# AI-OCR编译和打包过程（mac版）

## 编译和打包的系统环境

操作系统：macOS 12.6

python版本：3.8.10 64bit（miniconda）

nodejs版本：16.6.2

npm版本：8.13.2


### 基本环境准备

- 安装python3，为了打包python程序更干净推荐使用virtualenv安装虚拟环境

`pip install virtualenv`

- 安装nodejs，推荐使用nvm方便安装不同版本，我使用的是node v16

### 拉取代码

`git clone https://gitee.com/bingal/ai-ocr.git`
进入项目目录（后面执行命令都是在项目根目录内执行）
`cd ai-ocr`

## python部分的调试和打包

### 安装python虚拟环境

`virtualenv aiocr-env`

### 安装python依赖库

`aiocr-env\bin\python -m pip install -r py-service\requirements.txt --index-url=https://mirror.baidu.com/pypi/simple`

### 测试ocr-server运行和安装ppocr模型

`aiocr-env\Scripts\python.exe py-service\ocr_server.py`
不出意外会自动下载ppocr相关模型文件到 py-service\paddle_model 目录下，然后显示`start server on 8264` 就说明python端ocr服务可以正常运行，运行正常就可以退出了

### 使用pyinstaller对py-service打包成exe文件

打包前先修改 paddle 程序里会引起错误的地方，主要是会引起报错或者无限启动进程耗尽资源的问题，找到虚拟环境下这个文件
`aiocr-env\Lib\site-packages\paddle\dataset\image.py`
找到这部分文件内容
```python

from __future__ import print_function

import six
import numpy as np
# FIXME(minqiyang): this is an ugly fix for the numpy bug reported here
# https://github.com/numpy/numpy/issues/12497
if six.PY3:
    import subprocess
    import sys
    import os
    interpreter = sys.executable
    # Note(zhouwei): if use Python/C 'PyRun_SimpleString', 'sys.executable'
    # will be the C++ execubable on Windows
    if sys.platform == 'win32' and 'python.exe' not in interpreter:
        interpreter = sys.exec_prefix + os.sep + 'python.exe'
    import_cv2_proc = subprocess.Popen(
        [interpreter, "-c", "import cv2"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE)
    out, err = import_cv2_proc.communicate()
    retcode = import_cv2_proc.poll()
    if retcode != 0:
        cv2 = None
    else:
        import cv2
else:
    try:
        import cv2
    except ImportError:
        cv2 = None
```
修改成这样
```python

from __future__ import print_function

import six
import numpy as np
# FIXME(minqiyang): this is an ugly fix for the numpy bug reported here
# https://github.com/numpy/numpy/issues/12497
# if six.PY3:
#     import subprocess
#     import sys
#     import os
#     interpreter = sys.executable
#     # Note(zhouwei): if use Python/C 'PyRun_SimpleString', 'sys.executable'
#     # will be the C++ execubable on Windows
#     if sys.platform == 'win32' and 'python.exe' not in interpreter:
#         interpreter = sys.exec_prefix + os.sep + 'python.exe'
#     import_cv2_proc = subprocess.Popen(
#         [interpreter, "-c", "import cv2"],
#         stdout=subprocess.PIPE,
#         stderr=subprocess.PIPE)
#     out, err = import_cv2_proc.communicate()
#     retcode = import_cv2_proc.poll()
#     if retcode != 0:
#         cv2 = None
#     else:
#         import cv2
# else:
try:
    import cv2
except ImportError:
    cv2 = None
```
使用pyinstaller打包py-service，具体命令已经写好shell脚本，在项目根目录下直接执行即可
`npm run build-py-mac`
打包过程大概需要几分钟，全部执行完成之后，会在项目目录的 dist 目录下生成 ocr_server 的目录，就是打包生成的最终文件，执行`/dist/ocr_server/ocr_server.exe` 不出意外可以看到输出`start server on 8264` 就说明一切正常。

## 运行和打包 elactron 程序部分

本项目界面基于字节跳动的 arco design 的 react 开发，执行下面的命令打包
`npm run pack-app-mac`
不出意外会在目录`out\AI-OCR-darwin-x64`下生成最终的app程序，双击执行`out\AI-OCR-darwin-x64\AI-OCR.app`即可启动，打包后生成文件总共1.52GB，文件实在有点大，主要还是python端生成的包比较大，为了传输方便可以7zip压缩一下，执行`npm run 7z-mac`进行压缩，完成后会在项目目录下生成压缩包文件`ai-ocr-darwin-x64.7z`，总共233MB。

# AI-OCR - 基于PaddleOCR的OCR桌面客户端

## 1. 简介

* AI-OCR是基于PaddleOCR的OCR桌面客户端程序，支持Windows、Linux、MacOS等操作系统。
* 技术架构
  * 前端界面：Electron + Reactjs + ArcoDesign
  * OCR引擎：PaddleOCR + Pyinstaller 打包成独立服务
  * 前端和OCR引擎通信：thrift (跨语言RPC通信框架)

## 2. 项目目录结构及文件说明

```bash
ai-ocr
├─public                       - 前端静态资源目录
├─src                          - 前端源码目录
├─thrift-src                   - thrift接口定义源码目录
├─py-service                   - OCR引擎服务目录
├─7zr.exe                      - 命令行版7zip，为了方便打包压缩
├─logo.icns                    - mac端图标
├─logo.ico                     - windows端图标
├─logo.png                     - 图标png格式
├─main.js                      - electron主进程入口
├─package-pyservice-mac.sh     - mac端打包OCR引擎服务脚本
├─package-pyservice-win.bat    - windows端打包OCR引擎服务脚本
├─preload.js                   - electron渲染进程预加载脚本，定义主题
```

### 软件界面

![世界时区分布图](/assets/1665395619954.jpg#pic_center)

### 功能简介

支持批量添加图片、拖动图片到软件界面、粘贴剪贴板的图片进行识别

### 编译和打包说明（mac和windows）

[AI-OCR编译和打包过程（mac版）](/package-mac.md)

[AI-OCR编译和打包过程（mwindows版）](/package-win.md)
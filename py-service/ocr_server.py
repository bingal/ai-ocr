import json
import re
import os
import base64
import numpy as np
import cv2
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer
from thrift_ocr_py.ocr import OcrService
import paddleocr
# from paddleocr import PaddleOCR

RUN_PATH = os.path.split(os.path.realpath(__file__))[0]
ppocr = paddleocr.PaddleOCR(use_angle_cls=True, 
                  use_gpu=False,
                  lang='ch',
                  cls_model_dir=os.path.join(RUN_PATH, 'paddle_model', 'cls'), 
                  rec_model_dir=os.path.join(RUN_PATH, 'paddle_model', 'rec-ch'), 
                  det_model_dir=os.path.join(RUN_PATH, 'paddle_model', 'det'), 
                  show_log=False)

class Ocr_handler:
    def ocr(self, nid, img_path):
        print(f'start ocr {nid} {img_path}')
        # img_info = json.loads(dict_str)
        # nid = img_info['id']
        # img_path = img_info['path']
        print(f'{nid} start ocr')
        txts = ''
        try:
            if img_path.startswith('data:'):
                img_data = re.sub('^data:image/.+;base64,', '', img_path)
                im = cv2.imdecode(np.frombuffer(base64.b64decode(img_data), np.uint8), -1)
                if im.shape[2] == 4:
                    im = cv2.cvtColor(im, cv2.COLOR_BGRA2BGR)
                result = ppocr.ocr(im, cls=True)
            else:
                result = ppocr.ocr(img_path, cls=True)
            txts = [line[1][0] for line in result]
        except Exception as e:
            print(f'{nid} ocr error {e}')
        print('done')
        return '\n'.join(txts)


if __name__ == "__main__":
    port = 8000
    ip = "127.0.0.1"
    # 创建服务端
    handler = Ocr_handler()  # 自定义类
    processor = OcrService.Processor(handler)  # userService为python接口文件自动生成
    # 监听端口
    transport = TSocket.TServerSocket(ip, port)  # ip与port位置不可交换
    # 选择传输层
    tfactory = TTransport.TBufferedTransportFactory()
    # 选择传输协议
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()
    # 创建服务端
    server = TServer.TThreadedServer(processor, transport, tfactory, pfactory)
    print("start server in python")
    server.serve()
    print("Done")

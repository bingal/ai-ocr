export PADDLEOCR_PATH=/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages
export CODE_PATH=/Users/ben/Desktop/nodejs/ocr_app/py-service


# ppocr_app/bin/pyinstaller --clean -y ocr_server.spec
ppocr_app/bin/pyinstaller --clean -y -D --clean \
    --exclude-module matplotlib \
	--exclude-module pytz \
	./py-service/ocr_server.py \
	-p ${PADDLEOCR_PATH}/paddle/libs \
	-p ${PADDLEOCR_PATH}/paddleocr \
	-p ${PADDLEOCR_PATH}/paddleocr/ppocr/utils/e2e_utils \
	-p ${PADDLEOCR_PATH}/paddleocr/ppocr/postprocess \
	-p ${PADDLEOCR_PATH}/paddleocr/ppstructure \
	-p ${PADDLEOCR_PATH}/paddleocr/ppstructure/layout \
	--add-binary ${PADDLEOCR_PATH}/paddle/libs:. \
	--add-data ${CODE_PATH}/paddle_model:./paddle_model \
	--add-data ${CODE_PATH}/thrift_ocr_py:./thrift_ocr_py \
	--additional-hooks-dir=. \
	--hidden-import extract_textpoint_slow \
	--hidden-import tablepyxl \
	--hidden-import tablepyxl.style \
	--hidden-import skimage.filters.edges \
	--hidden-import picodet_postprocess \
	--add-data ${PADDLEOCR_PATH}/paddleocr/ppocr/utils/ppocr_keys_v1.txt:./ppocr/utils \
	--add-data ${PADDLEOCR_PATH}/paddleocr/ppocr/utils/dict/table_structure_dict.txt:./ppocr/utils/dict

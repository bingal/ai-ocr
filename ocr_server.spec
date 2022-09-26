# -*- mode: python ; coding: utf-8 -*-


block_cipher = None


a = Analysis(
    ['py-service/ocr_server.py'],
    pathex=['/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddle/libs', '/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr', '/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppocr/utils/e2e_utils', '/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppocr/postprocess', '/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppstructure', '/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppstructure/layout'],
    binaries=[('/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddle/libs', '.')],
    datas=[('/Users/ben/Desktop/nodejs/ocr_app/py-service/paddle_model', './paddle_model'), ('/Users/ben/Desktop/nodejs/ocr_app/py-service/thrift_ocr_py', './thrift_ocr_py'), ('/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppocr/utils/ppocr_keys_v1.txt', './ppocr/utils'), ('/Users/ben/Desktop/nodejs/ocr_app/ppocr_app/lib/python3.8/site-packages/paddleocr/ppocr/utils/dict/table_structure_dict.txt', './ppocr/utils/dict')],
    hiddenimports=['extract_textpoint_slow', 'tablepyxl', 'tablepyxl.style', 'skimage.filters.edges', 'picodet_postprocess'],
    hookspath=['.'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['matplotlib', 'pytz'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ocr_server',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ocr_server',
)

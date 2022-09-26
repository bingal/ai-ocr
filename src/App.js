import './App.css';
import "@arco-design/web-react/dist/css/arco.css";
import { useState, useReducer, useRef, useEffect } from "react";
import { Card, Space, Layout, Divider, Avatar, Input, Upload, Message, Grid, Image } from "@arco-design/web-react";
import { IconCheck, IconClose, IconLoading } from '@arco-design/web-react/icon';

const nanoid = require("nanoid");

// const Header = Layout.Header;
const Content = Layout.Content;
const Sider = Layout.Sider;
const TextArea = Input.TextArea;
const Row = Grid.Row;
const Col = Grid.Col;

// var thrift = require('thrift');
// // 调用win10下thrift命令自动生成的依赖包
// var userService = require('./thrift_js/userService');
// var ttypes = require('./thrift_js/test_types');
// var thriftConnection = thrift.createConnection('127.0.0.1', 8000, { timeout: 3000 });
// var thriftClient = thrift.createClient(userService, thriftConnection);

const isAcceptFile = (file, accept) => {
  if (accept && file) {
    const accepts = Array.isArray(accept)
      ? accept
      : accept
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x);
    const fileExtension = file.name.indexOf('.') > -1 ? file.name.split('.').pop() : '';
    return accepts.some((type) => {
      const text = type && type.toLowerCase();
      const fileType = (file.type || '').toLowerCase();
      console.log(fileType, text)
      if (text === fileType) {
        // 类似excel文件这种
        // 比如application/vnd.ms-excel和application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        // 本身就带有.字符的，不能走下面的.jpg等文件扩展名判断处理
        // 所以优先对比input的accept类型和文件对象的type值
        return true;
      }
      if (/\*/.test(text)) {
        // image/* 这种通配的形式处理
        console.log("fileType.replace(/\/.*$/, '') === text.replace(/\/.*$/, '')", fileType.replace(/\/.*$/, '') === text.replace(/\/.*$/, ''))
        return fileType.replace(/\/.*$/, '') === text.replace(/\/.*$/, '');
      }
      if (/..*/.test(text)) {
        // .jpg 等后缀名
        console.log("fileExtension === text.replace(/\./, '')", fileExtension === text.replace(/\./, ''))
        return text === `.${fileExtension && fileExtension.toLowerCase()}`;
      }
    return false;
  });
}
return !!file;
}


const CardContent = ({ text, state, img_data }) => {
  return (
    <Space
      size='medium'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Space size='medium'>
        <Avatar
          style={{
            backgroundColor: '#165DFF',
          }}
          size={64}
          shape='square'
        >
          {
            img_data ? <img src={img_data} style={{ width: '100%', height: '100%' }} /> : <IconLoading />
          }
        </Avatar>
        <div style={{ maxHeight: 64, overflow: 'hidden' }} className="ocr-content">{text}</div>
      </Space>
      {/* <Button type='primary' className="card-state-icon" icon={state == 1 ? <IconCheck /> : <IconClose />} shape='circle' size='mini' loading={state == 0} /> */}
      {
        state == 1 ? <IconCheck /> : state == 0 ? <IconLoading /> : <IconClose />
      }
    </Space>
  );
};


function App() {

  const pasteImageRef = useRef(window);
  const [selectCardId, setSelectCardId] = useState('');
  const [textareaText, setTextareaText] = useState('');
  const [selectImage, setSelectImage] = useState('');
  const [selectCardIndex, setSelectCardIndex] = useState(-1);
  const previewRef = useRef();

  const ocrListReducer = (state, action) => {
    switch (action.type) {
      case 'add':
        return [...state, action.payload]
      case 'update':
        return state.map(item => {
          if (item.id === action.payload.id) {
            if (item.id === selectCardId && action.payload.state === 1) {
              setTextareaText(action.payload.text)
              // if (action.payload.img_data){
              //   setSelectImage(action.payload.img_data)
              // }
            }
            return { ...item, ...action.payload }
          }
          return item
        })
      default:
        return state
    }
  }
  const [ocrList, orcListDispach] = useReducer(ocrListReducer, []);

  

  const pasteHandler = (e) => {
    const { clipboardData } = e;
    const { items } = clipboardData;
    const { length } = items;

    let blob = null;
    for (let i = 0; i < length; i++) {
      const item = items[i];
      if (item.type.startsWith('image')) {
        blob = item.getAsFile(); // blob中就是截图的文件，获取后可以上传到服务器
        startOcr(blob);
      }
    }
  };

  useEffect(() => {
    //给组件添加监听粘贴事件
    pasteImageRef.current?.addEventListener('paste', pasteHandler);
  }, []);

  const startOcr = (file) => {
    if (thriftClient==null){
      setTimeout(() => {
        console.log('thriftClient is null, try 1 second later')
        startOcr(file)
      }, 1000);
      return;
    }
    const id = nanoid.nanoid();
    console.info('startOcr', id, file.path, !file.path, thriftClient)
    orcListDispach({type:'add', payload:{id:id, text:'正在识别中...', state:0, img_data:''}})
    const reader = new FileReader();
    reader.onload = e => {
      const img_b64 = e.target.result;
      orcListDispach({ type: 'update', payload: { id: id, img_data: img_b64 } })
      
      if (!file.path) {
        thriftClient.ocr(id, img_b64, (error, res) => {
          if (error) {
            console.error('ocr error', error)
            orcListDispach({ type: 'update', payload: { id: id, text: '识别出错了', state: -1 } })
          } else {
            console.log('ocr ok', id, res, ocrList.length)
            orcListDispach({ type: 'update', payload: { id: id, text: res, state: 1 } })
          }
        })
      }
    };
    reader.onerror = e => {
      console.info('error:' + e);
    };
    reader.readAsDataURL(file);
    if (!!file.path){
      thriftClient.ocr(id, file.path, (error, res) => {
        if (error) {
          console.error('ocr error', error)
          orcListDispach({type:'update', payload:{id:id, text:'识别出错了', state:-1}})
        } else {
          console.log('ocr ok', id, res, ocrList.length)
          orcListDispach({type:'update', payload:{id:id, text:res, state:1}})
        }
      })
    }
  }

  const onCardClick = (item, index) => {
    console.info('onCardClick', item.text)
    setSelectCardIndex(index)
    setTextareaText(item.text)
    setSelectCardId(item.id)
    if(!!item.img_data){
      setSelectImage(item.img_data)
    }
  }


  return (
    <div className='layout-basic-app'>
      <Layout>
        {/* <Header>
          <Space size='large'>
            <Button type="primary" onClick={testThrift}>测试</Button>
          </Space>
        </Header> */}
        <Layout>
          <Sider
            resizeDirections={['right']}
            style={{
              minWidth: 300,
              maxWidth: '60%',
              width: 300,
            }}
          >
            <div className='left-side-toolbar'>
              {/* <Button type="primary" onClick={testThrift}>测试</Button> */}
              <Upload
                // renderUploadList={renderUploadList}
                showUploadList={false}
                // customRequest={customRequest}
                beforeUpload={(file, filesList) => {
                  startOcr(file)
                  console.log('filesList', filesList.length)
                  return false
                }}
                drag
                multiple
                accept='image/*'
                action='/'
                onDrop={(e) => {
                  let uploadFile = e.dataTransfer.files[0]
                  if (isAcceptFile(uploadFile, 'image/*')) {
                    return
                  } else {
                    Message.info('不接受的文件类型，请重新上传指定文件类型~');
                  }
                }}
                tip='只支持图片格式如：.jpg .png .gif, .jpeg, .bmp'
              />
            </div>
            <Divider className="left-side-divider" />
            <div className='left-side-content'>
            {ocrList.map((item, index) => {
              return (
                <Card
                  key={index}
                  style={{ marginTop: 10 }}
                  onClick={() => onCardClick(item, index)}
                  className={selectCardIndex === index ? 'card-selected' : ''}
                >
                  <CardContent text={item.text} state={item.state} img_data={item.img_data} />
                </Card>
              );
            })}
            </div>
          </Sider>
          <Content>
            <Row
              className='grid-demo'
              style={{paddingLeft:'10px', paddingRight:'10px'}}
            >
              <Col span={12} style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-fill-1)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
              }} ref={previewRef}>
                {/* <Card className="previewCard"> */}
                <Image src={selectImage}
                  className="previewImage"
                  previewProps={{
                    getPopupContainer: () => previewRef.current,
                    closable: true,
                }} />
                {/* </Card> */}
              </Col>
              <Col span={12}>
                {/* <Card className="previewCard"> */}
                  <TextArea className="content-textarea" placeholder='' style={{ resize: 'none' }} value={textareaText} readOnly={true} />
                  {/* {{__html: textareaText.replace(/\n/g, '<br />')}} */}
                {/* </Card> */}
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;

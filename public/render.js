// render.js
const thrift = require('thrift')
const fs  = require('fs')
const { resolve } = require('path')
let OcrService;
try {
    fs.accessSync(resolve('./public/thrift_ocr_js/OcrService.js'), fs.constants.F_OK);
    OcrService = require('./public/thrift_ocr_js/OcrService');
} catch (err) {
    OcrService = require('./thrift_ocr_js/OcrService');
}

var thriftConnection = null;
var thriftClient = null;

const init_thrift = () => {
    thriftConnection = thrift.createConnection('127.0.0.1', 8264, { timeout: 3000 });

    thriftConnection.on("error", function (e) {
        console.error("connect error", e);
        setTimeout(() => {
            console.log('reconnect')
            init_thrift();
        }, 1000);
    });
    thriftConnection.on("complete", function (e) {
        console.log("oncomplete");
        thriftClient = thrift.createClient(OcrService, thriftConnection);
    });
    thriftConnection.on("connect", function (e) {
        console.log("onconnect");
        thriftClient = thrift.createClient(OcrService, thriftConnection);
    });
    thriftConnection.on("close", function (e) {
        console.log("close");
    });
    thriftConnection.on("timeout", function (e) {
        console.log("ontimeout");
    });
}
init_thrift();

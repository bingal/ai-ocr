// renderer.js
const thrift = require('thrift');
const userService = require('./thrift_ocr_js/OcrService');
const ttypes = require('./thrift_ocr_js/ocr_types');
var thriftConnection = null;
var thriftClient = null;

const init_thrift = () => {
    thriftConnection = thrift.createConnection('127.0.0.1', 8000, { timeout: 3000 });

    thriftConnection.on("error", function (e) {
        console.error("connect error", e);
        setTimeout(() => {
            console.log('reconnect')
            init_thrift();
        }, 1000);
    });
    thriftConnection.on("complete", function (e) {
        console.log("oncomplete");
        thriftClient = thrift.createClient(userService, thriftConnection);
    });
    thriftConnection.on("connect", function (e) {
        console.log("onconnect");
        thriftClient = thrift.createClient(userService, thriftConnection);
    });
    thriftConnection.on("close", function (e) {
        console.log("close");
    });
    thriftConnection.on("timeout", function (e) {
        console.log("ontimeout");
    });
}
init_thrift();
// document.body.setAttribute('arco-theme', 'dark');

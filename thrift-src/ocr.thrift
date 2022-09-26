// struct Image{  
//     1: string nanoid,  
//     2: string path,    
// } 

// service userService {
//     string test1(1:string name)
// }
service OcrService {
    string ocr(1: string id, 2: string path)
}

// thrift -o thrift_ocr_js --gen js:node ocr.thrift
// thrift -o thrift_ocr_py --gen py ocr.thrift
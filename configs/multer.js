const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()
            + path.extname(file.originalname))
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 8000000 // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('لطفا فرمت عکس را انتخاب کنید'))
        }
        cb(undefined, true)
    }
});

module.exports = {imageUpload};
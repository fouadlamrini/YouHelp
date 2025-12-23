const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/files'; 

    if(file.mimetype.startsWith('image')) folder = 'uploads/images';
    else if(file.mimetype.startsWith('video')) folder = 'uploads/videos';
    
  
    if(!fs.existsSync(folder)){
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});


const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|ppt|pptx|xls|xlsx/;

const fileFilter = (req, file, cb) => {
  const ext = allowedTypes.test(file.originalname.toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if(ext && mime) cb(null, true);
  else cb(new Error('File type not allowed'));
};

module.exports = multer({ storage, fileFilter });

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'src/uploads/files'; // default folder
    if (file.mimetype.startsWith('image')) folder = 'src/uploads/images';
    else if (file.mimetype.startsWith('video')) folder = 'src/uploads/videos';

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // get extension
    cb(null, 'media-' + Date.now() + ext); // save as media-timestamp.ext
  },
});

// Allowed extensions for files
const allowedExtensions = /\.(jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|ppt|pptx|xls|xlsx)$/i;

// File filter to check both mimetype and extension
const fileFilter = (req, file, cb) => {
  const isValidExtension = allowedExtensions.test(file.originalname.toLowerCase());

  // Check mimetype
  const mimeType = file.mimetype;
  const isValidMime =
    mimeType.startsWith('image') ||
    mimeType.startsWith('video') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation');

  if (isValidExtension && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

// Multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;

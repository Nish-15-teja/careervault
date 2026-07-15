import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure local 'uploads' directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File validation check: restrict to PDFs only
const fileFilter = (req, file, cb) => {
  const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf';
  
  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error('Validation Error: Only PDF files are allowed for resumes.'));
  }
};

// Initialise Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter
});

export default upload;

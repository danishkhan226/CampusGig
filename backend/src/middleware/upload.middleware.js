import multer from 'multer';

// Use memory storage so file buffers can be directly streamed to ImageKit
const storage = multer.memoryStorage();

// File filter for images (JPEG, PNG, WEBP, GIF)
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

// File filter for order delivery attachments (images, PDFs, ZIPs, TXT, DOCX)
const deliveryFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.zip')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: Images, PDF, ZIP, TXT, DOCX.'), false);
  }
};

// 1. Single avatar upload (max 5MB)
export const uploadAvatarMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFilter
}).single('avatar');

// 2. Multiple service gig images (max 5 images, max 10MB each)
export const uploadServiceImagesMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFilter
}).array('images', 5);

// 3. Order delivery files (max 3 files, max 25MB each)
export const uploadDeliveryFilesMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: deliveryFilter
}).array('files', 3);

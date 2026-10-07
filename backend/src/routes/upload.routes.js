import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  uploadAvatarMiddleware,
  uploadServiceImagesMiddleware,
  uploadDeliveryFilesMiddleware
} from '../middleware/upload.middleware.js';
import {
  uploadAvatar,
  uploadServiceImages,
  uploadDeliveryFiles
} from '../controllers/upload.controller.js';

const router = Router();

// All uploads are protected and require user authentication
router.use(protect);

router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
router.post('/service-images', uploadServiceImagesMiddleware, uploadServiceImages);
router.post('/delivery-files', uploadDeliveryFilesMiddleware, uploadDeliveryFiles);

export default router;

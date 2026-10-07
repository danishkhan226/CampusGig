import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  requestVerification,
  confirmVerification
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Protected profile management
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, updateAvatar);

// Student verification
router.post('/verify-student/request', protect, requestVerification);
router.post('/verify-student/confirm', protect, confirmVerification);

// Public profile retrieval by ID
router.get('/:id', getUserProfile);

export default router;

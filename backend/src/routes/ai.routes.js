import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.middleware.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

// Rate limit AI features to 20 requests per 15 minutes per IP
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many AI requests. Please wait a few minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Protect all AI features to authenticated users
router.use(protect);
router.use(aiRateLimit);

router.post('/gig-description', aiController.generateGigDescription);
router.post('/enhance-requirements', aiController.enhanceRequirements);
router.post('/chat-suggestions', aiController.generateChatSuggestions);
router.post('/enhance-bio', aiController.enhanceBio);

export default router;

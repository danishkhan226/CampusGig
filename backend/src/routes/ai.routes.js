import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

// Protect all AI features to authenticated users
router.use(protect);

router.post('/gig-description', aiController.generateGigDescription);
router.post('/enhance-requirements', aiController.enhanceRequirements);
router.post('/chat-suggestions', aiController.generateChatSuggestions);
router.post('/enhance-bio', aiController.enhanceBio);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

// All chat routes require user authentication
router.use(protect);

router.get('/conversations', chatController.getUserConversations);
router.post('/conversations', chatController.getOrCreateConversation);
router.get('/conversations/:id', chatController.getConversationById);

router.get('/messages/:conversationId', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.patch('/messages/:conversationId/read', chatController.markMessagesAsRead);

router.get('/unread-count', chatController.getTotalUnreadCount);

export default router;

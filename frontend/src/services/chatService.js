import api from './api.js';

// POST /api/chat/conversations — get or create a conversation
export const getOrCreateConversation = ({ recipientId, serviceId, orderId }) =>
  api.post('/chat/conversations', { recipientId, serviceId, orderId });

// GET /api/chat/conversations — get all conversations for user
export const getUserConversations = () =>
  api.get('/chat/conversations');

// GET /api/chat/conversations/:id — get single conversation details
export const getConversationById = (id) =>
  api.get(`/chat/conversations/${id}`);

// GET /api/chat/messages/:conversationId — get messages
export const getMessages = (conversationId, params = {}) =>
  api.get(`/chat/messages/${conversationId}`, { params });

// POST /api/chat/messages — send message
export const sendMessage = ({ conversationId, text, attachments }) =>
  api.post('/chat/messages', { conversationId, text, attachments });

// PATCH /api/chat/messages/:conversationId/read — mark read
export const markMessagesAsRead = (conversationId) =>
  api.patch(`/chat/messages/${conversationId}/read`);

// GET /api/chat/unread-count — get total unread count
export const getTotalUnreadCount = () =>
  api.get('/chat/unread-count');

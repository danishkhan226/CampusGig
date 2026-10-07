import * as chatService from '../services/chat.service.js';
import { getIO } from '../socket/index.js';

/**
 * POST /api/chat/conversations
 * Get or create a conversation with another user
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, serviceId, orderId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required'
      });
    }

    const conversation = await chatService.getOrCreateConversation({
      userId: req.user._id,
      recipientId,
      serviceId,
      orderId
    });

    return res.status(200).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/conversations
 * Get all conversations for the authenticated user
 */
export const getUserConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getUserConversations(req.user._id);

    return res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/conversations/:id
 * Get a specific conversation
 */
export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await chatService.getConversationById(
      req.params.id,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/messages/:conversationId
 * Get messages for a conversation
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;

    const result = await chatService.getMessages(conversationId, req.user._id, {
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chat/messages
 * Send a message via REST
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, attachments } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    const message = await chatService.sendMessage({
      conversationId,
      senderId: req.user._id,
      text,
      attachments
    });

    // Notify via Socket.io if active
    const io = getIO();
    if (io) {
      io.to(`conv_${conversationId}`).emit('new_message', {
        conversationId,
        message
      });
      io.to(`user_${message.receiverId}`).emit('message_notification', {
        conversationId,
        message
      });
    }

    return res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/chat/messages/:conversationId/read
 * Mark messages in a conversation as read
 */
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const result = await chatService.markMessagesAsRead(
      conversationId,
      req.user._id
    );

    const io = getIO();
    if (io) {
      io.to(`conv_${conversationId}`).emit('messages_read', {
        conversationId,
        readerId: req.user._id.toString()
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chat/unread-count
 * Get total unread messages count for navbar badge
 */
export const getTotalUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await chatService.getTotalUnreadCount(req.user._id);

    return res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * Find or create a conversation between two users
 */
export const getOrCreateConversation = async ({ userId, recipientId, serviceId = null, orderId = null }) => {
  if (userId.toString() === recipientId.toString()) {
    const error = new Error('You cannot start a conversation with yourself');
    error.statusCode = 400;
    throw error;
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    const error = new Error('Recipient user not found');
    error.statusCode = 404;
    throw error;
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, recipientId] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, recipientId],
      serviceId: serviceId || null,
      orderId: orderId || null,
      unreadCounts: {
        [userId.toString()]: 0,
        [recipientId.toString()]: 0
      }
    });
  } else {
    // Optionally update associated context if provided
    let updated = false;
    if (serviceId && !conversation.serviceId) {
      conversation.serviceId = serviceId;
      updated = true;
    }
    if (orderId && !conversation.orderId) {
      conversation.orderId = orderId;
      updated = true;
    }
    if (updated) {
      await conversation.save();
    }
  }

  return await Conversation.findById(conversation._id)
    .populate('participants', 'name profileImage collegeName isVerifiedStudent')
    .populate('serviceId', 'title price category images')
    .populate('orderId', 'status amount serviceSnapshot');
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId
  })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name profileImage collegeName isVerifiedStudent')
    .populate('serviceId', 'title price category images')
    .populate('orderId', 'status amount serviceSnapshot');

  return conversations;
};

/**
 * Get a specific conversation by ID
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('participants', 'name profileImage collegeName isVerifiedStudent')
    .populate('serviceId', 'title price category images')
    .populate('orderId', 'status amount serviceSnapshot');

  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = conversation.participants.some(
    (p) => p._id.toString() === userId.toString()
  );

  if (!isParticipant) {
    const error = new Error('You do not have access to this conversation');
    error.statusCode = 403;
    throw error;
  }

  return conversation;
};

/**
 * Fetch messages for a conversation
 */
export const getMessages = async (conversationId, userId, { page = 1, limit = 50 } = {}) => {
  // Verify participant access
  await getConversationById(conversationId, userId);

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('senderId', 'name profileImage collegeName'),
    Message.countDocuments({ conversationId })
  ]);

  return {
    messages,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Send a message within a conversation
 */
export const sendMessage = async ({ conversationId, senderId, text = '', attachments = [] }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === senderId.toString()
  );

  if (!isParticipant) {
    const error = new Error('You are not a participant in this conversation');
    error.statusCode = 403;
    throw error;
  }

  // Find receiver ID
  const receiverId = conversation.participants.find(
    (p) => p.toString() !== senderId.toString()
  );

  if (!text.trim() && (!attachments || attachments.length === 0)) {
    const error = new Error('Message must have text or attachments');
    error.statusCode = 400;
    throw error;
  }

  // Create message
  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    text: text.trim(),
    attachments
  });

  // Update conversation
  conversation.lastMessage = {
    text: text.trim() || (attachments?.length ? '📎 Sent an attachment' : ''),
    senderId,
    createdAt: new Date()
  };

  // Increment receiver's unread count
  const receiverKey = receiverId.toString();
  const currentCount = conversation.unreadCounts.get(receiverKey) || 0;
  conversation.unreadCounts.set(receiverKey, currentCount + 1);
  conversation.updatedAt = new Date();

  await conversation.save();

  return await message.populate('senderId', 'name profileImage collegeName');
};

/**
 * Mark messages in a conversation as read by the user
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  const result = await Message.updateMany(
    {
      conversationId,
      receiverId: userId,
      read: false
    },
    {
      $set: {
        read: true,
        readAt: new Date()
      }
    }
  );

  // Reset unread count for user
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();
  }

  return { markedCount: result.modifiedCount };
};

/**
 * Get total unread messages count across all conversations for a user
 */
export const getTotalUnreadCount = async (userId) => {
  const count = await Message.countDocuments({
    receiverId: userId,
    read: false
  });
  return count;
};

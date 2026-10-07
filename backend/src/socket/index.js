import { Server } from 'socket.io';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import * as chatService from '../services/chat.service.js';

let io = null;
const onlineUsers = new Map(); // userId -> Set of socketIds

const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return cookieString.split(';').reduce((res, c) => {
    const [key, val] = c.trim().split('=');
    if (key && val) res[key] = decodeURIComponent(val);
    return res;
  }, {});
};

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    ...(process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
      : []),
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS'));
      },
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parseCookies(cookieHeader);
      const token = cookies.token || socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid socket credentials'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user room for direct notifications
    socket.join(`user_${userId}`);

    // Broadcast user online status
    io.emit('user_status_changed', { userId, status: 'online' });

    // Send currently online user list to newly connected client
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));

    // Event: Join a specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
      }
    });

    // Event: Leave a specific conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Event: Send a message via Socket
    socket.on('send_message', async ({ conversationId, text, attachments }, callback) => {
      try {
        const message = await chatService.sendMessage({
          conversationId,
          senderId: socket.user._id,
          text,
          attachments
        });

        const receiverId = message.receiverId.toString();

        // Broadcast to conversation room
        io.to(`conv_${conversationId}`).emit('new_message', {
          conversationId,
          message
        });

        // Also notify receiver's personal room for badge / notifications
        io.to(`user_${receiverId}`).emit('message_notification', {
          conversationId,
          message
        });

        if (callback && typeof callback === 'function') {
          callback({ success: true, message });
        }
      } catch (err) {
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Event: Typing indicators
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName: socket.user.name
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId
      });
    });

    // Event: Mark messages read
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        await chatService.markMessagesAsRead(conversationId, socket.user._id);
        io.to(`conv_${conversationId}`).emit('messages_read', {
          conversationId,
          readerId: userId
        });
      } catch (err) {
        console.error('[Socket mark_read error]:', err.message);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

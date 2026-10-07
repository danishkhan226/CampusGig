import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      default: ''
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: 'attachment' },
        fileType: { type: String, default: 'file' }
      }
    ],
    read: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ receiverId: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

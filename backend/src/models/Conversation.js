import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      text: {
        type: String,
        default: ''
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

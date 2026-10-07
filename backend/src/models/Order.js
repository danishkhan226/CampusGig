import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'accepted',
  'in_progress',
  'submitted',
  'revision_requested',
  'completed',
  'cancelled',
  'rejected',
  'disputed'
];

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must have a buyer'],
      index: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must have a seller'],
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Order must be linked to a service'],
      index: true
    },

    // Snapshot of service at order time (immutable record)
    serviceSnapshot: {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      deliveryDays: { type: Number, required: true },
      category: { type: String, required: true }
    },

    amount: {
      type: Number,
      required: [true, 'Order must have an amount'],
      min: [1, 'Amount must be at least ₹1']
    },

    // Razorpay fields (filled after payment)
    paymentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: 'Invalid order status: {VALUE}'
      },
      default: 'pending_payment',
      index: true
    },

    // Buyer's project requirements provided at checkout
    requirements: {
      type: String,
      required: [true, 'Please provide your project requirements'],
      trim: true,
      maxlength: [2000, 'Requirements cannot exceed 2000 characters']
    },

    // Files the freelancer delivers
    submittedFiles: {
      type: [String], // Cloudinary URLs
      default: []
    },

    // Message freelancer sends with delivery
    deliveryMessage: {
      type: String,
      default: '',
      maxlength: [1000, 'Delivery message cannot exceed 1000 characters']
    },

    // Revision history
    revisionRequests: [
      {
        message: { type: String, required: true },
        requestedAt: { type: Date, default: Date.now }
      }
    ],

    // Cancellation / rejection info
    cancellationReason: { type: String, default: '' },

    // Timestamps for key workflow milestones
    paidAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // Deadline calculated from acceptedAt + deliveryDays
    deadline: { type: Date, default: null },

    // Has the buyer reviewed this order?
    isReviewed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Indexes for dashboard queries
orderSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

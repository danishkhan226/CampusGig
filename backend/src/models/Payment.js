import mongoose from 'mongoose';

const PAYMENT_STATUSES = ['created', 'authorized', 'captured', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    userId:  {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must belong to a user'],
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Payment must be associated with an order'],
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay order ID is required'],
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Amount must be greater than zero']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: 'Invalid payment status: {VALUE}'
      },
      default: 'created',
      index: true
    },
    errorDetails: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import * as orderService from './order.service.js';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret
  });
};

/**
 * Create a Razorpay Order for a CampusGig order
 */
export const createRazorpayOrder = async ({ orderId, userId }) => {
  const order = await Order.findById(orderId).populate('buyerId', 'name email');
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  if (String(order.buyerId._id) !== String(userId)) {
    throw Object.assign(new Error('Unauthorized: You are not the buyer of this order'), { status: 403 });
  }

  if (order.status !== 'pending_payment') {
    throw Object.assign(new Error(`Order is not pending payment (Current status: ${order.status})`), { status: 400 });
  }

  const razorpay = getRazorpayInstance();

  // If Razorpay keys aren't set yet (or in mock dev mode)
  if (!razorpay) {
    const mockRazorpayOrderId = `order_sim_${Date.now()}`;
    await Payment.create({
      userId,
      orderId: order._id,
      razorpayOrderId: mockRazorpayOrderId,
      amount: order.amount,
      status: 'created'
    });

    return {
      orderId: order._id,
      razorpayOrderId: mockRazorpayOrderId,
      amount: order.amount * 100, // in paise
      currency: 'INR',
      keyId: 'rzp_test_simulation',
      isSimulation: true
    };
  }

  const options = {
    amount: Math.round(order.amount * 100), // Razorpay takes amount in paise
    currency: 'INR',
    receipt: `rcpt_${order._id.toString().slice(-10)}`,
    notes: {
      orderId: order._id.toString(),
      buyerId: userId.toString(),
      serviceTitle: order.serviceSnapshot.title
    }
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // Record payment initiation in DB
  await Payment.create({
    userId,
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: order.amount,
    currency: razorpayOrder.currency,
    status: 'created'
  });

  return {
    orderId: order._id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    isSimulation: false
  };
};

/**
 * Verify Razorpay payment signature securely server-side
 */
export const verifyPaymentSignature = async ({
  orderId,
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
}) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  const razorpay = getRazorpayInstance();

  if (razorpay) {
    // Cryptographically verify signature: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Record payment failure
      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: 'failed',
          razorpayPaymentId,
          errorDetails: { message: 'Signature verification mismatch' }
        }
      );
      throw Object.assign(new Error('Invalid payment signature. Payment verification failed.'), { status: 400 });
    }
  }

  // Update Payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      razorpaySignature,
      status: 'captured'
    },
    { upsert: true }
  );

  // Transition the order to 'paid' status
  const updatedOrder = await orderService.markOrderPaid({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  return updatedOrder;
};

/**
 * Get payment details for an order
 */
export const getPaymentByOrderId = async ({ orderId, userId }) => {
  const payment = await Payment.findOne({ orderId }).sort({ createdAt: -1 });
  if (!payment) {
    throw Object.assign(new Error('Payment record not found'), { status: 404 });
  }

  if (String(payment.userId) !== String(userId)) {
    throw Object.assign(new Error('Unauthorized'), { status: 403 });
  }

  return payment;
};

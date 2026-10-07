import { sendSuccess, sendError } from '../utils/response.js';
import * as paymentService from '../services/payment.service.js';

// POST /api/payments/create-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return sendError(res, 'orderId is required', 400);
    }

    const paymentData = await paymentService.createRazorpayOrder({
      orderId,
      userId: req.user._id
    });

    return sendSuccess(res, paymentData, 'Razorpay order created successfully', 201);
  } catch (err) {
    return sendError(res, err.message,  err.status || 500);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId) {
      return sendError(res, 'orderId and razorpayOrderId are required', 400);
    }

    const order = await paymentService.verifyPaymentSignature({
      orderId,
      userId: req.user._id,
      razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || `pay_sim_${Date.now()}`,
      razorpaySignature: razorpaySignature || 'simulated_signature'
    });

    return sendSuccess(res, order, 'Payment verified successfully. Order is active!');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/payments/order/:orderId
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentByOrderId({
      orderId: req.params.orderId,
      userId: req.user._id
    });
    return sendSuccess(res, payment, 'Payment details retrieved');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

import { sendSuccess, sendError } from '../utils/response.js';
import * as orderService from '../services/order.service.js';

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { serviceId, requirements } = req.body;
    if (!serviceId || !requirements) {
      return sendError(res, 'serviceId and requirements are required', 400);
    }
    const order = await orderService.createOrder({
      serviceId,
      buyerId: req.user._id,
      requirements
    });
    return sendSuccess(res, order, 'Order created — proceed to payment', 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/orders?role=buyer|seller&status=...&page=1&limit=10
export const getMyOrders = async (req, res) => {
  try {
    const { role = 'buyer', status, page = 1, limit = 10 } = req.query;
    const result = await orderService.getUserOrders({
      userId: req.user._id,
      role,
      status,
      page: Number(page),
      limit: Number(limit)
    });
    return sendSuccess(res, result, 'Orders retrieved');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/orders/stats
export const getStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats(req.user._id);
    return sendSuccess(res, stats, 'Order stats retrieved');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/orders/:id
export const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById({
      orderId: req.params.id,
      userId: req.user._id
    });
    return sendSuccess(res, order, 'Order retrieved');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// POST /api/orders/:id/pay  (called after Razorpay verification — Phase 6)
export const confirmPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await orderService.markOrderPaid({
      orderId: req.params.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    return sendSuccess(res, order, 'Payment confirmed — order is now active');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/accept  (seller)
export const acceptOrder = async (req, res) => {
  try {
    const order = await orderService.acceptOrder({
      orderId: req.params.id,
      sellerId: req.user._id
    });
    return sendSuccess(res, order, 'Order accepted — work in progress!');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/reject  (seller)
export const rejectOrder = async (req, res) => {
  try {
    const order = await orderService.rejectOrder({
      orderId: req.params.id,
      sellerId: req.user._id,
      reason: req.body.reason
    });
    return sendSuccess(res, order, 'Order rejected');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/submit  (seller)
export const submitWork = async (req, res) => {
  try {
    const { deliveryMessage, submittedFiles } = req.body;
    const order = await orderService.submitWork({
      orderId: req.params.id,
      sellerId: req.user._id,
      deliveryMessage,
      submittedFiles
    });
    return sendSuccess(res, order, 'Work submitted — awaiting buyer approval');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/complete  (buyer)
export const completeOrder = async (req, res) => {
  try {
    const order = await orderService.completeOrder({
      orderId: req.params.id,
      buyerId: req.user._id
    });
    return sendSuccess(res, order, 'Order completed! Please leave a review.');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/revision  (buyer)
export const requestRevision = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return sendError(res, 'Revision message is required', 400);
    const order = await orderService.requestRevision({
      orderId: req.params.id,
      buyerId: req.user._id,
      message
    });
    return sendSuccess(res, order, 'Revision requested');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PATCH /api/orders/:id/cancel  (buyer)
export const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder({
      orderId: req.params.id,
      buyerId: req.user._id,
      reason: req.body.reason
    });
    return sendSuccess(res, order, 'Order cancelled');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

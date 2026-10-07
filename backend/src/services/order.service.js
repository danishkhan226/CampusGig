import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// ─── Create Order (after requirements, before payment) ───────────────────────
export const createOrder = async ({ serviceId, buyerId, requirements }) => {
  const service = await Service.findById(serviceId);
  if (!service) throw Object.assign(new Error('Service not found'), { status: 404 });
  if (!service.isActive) throw Object.assign(new Error('This service is not currently available'), { status: 400 });
  if (String(service.sellerId) === String(buyerId)) {
    throw Object.assign(new Error('You cannot order your own service'), { status: 400 });
  }

  const order = await Order.create({
    buyerId,
    sellerId: service.sellerId,
    serviceId,
    serviceSnapshot: {
      title: service.title,
      price: service.price,
      deliveryDays: service.deliveryDays,
      category: service.category
    },
    amount: service.price,
    requirements
  });

  return order;
};

// ─── Get all orders for a user (as buyer or seller) ──────────────────────────
export const getUserOrders = async ({ userId, role, status, page = 1, limit = 10 }) => {
  const filter = role === 'seller' ? { sellerId: userId } : { buyerId: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyerId', 'name profileImage collegeName isVerifiedStudent')
      .populate('sellerId', 'name profileImage collegeName isVerifiedStudent')
      .populate('serviceId', 'title images category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter)
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

// ─── Get single order (must belong to buyer or seller) ───────────────────────
export const getOrderById = async ({ orderId, userId }) => {
  const order = await Order.findById(orderId)
    .populate('buyerId', 'name profileImage collegeName isVerifiedStudent email')
    .populate('sellerId', 'name profileImage collegeName isVerifiedStudent')
    .populate('serviceId', 'title images category price deliveryDays');

  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });

  const isBuyer = String(order.buyerId._id) === String(userId);
  const isSeller = String(order.sellerId._id) === String(userId);
  if (!isBuyer && !isSeller) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  return order;
};

// ─── Mark order as paid (called after Razorpay verification) ─────────────────
export const markOrderPaid = async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (order.status !== 'pending_payment') {
    throw Object.assign(new Error('Order is not awaiting payment'), { status: 400 });
  }

  order.status = 'paid';
  order.paidAt = new Date();
  order.razorpayOrderId = razorpayOrderId;
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  // Bump service order count
  await Service.findByIdAndUpdate(order.serviceId, { $inc: { ordersCount: 1 } });

  return order;
};

// ─── Seller accepts order ─────────────────────────────────────────────────────
export const acceptOrder = async ({ orderId, sellerId }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.sellerId) !== String(sellerId)) {
    throw Object.assign(new Error('Only the seller can accept this order'), { status: 403 });
  }
  if (order.status !== 'paid') {
    throw Object.assign(new Error('Order must be paid before it can be accepted'), { status: 400 });
  }

  const now = new Date();
  order.status = 'accepted';
  order.acceptedAt = now;
  order.deadline = new Date(now.getTime() + order.serviceSnapshot.deliveryDays * 24 * 60 * 60 * 1000);
  await order.save();

  return order;
};

// ─── Seller rejects order ─────────────────────────────────────────────────────
export const rejectOrder = async ({ orderId, sellerId, reason }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.sellerId) !== String(sellerId)) {
    throw Object.assign(new Error('Only the seller can reject this order'), { status: 403 });
  }
  if (order.status !== 'paid') {
    throw Object.assign(new Error('Order must be paid before it can be rejected'), { status: 400 });
  }

  order.status = 'rejected';
  order.cancellationReason = reason || 'Seller rejected the order';
  await order.save();

  return order;
};

// ─── Seller submits work ──────────────────────────────────────────────────────
export const submitWork = async ({ orderId, sellerId, deliveryMessage, submittedFiles }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.sellerId) !== String(sellerId)) {
    throw Object.assign(new Error('Only the seller can submit work for this order'), { status: 403 });
  }
  if (!['accepted', 'in_progress', 'revision_requested'].includes(order.status)) {
    throw Object.assign(new Error('Order cannot be submitted at this stage'), { status: 400 });
  }

  order.status = 'submitted';
  order.submittedAt = new Date();
  order.deliveryMessage = deliveryMessage || '';
  if (submittedFiles && submittedFiles.length > 0) {
    order.submittedFiles = submittedFiles;
  }
  await order.save();

  return order;
};

// ─── Buyer approves / completes order ────────────────────────────────────────
export const completeOrder = async ({ orderId, buyerId }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.buyerId) !== String(buyerId)) {
    throw Object.assign(new Error('Only the buyer can complete this order'), { status: 403 });
  }
  if (order.status !== 'submitted') {
    throw Object.assign(new Error('Order must be in submitted state to be completed'), { status: 400 });
  }

  order.status = 'completed';
  order.completedAt = new Date();
  await order.save();

  // Update seller stats
  await User.findByIdAndUpdate(order.sellerId, { $inc: { completedOrders: 1 } });

  return order;
};

// ─── Buyer requests revision ──────────────────────────────────────────────────
export const requestRevision = async ({ orderId, buyerId, message }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.buyerId) !== String(buyerId)) {
    throw Object.assign(new Error('Only the buyer can request a revision'), { status: 403 });
  }
  if (order.status !== 'submitted') {
    throw Object.assign(new Error('Order must be in submitted state to request revision'), { status: 400 });
  }

  order.status = 'revision_requested';
  order.revisionRequests.push({ message });
  await order.save();

  return order;
};

// ─── Buyer cancels order (only before seller accepts) ────────────────────────
export const cancelOrder = async ({ orderId, buyerId, reason }) => {
  const order = await Order.findById(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (String(order.buyerId) !== String(buyerId)) {
    throw Object.assign(new Error('Only the buyer can cancel this order'), { status: 403 });
  }
  if (!['pending_payment', 'paid'].includes(order.status)) {
    throw Object.assign(new Error('Order cannot be cancelled at this stage'), { status: 400 });
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'Cancelled by buyer';
  await order.save();

  return order;
};

// ─── Dashboard stats for a user ──────────────────────────────────────────────
export const getOrderStats = async (userId) => {
  const [buyerStats, sellerStats] = await Promise.all([
    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const toMap = (arr) => arr.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {});

  return {
    asbuyer: toMap(buyerStats),
    asSeller: toMap(sellerStats)
  };
};

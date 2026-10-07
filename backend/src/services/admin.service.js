import User from '../models/User.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';

/**
 * Get comprehensive analytics and stats for Admin Dashboard
 */
export const getAnalyticsOverview = async () => {
  const [
    totalUsers,
    verifiedStudents,
    totalServices,
    activeServices,
    totalOrders,
    completedOrders,
    revenueData,
    recentOrders,
    recentUsers,
    categoryDistribution,
    orderStatusCounts
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerifiedStudent: true }),
    Service.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ status: 'completed' }),

    // Total GMV / Platform Volume from paid and completed orders
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'accepted', 'in_progress', 'submitted', 'completed'] } } },
      { $group: { _id: null, totalVolume: { $sum: '$amount' } } }
    ]),

    // Recent 5 orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('buyerId', 'name email collegeName')
      .populate('sellerId', 'name email collegeName'),

    // Recent 5 users
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email collegeName isVerifiedStudent role createdAt profileImage'),

    // Category distribution
    Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Order status breakdown
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const totalGMV = revenueData.length > 0 ? revenueData[0].totalVolume : 0;
  // Estimated 5% student platform fee revenue
  const platformRevenue = Math.round(totalGMV * 0.05);

  const statusMap = {};
  orderStatusCounts.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  return {
    metrics: {
      totalUsers,
      verifiedStudents,
      unverifiedStudents: totalUsers - verifiedStudents,
      totalServices,
      activeServices,
      totalOrders,
      completedOrders,
      totalGMV,
      platformRevenue
    },
    recentOrders,
    recentUsers,
    categoryDistribution: categoryDistribution.map((c) => ({
      category: c._id,
      count: c.count
    })),
    orderStatusDistribution: statusMap
  };
};

/**
 * Get paginated users list with filters
 */
export const getUsers = async ({
  search = '',
  role,
  isVerifiedStudent,
  isSuspended,
  page = 1,
  limit = 20
}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { collegeName: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) query.role = role;
  if (isVerifiedStudent !== undefined && isVerifiedStudent !== '') {
    query.isVerifiedStudent = isVerifiedStudent === 'true' || isVerifiedStudent === true;
  }
  if (isSuspended !== undefined && isSuspended !== '') {
    query.isSuspended = isSuspended === 'true' || isSuspended === true;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-password'),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Toggle student verification badge manually
 */
export const toggleUserVerification = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isVerifiedStudent = !user.isVerifiedStudent;
  await user.save();

  return user;
};

/**
 * Change user role (user <-> admin)
 */
export const updateUserRole = async (userId, newRole) => {
  if (!['user', 'admin'].includes(newRole)) {
    const error = new Error('Invalid role specified');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.role = newRole;
  await user.save();

  return user;
};

/**
 * Suspend or unsuspend user
 */
export const toggleUserSuspension = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isSuspended = !user.isSuspended;
  await user.save();

  return user;
};

/**
 * Get all services / gigs with filters
 */
export const getServices = async ({
  search = '',
  category,
  isActive,
  page = 1,
  limit = 20
}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.category = category;
  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true' || isActive === true;
  }

  const [services, total] = await Promise.all([
    Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sellerId', 'name email collegeName isVerifiedStudent profileImage'),
    Service.countDocuments(query)
  ]);

  return {
    services,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Toggle service active/disabled status
 */
export const toggleServiceStatus = async (serviceId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }

  service.isActive = !service.isActive;
  await service.save();

  return service;
};

/**
 * Delete a service
 */
export const deleteService = async (serviceId) => {
  const service = await Service.findByIdAndDelete(serviceId);
  if (!service) {
    const error = new Error('Service not found');
    error.statusCode = 404;
    throw error;
  }
  return service;
};

/**
 * Get all platform orders with filters
 */
export const getOrders = async ({
  search = '',
  status,
  page = 1,
  limit = 20
}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const query = {};

  if (status) query.status = status;
  if (search) {
    query['serviceSnapshot.title'] = { $regex: search, $options: 'i' };
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('buyerId', 'name email collegeName')
      .populate('sellerId', 'name email collegeName')
      .populate('serviceId', 'title category'),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Resolve order dispute (force refund or force complete)
 */
export const resolveOrderDispute = async (orderId, { resolution, reason = '' }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (resolution === 'refund') {
    order.status = 'cancelled';
    order.cancellationReason = `Admin dispute resolution: ${reason || 'Refund issued to buyer'}`;
  } else if (resolution === 'complete') {
    order.status = 'completed';
    order.completedAt = new Date();
  } else {
    const error = new Error('Invalid resolution type. Must be "refund" or "complete"');
    error.statusCode = 400;
    throw error;
  }

  await order.save();

  return order;
};

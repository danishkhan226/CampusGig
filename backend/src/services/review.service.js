import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

/**
 * Create a new review for a completed order
 */
export const createReview = async ({ orderId, rating, comment, buyerId }) => {
  // 1. Validate order exists and belongs to buyer
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (order.buyerId.toString() !== buyerId.toString()) {
    const error = new Error('You are not authorized to review this order');
    error.statusCode = 403;
    throw error;
  }

  // 2. Validate order status is completed
  if (order.status !== 'completed') {
    const error = new Error('You can only review completed orders');
    error.statusCode = 400;
    throw error;
  }

  // 3. Ensure order has not been reviewed yet
  if (order.isReviewed) {
    const error = new Error('This order has already been reviewed');
    error.statusCode = 400;
    throw error;
  }

  const existingReview = await Review.findOne({ orderId });
  if (existingReview) {
    const error = new Error('A review for this order already exists');
    error.statusCode = 400;
    throw error;
  }

  // 4. Create review document
  const review = await Review.create({
    orderId,
    serviceId: order.serviceId,
    buyerId,
    sellerId: order.sellerId,
    rating: Number(rating),
    comment: comment.trim()
  });

  // 5. Mark order as reviewed
  order.isReviewed = true;
  await order.save();

  // 6. Recalculate Service rating & reviewCount
  const serviceReviews = await Review.find({ serviceId: order.serviceId });
  const totalServiceRating = serviceReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgServiceRating = serviceReviews.length > 0 
    ? Math.round((totalServiceRating / serviceReviews.length) * 10) / 10 
    : 0;

  await Service.findByIdAndUpdate(order.serviceId, {
    rating: avgServiceRating,
    reviewCount: serviceReviews.length
  });

  // 7. Recalculate Seller User rating & totalReviews
  const sellerReviews = await Review.find({ sellerId: order.sellerId });
  const totalSellerRating = sellerReviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgSellerRating = sellerReviews.length > 0
    ? Math.round((totalSellerRating / sellerReviews.length) * 10) / 10
    : 0;

  await User.findByIdAndUpdate(order.sellerId, {
    rating: avgSellerRating,
    totalReviews: sellerReviews.length
  });

  return await review.populate('buyerId', 'name profileImage collegeName isVerifiedStudent');
};

/**
 * Fetch reviews for a specific gig / service with breakdown stats
 */
export const getServiceReviews = async (serviceId, { page = 1, limit = 10, rating } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Filter query
  const query = { serviceId };
  if (rating) {
    query.rating = Number(rating);
  }

  const [reviews, totalMatching, allReviews] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('buyerId', 'name profileImage collegeName isVerifiedStudent'),
    Review.countDocuments(query),
    Review.find({ serviceId }, 'rating')
  ]);

  // Calculate rating breakdown (counts & percentages for 1 to 5 stars)
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumRating = 0;

  allReviews.forEach((r) => {
    if (breakdown[r.rating] !== undefined) {
      breakdown[r.rating] += 1;
    }
    sumRating += r.rating;
  });

  const totalReviews = allReviews.length;
  const averageRating = totalReviews > 0 ? Math.round((sumRating / totalReviews) * 10) / 10 : 0;

  return {
    reviews,
    pagination: {
      total: totalMatching,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalMatching / limitNum) || 1
    },
    stats: {
      totalReviews,
      averageRating,
      breakdown
    }
  };
};

/**
 * Fetch all reviews received by a seller across all their services
 */
export const getUserReviews = async (sellerId, { page = 1, limit = 10 } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    Review.find({ sellerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('buyerId', 'name profileImage collegeName isVerifiedStudent')
      .populate('serviceId', 'title category price'),
    Review.countDocuments({ sellerId })
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Fetch review for a specific order
 */
export const getReviewByOrderId = async (orderId) => {
  const review = await Review.findOne({ orderId })
    .populate('buyerId', 'name profileImage collegeName isVerifiedStudent')
    .populate('sellerId', 'name profileImage collegeName');
  return review;
};

/**
 * Add or update seller reply to a client review
 */
export const replyToReview = async (reviewId, sellerId, message) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const error = new Error('Review not found');
    error.statusCode = 404;
    throw error;
  }

  if (review.sellerId.toString() !== sellerId.toString()) {
    const error = new Error('Only the freelancer who completed the gig can reply to this review');
    error.statusCode = 403;
    throw error;
  }

  review.sellerReply = {
    message: message.trim(),
    repliedAt: new Date()
  };

  await review.save();
  return await review.populate('buyerId', 'name profileImage collegeName isVerifiedStudent');
};

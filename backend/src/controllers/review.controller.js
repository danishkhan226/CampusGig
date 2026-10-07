import * as reviewService from '../services/review.service.js';

/**
 * POST /api/reviews
 * Submit a review for a completed order
 */
export const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars'
      });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 5 characters long'
      });
    }

    const review = await reviewService.createReview({
      orderId,
      rating,
      comment,
      buyerId: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/service/:serviceId
 * Get reviews and rating breakdown for a service
 */
export const getServiceReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page, limit, rating } = req.query;

    const result = await reviewService.getServiceReviews(serviceId, {
      page,
      limit,
      rating
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/user/:userId
 * Get reviews received by a seller across all services
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await reviewService.getUserReviews(userId, {
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/order/:orderId
 * Get review associated with a specific order
 */
export const getOrderReview = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const review = await reviewService.getReviewByOrderId(orderId);

    return res.status(200).json({
      success: true,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reviews/:id/reply
 * Seller reply to a review
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message cannot be empty'
      });
    }

    const review = await reviewService.replyToReview(id, req.user._id, message);

    return res.status(200).json({
      success: true,
      message: 'Reply submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

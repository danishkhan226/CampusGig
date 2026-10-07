import api from './api.js';

// POST /api/reviews — create review for completed order
export const createReview = ({ orderId, rating, comment }) =>
  api.post('/reviews', { orderId, rating, comment });

// GET /api/reviews/service/:serviceId — get reviews for a gig with breakdown
export const getServiceReviews = (serviceId, params = {}) =>
  api.get(`/reviews/service/${serviceId}`, { params });

// GET /api/reviews/user/:userId — get reviews received by a seller
export const getUserReviews = (userId, params = {}) =>
  api.get(`/reviews/user/${userId}`, { params });

// GET /api/reviews/order/:orderId — get review for a specific order
export const getOrderReview = (orderId) =>
  api.get(`/reviews/order/${orderId}`);

// POST /api/reviews/:id/reply — seller reply to a review
export const replyToReview = (reviewId, message) =>
  api.post(`/reviews/${reviewId}/reply`, { message });

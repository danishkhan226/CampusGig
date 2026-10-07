import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as reviewController from '../controllers/review.controller.js';

const router = Router();

// Public routes: view reviews
router.get('/service/:serviceId', reviewController.getServiceReviews);
router.get('/user/:userId', reviewController.getUserReviews);

// Protected routes: submit review, get order review, reply
router.post('/', protect, reviewController.createReview);
router.get('/order/:orderId', protect, reviewController.getOrderReview);
router.post('/:id/reply', protect, reviewController.replyToReview);

export default router;

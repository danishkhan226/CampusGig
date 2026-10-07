import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createOrder,
  getMyOrders,
  getStats,
  getOrder,
  confirmPayment,
  acceptOrder,
  rejectOrder,
  submitWork,
  completeOrder,
  requestRevision,
  cancelOrder
} from '../controllers/order.controller.js';

const router = Router();

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);           // buyer creates order
router.get('/', getMyOrders);            // list orders (buyer or seller view)
router.get('/stats', getStats);          // dashboard stats

router.get('/:id', getOrder);            // get single order detail

router.post('/:id/pay', confirmPayment); // confirm Razorpay payment
router.patch('/:id/accept', acceptOrder);   // seller accepts
router.patch('/:id/reject', rejectOrder);   // seller rejects
router.patch('/:id/submit', submitWork);    // seller submits work
router.patch('/:id/complete', completeOrder); // buyer approves
router.patch('/:id/revision', requestRevision); // buyer requests revision
router.patch('/:id/cancel', cancelOrder);   // buyer cancels

export default router;

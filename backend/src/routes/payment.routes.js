import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails
} from '../controllers/payment.controller.js';

 const router = Router();

// All payment operations require authentication
router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/order/:orderId', getPaymentDetails);

export default router;

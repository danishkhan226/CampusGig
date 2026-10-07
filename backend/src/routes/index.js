import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import serviceRoutes from './service.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import uploadRoutes from './upload.routes.js';
import reviewRoutes from './review.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/chat', chatRoutes);

export default router;

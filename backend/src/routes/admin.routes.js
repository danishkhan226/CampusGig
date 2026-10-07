import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

// Protect all admin routes with authentication and admin role authorization
router.use(protect);
router.use(authorize('admin'));

// Analytics
router.get('/analytics', adminController.getAnalyticsOverview);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/verify', adminController.toggleUserVerification);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/suspend', adminController.toggleUserSuspension);

// Service / Gig Moderation
router.get('/services', adminController.getServices);
router.patch('/services/:id/toggle', adminController.toggleServiceStatus);
router.delete('/services/:id', adminController.deleteService);

// Order & Escrow Management
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/resolve', adminController.resolveOrderDispute);

export default router;

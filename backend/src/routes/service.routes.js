import { Router } from 'express';
import {
  getAllServices,
  getServiceDetails,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getAllServices);
router.post('/', protect, createService);
router.get('/:id', getServiceDetails);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

export default router;

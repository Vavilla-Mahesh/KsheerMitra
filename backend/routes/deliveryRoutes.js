import express from 'express';
import * as deliveryController from '../controllers/deliveryController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, deliveryStatusSchema } from '../utils/validation.js';

const router = express.Router();

router.get('/assigned', verifyToken, checkRole('delivery_boy'), deliveryController.getAssignedDeliveries);
router.get('/all', verifyToken, checkRole('admin'), deliveryController.getAllDeliveries);
router.get('/:id', verifyToken, deliveryController.getDeliveryById);
router.put('/:id/status', verifyToken, checkRole('delivery_boy', 'admin'), validate(deliveryStatusSchema), deliveryController.updateDeliveryStatus);

export default router;

import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, orderSchema, orderStatusSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('admin', 'customer'), validate(orderSchema), orderController.createOrder);
router.get('/:id', verifyToken, orderController.getOrderById);
router.put('/:id/status', verifyToken, checkRole('admin', 'delivery_boy'), validate(orderStatusSchema), orderController.updateOrderStatus);

export default router;

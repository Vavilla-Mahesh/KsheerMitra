import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, orderSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('admin', 'customer'), validate(orderSchema), orderController.createOrder);
router.get('/:id', verifyToken, orderController.getOrderById);

export default router;

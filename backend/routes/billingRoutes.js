import express from 'express';
import * as billingController from '../controllers/billingController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:customerId/billing', verifyToken, checkRole('admin', 'customer'), billingController.getMonthlyBilling);

export default router;

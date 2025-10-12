import express from 'express';
import * as dailyAdjustmentController from '../controllers/dailyAdjustmentController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, dailyAdjustmentSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/:subscriptionId/adjustments', verifyToken, checkRole('admin', 'customer'), validate(dailyAdjustmentSchema), dailyAdjustmentController.createOrUpdateAdjustment);
router.get('/:subscriptionId/adjustments', verifyToken, dailyAdjustmentController.getSubscriptionAdjustments);

export default router;

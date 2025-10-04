import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validateOneOf, subscriptionSchema, updateSubscriptionSchema, enhancedSubscriptionSchema, updateEnhancedSubscriptionSchema } from '../utils/validation.js';

const router = express.Router();

// Support both legacy and enhanced subscription schemas
router.post('/', verifyToken, checkRole('admin', 'customer'), validateOneOf(enhancedSubscriptionSchema, subscriptionSchema), subscriptionController.createSubscription);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);
router.put('/:id', verifyToken, checkRole('admin', 'customer'), validateOneOf(updateEnhancedSubscriptionSchema, updateSubscriptionSchema), subscriptionController.updateSubscription);
router.delete('/:id', verifyToken, checkRole('admin', 'customer'), subscriptionController.deleteSubscription);

// Enhanced subscription management
router.put('/:id/adjust-date', verifyToken, checkRole('admin', 'customer'), subscriptionController.adjustDateOrder);
router.put('/:id/update-all', verifyToken, checkRole('admin', 'customer'), validateOneOf(updateEnhancedSubscriptionSchema, updateSubscriptionSchema), subscriptionController.updateAllSchedule);

export default router;

import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validateOneOf, subscriptionSchema, updateSubscriptionSchema, enhancedSubscriptionSchema, updateEnhancedSubscriptionSchema } from '../utils/validation.js';

const router = express.Router();

// Support both legacy and enhanced subscription schemas
// Check subscriptionSchema first (single-product), then enhancedSubscriptionSchema (multi-product)
router.post('/', verifyToken, checkRole('admin', 'customer'), validateOneOf(subscriptionSchema, enhancedSubscriptionSchema), subscriptionController.createSubscription);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);
router.put('/:id', verifyToken, checkRole('admin', 'customer'), validateOneOf(updateSubscriptionSchema, updateEnhancedSubscriptionSchema), subscriptionController.updateSubscription);
router.delete('/:id', verifyToken, checkRole('admin', 'customer'), subscriptionController.deleteSubscription);

// Enhanced subscription management
router.put('/:id/items', verifyToken, checkRole('admin', 'customer'), subscriptionController.updateSubscriptionItems);
router.put('/:id/adjust-date', verifyToken, checkRole('admin', 'customer'), subscriptionController.adjustDateOrder);
router.put('/:id/update-all', verifyToken, checkRole('admin', 'customer'), validateOneOf(updateSubscriptionSchema, updateEnhancedSubscriptionSchema), subscriptionController.updateAllSchedule);

export default router;

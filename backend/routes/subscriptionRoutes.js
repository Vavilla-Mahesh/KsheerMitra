import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { verifyToken, checkRole } from '../middlewares/auth.js';
import { validate, subscriptionSchema, updateSubscriptionSchema } from '../utils/validation.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('admin', 'customer'), validate(subscriptionSchema), subscriptionController.createSubscription);
router.get('/:id', verifyToken, subscriptionController.getSubscriptionById);
router.put('/:id', verifyToken, checkRole('admin', 'customer'), validate(updateSubscriptionSchema), subscriptionController.updateSubscription);
router.delete('/:id', verifyToken, checkRole('admin', 'customer'), subscriptionController.deleteSubscription);

export default router;

import express from 'express';
import {
  getAssignedCustomers,
  updateDeliveryStatus,
  generateDailyInvoice,
  getDeliveryStats
} from '../controllers/newDeliveryController.js';
import { authenticate, isDeliveryBoy } from '../middlewares/otpAuthMiddleware.js';

const router = express.Router();

// All routes require authentication as delivery boy
router.use(authenticate, isDeliveryBoy);

// Get assigned customers with route optimization
router.get('/assigned-customers', getAssignedCustomers);

// Update delivery status
router.put('/status/:deliveryStatusId', updateDeliveryStatus);

// Generate daily invoice
router.post('/invoice/daily', generateDailyInvoice);

// Get delivery statistics
router.get('/stats', getDeliveryStats);

export default router;

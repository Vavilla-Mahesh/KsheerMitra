import express from 'express';
import {
  getAssignedCustomers,
  updateDeliveryStatus,
  generateDailyInvoice,
  getDeliveryStats
} from '../controllers/newDeliveryController.js';
import { authenticate, isDeliveryBoy } from '../middlewares/otpAuthMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for delivery endpoints
const deliveryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests, please slow down'
});

// All routes require authentication as delivery boy
router.use(authenticate, isDeliveryBoy);

// Get assigned customers with route optimization
router.get('/assigned-customers', deliveryLimiter, getAssignedCustomers);

// Update delivery status
router.put('/status/:deliveryStatusId', deliveryLimiter, updateDeliveryStatus);

// Generate daily invoice
router.post('/invoice/daily', deliveryLimiter, generateDailyInvoice);

// Get delivery statistics
router.get('/stats', deliveryLimiter, getDeliveryStats);

export default router;

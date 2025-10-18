import express from 'express';
import {
  assignArea,
  getAreaAssignments,
  getDashboardStats,
  getInvoices,
  getDeliveryStatuses,
  createDeliveryBoy,
  getDeliveryBoys
} from '../controllers/newAdminController.js';
import { authenticate, isAdmin } from '../middlewares/otpAuthMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please slow down'
});

// All routes require authentication as admin
router.use(authenticate, isAdmin);

// Area assignment
router.post('/area/assign', adminLimiter, assignArea);
router.get('/area/assignments', adminLimiter, getAreaAssignments);

// Dashboard
router.get('/dashboard/stats', adminLimiter, getDashboardStats);

// Invoices
router.get('/invoices', adminLimiter, getInvoices);

// Delivery statuses
router.get('/delivery-statuses', adminLimiter, getDeliveryStatuses);

// Delivery boys management
router.post('/delivery-boys', adminLimiter, createDeliveryBoy);
router.get('/delivery-boys', adminLimiter, getDeliveryBoys);

export default router;

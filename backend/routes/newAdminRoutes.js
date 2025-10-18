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

const router = express.Router();

// All routes require authentication as admin
router.use(authenticate, isAdmin);

// Area assignment
router.post('/area/assign', assignArea);
router.get('/area/assignments', getAreaAssignments);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Invoices
router.get('/invoices', getInvoices);

// Delivery statuses
router.get('/delivery-statuses', getDeliveryStatuses);

// Delivery boys management
router.post('/delivery-boys', createDeliveryBoy);
router.get('/delivery-boys', getDeliveryBoys);

export default router;

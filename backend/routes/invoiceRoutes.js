import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All invoice routes require authentication
router.use(authenticateToken);

// Generate daily invoice (admin or delivery boy can trigger)
router.post('/daily', authorizeRoles('admin', 'delivery_boy'), invoiceController.generateDailyInvoice);

// Generate monthly invoice (admin only)
router.post('/monthly', authorizeRoles('admin'), invoiceController.generateMonthlyInvoice);

// Get all invoices (admin only)
router.get('/', authorizeRoles('admin'), invoiceController.getAllInvoices);

// Get invoice by ID (admin, or the user who the invoice is for)
router.get('/:id', invoiceController.getInvoiceById);

// Download invoice PDF
router.get('/:id/download', invoiceController.downloadInvoicePDF);

export default router;

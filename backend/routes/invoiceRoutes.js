import express from 'express';
import { generateMonthlyInvoice, getCustomerInvoices } from '../controllers/invoiceController.js';
import { authenticate } from '../middlewares/otpAuthMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for invoice endpoints
const invoiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please slow down'
});

// Generate monthly invoice for a customer
router.post('/monthly/:customerId', authenticate, invoiceLimiter, generateMonthlyInvoice);

// Get invoices for a customer
router.get('/customer/:customerId', authenticate, invoiceLimiter, getCustomerInvoices);

export default router;

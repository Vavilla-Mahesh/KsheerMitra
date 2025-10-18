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
router.post('/monthly/:customerId', invoiceLimiter, authenticate, generateMonthlyInvoice);

// Get invoices for a customer
router.get('/customer/:customerId', invoiceLimiter, authenticate, getCustomerInvoices);

export default router;

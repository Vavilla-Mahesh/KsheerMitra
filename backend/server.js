import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initializeSystemUsers } from './utils/initializeUsers.js';
import { initializeWhatsApp, isWhatsAppReady } from './services/whatsappService.js';
import { initializeScheduler } from './services/schedulerService.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import dailyAdjustmentRoutes from './routes/dailyAdjustmentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    whatsappReady: isWhatsAppReady()
  });
});

// Meta endpoint
app.get('/meta', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'KsheerMitra API',
      version: '1.0.0',
      description: 'Milk Delivery Management System',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/subscriptions', dailyAdjustmentRoutes);
app.use('/orders', orderRoutes);
app.use('/customers/:customerId/orders', (req, res, next) => {
  req.params.customerId = req.params.customerId;
  next();
});
app.use('/delivery', deliveryRoutes);
app.use('/customers', billingRoutes);
app.use('/admin', adminRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/otp', otpRoutes);

// Customer-specific subscription endpoint
app.get('/customers/:customerId/subscriptions', async (req, res, next) => {
  const subscriptionController = await import('./controllers/subscriptionController.js');
  subscriptionController.getCustomerSubscriptions(req, res, next);
});

// Customer-specific order endpoint
app.get('/customers/:customerId/orders', async (req, res, next) => {
  const orderController = await import('./controllers/orderController.js');
  orderController.getCustomerOrders(req, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize system users (admin and delivery boy)
    await initializeSystemUsers();
    
    // Initialize WhatsApp client (non-blocking)
    initializeWhatsApp().catch(error => {
      console.error('Failed to initialize WhatsApp client:', error);
      console.warn('Server will continue without WhatsApp integration');
    });
    
    // Initialize scheduler for automated jobs
    initializeScheduler();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('WhatsApp integration: Initializing...');
      console.log('Scheduler: Active');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

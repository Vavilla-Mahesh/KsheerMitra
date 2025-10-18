import cron from 'node-cron';
import { Op } from 'sequelize';
import { DeliveryStatus, Invoice, User, Subscription, Product } from '../models/sequelize/index.js';
import { getInvoiceService } from './invoiceService.js';
import { getWhatsAppService } from './whatsappService.js';

class CronService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Initialize all cron jobs
   */
  initializeJobs() {
    // Daily invoice generation at 8 PM
    this.scheduleDailyInvoiceGeneration();

    // Monthly invoice generation on 1st of every month at 9 AM
    this.scheduleMonthlyInvoiceGeneration();

    console.log('Cron jobs initialized');
  }

  /**
   * Schedule daily invoice generation
   * Runs at 8 PM every day
   */
  scheduleDailyInvoiceGeneration() {
    const job = cron.schedule('0 20 * * *', async () => {
      console.log('Running daily invoice generation...');
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get all delivery boys
        const deliveryBoys = await User.findAll({
          where: { role: 'DELIVERY' }
        });

        for (const deliveryBoy of deliveryBoys) {
          await this.generateDailyInvoiceForDeliveryBoy(deliveryBoy.id, today);
        }

        console.log('Daily invoice generation completed');
      } catch (error) {
        console.error('Error in daily invoice generation:', error);
      }
    });

    this.jobs.push(job);
  }

  /**
   * Schedule monthly invoice generation
   * Runs on 1st of every month at 9 AM
   */
  scheduleMonthlyInvoiceGeneration() {
    const job = cron.schedule('0 9 1 * *', async () => {
      console.log('Running monthly invoice generation...');
      
      try {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const month = lastMonth.getMonth() + 1;
        const year = lastMonth.getFullYear();

        // Get all customers
        const customers = await User.findAll({
          where: { role: 'CUSTOMER' }
        });

        for (const customer of customers) {
          await this.generateMonthlyInvoiceForCustomer(customer.id, month, year);
        }

        console.log('Monthly invoice generation completed');
      } catch (error) {
        console.error('Error in monthly invoice generation:', error);
      }
    });

    this.jobs.push(job);
  }

  /**
   * Generate daily invoice for a delivery boy
   */
  async generateDailyInvoiceForDeliveryBoy(deliveryBoyId, date) {
    try {
      const deliveryBoy = await User.findByPk(deliveryBoyId);
      if (!deliveryBoy) {
        console.error(`Delivery boy ${deliveryBoyId} not found`);
        return;
      }

      // Get all deliveries for the day
      const deliveries = await DeliveryStatus.findAll({
        where: {
          deliveryBoyId,
          date,
          status: 'DELIVERED'
        },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['name']
          },
          {
            model: Subscription,
            as: 'subscription',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'price']
              }
            ]
          }
        ]
      });

      if (deliveries.length === 0) {
        console.log(`No deliveries for ${deliveryBoy.name} on ${date}`);
        return;
      }

      // Prepare invoice data
      const deliveryItems = deliveries.map(d => ({
        customerName: d.customer.name,
        productName: d.subscription.product.name,
        quantity: d.subscription.quantity,
        price: parseFloat(d.subscription.product.price),
        amount: d.subscription.quantity * parseFloat(d.subscription.product.price)
      }));

      const totalAmount = deliveryItems.reduce((sum, item) => sum + item.amount, 0);

      // Generate PDF
      const invoiceService = getInvoiceService();
      const pdfPath = await invoiceService.generateDailyInvoice({
        deliveryBoyId: deliveryBoy.id,
        deliveryBoyName: deliveryBoy.name,
        date,
        deliveries: deliveryItems,
        totalAmount
      });

      // Save invoice to database
      const invoice = await Invoice.create({
        generatedBy: deliveryBoyId,
        targetUserId: null,
        type: 'DAILY',
        amount: totalAmount,
        pdfPath,
        date
      });

      // Send to admin via WhatsApp
      const admin = await User.findOne({ where: { role: 'ADMIN' } });
      if (admin && admin.phone) {
        const whatsappService = getWhatsAppService();
        const sent = await whatsappService.sendInvoice(admin.phone, 'DAILY', pdfPath);
        
        if (sent) {
          await invoice.update({ sentViaWhatsApp: true });
        }
      }

      console.log(`Daily invoice generated for ${deliveryBoy.name}`);
    } catch (error) {
      console.error(`Error generating daily invoice for delivery boy ${deliveryBoyId}:`, error);
    }
  }

  /**
   * Generate monthly invoice for a customer
   */
  async generateMonthlyInvoiceForCustomer(customerId, month, year) {
    try {
      const customer = await User.findByPk(customerId);
      if (!customer) {
        console.error(`Customer ${customerId} not found`);
        return;
      }

      // Get all deliveries for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const deliveries = await DeliveryStatus.findAll({
        where: {
          customerId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: Subscription,
            as: 'subscription',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['name', 'price']
              }
            ]
          }
        ],
        order: [['date', 'ASC']]
      });

      if (deliveries.length === 0) {
        console.log(`No deliveries for ${customer.name} in ${month}/${year}`);
        return;
      }

      // Prepare invoice data
      const deliveryItems = deliveries.map(d => ({
        date: d.date,
        productName: d.subscription.product.name,
        quantity: d.subscription.quantity,
        price: parseFloat(d.subscription.product.price),
        amount: d.subscription.quantity * parseFloat(d.subscription.product.price),
        status: d.status
      }));

      const totalAmount = deliveryItems
        .filter(item => item.status === 'DELIVERED')
        .reduce((sum, item) => sum + item.amount, 0);

      // Generate PDF
      const invoiceService = getInvoiceService();
      const pdfPath = await invoiceService.generateMonthlyInvoice({
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        month,
        year,
        deliveries: deliveryItems,
        totalAmount,
        paymentStatus: 'Pending'
      });

      // Get admin for generatedBy field
      const admin = await User.findOne({ where: { role: 'ADMIN' } });

      // Save invoice to database
      const invoice = await Invoice.create({
        generatedBy: admin ? admin.id : customerId,
        targetUserId: customerId,
        type: 'MONTHLY',
        amount: totalAmount,
        pdfPath,
        date: new Date()
      });

      // Send to customer via WhatsApp
      if (customer.phone) {
        const whatsappService = getWhatsAppService();
        const sent = await whatsappService.sendInvoice(customer.phone, 'MONTHLY', pdfPath);
        
        if (sent) {
          await invoice.update({ sentViaWhatsApp: true });
        }
      }

      console.log(`Monthly invoice generated for ${customer.name}`);
    } catch (error) {
      console.error(`Error generating monthly invoice for customer ${customerId}:`, error);
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAllJobs() {
    this.jobs.forEach(job => job.stop());
    console.log('All cron jobs stopped');
  }
}

// Singleton instance
let cronService = null;

export const getCronService = () => {
  if (!cronService) {
    cronService = new CronService();
  }
  return cronService;
};

export default CronService;

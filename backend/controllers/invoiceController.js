import { Invoice, User, DeliveryStatus, Subscription, Product } from '../models/sequelize/index.js';
import { getInvoiceService } from '../services/invoiceService.js';
import { getWhatsAppService } from '../services/whatsappService.js';
import { Op } from 'sequelize';

/**
 * Generate monthly invoice for a customer
 */
export const generateMonthlyInvoice = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { month, year } = req.body;

    // Default to previous month if not specified
    const now = new Date();
    const targetMonth = month || (now.getMonth() === 0 ? 12 : now.getMonth());
    const targetYear = year || (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

    // Get customer
    const customer = await User.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get deliveries for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const deliveries = await DeliveryStatus.findAll({
      where: {
        customerId,
        date: {
          [Op.between]: [startDate, endDate]
        },
        status: 'DELIVERED'
      },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        }
      ],
      order: [['date', 'ASC']]
    });

    if (deliveries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No deliveries found for this period'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const deliveryData = deliveries.map(d => {
      const amount = d.subscription.quantity * d.subscription.product.price;
      totalAmount += amount;
      return {
        date: d.date,
        productName: d.subscription.product.name,
        quantity: d.subscription.quantity,
        price: d.subscription.product.price,
        amount,
        status: d.status
      };
    });

    // Generate PDF
    const invoiceService = getInvoiceService();
    const pdfPath = await invoiceService.generateMonthlyInvoice({
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address,
      month: targetMonth,
      year: targetYear,
      deliveries: deliveryData,
      totalAmount,
      paymentStatus: 'Pending'
    });

    // Save invoice record
    const invoice = await Invoice.create({
      generatedBy: req.user.id,
      targetUserId: customerId,
      type: 'MONTHLY',
      amount: totalAmount,
      pdfPath,
      date: new Date(targetYear, targetMonth - 1, 1)
    });

    // Send via WhatsApp if enabled
    if (customer.phone) {
      try {
        const whatsappService = getWhatsAppService();
        const sent = await whatsappService.sendInvoice(customer.phone, 'MONTHLY', pdfPath);
        if (sent) {
          await invoice.update({ sentViaWhatsApp: true });
        }
      } catch (error) {
        console.error('Failed to send invoice via WhatsApp:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Monthly invoice generated successfully',
      data: {
        invoice: {
          id: invoice.id,
          type: invoice.type,
          amount: invoice.amount,
          date: invoice.date,
          pdfPath: invoice.pdfPath,
          sentViaWhatsApp: invoice.sentViaWhatsApp
        },
        deliveriesCount: deliveries.length,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Generate monthly invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate monthly invoice'
    });
  }
};

/**
 * Get invoices for a customer
 */
export const getCustomerInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { type, startDate, endDate } = req.query;

    const whereClause = { targetUserId: customerId };

    if (type) {
      whereClause.type = type;
    }

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'role']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get customer invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

export default {
  generateMonthlyInvoice,
  getCustomerInvoices
};

import { DeliveryStatus, User, Subscription, Product, AreaAssignment } from '../models/sequelize/index.js';
import { getWhatsAppService } from '../services/whatsappService.js';
import { getGoogleMapsService } from '../services/googleMapsService.js';
import { getInvoiceService } from '../services/invoiceService.js';
import { Invoice } from '../models/sequelize/index.js';
import { Op } from 'sequelize';

/**
 * Get assigned customers for a delivery boy with route optimization
 */
export const getAssignedCustomers = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Get area assignment
    const areaAssignment = await AreaAssignment.findOne({
      where: { deliveryBoyId }
    });

    if (!areaAssignment || !areaAssignment.customers || areaAssignment.customers.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          customers: [],
          route: null
        }
      });
    }

    // Get delivery statuses for the date
    const deliveryStatuses = await DeliveryStatus.findAll({
      where: {
        deliveryBoyId,
        date
      },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'address', 'latitude', 'longitude']
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'price', 'unit']
            }
          ]
        }
      ]
    });

    // Get delivery boy location
    const deliveryBoy = await User.findByPk(deliveryBoyId);

    // Calculate optimized route if locations are available
    let route = null;
    if (deliveryBoy.latitude && deliveryBoy.longitude) {
      const customerLocations = deliveryStatuses
        .filter(ds => ds.customer.latitude && ds.customer.longitude)
        .map(ds => ({
          customerId: ds.customer.id,
          lat: ds.customer.latitude,
          lng: ds.customer.longitude
        }));

      if (customerLocations.length > 0) {
        try {
          const mapsService = getGoogleMapsService();
          route = await mapsService.getOptimizedDeliveryRoute(
            { lat: deliveryBoy.latitude, lng: deliveryBoy.longitude },
            customerLocations
          );
        } catch (error) {
          console.error('Route optimization failed:', error);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        customers: deliveryStatuses.map(ds => ({
          id: ds.id,
          customerId: ds.customer.id,
          customerName: ds.customer.name,
          customerPhone: ds.customer.phone,
          customerAddress: ds.customer.address,
          latitude: ds.customer.latitude,
          longitude: ds.customer.longitude,
          product: ds.subscription.product.name,
          quantity: ds.subscription.quantity,
          price: ds.subscription.product.price,
          status: ds.status,
          date: ds.date
        })),
        route
      }
    });
  } catch (error) {
    console.error('Get assigned customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned customers'
    });
  }
};

/**
 * Update delivery status (Delivered/Missed/Pending)
 */
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatusId } = req.params;
    const { status, notes } = req.body;

    if (!['PENDING', 'DELIVERED', 'MISSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const deliveryStatus = await DeliveryStatus.findByPk(deliveryStatusId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['phone', 'name']
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name']
            }
          ]
        }
      ]
    });

    if (!deliveryStatus) {
      return res.status(404).json({
        success: false,
        message: 'Delivery status not found'
      });
    }

    // Update status
    await deliveryStatus.update({ status });

    // Send WhatsApp notification to customer
    if (status === 'DELIVERED' || status === 'MISSED') {
      const whatsappService = getWhatsAppService();
      await whatsappService.sendDeliveryNotification(
        deliveryStatus.customer.phone,
        status,
        deliveryStatus.date,
        deliveryStatus.subscription.product.name
      );
    }

    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      data: deliveryStatus
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status'
    });
  }
};

/**
 * Generate and send daily invoice to admin
 */
export const generateDailyInvoice = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const date = req.body.date || new Date().toISOString().split('T')[0];

    const deliveryBoy = await User.findByPk(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    // Get all delivered items for the day
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
      return res.status(400).json({
        success: false,
        message: 'No deliveries found for this date'
      });
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

    res.status(200).json({
      success: true,
      message: 'Daily invoice generated and sent',
      data: {
        invoiceId: invoice.id,
        totalAmount,
        deliveryCount: deliveries.length
      }
    });
  } catch (error) {
    console.error('Generate daily invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily invoice'
    });
  }
};

/**
 * Get delivery statistics for a delivery boy
 */
export const getDeliveryStats = async (req, res) => {
  try {
    const deliveryBoyId = req.user.id;
    const { startDate, endDate } = req.query;

    const where = { deliveryBoyId };
    
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const deliveries = await DeliveryStatus.findAll({ where });

    const stats = {
      total: deliveries.length,
      delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
      missed: deliveries.filter(d => d.status === 'MISSED').length,
      pending: deliveries.filter(d => d.status === 'PENDING').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get delivery stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery statistics'
    });
  }
};

export default {
  getAssignedCustomers,
  updateDeliveryStatus,
  generateDailyInvoice,
  getDeliveryStats
};

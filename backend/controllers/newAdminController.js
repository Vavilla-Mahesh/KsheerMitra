import { User, Product, Subscription, DeliveryStatus, AreaAssignment, Invoice } from '../models/sequelize/index.js';
import { Op } from 'sequelize';

/**
 * Create or update area assignment for a delivery boy
 */
export const assignArea = async (req, res) => {
  try {
    const { deliveryBoyId, areaName, customerIds } = req.body;

    if (!deliveryBoyId || !areaName || !customerIds || !Array.isArray(customerIds)) {
      return res.status(400).json({
        success: false,
        message: 'deliveryBoyId, areaName, and customerIds array are required'
      });
    }

    // Verify delivery boy exists
    const deliveryBoy = await User.findOne({
      where: { id: deliveryBoyId, role: 'DELIVERY' }
    });

    if (!deliveryBoy) {
      return res.status(404).json({
        success: false,
        message: 'Delivery boy not found'
      });
    }

    // Verify all customers exist
    const customers = await User.findAll({
      where: {
        id: { [Op.in]: customerIds },
        role: 'CUSTOMER'
      }
    });

    if (customers.length !== customerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some customer IDs are invalid'
      });
    }

    // Update customers' areaId
    await User.update(
      { areaId: deliveryBoyId },
      { where: { id: { [Op.in]: customerIds } } }
    );

    // Create or update area assignment
    const [areaAssignment, created] = await AreaAssignment.findOrCreate({
      where: { deliveryBoyId },
      defaults: {
        areaName,
        customers: customerIds
      }
    });

    if (!created) {
      await areaAssignment.update({
        areaName,
        customers: customerIds
      });
    }

    res.status(200).json({
      success: true,
      message: 'Area assigned successfully',
      data: areaAssignment
    });
  } catch (error) {
    console.error('Assign area error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign area'
    });
  }
};

/**
 * Get all area assignments
 */
export const getAreaAssignments = async (req, res) => {
  try {
    const assignments = await AreaAssignment.findAll({
      include: [
        {
          model: User,
          as: 'deliveryBoy',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    // Fetch customer details for each assignment
    const assignmentsWithCustomers = await Promise.all(
      assignments.map(async (assignment) => {
        const customers = await User.findAll({
          where: { id: { [Op.in]: assignment.customers || [] } },
          attributes: ['id', 'name', 'phone', 'address']
        });

        return {
          id: assignment.id,
          areaName: assignment.areaName,
          deliveryBoy: assignment.deliveryBoy,
          customers
        };
      })
    );

    res.status(200).json({
      success: true,
      data: assignmentsWithCustomers
    });
  } catch (error) {
    console.error('Get area assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch area assignments'
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalCustomers,
      totalProducts,
      activeSubscriptions,
      todayDeliveries,
      deliveredToday,
      missedToday
    ] = await Promise.all([
      User.count({ where: { role: 'CUSTOMER' } }),
      Product.count({ where: { isActive: true } }),
      Subscription.count({ where: { active: true } }),
      DeliveryStatus.count({ where: { date: today } }),
      DeliveryStatus.count({ where: { date: today, status: 'DELIVERED' } }),
      DeliveryStatus.count({ where: { date: today, status: 'MISSED' } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        activeSubscriptions,
        todayDeliveries,
        deliveredToday,
        missedToday,
        pendingToday: todayDeliveries - deliveredToday - missedToday
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * Get all invoices with filters
 */
export const getInvoices = async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {};
    if (type) where.type = type;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: invoices } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'role']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        invoices,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

/**
 * Get all delivery statuses with filters
 */
export const getDeliveryStatuses = async (req, res) => {
  try {
    const { status, date, deliveryBoyId, customerId, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (date) where.date = date;
    if (deliveryBoyId) where.deliveryBoyId = deliveryBoyId;
    if (customerId) where.customerId = customerId;

    const offset = (page - 1) * limit;

    const { count, rows: deliveryStatuses } = await DeliveryStatus.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'phone', 'address']
        },
        {
          model: User,
          as: 'deliveryBoy',
          attributes: ['id', 'name', 'phone']
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
      ],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        deliveryStatuses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get delivery statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery statuses'
    });
  }
};

/**
 * Create delivery boy user
 */
export const createDeliveryBoy = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Geocode address if provided
    let latitude = null;
    let longitude = null;
    let formattedAddress = address;

    if (address) {
      try {
        const { getGoogleMapsService } = await import('../services/googleMapsService.js');
        const mapsService = getGoogleMapsService();
        const location = await mapsService.geocodeAddress(address);
        latitude = location.lat;
        longitude = location.lng;
        formattedAddress = location.formattedAddress;
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }

    const deliveryBoy = await User.create({
      name,
      phone,
      address: formattedAddress,
      latitude,
      longitude,
      role: 'DELIVERY',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Delivery boy created successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('Create delivery boy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery boy'
    });
  }
};

/**
 * Get all delivery boys
 */
export const getDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await User.findAll({
      where: { role: 'DELIVERY' },
      attributes: ['id', 'name', 'phone', 'address', 'latitude', 'longitude', 'status'],
      include: [
        {
          model: AreaAssignment,
          as: 'areaAssignments',
          attributes: ['id', 'areaName', 'customers']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: deliveryBoys
    });
  } catch (error) {
    console.error('Get delivery boys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery boys'
    });
  }
};

export default {
  assignArea,
  getAreaAssignments,
  getDashboardStats,
  getInvoices,
  getDeliveryStatuses,
  createDeliveryBoy,
  getDeliveryBoys
};

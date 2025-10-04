import * as adminService from '../services/adminService.js';

// User Management
export const getAllUsers = async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      status: req.query.status
    };

    const users = await adminService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.validatedData || req.body;

    const user = await adminService.updateUser(userId, updates);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await adminService.deactivateUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delivery Boy Management
export const getDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await adminService.getDeliveryBoy();

    res.status(200).json({
      success: true,
      data: deliveryBoy
    });
  } catch (error) {
    console.error('Get delivery boy error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateDeliveryBoy = async (req, res) => {
  try {
    const updates = req.validatedData || req.body;
    const deliveryBoy = await adminService.updateDeliveryBoy(updates);

    res.status(200).json({
      success: true,
      message: 'Delivery boy updated successfully',
      data: deliveryBoy
    });
  } catch (error) {
    console.error('Update delivery boy error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const assignDelivery = async (req, res) => {
  try {
    const { customer_id, delivery_date } = req.validatedData || req.body;
    const delivery = await adminService.assignDelivery(customer_id, delivery_date);

    res.status(201).json({
      success: true,
      message: 'Delivery assigned successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

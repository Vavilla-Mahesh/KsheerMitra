import * as adminModel from '../models/adminModel.js';
import * as userModel from '../models/userModel.js';

export const getAllUsers = async (filters) => {
  return await adminModel.findAllUsers(filters);
};

export const updateUser = async (userId, updates) => {
  // Check if user exists
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Prevent updating admin role
  if (user.role === 'admin') {
    throw new Error('Cannot update admin user through this endpoint');
  }

  return await adminModel.updateUserById(userId, updates);
};

export const deactivateUser = async (userId) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    throw new Error('Cannot deactivate admin user');
  }

  const result = await adminModel.deactivateUser(userId);
  if (!result) {
    throw new Error('Failed to deactivate user or user is admin');
  }

  return result;
};

export const getDeliveryBoy = async () => {
  const deliveryBoy = await adminModel.findDeliveryBoy();
  if (!deliveryBoy) {
    throw new Error('No delivery boy found in the system');
  }
  return deliveryBoy;
};

export const updateDeliveryBoy = async (updates) => {
  const deliveryBoy = await adminModel.findDeliveryBoy();
  if (!deliveryBoy) {
    throw new Error('No delivery boy found in the system');
  }

  return await adminModel.updateDeliveryBoy(deliveryBoy.id, updates);
};

export const assignDelivery = async (customerId, deliveryDate) => {
  // Get delivery boy
  const deliveryBoy = await adminModel.findDeliveryBoy();
  if (!deliveryBoy) {
    throw new Error('No delivery boy available');
  }

  // Check if customer exists
  const customer = await userModel.findUserById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  if (customer.role !== 'customer') {
    throw new Error('User is not a customer');
  }

  return await adminModel.assignDelivery(deliveryBoy.id, customerId, deliveryDate);
};

export const getDashboardStats = async () => {
  return await adminModel.getAdminDashboardStats();
};

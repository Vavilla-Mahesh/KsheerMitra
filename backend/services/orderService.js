import * as orderModel from '../models/orderModel.js';
import { findProductById } from '../models/productModel.js';
import { findUserById } from '../models/userModel.js';

export const createOrder = async (orderData) => {
  // Validate customer exists
  const customer = await findUserById(orderData.customer_id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Validate product exists
  const product = await findProductById(orderData.product_id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const order = await orderModel.createOrder(orderData);
  return order;
};

export const getCustomerOrders = async (customerId, month) => {
  const orders = await orderModel.findOrdersByCustomer(customerId, month);
  return orders;
};

export const getOrderById = async (id) => {
  const order = await orderModel.findOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

export const updateOrderStatus = async (id, status) => {
  const order = await orderModel.findOrderById(id);
  if (!order) {
    throw new Error('Order not found');
  }
  
  const validStatuses = ['pending', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  const updatedOrder = await orderModel.updateOrderStatus(id, status);
  return updatedOrder;
};

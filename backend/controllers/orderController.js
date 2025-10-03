import * as orderService from '../services/orderService.js';

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { month } = req.query;
    
    const orders = await orderService.getCustomerOrders(customerId, month);
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

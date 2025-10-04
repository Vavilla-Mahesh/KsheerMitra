import * as deliveryService from '../services/deliveryService.js';

export const getAssignedDeliveries = async (req, res) => {
  try {
    const { date } = req.query;
    const deliveries = await deliveryService.getAssignedDeliveries(req.user.id, date);
    
    res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get assigned deliveries error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (date) filters.date = date;
    
    const deliveries = await deliveryService.getAllDeliveries(filters);
    
    res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await deliveryService.getDeliveryById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.validatedData;
    const delivery = await deliveryService.updateDeliveryStatus(req.params.id, status, notes);
    
    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully',
      data: delivery
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

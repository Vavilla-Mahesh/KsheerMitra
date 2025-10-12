import * as deliveryModel from '../models/deliveryModel.js';

export const getAssignedDeliveries = async (deliveryBoyId, date) => {
  const deliveries = await deliveryModel.findDeliveriesByDeliveryBoy(deliveryBoyId, date);
  return deliveries;
};

export const getAllDeliveries = async (filters) => {
  const deliveries = await deliveryModel.findAllDeliveries(filters);
  return deliveries;
};

export const getDeliveryById = async (id) => {
  const delivery = await deliveryModel.findDeliveryById(id);
  if (!delivery) {
    throw new Error('Delivery not found');
  }
  return delivery;
};

export const updateDeliveryStatus = async (id, status, notes) => {
  const delivery = await deliveryModel.findDeliveryById(id);
  if (!delivery) {
    throw new Error('Delivery not found');
  }
  
  const updatedDelivery = await deliveryModel.updateDeliveryStatus(id, status, notes);
  return updatedDelivery;
};

import * as deliveryModel from '../models/deliveryModel.js';
import { sendDeliveryStatusMessage } from './whatsappService.js';
import { getClient } from '../config/db.js';

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
  
  // Send WhatsApp message to customer when status is 'delivered' or 'failed'
  if (status === 'delivered' || status === 'failed') {
    try {
      const client = getClient();
      const customerQuery = 'SELECT name, phone FROM users WHERE id = $1';
      const customerResult = await client.query(customerQuery, [delivery.customer_id]);
      
      if (customerResult.rows.length > 0) {
        const customer = customerResult.rows[0];
        const deliveryDate = new Date(delivery.delivery_date).toLocaleDateString();
        const messageStatus = status === 'delivered' ? 'delivered' : 'missed';
        
        // Send WhatsApp notification (non-blocking)
        sendDeliveryStatusMessage(
          customer.phone,
          customer.name,
          deliveryDate,
          messageStatus
        ).catch(error => {
          console.error('Failed to send WhatsApp message:', error);
        });
      }
    } catch (error) {
      console.error('Error sending delivery status notification:', error);
      // Don't throw error, just log it - delivery status update should succeed even if notification fails
    }
  }
  
  return updatedDelivery;
};

import * as subscriptionModel from '../models/subscriptionModel.js';
import { findProductById } from '../models/productModel.js';
import { findUserById } from '../models/userModel.js';

export const createSubscription = async (subscriptionData) => {
  // Validate customer exists
  const customer = await findUserById(subscriptionData.customer_id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Validate product exists
  const product = await findProductById(subscriptionData.product_id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const subscription = await subscriptionModel.createSubscription(subscriptionData);
  return subscription;
};

export const getSubscriptionById = async (id) => {
  const subscription = await subscriptionModel.findSubscriptionById(id);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  return subscription;
};

export const getCustomerSubscriptions = async (customerId) => {
  const subscriptions = await subscriptionModel.findSubscriptionsByCustomer(customerId);
  return subscriptions;
};

export const updateSubscription = async (id, updates) => {
  const subscription = await subscriptionModel.findSubscriptionById(id);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  const updatedSubscription = await subscriptionModel.updateSubscription(id, updates);
  return updatedSubscription;
};

export const deleteSubscription = async (id) => {
  const subscription = await subscriptionModel.findSubscriptionById(id);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  const deletedSubscription = await subscriptionModel.deleteSubscription(id);
  return deletedSubscription;
};

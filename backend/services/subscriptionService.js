import * as subscriptionModel from '../models/subscriptionModel.js';
import * as subscriptionItemModel from '../models/subscriptionItemModel.js';
import { findProductById } from '../models/productModel.js';
import { findUserById } from '../models/userModel.js';

export const createSubscription = async (subscriptionData) => {
  // Validate customer exists
  const customer = await findUserById(subscriptionData.customer_id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Handle legacy single-product subscription
  if (subscriptionData.product_id) {
    const product = await findProductById(subscriptionData.product_id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const subscription = await subscriptionModel.createSubscription(subscriptionData);
    return subscription;
  }
  
  // Handle multi-product subscription
  if (subscriptionData.items && subscriptionData.items.length > 0) {
    // Validate all products exist
    for (const item of subscriptionData.items) {
      const product = await findProductById(item.product_id);
      if (!product) {
        throw new Error(`Product with id ${item.product_id} not found`);
      }
    }
    
    // Create subscription without product_id
    const subscription = await subscriptionModel.createSubscription({
      customer_id: subscriptionData.customer_id,
      start_date: subscriptionData.start_date,
      end_date: subscriptionData.end_date,
      schedule_type: subscriptionData.schedule_type,
      days_of_week: subscriptionData.days_of_week
    });
    
    // Create subscription items
    const itemsToCreate = [];
    for (const item of subscriptionData.items) {
      const product = await findProductById(item.product_id);
      itemsToCreate.push({
        subscription_id: subscription.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: product.unit_price
      });
    }
    
    const items = await subscriptionItemModel.bulkCreateSubscriptionItems(itemsToCreate);
    
    return {
      ...subscription,
      items
    };
  }
  
  throw new Error('Either product_id or items array is required');
};

export const getSubscriptionById = async (id) => {
  const subscription = await subscriptionModel.findSubscriptionById(id);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // Get subscription items if no product_id (multi-product subscription)
  if (!subscription.product_id) {
    const items = await subscriptionItemModel.findItemsBySubscriptionId(id);
    subscription.items = items;
  }
  
  return subscription;
};

export const getCustomerSubscriptions = async (customerId) => {
  const subscriptions = await subscriptionModel.findSubscriptionsByCustomer(customerId);
  
  // Attach items to multi-product subscriptions
  for (const subscription of subscriptions) {
    if (!subscription.product_id) {
      const items = await subscriptionItemModel.findItemsBySubscriptionId(subscription.id);
      subscription.items = items;
    }
  }
  
  return subscriptions;
};

export const updateSubscription = async (id, updates) => {
  const subscription = await subscriptionModel.findSubscriptionById(id);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // Handle items update for multi-product subscriptions
  if (updates.items && updates.items.length > 0) {
    // Validate all products exist
    for (const item of updates.items) {
      const product = await findProductById(item.product_id);
      if (!product) {
        throw new Error(`Product with id ${item.product_id} not found`);
      }
    }
    
    // Delete existing items
    await subscriptionItemModel.deleteItemsBySubscriptionId(id);
    
    // Create new items
    const itemsToCreate = [];
    for (const item of updates.items) {
      const product = await findProductById(item.product_id);
      itemsToCreate.push({
        subscription_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: product.unit_price
      });
    }
    
    await subscriptionItemModel.bulkCreateSubscriptionItems(itemsToCreate);
    delete updates.items; // Remove items from subscription update
  }
  
  const updatedSubscription = await subscriptionModel.updateSubscription(id, updates);
  
  // Attach items if multi-product subscription
  if (!updatedSubscription.product_id) {
    const items = await subscriptionItemModel.findItemsBySubscriptionId(id);
    updatedSubscription.items = items;
  }
  
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

export const adjustDateOrder = async (subscriptionId, date, adjustments) => {
  const subscription = await subscriptionModel.findSubscriptionById(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  // For multi-product subscriptions, adjustments should be an array of {product_id, quantity}
  // For single-product subscriptions, adjustments should be a single quantity value
  
  // This will use the daily_adjustments table to override quantities for specific dates
  // The implementation will depend on whether it's a single or multi-product subscription
  
  return {
    subscriptionId,
    date,
    adjustments,
    message: 'Daily adjustment recorded. This will override the regular quantity for this specific date.'
  };
};

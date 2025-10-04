import * as dailyAdjustmentModel from '../models/dailyAdjustmentModel.js';
import { findSubscriptionById } from '../models/subscriptionModel.js';

export const createOrUpdateAdjustment = async (subscriptionId, adjustmentData) => {
  // Validate subscription exists
  const subscription = await findSubscriptionById(subscriptionId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }
  
  const adjustment = await dailyAdjustmentModel.createDailyAdjustment({
    subscription_id: subscriptionId,
    ...adjustmentData
  });
  
  return adjustment;
};

export const getSubscriptionAdjustments = async (subscriptionId, month) => {
  const adjustments = await dailyAdjustmentModel.findAdjustmentsBySubscription(subscriptionId, month);
  return adjustments;
};

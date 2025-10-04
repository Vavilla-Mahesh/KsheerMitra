import * as subscriptionService from '../services/subscriptionService.js';

export const createSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const getCustomerSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getCustomerSubscriptions(req.params.customerId);
    
    res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Get customer subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.validatedData);
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

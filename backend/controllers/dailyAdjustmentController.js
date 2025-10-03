import * as dailyAdjustmentService from '../services/dailyAdjustmentService.js';

export const createOrUpdateAdjustment = async (req, res) => {
  try {
    const adjustment = await dailyAdjustmentService.createOrUpdateAdjustment(
      req.params.subscriptionId,
      req.validatedData
    );
    
    res.status(201).json({
      success: true,
      message: 'Daily adjustment saved successfully',
      data: adjustment
    });
  } catch (error) {
    console.error('Create/update adjustment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSubscriptionAdjustments = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { month } = req.query;
    
    const adjustments = await dailyAdjustmentService.getSubscriptionAdjustments(subscriptionId, month);
    
    res.status(200).json({
      success: true,
      data: adjustments
    });
  } catch (error) {
    console.error('Get adjustments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

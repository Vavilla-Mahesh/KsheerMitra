import * as billingService from '../services/billingService.js';

export const getMonthlyBilling = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month parameter is required (format: YYYY-MM)'
      });
    }
    
    const billing = await billingService.getMonthlyBilling(customerId, month);
    
    res.status(200).json({
      success: true,
      data: billing
    });
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

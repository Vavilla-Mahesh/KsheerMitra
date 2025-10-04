import * as billingModel from '../models/billingModel.js';
import { findUserById } from '../models/userModel.js';

export const getMonthlyBilling = async (customerId, month) => {
  // Validate customer exists
  const customer = await findUserById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!monthRegex.test(month)) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }
  
  // Get billing details
  const items = await billingModel.calculateMonthlyBilling(customerId, month);
  
  // Group by date for better structure
  const dailyBreakdown = {};
  let monthTotal = 0;
  
  items.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    
    if (!dailyBreakdown[dateStr]) {
      dailyBreakdown[dateStr] = {
        date: dateStr,
        items: [],
        day_total: 0
      };
    }
    
    dailyBreakdown[dateStr].items.push({
      product_id: item.product_id,
      product_name: item.product_name,
      unit_price: parseFloat(item.unit_price),
      quantity: parseInt(item.total_quantity),
      line_total: parseFloat(item.line_total)
    });
    
    dailyBreakdown[dateStr].day_total += parseFloat(item.line_total);
    monthTotal += parseFloat(item.line_total);
  });
  
  return {
    customer_id: customerId,
    customer_name: customer.name,
    month,
    daily_breakdown: Object.values(dailyBreakdown),
    month_total: monthTotal
  };
};

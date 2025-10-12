import { getClient } from '../config/db.js';

export const createDailyAdjustment = async (adjustmentData) => {
  const client = getClient();
  const { subscription_id, adjustment_date, adjusted_quantity } = adjustmentData;
  
  const query = `
    INSERT INTO daily_adjustments (subscription_id, adjustment_date, adjusted_quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (subscription_id, adjustment_date) 
    DO UPDATE SET adjusted_quantity = $3, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  
  const result = await client.query(query, [subscription_id, adjustment_date, adjusted_quantity]);
  return result.rows[0];
};

export const findAdjustmentsBySubscription = async (subscriptionId, month = null) => {
  const client = getClient();
  let query = `
    SELECT * FROM daily_adjustments 
    WHERE subscription_id = $1
  `;
  const params = [subscriptionId];
  
  if (month) {
    query += ` AND DATE_TRUNC('month', adjustment_date) = $2`;
    params.push(`${month}-01`);
  }
  
  query += ' ORDER BY adjustment_date ASC';
  
  const result = await client.query(query, params);
  return result.rows;
};

export const findAdjustmentByDate = async (subscriptionId, date) => {
  const client = getClient();
  const query = `
    SELECT * FROM daily_adjustments 
    WHERE subscription_id = $1 AND adjustment_date = $2
  `;
  const result = await client.query(query, [subscriptionId, date]);
  return result.rows[0];
};

export const deleteAdjustment = async (id) => {
  const client = getClient();
  const query = 'DELETE FROM daily_adjustments WHERE id = $1 RETURNING *';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

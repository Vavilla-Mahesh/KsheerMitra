import { getClient } from '../config/db.js';

export const createSubscription = async (subscriptionData) => {
  const client = getClient();
  const { customer_id, product_id, quantity_per_day, start_date, end_date, schedule_type, days_of_week } = subscriptionData;
  
  const query = `
    INSERT INTO subscriptions (customer_id, product_id, quantity_per_day, start_date, end_date, schedule_type, days_of_week)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const result = await client.query(query, [
    customer_id, 
    product_id || null, 
    quantity_per_day || 0, 
    start_date, 
    end_date, 
    schedule_type || 'daily',
    days_of_week || null
  ]);
  return result.rows[0];
};

export const findSubscriptionById = async (id) => {
  const client = getClient();
  const query = `
    SELECT s.*, u.name as customer_name
    FROM subscriptions s
    JOIN users u ON s.customer_id = u.id
    WHERE s.id = $1
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const findSubscriptionsByCustomer = async (customerId) => {
  const client = getClient();
  const query = `
    SELECT s.*
    FROM subscriptions s
    WHERE s.customer_id = $1
    ORDER BY s.created_at DESC
  `;
  const result = await client.query(query, [customerId]);
  return result.rows;
};

export const updateSubscription = async (id, updates) => {
  const client = getClient();
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(value);
    paramCount++;
  });
  
  values.push(id);
  const query = `
    UPDATE subscriptions 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const deleteSubscription = async (id) => {
  const client = getClient();
  const query = 'DELETE FROM subscriptions WHERE id = $1 RETURNING *';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const findActiveSubscriptionsForDate = async (customerId, date) => {
  const client = getClient();
  const query = `
    SELECT s.*
    FROM subscriptions s
    WHERE s.customer_id = $1 
      AND s.is_active = true
      AND s.start_date <= $2
      AND (s.end_date IS NULL OR s.end_date >= $2)
  `;
  const result = await client.query(query, [customerId, date]);
  return result.rows;
};

import { getClient } from '../config/db.js';

export const createSubscriptionItem = async (itemData) => {
  const client = getClient();
  const { subscription_id, product_id, quantity, price_per_unit } = itemData;
  
  const query = `
    INSERT INTO subscription_items (subscription_id, product_id, quantity, price_per_unit)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await client.query(query, [subscription_id, product_id, quantity, price_per_unit]);
  return result.rows[0];
};

export const findItemsBySubscriptionId = async (subscriptionId) => {
  const client = getClient();
  const query = `
    SELECT si.*, p.name as product_name, p.unit
    FROM subscription_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.subscription_id = $1
  `;
  const result = await client.query(query, [subscriptionId]);
  return result.rows;
};

export const updateSubscriptionItem = async (id, updates) => {
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
    UPDATE subscription_items 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const deleteItemsBySubscriptionId = async (subscriptionId) => {
  const client = getClient();
  const query = 'DELETE FROM subscription_items WHERE subscription_id = $1';
  await client.query(query, [subscriptionId]);
};

export const bulkCreateSubscriptionItems = async (items) => {
  const client = getClient();
  
  // Build bulk insert query
  const valueStrings = [];
  const values = [];
  let paramCount = 1;
  
  items.forEach((item) => {
    valueStrings.push(`($${paramCount}, $${paramCount + 1}, $${paramCount + 2}, $${paramCount + 3})`);
    values.push(item.subscription_id, item.product_id, item.quantity, item.price_per_unit);
    paramCount += 4;
  });
  
  const query = `
    INSERT INTO subscription_items (subscription_id, product_id, quantity, price_per_unit)
    VALUES ${valueStrings.join(', ')}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows;
};

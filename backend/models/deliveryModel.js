import { getClient } from '../config/db.js';

export const createDelivery = async (deliveryData) => {
  const client = getClient();
  const { customer_id, delivery_boy_id, delivery_date, status, notes } = deliveryData;
  
  const query = `
    INSERT INTO deliveries (customer_id, delivery_boy_id, delivery_date, status, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await client.query(query, [customer_id, delivery_boy_id, delivery_date, status, notes]);
  return result.rows[0];
};

export const findDeliveryById = async (id) => {
  const client = getClient();
  const query = `
    SELECT d.*, 
           c.name as customer_name, c.location as customer_location,
           db.name as delivery_boy_name
    FROM deliveries d
    JOIN users c ON d.customer_id = c.id
    LEFT JOIN users db ON d.delivery_boy_id = db.id
    WHERE d.id = $1
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const findDeliveriesByDeliveryBoy = async (deliveryBoyId, date = null) => {
  const client = getClient();
  let query = `
    SELECT d.*, 
           c.name as customer_name, c.location as customer_location
    FROM deliveries d
    JOIN users c ON d.customer_id = c.id
    WHERE d.delivery_boy_id = $1
  `;
  const params = [deliveryBoyId];
  
  if (date) {
    query += ` AND d.delivery_date = $2`;
    params.push(date);
  }
  
  query += ' ORDER BY d.delivery_date DESC, d.created_at DESC';
  
  const result = await client.query(query, params);
  return result.rows;
};

export const findAllDeliveries = async (filters = {}) => {
  const client = getClient();
  let query = `
    SELECT d.*, 
           c.name as customer_name, c.location as customer_location,
           db.name as delivery_boy_name
    FROM deliveries d
    JOIN users c ON d.customer_id = c.id
    LEFT JOIN users db ON d.delivery_boy_id = db.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;
  
  if (filters.status) {
    query += ` AND d.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }
  
  if (filters.date) {
    query += ` AND d.delivery_date = $${paramCount}`;
    params.push(filters.date);
    paramCount++;
  }
  
  query += ' ORDER BY d.delivery_date DESC, d.created_at DESC';
  
  const result = await client.query(query, params);
  return result.rows;
};

export const updateDeliveryStatus = async (id, status, notes = null) => {
  const client = getClient();
  let query = 'UPDATE deliveries SET status = $1';
  const params = [status];
  let paramCount = 2;
  
  if (notes !== null) {
    query += `, notes = $${paramCount}`;
    params.push(notes);
    paramCount++;
  }
  
  params.push(id);
  query += ` WHERE id = $${paramCount} RETURNING *`;
  
  const result = await client.query(query, params);
  return result.rows[0];
};

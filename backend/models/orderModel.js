import { getClient } from '../config/db.js';

export const createOrder = async (orderData) => {
  const client = getClient();
  const { customer_id, product_id, quantity, order_date } = orderData;
  
  const query = `
    INSERT INTO orders (customer_id, product_id, quantity, order_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await client.query(query, [customer_id, product_id, quantity, order_date]);
  return result.rows[0];
};

export const findOrdersByCustomer = async (customerId, month = null) => {
  const client = getClient();
  let query = `
    SELECT o.*, p.name as product_name, p.unit_price
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.customer_id = $1
  `;
  const params = [customerId];
  
  if (month) {
    query += ` AND DATE_TRUNC('month', o.order_date) = $2`;
    params.push(`${month}-01`);
  }
  
  query += ' ORDER BY o.order_date DESC';
  
  const result = await client.query(query, params);
  return result.rows;
};

export const findOrderById = async (id) => {
  const client = getClient();
  const query = `
    SELECT o.*, p.name as product_name, p.unit_price
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.id = $1
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const updateOrderStatus = async (id, status) => {
  const client = getClient();
  const query = `
    UPDATE orders 
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await client.query(query, [status, id]);
  return result.rows[0];
};

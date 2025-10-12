import { getClient } from '../config/db.js';

export const createUser = async (userData) => {
  const client = getClient();
  const { name, phone, email, location, password_hash, role } = userData;
  
  const query = `
    INSERT INTO users (name, phone, email, location, password_hash, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, phone, email, location, role, created_at, updated_at
  `;
  
  const result = await client.query(query, [name, phone, email, location, password_hash, role]);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const client = getClient();
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await client.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const client = getClient();
  const query = 'SELECT id, name, phone, email, location, role, created_at, updated_at FROM users WHERE id = $1';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const updateUser = async (id, updates) => {
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
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, name, phone, email, location, role, updated_at
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const countDeliveryBoys = async () => {
  const client = getClient();
  const query = "SELECT COUNT(*) as count FROM users WHERE role = 'delivery_boy'";
  const result = await client.query(query);
  return parseInt(result.rows[0].count);
};

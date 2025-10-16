import { getClient } from '../config/db.js';

export const createUser = async (userData) => {
  const client = getClient();
  const { 
    name, 
    phone, 
    email, 
    location, 
    password_hash, 
    role,
    whatsapp_number,
    whatsapp_verified,
    latitude,
    longitude,
    address_manual
  } = userData;
  
  const query = `
    INSERT INTO users (
      name, phone, email, location, password_hash, role,
      whatsapp_number, whatsapp_verified, latitude, longitude, address_manual
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id, name, phone, email, location, role, whatsapp_number, whatsapp_verified, 
              latitude, longitude, address_manual, area_id, created_at, updated_at
  `;
  
  const result = await client.query(query, [
    name, 
    phone, 
    email, 
    location, 
    password_hash, 
    role,
    whatsapp_number,
    whatsapp_verified || false,
    latitude,
    longitude,
    address_manual
  ]);
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
  const query = `
    SELECT id, name, phone, email, location, role, whatsapp_number, whatsapp_verified,
           latitude, longitude, address_manual, area_id, created_at, updated_at 
    FROM users WHERE id = $1
  `;
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
    RETURNING id, name, phone, email, location, role, whatsapp_number, whatsapp_verified,
              latitude, longitude, address_manual, area_id, updated_at
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

export const findUserByWhatsApp = async (whatsappNumber) => {
  const client = getClient();
  const query = 'SELECT * FROM users WHERE whatsapp_number = $1';
  const result = await client.query(query, [whatsappNumber]);
  return result.rows[0];
};

export const getAllDeliveryBoys = async () => {
  const client = getClient();
  const query = `
    SELECT id, name, phone, whatsapp_number, status
    FROM users 
    WHERE role = 'delivery_boy'
    ORDER BY name
  `;
  const result = await client.query(query);
  return result.rows;
};

export const getCustomersWithLocation = async () => {
  const client = getClient();
  const query = `
    SELECT id, name, whatsapp_number, phone, latitude, longitude, address_manual, area_id
    FROM users 
    WHERE role = 'customer' AND latitude IS NOT NULL AND longitude IS NOT NULL
    ORDER BY name
  `;
  const result = await client.query(query);
  return result.rows;
};


import { getClient } from '../config/db.js';

export const createDeliveryArea = async (areaData) => {
  const client = getClient();
  const { name, description, delivery_boy_id, polygon_coordinates } = areaData;
  
  const query = `
    INSERT INTO delivery_areas (name, description, delivery_boy_id, polygon_coordinates)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await client.query(query, [
    name,
    description,
    delivery_boy_id,
    JSON.stringify(polygon_coordinates)
  ]);
  return result.rows[0];
};

export const findAllDeliveryAreas = async () => {
  const client = getClient();
  const query = 'SELECT * FROM delivery_areas WHERE is_active = true ORDER BY created_at DESC';
  const result = await client.query(query);
  return result.rows;
};

export const findDeliveryAreaById = async (id) => {
  const client = getClient();
  const query = 'SELECT * FROM delivery_areas WHERE id = $1';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const findDeliveryAreasByDeliveryBoy = async (deliveryBoyId) => {
  const client = getClient();
  const query = `
    SELECT * FROM delivery_areas 
    WHERE delivery_boy_id = $1 AND is_active = true
    ORDER BY created_at DESC
  `;
  const result = await client.query(query, [deliveryBoyId]);
  return result.rows;
};

export const updateDeliveryArea = async (id, updates) => {
  const client = getClient();
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'polygon_coordinates') {
      fields.push(`${key} = $${paramCount}`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
    }
    paramCount++;
  });
  
  values.push(id);
  const query = `
    UPDATE delivery_areas 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const deleteDeliveryArea = async (id) => {
  const client = getClient();
  const query = 'UPDATE delivery_areas SET is_active = false WHERE id = $1 RETURNING *';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const assignCustomersToArea = async (areaId, customerIds) => {
  const client = getClient();
  const query = `
    UPDATE users 
    SET area_id = $1 
    WHERE id = ANY($2::uuid[])
    RETURNING id, name, whatsapp_number, area_id
  `;
  const result = await client.query(query, [areaId, customerIds]);
  return result.rows;
};

export const getCustomersInArea = async (areaId) => {
  const client = getClient();
  const query = `
    SELECT id, name, whatsapp_number, phone, latitude, longitude, address_manual
    FROM users 
    WHERE area_id = $1 AND role = 'customer'
    ORDER BY name
  `;
  const result = await client.query(query, [areaId]);
  return result.rows;
};

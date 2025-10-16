import { getClient } from '../config/db.js';

export const createDeliveryRoute = async (routeData) => {
  const client = getClient();
  const {
    delivery_boy_id,
    route_date,
    customer_ids,
    route_data,
    total_distance,
    estimated_duration
  } = routeData;
  
  const query = `
    INSERT INTO delivery_routes (
      delivery_boy_id,
      route_date,
      customer_ids,
      route_data,
      total_distance,
      estimated_duration
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const result = await client.query(query, [
    delivery_boy_id,
    route_date,
    JSON.stringify(customer_ids),
    route_data ? JSON.stringify(route_data) : null,
    total_distance,
    estimated_duration
  ]);
  return result.rows[0];
};

export const findRoutesByDeliveryBoy = async (deliveryBoyId, routeDate = null) => {
  const client = getClient();
  let query = `
    SELECT * FROM delivery_routes 
    WHERE delivery_boy_id = $1
  `;
  const params = [deliveryBoyId];
  
  if (routeDate) {
    query += ' AND route_date = $2';
    params.push(routeDate);
  }
  
  query += ' ORDER BY route_date DESC, created_at DESC';
  
  const result = await client.query(query, params);
  return result.rows;
};

export const findRouteById = async (id) => {
  const client = getClient();
  const query = 'SELECT * FROM delivery_routes WHERE id = $1';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const updateRouteStatus = async (id, status, completedAt = null) => {
  const client = getClient();
  const updates = { status };
  
  if (status === 'in_progress' && !completedAt) {
    updates.started_at = new Date();
  } else if (status === 'completed' && completedAt) {
    updates.completed_at = completedAt;
  }
  
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
    UPDATE delivery_routes 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const createDeliveryLog = async (logData) => {
  const client = getClient();
  const { route_id, customer_id, delivery_order, status, notes } = logData;
  
  const query = `
    INSERT INTO delivery_logs (route_id, customer_id, delivery_order, status, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  
  const result = await client.query(query, [
    route_id,
    customer_id,
    delivery_order,
    status || 'pending',
    notes
  ]);
  return result.rows[0];
};

export const findDeliveryLogsByRoute = async (routeId) => {
  const client = getClient();
  const query = `
    SELECT dl.*, u.name as customer_name, u.whatsapp_number, u.latitude, u.longitude
    FROM delivery_logs dl
    JOIN users u ON dl.customer_id = u.id
    WHERE dl.route_id = $1
    ORDER BY dl.delivery_order
  `;
  const result = await client.query(query, [routeId]);
  return result.rows;
};

export const updateDeliveryLog = async (id, updates) => {
  const client = getClient();
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  // Auto-set completed_at when status is 'completed'
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date();
  }
  
  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = $${paramCount}`);
    values.push(value);
    paramCount++;
  });
  
  values.push(id);
  const query = `
    UPDATE delivery_logs 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

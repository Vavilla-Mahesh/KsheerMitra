import { getClient } from '../config/db.js';

// User Management
export const findAllUsers = async (filters = {}) => {
  const client = getClient();
  let query = `
    SELECT id, name, phone, email, location, role, status, created_at, updated_at 
    FROM users
    WHERE 1=1
  `;
  const values = [];
  let paramCount = 1;

  if (filters.role) {
    query += ` AND role = $${paramCount}`;
    values.push(filters.role);
    paramCount++;
  }

  if (filters.status) {
    query += ` AND status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await client.query(query, values);
  return result.rows;
};

export const updateUserById = async (id, updates) => {
  const client = getClient();
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Only allow specific fields to be updated
  const allowedFields = ['name', 'phone', 'location', 'status'];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(id);
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, name, phone, email, location, role, status, updated_at
  `;

  const result = await client.query(query, values);
  return result.rows[0];
};

export const deactivateUser = async (id) => {
  const client = getClient();
  const query = `
    UPDATE users 
    SET status = 'inactive'
    WHERE id = $1 AND role != 'admin'
    RETURNING id, name, email, role, status
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

// Delivery Boy Management
export const findDeliveryBoy = async () => {
  const client = getClient();
  const query = `
    SELECT u.id, u.name, u.phone, u.email, u.location, u.status, u.created_at, u.updated_at,
           ds.status as delivery_status, ds.location as current_location, ds.updated_at as status_updated_at
    FROM users u
    LEFT JOIN delivery_status ds ON u.id = ds.delivery_boy_id
    WHERE u.role = 'delivery_boy'
  `;
  const result = await client.query(query);
  return result.rows[0];
};

export const updateDeliveryBoy = async (id, updates) => {
  const client = getClient();
  const fields = [];
  const values = [];
  let paramCount = 1;

  const allowedFields = ['name', 'phone', 'location', 'status'];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(id);
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount} AND role = 'delivery_boy'
    RETURNING id, name, phone, email, location, status, updated_at
  `;

  const result = await client.query(query, values);
  return result.rows[0];
};

export const updateDeliveryBoyStatus = async (deliveryBoyId, status, location = null) => {
  const client = getClient();
  const query = `
    INSERT INTO delivery_status (delivery_boy_id, status, location)
    VALUES ($1, $2, $3)
    ON CONFLICT (delivery_boy_id) 
    DO UPDATE SET status = $2, location = $3, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const result = await client.query(query, [deliveryBoyId, status, location]);
  return result.rows[0];
};

// Delivery Assignment
export const assignDelivery = async (deliveryBoyId, customerId, deliveryDate) => {
  const client = getClient();
  const query = `
    INSERT INTO deliveries (customer_id, delivery_boy_id, delivery_date, status)
    VALUES ($1, $2, $3, 'assigned')
    RETURNING *
  `;
  const result = await client.query(query, [customerId, deliveryBoyId, deliveryDate]);
  return result.rows[0];
};

export const getAdminDashboardStats = async () => {
  const client = getClient();
  
  // Get counts in parallel
  const [customersResult, productsResult, deliveriesResult, deliveryBoyResult] = await Promise.all([
    client.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND status = 'active'"),
    client.query("SELECT COUNT(*) as count FROM products WHERE is_active = true"),
    client.query("SELECT COUNT(*) as count FROM deliveries WHERE status IN ('pending', 'assigned', 'in_progress') AND delivery_date = CURRENT_DATE"),
    client.query("SELECT u.id, u.name, ds.status FROM users u LEFT JOIN delivery_status ds ON u.id = ds.delivery_boy_id WHERE u.role = 'delivery_boy'")
  ]);

  return {
    activeCustomers: parseInt(customersResult.rows[0].count),
    totalProducts: parseInt(productsResult.rows[0].count),
    ongoingDeliveries: parseInt(deliveriesResult.rows[0].count),
    deliveryBoyStatus: deliveryBoyResult.rows[0] || null
  };
};

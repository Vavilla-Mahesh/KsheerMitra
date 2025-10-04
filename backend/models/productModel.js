import { getClient } from '../config/db.js';

export const createProduct = async (productData) => {
  const client = getClient();
  const { name, description, unit_price, unit, is_active, image_url, category } = productData;
  
  const query = `
    INSERT INTO products (name, description, unit_price, unit, is_active, image_url, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const result = await client.query(query, [name, description, unit_price, unit, is_active, image_url || null, category || null]);
  return result.rows[0];
};

export const findAllProducts = async (options = {}) => {
  const client = getClient();
  const { activeOnly = false, page = 1, limit = 20, category = null } = options;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const values = [];
  let paramCount = 1;
  
  if (activeOnly) {
    query += ' AND is_active = true';
  }
  
  if (category) {
    query += ` AND category = $${paramCount}`;
    values.push(category);
    paramCount++;
  }
  
  query += ' ORDER BY created_at DESC';
  
  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);
  
  const result = await client.query(query, values);
  
  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
  const countValues = [];
  let countParamCount = 1;
  
  if (activeOnly) {
    countQuery += ' AND is_active = true';
  }
  
  if (category) {
    countQuery += ` AND category = $${countParamCount}`;
    countValues.push(category);
  }
  
  const countResult = await client.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count);
  
  return {
    products: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const findProductById = async (id) => {
  const client = getClient();
  const query = 'SELECT * FROM products WHERE id = $1';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const updateProduct = async (id, updates) => {
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
    UPDATE products 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await client.query(query, values);
  return result.rows[0];
};

export const deleteProduct = async (id) => {
  const client = getClient();
  const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
  const result = await client.query(query, [id]);
  return result.rows[0];
};

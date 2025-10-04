import { getClient } from '../config/db.js';

export const calculateMonthlyBilling = async (customerId, month) => {
  const client = getClient();
  
  // Generate series of dates for the month
  const query = `
    WITH date_series AS (
      SELECT generate_series(
        DATE_TRUNC('month', $2::date),
        (DATE_TRUNC('month', $2::date) + INTERVAL '1 month - 1 day')::date,
        '1 day'::interval
      )::date AS date
    ),
    -- Get subscription quantities for each day
    subscription_items AS (
      SELECT 
        ds.date,
        s.id as subscription_id,
        p.id as product_id,
        p.name as product_name,
        p.unit_price,
        COALESCE(da.adjusted_quantity, s.quantity_per_day) as quantity
      FROM date_series ds
      CROSS JOIN subscriptions s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN daily_adjustments da ON da.subscription_id = s.id AND da.adjustment_date = ds.date
      WHERE s.customer_id = $1
        AND s.is_active = true
        AND s.start_date <= ds.date
        AND (s.end_date IS NULL OR s.end_date >= ds.date)
    ),
    -- Get one-off orders for each day
    order_items AS (
      SELECT 
        o.order_date as date,
        NULL::uuid as subscription_id,
        p.id as product_id,
        p.name as product_name,
        p.unit_price,
        o.quantity
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.customer_id = $1
        AND DATE_TRUNC('month', o.order_date) = DATE_TRUNC('month', $2::date)
        AND o.status != 'cancelled'
    ),
    -- Combine both
    all_items AS (
      SELECT * FROM subscription_items
      UNION ALL
      SELECT * FROM order_items
    )
    -- Calculate daily totals
    SELECT 
      date,
      product_id,
      product_name,
      unit_price,
      SUM(quantity) as total_quantity,
      SUM(quantity * unit_price) as line_total
    FROM all_items
    GROUP BY date, product_id, product_name, unit_price
    ORDER BY date, product_name;
  `;
  
  const result = await client.query(query, [customerId, `${month}-01`]);
  return result.rows;
};

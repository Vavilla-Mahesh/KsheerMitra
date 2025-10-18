import { getClient } from '../config/db.js';
import { generateDailyInvoicePDF, generateMonthlyInvoicePDF } from './pdfService.js';
import { sendDailyInvoiceToAdmin, sendMonthlyInvoiceToCustomer } from './whatsappService.js';

/**
 * Generate and send daily invoice for a delivery boy
 */
export const generateDailyInvoice = async (deliveryBoyId, date) => {
  const client = getClient();
  
  try {
    // Get delivery boy details
    const deliveryBoyQuery = `
      SELECT id, name, phone 
      FROM users 
      WHERE id = $1 AND role = 'delivery_boy'
    `;
    const deliveryBoyResult = await client.query(deliveryBoyQuery, [deliveryBoyId]);
    
    if (deliveryBoyResult.rows.length === 0) {
      throw new Error('Delivery boy not found');
    }
    
    const deliveryBoy = deliveryBoyResult.rows[0];
    
    // Get all delivered items for the day
    const deliveriesQuery = `
      SELECT 
        d.id,
        u.name as customer_name,
        u.phone as customer_phone,
        s.quantity_per_day,
        p.name as product_name,
        p.unit_price,
        (s.quantity_per_day * p.unit_price) as amount,
        d.delivery_date
      FROM deliveries d
      JOIN users u ON d.customer_id = u.id
      LEFT JOIN subscriptions s ON s.customer_id = u.id AND s.is_active = true
      LEFT JOIN products p ON s.product_id = p.id
      WHERE d.delivery_boy_id = $1 
        AND d.delivery_date = $2 
        AND d.status = 'delivered'
        AND s.start_date <= $2
        AND (s.end_date IS NULL OR s.end_date >= $2)
      ORDER BY u.name
    `;
    
    const deliveriesResult = await client.query(deliveriesQuery, [deliveryBoyId, date]);
    
    if (deliveriesResult.rows.length === 0) {
      return {
        success: false,
        message: 'No deliveries found for this date'
      };
    }
    
    // Prepare invoice data
    const deliveries = deliveriesResult.rows.map(row => ({
      customerName: row.customer_name,
      productName: row.product_name,
      quantity: row.quantity_per_day,
      amount: parseFloat(row.amount)
    }));
    
    const totalAmount = deliveries.reduce((sum, d) => sum + d.amount, 0);
    
    const invoiceData = {
      deliveryBoyId: deliveryBoy.id,
      deliveryBoyName: deliveryBoy.name,
      date: new Date(date).toLocaleDateString(),
      deliveries,
      totalAmount
    };
    
    // Generate PDF
    const pdfPath = await generateDailyInvoicePDF(invoiceData);
    
    // Save invoice record in database
    const invoiceQuery = `
      INSERT INTO invoices (generated_by, type, amount, pdf_path, invoice_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const invoiceResult = await client.query(invoiceQuery, [
      deliveryBoyId,
      'DAILY',
      totalAmount,
      pdfPath,
      date
    ]);
    
    const invoice = invoiceResult.rows[0];
    
    // Get admin phone number
    const adminQuery = `SELECT phone FROM users WHERE role = 'admin' LIMIT 1`;
    const adminResult = await client.query(adminQuery);
    
    if (adminResult.rows.length > 0) {
      const adminPhone = adminResult.rows[0].phone;
      
      // Send invoice to admin via WhatsApp
      const summary = {
        totalDeliveries: deliveries.length,
        totalAmount
      };
      
      await sendDailyInvoiceToAdmin(
        adminPhone,
        pdfPath,
        deliveryBoy.name,
        invoiceData.date,
        summary
      );
      
      // Update invoice record to mark as sent
      await client.query(
        'UPDATE invoices SET sent_via_whatsapp = true WHERE id = $1',
        [invoice.id]
      );
    }
    
    return {
      success: true,
      invoice,
      pdfPath
    };
  } catch (error) {
    console.error('Error generating daily invoice:', error);
    throw error;
  }
};

/**
 * Generate and send monthly invoice for a customer
 */
export const generateMonthlyInvoice = async (customerId, month, year) => {
  const client = getClient();
  
  try {
    // Get customer details
    const customerQuery = `
      SELECT id, name, phone 
      FROM users 
      WHERE id = $1 AND role = 'customer'
    `;
    const customerResult = await client.query(customerQuery, [customerId]);
    
    if (customerResult.rows.length === 0) {
      throw new Error('Customer not found');
    }
    
    const customer = customerResult.rows[0];
    
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    // Get all deliveries for the month
    const deliveriesQuery = `
      SELECT 
        d.delivery_date,
        p.name as product_name,
        p.unit_price,
        COALESCE(da.adjusted_quantity, s.quantity_per_day) as quantity,
        (COALESCE(da.adjusted_quantity, s.quantity_per_day) * p.unit_price) as amount
      FROM deliveries d
      LEFT JOIN subscriptions s ON s.customer_id = d.customer_id AND s.is_active = true
      LEFT JOIN daily_adjustments da ON da.subscription_id = s.id AND da.adjustment_date = d.delivery_date
      LEFT JOIN products p ON s.product_id = p.id
      WHERE d.customer_id = $1 
        AND d.status = 'delivered'
        AND d.delivery_date >= $2
        AND d.delivery_date <= $3
        AND s.start_date <= d.delivery_date
        AND (s.end_date IS NULL OR s.end_date >= d.delivery_date)
      
      UNION ALL
      
      SELECT 
        o.order_date as delivery_date,
        p.name as product_name,
        p.unit_price,
        o.quantity,
        (o.quantity * p.unit_price) as amount
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.customer_id = $1 
        AND o.status = 'delivered'
        AND o.order_date >= $2
        AND o.order_date <= $3
      
      ORDER BY delivery_date
    `;
    
    const deliveriesResult = await client.query(deliveriesQuery, [
      customerId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ]);
    
    if (deliveriesResult.rows.length === 0) {
      return {
        success: false,
        message: 'No deliveries found for this month'
      };
    }
    
    // Prepare invoice data
    const dailyBreakdown = deliveriesResult.rows.map(row => ({
      date: new Date(row.delivery_date).toLocaleDateString(),
      productName: row.product_name,
      quantity: parseInt(row.quantity),
      unitPrice: parseFloat(row.unit_price),
      amount: parseFloat(row.amount)
    }));
    
    const totalAmount = dailyBreakdown.reduce((sum, item) => sum + item.amount, 0);
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const invoiceData = {
      customerId: customer.id,
      customerName: customer.name,
      month: monthNames[month - 1],
      year,
      dailyBreakdown,
      totalAmount,
      paymentStatus: 'Pending'
    };
    
    // Generate PDF
    const pdfPath = await generateMonthlyInvoicePDF(invoiceData);
    
    // Save invoice record in database
    const invoiceQuery = `
      INSERT INTO invoices (generated_by, target_user_id, type, amount, pdf_path, invoice_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    // Get admin ID for generated_by
    const adminQuery = `SELECT id FROM users WHERE role = 'admin' LIMIT 1`;
    const adminResult = await client.query(adminQuery);
    const adminId = adminResult.rows[0]?.id || null;
    
    const invoiceResult = await client.query(invoiceQuery, [
      adminId,
      customerId,
      'MONTHLY',
      totalAmount,
      pdfPath,
      endDate.toISOString().split('T')[0]
    ]);
    
    const invoice = invoiceResult.rows[0];
    
    // Send invoice to customer via WhatsApp
    await sendMonthlyInvoiceToCustomer(
      customer.phone,
      pdfPath,
      customer.name,
      invoiceData.month,
      year,
      totalAmount
    );
    
    // Update invoice record to mark as sent
    await client.query(
      'UPDATE invoices SET sent_via_whatsapp = true WHERE id = $1',
      [invoice.id]
    );
    
    return {
      success: true,
      invoice,
      pdfPath
    };
  } catch (error) {
    console.error('Error generating monthly invoice:', error);
    throw error;
  }
};

/**
 * Get all invoices
 */
export const getAllInvoices = async (filters = {}) => {
  const client = getClient();
  
  let query = `
    SELECT 
      i.*,
      u1.name as generated_by_name,
      u2.name as target_user_name
    FROM invoices i
    LEFT JOIN users u1 ON i.generated_by = u1.id
    LEFT JOIN users u2 ON i.target_user_id = u2.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (filters.type) {
    query += ` AND i.type = $${paramCount}`;
    params.push(filters.type);
    paramCount++;
  }
  
  if (filters.generatedBy) {
    query += ` AND i.generated_by = $${paramCount}`;
    params.push(filters.generatedBy);
    paramCount++;
  }
  
  if (filters.targetUserId) {
    query += ` AND i.target_user_id = $${paramCount}`;
    params.push(filters.targetUserId);
    paramCount++;
  }
  
  if (filters.startDate) {
    query += ` AND i.invoice_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }
  
  if (filters.endDate) {
    query += ` AND i.invoice_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }
  
  query += ' ORDER BY i.invoice_date DESC, i.created_at DESC';
  
  const result = await client.query(query, params);
  return result.rows;
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id) => {
  const client = getClient();
  
  const query = `
    SELECT 
      i.*,
      u1.name as generated_by_name,
      u2.name as target_user_name
    FROM invoices i
    LEFT JOIN users u1 ON i.generated_by = u1.id
    LEFT JOIN users u2 ON i.target_user_id = u2.id
    WHERE i.id = $1
  `;
  
  const result = await client.query(query, [id]);
  
  if (result.rows.length === 0) {
    throw new Error('Invoice not found');
  }
  
  return result.rows[0];
};

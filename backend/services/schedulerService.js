import cron from 'node-cron';
import { getClient } from '../config/db.js';
import { generateDailyInvoice, generateMonthlyInvoice } from './invoiceService.js';

let scheduledJobs = [];

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduler = () => {
  console.log('Initializing scheduler...');
  
  // Daily invoice generation at 8:00 PM (20:00)
  const dailyInvoiceJob = cron.schedule('0 20 * * *', async () => {
    console.log('Running daily invoice generation job...');
    await generateDailyInvoicesForAllDeliveryBoys();
  });
  
  scheduledJobs.push({ name: 'Daily Invoice Generation', job: dailyInvoiceJob });
  
  // Monthly invoice generation on 1st of every month at 9:00 AM
  const monthlyInvoiceJob = cron.schedule('0 9 1 * *', async () => {
    console.log('Running monthly invoice generation job...');
    await generateMonthlyInvoicesForAllCustomers();
  });
  
  scheduledJobs.push({ name: 'Monthly Invoice Generation', job: monthlyInvoiceJob });
  
  console.log('Scheduler initialized with jobs:', scheduledJobs.map(j => j.name));
};

/**
 * Generate daily invoices for all delivery boys who have completed deliveries
 */
const generateDailyInvoicesForAllDeliveryBoys = async () => {
  const client = getClient();
  
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    // Get all delivery boys who have delivered items yesterday
    const query = `
      SELECT DISTINCT d.delivery_boy_id
      FROM deliveries d
      WHERE d.delivery_date = $1 
        AND d.status = 'delivered'
        AND d.delivery_boy_id IS NOT NULL
    `;
    
    const result = await client.query(query, [dateStr]);
    
    console.log(`Found ${result.rows.length} delivery boys with deliveries for ${dateStr}`);
    
    // Generate invoice for each delivery boy
    for (const row of result.rows) {
      try {
        await generateDailyInvoice(row.delivery_boy_id, dateStr);
        console.log(`Generated daily invoice for delivery boy ${row.delivery_boy_id}`);
      } catch (error) {
        console.error(`Error generating daily invoice for delivery boy ${row.delivery_boy_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in daily invoice generation job:', error);
  }
};

/**
 * Generate monthly invoices for all customers
 */
const generateMonthlyInvoicesForAllCustomers = async () => {
  const client = getClient();
  
  try {
    // Get previous month and year
    const now = new Date();
    const lastMonth = now.getMonth(); // 0-based, so current month - 1 = last month
    const year = lastMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = lastMonth === 0 ? 12 : lastMonth;
    
    // Get all active customers who had deliveries last month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const query = `
      SELECT DISTINCT d.customer_id
      FROM deliveries d
      WHERE d.delivery_date >= $1 
        AND d.delivery_date <= $2
        AND d.status = 'delivered'
    `;
    
    const result = await client.query(query, [startDate, endDate]);
    
    console.log(`Found ${result.rows.length} customers with deliveries for ${month}/${year}`);
    
    // Generate invoice for each customer
    for (const row of result.rows) {
      try {
        await generateMonthlyInvoice(row.customer_id, month, year);
        console.log(`Generated monthly invoice for customer ${row.customer_id}`);
      } catch (error) {
        console.error(`Error generating monthly invoice for customer ${row.customer_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in monthly invoice generation job:', error);
  }
};

/**
 * Manually trigger daily invoice generation for a specific delivery boy
 */
export const triggerDailyInvoice = async (deliveryBoyId, date = null) => {
  if (!date) {
    const today = new Date();
    date = today.toISOString().split('T')[0];
  }
  
  return await generateDailyInvoice(deliveryBoyId, date);
};

/**
 * Manually trigger monthly invoice generation for a specific customer
 */
export const triggerMonthlyInvoice = async (customerId, month = null, year = null) => {
  if (!month || !year) {
    const now = new Date();
    month = now.getMonth(); // Last month
    year = month === 0 ? now.getFullYear() - 1 : now.getFullYear();
    month = month === 0 ? 12 : month;
  }
  
  return await generateMonthlyInvoice(customerId, month, year);
};

/**
 * Stop all scheduled jobs
 */
export const stopScheduler = () => {
  console.log('Stopping all scheduled jobs...');
  scheduledJobs.forEach(({ name, job }) => {
    job.stop();
    console.log(`Stopped job: ${name}`);
  });
  scheduledJobs = [];
};

/**
 * Get status of all scheduled jobs
 */
export const getSchedulerStatus = () => {
  return scheduledJobs.map(({ name, job }) => ({
    name,
    running: job.running || false
  }));
};

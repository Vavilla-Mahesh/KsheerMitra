import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { getClient } from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let whatsappClient = null;
let isReady = false;

/**
 * Initialize WhatsApp client
 */
export const initializeWhatsApp = async () => {
  if (whatsappClient) {
    return whatsappClient;
  }

  const sessionPath = process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '../.wwebjs_auth');
  
  // Ensure session directory exists
  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('WhatsApp QR Code received. Scan with your phone:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isReady = true;
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
    isReady = false;
  });

  whatsappClient.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    isReady = false;
  });

  await whatsappClient.initialize();
  
  return whatsappClient;
};

/**
 * Check if WhatsApp client is ready
 */
export const isWhatsAppReady = () => {
  return isReady;
};

/**
 * Format phone number to WhatsApp format (without + and with country code)
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume it's Indian number and add 91
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned + '@c.us';
};

/**
 * Send a message via WhatsApp
 */
export const sendWhatsAppMessage = async (phone, message, messageType = 'OTHER') => {
  const client = getClient();
  
  try {
    if (!isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    // Send message
    await whatsappClient.sendMessage(formattedPhone, message);
    
    // Log message in database
    await logWhatsAppMessage(phone, messageType, message, 'sent');
    
    console.log(`WhatsApp message sent to ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Log failed message in database
    await logWhatsAppMessage(phone, messageType, message, 'failed', error.message);
    
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via WhatsApp
 */
export const sendOTP = async (phone, otp) => {
  const message = `Your KsheerMitra OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nDo not share this code with anyone.`;
  return await sendWhatsAppMessage(phone, message, 'OTP');
};

/**
 * Send delivery status message to customer
 */
export const sendDeliveryStatusMessage = async (phone, customerName, date, status) => {
  let message;
  
  if (status === 'delivered') {
    message = `✅ Hello ${customerName}!\n\nYour milk delivery for ${date} has been successfully delivered.\n\nThank you for choosing KsheerMitra! 🥛`;
  } else if (status === 'missed') {
    message = `❌ Hello ${customerName}!\n\nWe're sorry, but your milk delivery for ${date} was missed.\n\nPlease contact us if you have any concerns.\n\nKsheerMitra Team`;
  } else {
    return { success: false, error: 'Invalid status' };
  }
  
  return await sendWhatsAppMessage(phone, message, 'DELIVERY_STATUS');
};

/**
 * Send daily invoice PDF to admin via WhatsApp
 */
export const sendDailyInvoiceToAdmin = async (adminPhone, pdfPath, deliveryBoyName, date, summary) => {
  try {
    if (!isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const formattedPhone = formatPhoneNumber(adminPhone);
    
    // Prepare message
    const message = `📊 *Daily Invoice Report*\n\n` +
                   `Delivery Boy: ${deliveryBoyName}\n` +
                   `Date: ${date}\n\n` +
                   `*Summary:*\n` +
                   `Total Deliveries: ${summary.totalDeliveries}\n` +
                   `Total Amount: ₹${summary.totalAmount.toFixed(2)}\n\n` +
                   `Please find the detailed invoice attached.`;
    
    // Send message first
    await whatsappClient.sendMessage(formattedPhone, message);
    
    // Send PDF as media
    const { MessageMedia } = await import('whatsapp-web.js');
    const pdfData = fs.readFileSync(pdfPath, { encoding: 'base64' });
    const pdfMedia = new MessageMedia('application/pdf', pdfData, `daily_invoice_${date}.pdf`);
    
    await whatsappClient.sendMessage(formattedPhone, pdfMedia);
    
    // Log message in database
    await logWhatsAppMessage(adminPhone, 'DAILY_INVOICE', message, 'sent');
    
    console.log(`Daily invoice sent to admin ${adminPhone}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending daily invoice:', error);
    
    // Log failed message in database
    await logWhatsAppMessage(adminPhone, 'DAILY_INVOICE', 'Daily invoice PDF', 'failed', error.message);
    
    return { success: false, error: error.message };
  }
};

/**
 * Send monthly invoice PDF to customer via WhatsApp
 */
export const sendMonthlyInvoiceToCustomer = async (customerPhone, pdfPath, customerName, month, year, amount) => {
  try {
    if (!isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    const formattedPhone = formatPhoneNumber(customerPhone);
    
    // Prepare message
    const message = `🧾 *Monthly Invoice - ${month} ${year}*\n\n` +
                   `Hello ${customerName},\n\n` +
                   `Your monthly invoice is ready!\n\n` +
                   `*Total Amount:* ₹${amount.toFixed(2)}\n\n` +
                   `Thank you for being a valued customer of KsheerMitra! 🥛\n\n` +
                   `Please find the detailed invoice attached.`;
    
    // Send message first
    await whatsappClient.sendMessage(formattedPhone, message);
    
    // Send PDF as media
    const { MessageMedia } = await import('whatsapp-web.js');
    const pdfData = fs.readFileSync(pdfPath, { encoding: 'base64' });
    const pdfMedia = new MessageMedia('application/pdf', pdfData, `monthly_invoice_${month}_${year}.pdf`);
    
    await whatsappClient.sendMessage(formattedPhone, pdfMedia);
    
    // Log message in database
    await logWhatsAppMessage(customerPhone, 'MONTHLY_INVOICE', message, 'sent');
    
    console.log(`Monthly invoice sent to customer ${customerPhone}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending monthly invoice:', error);
    
    // Log failed message in database
    await logWhatsAppMessage(customerPhone, 'MONTHLY_INVOICE', 'Monthly invoice PDF', 'failed', error.message);
    
    return { success: false, error: error.message };
  }
};

/**
 * Log WhatsApp message in database
 */
const logWhatsAppMessage = async (phone, messageType, messageContent, status, errorMessage = null) => {
  const client = getClient();
  
  try {
    const query = `
      INSERT INTO whatsapp_messages (recipient_phone, message_type, message_content, status, sent_at, error_message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const sentAt = status === 'sent' ? new Date() : null;
    const result = await client.query(query, [
      phone,
      messageType,
      messageContent,
      status,
      sentAt,
      errorMessage
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error logging WhatsApp message:', error);
  }
};

/**
 * Get WhatsApp client instance
 */
export const getWhatsAppClient = () => {
  return whatsappClient;
};

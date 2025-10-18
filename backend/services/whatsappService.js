import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.sessionPath = process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '../../sessions');
  }

  async initialize() {
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: this.sessionPath
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      console.log('WhatsApp QR Code received. Scan this to authenticate:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    try {
      await this.client.initialize();
      console.log('WhatsApp client initialized');
    } catch (error) {
      console.error('Failed to initialize WhatsApp client:', error);
      throw error;
    }
  }

  async sendOTP(phone, otp) {
    if (!this.isReady) {
      console.warn('WhatsApp client not ready, skipping OTP send');
      return false;
    }

    try {
      // Format phone number (remove + and add country code if needed)
      const formattedPhone = this.formatPhoneNumber(phone);
      const message = `Your KsheerMitra OTP is: ${otp}\nValid for 10 minutes.\nDo not share this code with anyone.`;
      
      await this.client.sendMessage(`${formattedPhone}@c.us`, message);
      console.log(`OTP sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('Failed to send OTP via WhatsApp:', error);
      return false;
    }
  }

  async sendDeliveryNotification(phone, status, date, productName) {
    if (!this.isReady) {
      console.warn('WhatsApp client not ready, skipping delivery notification');
      return false;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      let message = '';

      if (status === 'DELIVERED') {
        message = `✅ Your ${productName} for ${date} has been delivered!\n\nThank you for choosing KsheerMitra.`;
      } else if (status === 'MISSED') {
        message = `❌ Your ${productName} for ${date} was missed.\n\nPlease contact us for rescheduling.`;
      }

      await this.client.sendMessage(`${formattedPhone}@c.us`, message);
      console.log(`Delivery notification sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('Failed to send delivery notification:', error);
      return false;
    }
  }

  async sendInvoice(phone, invoiceType, pdfPath) {
    if (!this.isReady) {
      console.warn('WhatsApp client not ready, skipping invoice send');
      return false;
    }

    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      const caption = invoiceType === 'DAILY' 
        ? '📄 Your daily delivery invoice is ready!'
        : '🧾 Your monthly invoice is ready!';

      // Validate pdfPath is within expected directory
      const invoicesDir = path.resolve(__dirname, '../../invoices');
      const resolvedPath = path.resolve(pdfPath);
      
      if (!resolvedPath.startsWith(invoicesDir)) {
        throw new Error('Invalid PDF path');
      }

      // Send invoice as document
      const media = await import('whatsapp-web.js').then(m => m.MessageMedia);
      const pdfData = fs.readFileSync(resolvedPath, { encoding: 'base64' });
      const pdfMedia = new media.MessageMedia('application/pdf', pdfData, `invoice_${invoiceType.toLowerCase()}.pdf`);
      
      await this.client.sendMessage(`${formattedPhone}@c.us`, pdfMedia, { caption });
      console.log(`Invoice sent to ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('Failed to send invoice:', error);
      return false;
    }
  }

  formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number doesn't start with country code, assume India (+91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      console.log('WhatsApp client destroyed');
    }
  }
}

// Singleton instance
let whatsappService = null;

export const getWhatsAppService = () => {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
  }
  return whatsappService;
};

export default WhatsAppService;

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceService {
  constructor() {
    this.invoicesDir = path.join(__dirname, '../../invoices');
    
    // Ensure invoices directory exists
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  /**
   * Generate a daily invoice for a delivery boy
   * @param {Object} data - Invoice data
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateDailyInvoice(data) {
    const {
      deliveryBoyId,
      deliveryBoyName,
      date,
      deliveries,
      totalAmount
    } = data;

    // Sanitize filename to prevent path traversal
    const sanitizedId = deliveryBoyId.replace(/[^a-zA-Z0-9-]/g, '');
    const sanitizedDate = date.replace(/[^0-9-]/g, '');
    const fileName = `daily_invoice_${sanitizedId}_${sanitizedDate}.pdf`;
    const filePath = path.join(this.invoicesDir, fileName);
    
    // Validate the final path is within invoices directory
    const resolvedPath = path.resolve(filePath);
    const resolvedInvoicesDir = path.resolve(this.invoicesDir);
    if (!resolvedPath.startsWith(resolvedInvoicesDir)) {
      return Promise.reject(new Error('Invalid file path'));
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('KSHEERMITRA', { align: 'center' });
        doc.fontSize(16).text('Daily Delivery Invoice', { align: 'center' });
        doc.moveDown();

        // Delivery Boy Info
        doc.fontSize(12);
        doc.text(`Delivery Boy: ${deliveryBoyName}`);
        doc.text(`Date: ${date}`);
        doc.moveDown();

        // Deliveries Table Header
        doc.fontSize(10);
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 200;
        const col3 = 300;
        const col4 = 400;
        const col5 = 480;

        doc.font('Helvetica-Bold');
        doc.text('Customer', col1, tableTop);
        doc.text('Product', col2, tableTop);
        doc.text('Quantity', col3, tableTop);
        doc.text('Price', col4, tableTop);
        doc.text('Amount', col5, tableTop);

        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Deliveries
        doc.font('Helvetica');
        let currentY = doc.y;

        deliveries.forEach((delivery, index) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc.text(delivery.customerName, col1, currentY, { width: 140 });
          doc.text(delivery.productName, col2, currentY, { width: 90 });
          doc.text(delivery.quantity.toString(), col3, currentY);
          doc.text(`₹${delivery.price}`, col4, currentY);
          doc.text(`₹${delivery.amount}`, col5, currentY);

          currentY += 20;
        });

        doc.y = currentY;
        doc.moveDown();

        // Total
        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold');
        doc.text('Total Amount:', col4, doc.y);
        doc.text(`₹${totalAmount.toFixed(2)}`, col5, doc.y);

        // Footer
        doc.moveDown(2);
        doc.font('Helvetica');
        doc.fontSize(8);
        doc.text('Thank you for your service!', { align: 'center' });
        doc.text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a monthly invoice for a customer
   * @param {Object} data - Invoice data
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateMonthlyInvoice(data) {
    const {
      customerId,
      customerName,
      customerAddress,
      month,
      year,
      deliveries,
      totalAmount,
      paymentStatus
    } = data;

    // Sanitize filename to prevent path traversal
    const sanitizedId = customerId.replace(/[^a-zA-Z0-9-]/g, '');
    const sanitizedYear = year.toString().replace(/[^0-9]/g, '');
    const sanitizedMonth = month.toString().replace(/[^0-9]/g, '');
    const fileName = `monthly_invoice_${sanitizedId}_${sanitizedYear}_${sanitizedMonth}.pdf`;
    const filePath = path.join(this.invoicesDir, fileName);
    
    // Validate the final path is within invoices directory
    const resolvedPath = path.resolve(filePath);
    const resolvedInvoicesDir = path.resolve(this.invoicesDir);
    if (!resolvedPath.startsWith(resolvedInvoicesDir)) {
      return Promise.reject(new Error('Invalid file path'));
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('KSHEERMITRA', { align: 'center' });
        doc.fontSize(16).text('Monthly Invoice', { align: 'center' });
        doc.moveDown();

        // Customer Info
        doc.fontSize(12);
        doc.text(`Customer: ${customerName}`);
        doc.text(`Address: ${customerAddress || 'N/A'}`);
        doc.text(`Period: ${month}/${year}`);
        doc.text(`Payment Status: ${paymentStatus || 'Pending'}`);
        doc.moveDown();

        // Deliveries Table Header
        doc.fontSize(10);
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 130;
        const col3 = 280;
        const col4 = 360;
        const col5 = 440;
        const col6 = 500;

        doc.font('Helvetica-Bold');
        doc.text('Date', col1, tableTop);
        doc.text('Product', col2, tableTop);
        doc.text('Quantity', col3, tableTop);
        doc.text('Price', col4, tableTop);
        doc.text('Amount', col5, tableTop);
        doc.text('Status', col6, tableTop);

        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Deliveries
        doc.font('Helvetica');
        let currentY = doc.y;

        deliveries.forEach((delivery) => {
          if (currentY > 700) {
            doc.addPage();
            currentY = 50;
          }

          doc.text(delivery.date, col1, currentY);
          doc.text(delivery.productName, col2, currentY, { width: 140 });
          doc.text(delivery.quantity.toString(), col3, currentY);
          doc.text(`₹${delivery.price}`, col4, currentY);
          doc.text(`₹${delivery.amount}`, col5, currentY);
          doc.text(delivery.status, col6, currentY);

          currentY += 20;
        });

        doc.y = currentY;
        doc.moveDown();

        // Total
        doc.moveTo(col1, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold');
        doc.text('Total Amount:', col4, doc.y);
        doc.text(`₹${totalAmount.toFixed(2)}`, col5, doc.y);

        // Footer
        doc.moveDown(2);
        doc.font('Helvetica');
        doc.fontSize(8);
        doc.text('Thank you for your business!', { align: 'center' });
        doc.text('Generated on: ' + new Date().toLocaleString(), { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Delete an invoice file
   * @param {string} filePath - Path to invoice file
   */
  deleteInvoice(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// Singleton instance
let invoiceService = null;

export const getInvoiceService = () => {
  if (!invoiceService) {
    invoiceService = new InvoiceService();
  }
  return invoiceService;
};

export default InvoiceService;

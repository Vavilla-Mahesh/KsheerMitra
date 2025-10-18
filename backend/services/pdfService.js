import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure invoices directory exists
const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

/**
 * Generate Daily Invoice PDF for Delivery Boy
 * @param {Object} data - Invoice data
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateDailyInvoicePDF = async (data) => {
  const {
    deliveryBoyName,
    date,
    deliveries,
    totalAmount,
    deliveryBoyId
  } = data;

  const fileName = `daily_invoice_${deliveryBoyId}_${date.replace(/\//g, '-')}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('KsheerMitra', { align: 'center' });
    doc.fontSize(16).text('Daily Delivery Invoice', { align: 'center' });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(12);
    doc.text(`Delivery Boy: ${deliveryBoyName}`);
    doc.text(`Date: ${date}`);
    doc.text(`Invoice Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Customer Name', 50, tableTop);
    doc.text('Product', 200, tableTop);
    doc.text('Quantity', 350, tableTop);
    doc.text('Amount (₹)', 450, tableTop);
    
    // Line under header
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
    doc.moveDown(1.5);

    // Table Body
    doc.font('Helvetica');
    let yPosition = doc.y;

    deliveries.forEach((delivery) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(delivery.customerName, 50, yPosition, { width: 140 });
      doc.text(delivery.productName, 200, yPosition, { width: 140 });
      doc.text(delivery.quantity.toString(), 350, yPosition);
      doc.text(delivery.amount.toFixed(2), 450, yPosition);

      yPosition += 25;
    });

    // Total
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`Total Deliveries: ${deliveries.length}`, 50);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 350, doc.y - 15);

    // Footer
    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica').text(
      'This is a system-generated invoice. For queries, contact admin.',
      { align: 'center' }
    );

    doc.end();
  });
};

/**
 * Generate Monthly Invoice PDF for Customer
 * @param {Object} data - Invoice data
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateMonthlyInvoicePDF = async (data) => {
  const {
    customerName,
    customerId,
    month,
    year,
    dailyBreakdown,
    totalAmount,
    paymentStatus
  } = data;

  const fileName = `monthly_invoice_${customerId}_${month}_${year}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('KsheerMitra', { align: 'center' });
    doc.fontSize(16).text('Monthly Invoice', { align: 'center' });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(12);
    doc.text(`Customer Name: ${customerName}`);
    doc.text(`Invoice Period: ${month} ${year}`);
    doc.text(`Payment Status: ${paymentStatus || 'Pending'}`);
    doc.text(`Invoice Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Date', 50, tableTop);
    doc.text('Product', 150, tableTop);
    doc.text('Quantity', 300, tableTop);
    doc.text('Unit Price (₹)', 380, tableTop);
    doc.text('Amount (₹)', 480, tableTop);
    
    // Line under header
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();
    doc.moveDown(1.5);

    // Table Body
    doc.font('Helvetica');
    let yPosition = doc.y;

    dailyBreakdown.forEach((item) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(item.date, 50, yPosition);
      doc.text(item.productName, 150, yPosition, { width: 140 });
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(item.unitPrice.toFixed(2), 380, yPosition);
      doc.text(item.amount.toFixed(2), 480, yPosition);

      yPosition += 25;
    });

    // Total
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(14);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 350);

    // Payment Instructions
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica');
    doc.text('Payment can be made via:', 50);
    doc.fontSize(10);
    doc.text('• Cash payment to delivery boy', 50);
    doc.text('• Bank transfer (Contact admin for details)', 50);
    doc.text('• UPI payment (Contact admin for details)', 50);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').text(
      'Thank you for choosing KsheerMitra!',
      { align: 'center' }
    );
    doc.text(
      'For queries, contact: support@ksheermitra.com',
      { align: 'center' }
    );

    doc.end();
  });
};

/**
 * Get invoice file path
 * @param {string} fileName - Name of the invoice file
 * @returns {string} - Full path to the invoice file
 */
export const getInvoiceFilePath = (fileName) => {
  return path.join(invoicesDir, fileName);
};

/**
 * Check if invoice file exists
 * @param {string} fileName - Name of the invoice file
 * @returns {boolean} - True if file exists
 */
export const invoiceFileExists = (fileName) => {
  const filePath = path.join(invoicesDir, fileName);
  return fs.existsSync(filePath);
};

/**
 * Delete invoice file
 * @param {string} fileName - Name of the invoice file
 * @returns {boolean} - True if deletion successful
 */
export const deleteInvoiceFile = (fileName) => {
  try {
    const filePath = path.join(invoicesDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting invoice file:', error);
    return false;
  }
};

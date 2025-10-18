import * as invoiceService from '../services/invoiceService.js';
import { triggerDailyInvoice, triggerMonthlyInvoice } from '../services/schedulerService.js';

/**
 * Generate daily invoice for a delivery boy
 */
export const generateDailyInvoice = async (req, res) => {
  try {
    const { deliveryBoyId, date } = req.body;
    
    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: 'Delivery boy ID is required'
      });
    }
    
    const result = await triggerDailyInvoice(deliveryBoyId, date);
    
    res.status(200).json({
      success: true,
      message: 'Daily invoice generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Generate daily invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate monthly invoice for a customer
 */
export const generateMonthlyInvoice = async (req, res) => {
  try {
    const { customerId, month, year } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }
    
    const result = await triggerMonthlyInvoice(customerId, month, year);
    
    res.status(200).json({
      success: true,
      message: 'Monthly invoice generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Generate monthly invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all invoices with optional filters
 */
export const getAllInvoices = async (req, res) => {
  try {
    const { type, generatedBy, targetUserId, startDate, endDate } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (generatedBy) filters.generatedBy = generatedBy;
    if (targetUserId) filters.targetUserId = targetUserId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const invoices = await invoiceService.getAllInvoices(filters);
    
    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await invoiceService.getInvoiceById(id);
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Download invoice PDF
 */
export const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await invoiceService.getInvoiceById(id);
    
    if (!invoice.pdf_path) {
      return res.status(404).json({
        success: false,
        message: 'Invoice PDF not found'
      });
    }
    
    res.download(invoice.pdf_path);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

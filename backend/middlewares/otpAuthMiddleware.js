import { getOTPAuthService } from '../services/otpAuthService.js';

const otpAuthService = getOTPAuthService();

/**
 * Middleware to verify JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = otpAuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user is delivery boy
 */
export const isDeliveryBoy = async (req, res, next) => {
  if (req.user.role !== 'DELIVERY') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Delivery boy role required.'
    });
  }
  next();
};

/**
 * Middleware to check if user is customer
 */
export const isCustomer = async (req, res, next) => {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.'
    });
  }
  next();
};

export default {
  authenticate,
  isAdmin,
  isDeliveryBoy,
  isCustomer
};

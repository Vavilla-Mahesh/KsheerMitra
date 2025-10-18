import express from 'express';
import { requestOTP, verifyOTP, updateProfile, getProfile } from '../controllers/otpAuthController.js';
import { authenticate } from '../middlewares/otpAuthMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many OTP requests, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many authentication attempts, please try again later'
});

// OTP Authentication routes
router.post('/send-otp', otpLimiter, requestOTP);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/otp/request', otpLimiter, requestOTP); // Legacy
router.post('/otp/verify', authLimiter, verifyOTP); // Legacy

// Profile/Signup routes (protected)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/signup', authLimiter, updateProfile); // Alias for profile update after OTP login

export default router;

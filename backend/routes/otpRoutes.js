import express from 'express';
import * as otpController from '../controllers/otpController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many OTP requests, please try again later'
});

// Send OTP
router.post('/send', otpLimiter, otpController.sendOTP);

// Verify OTP
router.post('/verify', otpLimiter, otpController.verifyOTP);

// Resend OTP
router.post('/resend', otpLimiter, otpController.resendOTP);

export default router;

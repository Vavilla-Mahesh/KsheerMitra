import express from 'express';
import * as authController from '../controllers/authController.js';
import { 
  validate, 
  signupSchema, 
  loginSchema, 
  refreshTokenSchema,
  whatsappOtpRequestSchema,
  whatsappOtpVerifySchema,
  whatsappSignupSchema
} from '../utils/validation.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later'
});

// Traditional email/password auth
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

// WhatsApp OTP auth
router.post('/whatsapp/send-otp', authLimiter, validate(whatsappOtpRequestSchema), authController.sendOtp);
router.post('/whatsapp/verify-otp', authLimiter, validate(whatsappOtpVerifySchema), authController.verifyOtp);
router.post('/whatsapp/complete-signup', validate(whatsappSignupSchema), authController.completeWhatsAppSignup);

export default router;

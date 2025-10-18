import express from 'express';
import { requestOTP, verifyOTP, updateProfile, getProfile } from '../controllers/otpAuthController.js';
import { authenticate } from '../middlewares/otpAuthMiddleware.js';

const router = express.Router();

// OTP Authentication routes
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);

// Profile routes (protected)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;

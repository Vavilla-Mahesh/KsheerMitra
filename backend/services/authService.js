import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmail, findUserByWhatsApp } from '../models/userModel.js';
import { saveRefreshToken, findRefreshToken, revokeRefreshToken } from '../models/refreshTokenModel.js';
import { 
  createOtpVerification, 
  findOtpByWhatsApp, 
  verifyOtp, 
  incrementOtpAttempts 
} from '../models/otpModel.js';
import { sendOtpViaWhatsApp, generateOtpCode } from './whatsappService.js';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

export const signup = async (userData) => {
  const { name, phone, email, location, password, role = 'customer' } = userData;
  
  // Only customers can sign up manually
  if (role !== 'customer') {
    throw new Error('Only customers can sign up');
  }
  
  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  
  // Create user
  const user = await createUser({
    name,
    phone,
    email,
    location,
    password_hash,
    role
  });
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  
  return { user, accessToken, refreshToken };
};

export const login = async (email, password) => {
  // Find user
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  
  // Remove password hash from user object
  delete user.password_hash;
  
  return { user, accessToken, refreshToken };
};

export const refresh = async (refreshTokenString) => {
  // Find and validate refresh token
  const tokenRecord = await findRefreshToken(refreshTokenString);
  if (!tokenRecord) {
    throw new Error('Invalid or expired refresh token');
  }
  
  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshTokenString, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
  
  // Revoke old refresh token
  await revokeRefreshToken(refreshTokenString);
  
  // Generate new tokens
  const user = { id: decoded.id, email: decoded.email, role: decoded.role };
  const { accessToken, refreshToken } = await generateTokens(user);
  
  return { accessToken, refreshToken };
};

export const logout = async (refreshTokenString) => {
  await revokeRefreshToken(refreshTokenString);
};

const generateTokens = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    whatsapp_number: user.whatsapp_number
  };
  
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d'
  });
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Save refresh token
  await saveRefreshToken(user.id, refreshToken, expiresAt);
  
  return { accessToken, refreshToken };
};

/**
 * Send OTP to WhatsApp number
 */
export const sendWhatsAppOtp = async (whatsappNumber) => {
  // Generate OTP
  const otpCode = generateOtpCode();
  
  // Calculate expiry time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
  
  // Save OTP to database
  await createOtpVerification(whatsappNumber, otpCode, expiresAt);
  
  // Send OTP via WhatsApp
  await sendOtpViaWhatsApp(whatsappNumber, otpCode);
  
  return {
    message: 'OTP sent successfully',
    expiresAt
  };
};

/**
 * Verify WhatsApp OTP
 */
export const verifyWhatsAppOtp = async (whatsappNumber, otpCode) => {
  // Find OTP record
  const otpRecord = await findOtpByWhatsApp(whatsappNumber);
  
  if (!otpRecord) {
    throw new Error('OTP not found or expired');
  }
  
  // Check attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
  }
  
  // Verify OTP code
  if (otpRecord.otp_code !== otpCode) {
    await incrementOtpAttempts(otpRecord.id);
    throw new Error('Invalid OTP code');
  }
  
  // Mark OTP as verified
  await verifyOtp(otpRecord.id);
  
  // Check if user exists
  const existingUser = await findUserByWhatsApp(whatsappNumber);
  
  return {
    verified: true,
    userExists: !!existingUser,
    user: existingUser || null
  };
};

/**
 * Complete WhatsApp signup after OTP verification
 */
export const completeWhatsAppSignup = async (userData) => {
  const { 
    name, 
    whatsapp_number, 
    phone,
    latitude, 
    longitude, 
    address_manual,
    role = 'customer' 
  } = userData;
  
  // Only customers can sign up
  if (role !== 'customer') {
    throw new Error('Only customers can sign up');
  }
  
  // Check if WhatsApp number already exists
  const existingUser = await findUserByWhatsApp(whatsapp_number);
  if (existingUser) {
    throw new Error('WhatsApp number already registered');
  }
  
  // Create user without password (WhatsApp auth only)
  const user = await createUser({
    name,
    phone: phone || whatsapp_number,
    whatsapp_number,
    whatsapp_verified: true,
    latitude,
    longitude,
    address_manual,
    location: address_manual || `${latitude},${longitude}`,
    password_hash: null, // No password for WhatsApp-only users
    role
  });
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  
  return { user, accessToken, refreshToken };
};

/**
 * Login with WhatsApp (after OTP verification)
 */
export const loginWithWhatsApp = async (whatsappNumber) => {
  // Find user
  const user = await findUserByWhatsApp(whatsappNumber);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!user.whatsapp_verified) {
    throw new Error('WhatsApp number not verified');
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);
  
  // Remove password hash from user object
  delete user.password_hash;
  
  return { user, accessToken, refreshToken };
};

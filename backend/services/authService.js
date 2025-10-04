import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { saveRefreshToken, findRefreshToken, revokeRefreshToken } from '../models/refreshTokenModel.js';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

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
    role: user.role
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

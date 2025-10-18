import { getClient } from '../config/db.js';
import { sendOTP } from './whatsappService.js';

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to user's phone via WhatsApp
 */
export const sendOTPToUser = async (phone) => {
  const client = getClient();
  
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Check if user exists
    const userQuery = 'SELECT id FROM users WHERE phone = $1';
    const userResult = await client.query(userQuery, [phone]);
    
    if (userResult.rows.length > 0) {
      // Update existing user's OTP
      await client.query(
        'UPDATE users SET otp = $1, otp_expires_at = $2 WHERE phone = $3',
        [otp, expiresAt, phone]
      );
    } else {
      // For new users, we'll store OTP temporarily
      // The user will be created after OTP verification
      // For now, we can't store it without a full user record
      // This needs to be handled during signup
      throw new Error('User not found. Please signup first.');
    }
    
    // Send OTP via WhatsApp
    const result = await sendOTP(phone, otp);
    
    if (!result.success) {
      throw new Error('Failed to send OTP via WhatsApp');
    }
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresAt
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phone, otp) => {
  const client = getClient();
  
  try {
    const query = `
      SELECT id, otp, otp_expires_at, role 
      FROM users 
      WHERE phone = $1
    `;
    
    const result = await client.query(query, [phone]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = result.rows[0];
    
    // Check if OTP is set
    if (!user.otp) {
      throw new Error('No OTP found for this user');
    }
    
    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires_at)) {
      throw new Error('OTP has expired');
    }
    
    // Verify OTP
    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }
    
    // Clear OTP after successful verification
    await client.query(
      'UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [user.id]
    );
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (phone) => {
  return await sendOTPToUser(phone);
};

/**
 * Clear expired OTPs (can be run as a cleanup job)
 */
export const clearExpiredOTPs = async () => {
  const client = getClient();
  
  try {
    const query = `
      UPDATE users 
      SET otp = NULL, otp_expires_at = NULL 
      WHERE otp_expires_at < NOW()
    `;
    
    const result = await client.query(query);
    
    console.log(`Cleared ${result.rowCount} expired OTPs`);
    
    return {
      success: true,
      clearedCount: result.rowCount
    };
  } catch (error) {
    console.error('Error clearing expired OTPs:', error);
    throw error;
  }
};

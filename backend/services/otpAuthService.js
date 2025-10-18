import jwt from 'jsonwebtoken';
import { User } from '../models/sequelize/index.js';
import { getWhatsAppService } from './whatsappService.js';

class OTPAuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
    this.otpExpiryMinutes = 10;
  }

  /**
   * Generate a random 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Request OTP for phone number
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} - Result with success status
   */
  async requestOTP(phone) {
    try {
      // Generate OTP
      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);

      // Find or create user
      let user = await User.findOne({ where: { phone } });

      if (user) {
        // Update existing user with new OTP
        await user.update({ otp, otpExpiry });
      } else {
        // Create new user with CUSTOMER role by default
        user = await User.create({
          phone,
          name: `User_${phone.slice(-4)}`, // Temporary name
          role: 'CUSTOMER',
          otp,
          otpExpiry
        });
      }

      // Send OTP via WhatsApp
      const whatsappService = getWhatsAppService();
      const sent = await whatsappService.sendOTP(phone, otp);

      // For development/testing, also log OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`OTP for ${phone}: ${otp}`);
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        otpSentViaWhatsApp: sent
      };
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and issue JWT token
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} - User data and JWT token
   */
  async verifyOTP(phone, otp) {
    try {
      const user = await User.findOne({ where: { phone } });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.otp || !user.otpExpiry) {
        throw new Error('No OTP found for this number');
      }

      // Check if OTP is expired
      if (new Date() > user.otpExpiry) {
        throw new Error('OTP has expired');
      }

      // Verify OTP
      if (user.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP after successful verification
      await user.update({ otp: null, otpExpiry: null });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          address: user.address,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Update user profile after first login
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data (name, address, email)
   * @returns {Promise<Object>} - Updated user
   */
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const updates = {};
      
      if (profileData.name) updates.name = profileData.name;
      if (profileData.address) updates.address = profileData.address;
      if (profileData.email) updates.email = profileData.email;

      // If address is provided, geocode it
      if (profileData.address && !profileData.latitude) {
        try {
          const { getGoogleMapsService } = await import('./googleMapsService.js');
          const mapsService = getGoogleMapsService();
          const location = await mapsService.geocodeAddress(profileData.address);
          updates.latitude = location.lat;
          updates.longitude = location.lng;
          updates.address = location.formattedAddress;
        } catch (error) {
          console.error('Geocoding failed:', error);
          // Continue without geocoding
        }
      }

      await user.update(updates);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          address: user.address,
          email: user.email,
          latitude: user.latitude,
          longitude: user.longitude
        }
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

// Singleton instance
let otpAuthService = null;

export const getOTPAuthService = () => {
  if (!otpAuthService) {
    otpAuthService = new OTPAuthService();
  }
  return otpAuthService;
};

export default OTPAuthService;

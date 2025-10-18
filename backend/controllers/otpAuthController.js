import { getOTPAuthService } from '../services/otpAuthService.js';

const otpAuthService = getOTPAuthService();

/**
 * Request OTP for login
 */
export const requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const result = await otpAuthService.requestOTP(phone);

    res.status(200).json(result);
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
};

/**
 * Verify OTP and login
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    const result = await otpAuthService.verifyOTP(phone, otp);

    res.status(200).json(result);
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed'
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const profileData = req.body;

    const result = await otpAuthService.updateProfile(userId, profileData);

    res.status(200).json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const { User } = await import('../models/sequelize/index.js');
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'phone', 'email', 'role', 'address', 'latitude', 'longitude', 'status']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

export default {
  requestOTP,
  verifyOTP,
  updateProfile,
  getProfile
};

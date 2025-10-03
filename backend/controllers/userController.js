import * as userService from '../services/userService.js';

export const getMe = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.validatedData);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

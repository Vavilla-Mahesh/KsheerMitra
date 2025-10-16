import * as authService from '../services/authService.js';

export const signup = async (req, res) => {
  try {
    const result = await authService.signup(req.validatedData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;
    const result = await authService.login(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.validatedData;
    const result = await authService.refresh(refreshToken);
    
    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: result
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.validatedData;
    await authService.logout(refreshToken);
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// WhatsApp OTP endpoints
export const sendOtp = async (req, res) => {
  try {
    const { whatsapp_number } = req.validatedData;
    const result = await authService.sendWhatsAppOtp(whatsapp_number);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { whatsapp_number, otp_code } = req.validatedData;
    const result = await authService.verifyWhatsAppOtp(whatsapp_number, otp_code);
    
    // If user exists, log them in
    if (result.userExists && result.user) {
      const loginResult = await authService.loginWithWhatsApp(whatsapp_number);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          ...result,
          ...loginResult
        }
      });
    } else {
      // New user, proceed to signup
      res.status(200).json({
        success: true,
        message: 'OTP verified. Please complete signup.',
        data: result
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const completeWhatsAppSignup = async (req, res) => {
  try {
    const result = await authService.completeWhatsAppSignup(req.validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Signup completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

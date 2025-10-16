import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_VERIFY_TEMPLATE_ID = process.env.WHATSAPP_VERIFY_TEMPLATE_ID;

/**
 * Send OTP via WhatsApp Business Cloud API
 * @param {string} whatsappNumber - Recipient's WhatsApp number (with country code)
 * @param {string} otpCode - OTP code to send
 */
export const sendOtpViaWhatsApp = async (whatsappNumber, otpCode) => {
  if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not configured');
  }

  try {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    // Format: If using a template
    if (WHATSAPP_VERIFY_TEMPLATE_ID) {
      const payload = {
        messaging_product: 'whatsapp',
        to: whatsappNumber,
        type: 'template',
        template: {
          name: WHATSAPP_VERIFY_TEMPLATE_ID,
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: otpCode
                }
              ]
            }
          ]
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } else {
      // Fallback: Send as text message (requires approved number)
      const payload = {
        messaging_product: 'whatsapp',
        to: whatsappNumber,
        type: 'text',
        text: {
          body: `Your KsheerMitra verification code is: ${otpCode}. Valid for 10 minutes.`
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    }
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw new Error('Failed to send OTP via WhatsApp');
  }
};

/**
 * Generate a 6-digit OTP code
 */
export const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

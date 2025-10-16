import { getClient } from '../config/db.js';

export const createOtpVerification = async (whatsappNumber, otpCode, expiresAt) => {
  const client = getClient();
  const query = `
    INSERT INTO otp_verifications (whatsapp_number, otp_code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, whatsapp_number, expires_at, created_at
  `;
  const result = await client.query(query, [whatsappNumber, otpCode, expiresAt]);
  return result.rows[0];
};

export const findOtpByWhatsApp = async (whatsappNumber) => {
  const client = getClient();
  const query = `
    SELECT * FROM otp_verifications 
    WHERE whatsapp_number = $1 
    AND verified = false 
    AND expires_at > NOW()
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const result = await client.query(query, [whatsappNumber]);
  return result.rows[0];
};

export const verifyOtp = async (id) => {
  const client = getClient();
  const query = `
    UPDATE otp_verifications 
    SET verified = true 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const incrementOtpAttempts = async (id) => {
  const client = getClient();
  const query = `
    UPDATE otp_verifications 
    SET attempts = attempts + 1 
    WHERE id = $1 
    RETURNING *
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

export const deleteExpiredOtps = async () => {
  const client = getClient();
  const query = 'DELETE FROM otp_verifications WHERE expires_at < NOW()';
  const result = await client.query(query);
  return result.rowCount;
};

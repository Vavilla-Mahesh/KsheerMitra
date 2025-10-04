import { getClient } from '../config/db.js';

export const saveRefreshToken = async (userId, token, expiresAt) => {
  const client = getClient();
  const query = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, token, expires_at
  `;
  
  const result = await client.query(query, [userId, token, expiresAt]);
  return result.rows[0];
};

export const findRefreshToken = async (token) => {
  const client = getClient();
  const query = `
    SELECT * FROM refresh_tokens 
    WHERE token = $1 AND revoked = false AND expires_at > NOW()
  `;
  
  const result = await client.query(query, [token]);
  return result.rows[0];
};

export const revokeRefreshToken = async (token) => {
  const client = getClient();
  const query = 'UPDATE refresh_tokens SET revoked = true WHERE token = $1';
  await client.query(query, [token]);
};

export const revokeAllUserTokens = async (userId) => {
  const client = getClient();
  const query = 'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1';
  await client.query(query, [userId]);
};

export const cleanupExpiredTokens = async () => {
  const client = getClient();
  const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
  const result = await client.query(query);
  return result.rowCount;
};

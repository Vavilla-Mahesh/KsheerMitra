import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

let connected = false;

export const connectDB = async () => {
  try {
    await client.connect();
    connected = true;
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const getClient = () => {
  if (!connected) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return client;
};

export const closeDB = async () => {
  if (connected) {
    await client.end();
    connected = false;
    console.log('PostgreSQL connection closed');
  }
};

export default { connectDB, getClient, closeDB };

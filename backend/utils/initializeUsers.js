import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { findUserByEmail, createUser } from '../models/userModel.js';

dotenv.config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

export const initializeSystemUsers = async () => {
  try {
    console.log('Initializing system users...');

    // Initialize admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;
    const adminPhone = process.env.ADMIN_PHONE;
    const adminLocation = process.env.ADMIN_LOCATION;

    if (adminEmail && adminPassword && adminName && adminPhone && adminLocation) {
      const existingAdmin = await findUserByEmail(adminEmail);
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);
        await createUser({
          name: adminName,
          phone: adminPhone,
          email: adminEmail,
          location: adminLocation,
          password_hash: passwordHash,
          role: 'admin'
        });
        console.log(`Admin user created: ${adminEmail}`);
      } else {
        console.log(`Admin user already exists: ${adminEmail}`);
      }
    } else {
      console.warn('Admin credentials not fully configured in environment variables');
    }

    // Initialize delivery boy
    const deliveryEmail = process.env.DELIVERY_EMAIL;
    const deliveryPassword = process.env.DELIVERY_PASSWORD;
    const deliveryName = process.env.DELIVERY_NAME;
    const deliveryPhone = process.env.DELIVERY_PHONE;
    const deliveryLocation = process.env.DELIVERY_LOCATION;

    if (deliveryEmail && deliveryPassword && deliveryName && deliveryPhone && deliveryLocation) {
      const existingDelivery = await findUserByEmail(deliveryEmail);
      if (!existingDelivery) {
        const passwordHash = await bcrypt.hash(deliveryPassword, BCRYPT_ROUNDS);
        await createUser({
          name: deliveryName,
          phone: deliveryPhone,
          email: deliveryEmail,
          location: deliveryLocation,
          password_hash: passwordHash,
          role: 'delivery_boy'
        });
        console.log(`Delivery boy user created: ${deliveryEmail}`);
      } else {
        console.log(`Delivery boy user already exists: ${deliveryEmail}`);
      }
    } else {
      console.warn('Delivery boy credentials not fully configured in environment variables');
    }

    console.log('System users initialization complete');
  } catch (error) {
    console.error('Error initializing system users:', error);
    throw error;
  }
};

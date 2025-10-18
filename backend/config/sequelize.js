import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    database: process.env.PG_DATABASE || process.env.DB_NAME,
    username: process.env.PG_USER || process.env.DB_USER,
    password: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
    host: process.env.PG_HOST || process.env.DB_HOST || 'localhost',
    port: process.env.PG_PORT || process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: process.env.DATABASE_URL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

// Test connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    console.error('Sequelize: Unable to connect to the database:', error);
    throw error;
  }
};

// Sync database
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Sequelize: Database synchronized successfully');
  } catch (error) {
    console.error('Sequelize: Error syncing database:', error);
    throw error;
  }
};

export default sequelize;

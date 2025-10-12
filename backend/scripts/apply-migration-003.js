import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const runMigration = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Apply the quantity constraint fix
    console.log('\nApplying quantity_per_day constraint fix...');
    const fixSQL = fs.readFileSync(
      join(__dirname, '../migrations/fix_quantity_constraint.sql'),
      'utf8'
    );

    await client.query(fixSQL);
    console.log('✅ Constraint fix applied successfully!');
    console.log('   - quantity_per_day can now be 0 or greater (was requiring > 0)');
    console.log('\nYou can now create multi-product subscriptions!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration();

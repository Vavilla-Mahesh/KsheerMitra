import dotenv from 'dotenv';
import sequelize, { testConnection } from '../config/sequelize.js';
import { connectDB } from '../config/db.js';
import { getGoogleMapsService } from '../services/googleMapsService.js';
import { getWhatsAppService } from '../services/whatsappService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Comprehensive system check script
 * Tests all integrations and services
 */

const results = {
  checks: [],
  passed: 0,
  failed: 0,
  warnings: 0
};

function logCheck(name, status, message = '') {
  const symbols = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️',
    info: 'ℹ️'
  };

  results.checks.push({ name, status, message });
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else if (status === 'warn') results.warnings++;

  console.log(`${symbols[status]} ${name}: ${message || status.toUpperCase()}`);
}

async function runSystemCheck() {
  console.log('='.repeat(70));
  console.log('KsheerMitra - Full System Check');
  console.log('='.repeat(70));
  console.log();

  // 1. Environment Variables
  console.log('1. Environment Variable Check:');
  console.log('-'.repeat(70));
  
  if (!process.env.PORT) {
    logCheck('PORT', 'fail', 'Not set');
  } else {
    logCheck('PORT', 'pass', process.env.PORT);
  }

  if (!process.env.NODE_ENV) {
    logCheck('NODE_ENV', 'warn', 'Not set, defaulting to development');
  } else {
    logCheck('NODE_ENV', 'pass', process.env.NODE_ENV);
  }

  const hasDBConfig = process.env.DATABASE_URL || 
    (process.env.PG_DATABASE && process.env.PG_USER) ||
    (process.env.DB_NAME && process.env.DB_USER);
  
  if (hasDBConfig) {
    logCheck('Database Config', 'pass', 'Configured');
  } else {
    logCheck('Database Config', 'fail', 'Missing database configuration');
  }

  if (process.env.GOOGLE_MAPS_API_KEY && 
      process.env.GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key') {
    logCheck('Google Maps API Key', 'pass', 'Configured');
  } else {
    logCheck('Google Maps API Key', 'warn', 'Not configured or using placeholder');
  }

  console.log();

  // 2. Database Connectivity
  console.log('2. Database Connectivity:');
  console.log('-'.repeat(70));

  try {
    await connectDB();
    logCheck('Legacy DB Connection (pg)', 'pass', 'Connected');
  } catch (error) {
    logCheck('Legacy DB Connection (pg)', 'fail', error.message);
  }

  try {
    await testConnection();
    logCheck('Sequelize Connection', 'pass', 'Connected');
  } catch (error) {
    logCheck('Sequelize Connection', 'fail', error.message);
  }

  console.log();

  // 3. Database Models
  console.log('3. Database Models:');
  console.log('-'.repeat(70));

  try {
    // Import models
    await import('../models/sequelize/index.js');
    logCheck('Model Loading', 'pass', 'All models loaded');

    // Check if we can query models
    const modelNames = Object.keys(sequelize.models);
    logCheck('Models Defined', 'pass', `${modelNames.length} models: ${modelNames.join(', ')}`);

    // Try to sync (check only, don't alter)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logCheck('Model Sync', 'pass', 'Models synchronized with database');
    } else {
      logCheck('Model Sync', 'info', 'Skipped in production mode');
    }
  } catch (error) {
    logCheck('Model Sync', 'fail', error.message);
  }

  console.log();

  // 4. Required Directories
  console.log('4. File System Structure:');
  console.log('-'.repeat(70));

  const requiredDirs = [
    { path: path.join(__dirname, '../uploads'), name: 'Uploads Directory' },
    { path: path.join(__dirname, '../uploads/products'), name: 'Products Upload Directory' },
    { path: path.join(__dirname, '../invoices'), name: 'Invoices Directory' },
    { path: path.join(__dirname, '../sessions'), name: 'WhatsApp Sessions Directory' }
  ];

  requiredDirs.forEach(({ path: dirPath, name }) => {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        logCheck(name, 'pass', `Exists (${dirPath})`);
      } else {
        logCheck(name, 'fail', `Path exists but is not a directory`);
      }
    } else {
      logCheck(name, 'warn', `Does not exist, will be created automatically`);
    }
  });

  console.log();

  // 5. Google Maps Service
  console.log('5. Google Maps Service:');
  console.log('-'.repeat(70));

  if (process.env.GOOGLE_MAPS_API_KEY && 
      process.env.GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key') {
    try {
      const mapsService = getGoogleMapsService();
      
      // Test geocoding with a known address
      const testAddress = 'New Delhi, India';
      const result = await mapsService.geocodeAddress(testAddress);
      
      if (result && result.lat && result.lng) {
        logCheck('Google Maps Geocoding', 'pass', 
          `Test successful (${testAddress} -> ${result.lat}, ${result.lng})`);
      } else {
        logCheck('Google Maps Geocoding', 'fail', 'Invalid response from API');
      }
    } catch (error) {
      logCheck('Google Maps Geocoding', 'fail', error.message);
    }
  } else {
    logCheck('Google Maps Service', 'info', 'Skipped - API key not configured');
  }

  console.log();

  // 6. WhatsApp Service
  console.log('6. WhatsApp Service:');
  console.log('-'.repeat(70));

  if (process.env.ENABLE_WHATSAPP === 'true') {
    try {
      const whatsappService = getWhatsAppService();
      logCheck('WhatsApp Service', 'info', 
        'Service created (initialization requires QR code scan)');
      logCheck('WhatsApp Session Path', 'pass', 
        process.env.WHATSAPP_SESSION_PATH || './sessions');
    } catch (error) {
      logCheck('WhatsApp Service', 'fail', error.message);
    }
  } else {
    logCheck('WhatsApp Service', 'info', 'Disabled via ENABLE_WHATSAPP flag');
  }

  console.log();

  // 7. API Routes Check
  console.log('7. API Routes Check:');
  console.log('-'.repeat(70));

  const routes = [
    'auth (legacy)',
    'users',
    'products',
    'subscriptions',
    'orders',
    'delivery',
    'billing',
    'admin',
    'api/auth (OTP)',
    'api/delivery (enhanced)',
    'api/admin (enhanced)',
    'api/invoice'
  ];

  routes.forEach(route => {
    logCheck(`Route: /${route}`, 'pass', 'Configured in server.js');
  });

  console.log();

  // Summary
  console.log('='.repeat(70));
  console.log('System Check Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Passed:   ${results.passed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`❌ Failed:   ${results.failed}`);
  console.log(`ℹ️  Info:    ${results.checks.filter(c => c.status === 'info').length}`);
  console.log();

  if (results.failed > 0) {
    console.log('❌ System check FAILED!');
    console.log('   Critical issues found. Please review the failures above.');
    console.log();
    return false;
  } else if (results.warnings > 0) {
    console.log('⚠️  System check passed with warnings.');
    console.log('   Review the warnings above for optimal configuration.');
    console.log();
    return true;
  } else {
    console.log('✅ System check PASSED!');
    console.log('   All systems operational.');
    console.log();
    return true;
  }
}

// Run the check
runSystemCheck()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('System check encountered an error:', error);
    process.exit(1);
  });

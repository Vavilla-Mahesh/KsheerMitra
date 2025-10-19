import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Environment variable validation script
 * Validates all required environment variables and their formats
 */

const validationResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Required environment variables
const requiredVars = [
  'PORT',
  'NODE_ENV'
];

// Database variables (at least one set required)
const dbVarSets = {
  set1: ['DATABASE_URL'],
  set2: ['PG_HOST', 'PG_PORT', 'PG_USER', 'PG_PASSWORD', 'PG_DATABASE'],
  set3: ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
};

// Optional but recommended variables
const optionalVars = [
  'JWT_SECRET',
  'GOOGLE_MAPS_API_KEY',
  'WHATSAPP_SESSION_PATH',
  'ENABLE_WHATSAPP',
  'ENABLE_CRON',
  'CORS_ORIGIN'
];

console.log('='.repeat(60));
console.log('KsheerMitra Backend - Environment Variable Validation');
console.log('='.repeat(60));
console.log();

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ CRITICAL: .env file not found!');
  console.log('   Please copy .env.example to .env and configure it.');
  process.exit(1);
}

console.log('✅ .env file found');
console.log();

// Validate required variables
console.log('Checking Required Variables:');
console.log('-'.repeat(60));

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    validationResults.failed.push(`${varName} is not set`);
    console.log(`❌ ${varName}: NOT SET`);
  } else {
    validationResults.passed.push(varName);
    console.log(`✅ ${varName}: ${value}`);
  }
});

console.log();

// Validate database configuration
console.log('Checking Database Configuration:');
console.log('-'.repeat(60));

let dbConfigFound = false;

if (process.env.DATABASE_URL) {
  dbConfigFound = true;
  validationResults.passed.push('DATABASE_URL');
  console.log('✅ DATABASE_URL: configured (connection string)');
} else if (
  process.env.PG_HOST && 
  process.env.PG_PORT && 
  process.env.PG_USER && 
  process.env.PG_PASSWORD && 
  process.env.PG_DATABASE
) {
  dbConfigFound = true;
  validationResults.passed.push('PostgreSQL Config (PG_*)');
  console.log('✅ PostgreSQL Configuration (PG_*):');
  console.log(`   Host: ${process.env.PG_HOST}`);
  console.log(`   Port: ${process.env.PG_PORT}`);
  console.log(`   User: ${process.env.PG_USER}`);
  console.log(`   Database: ${process.env.PG_DATABASE}`);
} else if (
  process.env.DB_HOST && 
  process.env.DB_PORT && 
  process.env.DB_USER && 
  process.env.DB_PASSWORD && 
  process.env.DB_NAME
) {
  dbConfigFound = true;
  validationResults.passed.push('Legacy DB Config (DB_*)');
  console.log('✅ Legacy Database Configuration (DB_*):');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
}

if (!dbConfigFound) {
  validationResults.failed.push('Database configuration incomplete');
  console.log('❌ No valid database configuration found!');
  console.log('   Set either DATABASE_URL or PG_* or DB_* variables');
}

console.log();

// Validate optional variables
console.log('Checking Optional/Feature Variables:');
console.log('-'.repeat(60));

// JWT Secret
if (!process.env.JWT_SECRET) {
  validationResults.warnings.push('JWT_SECRET not set - using default (INSECURE)');
  console.log('⚠️  JWT_SECRET: NOT SET (will use default - INSECURE for production)');
} else if (process.env.JWT_SECRET === 'your_secret_key_change_in_production') {
  validationResults.warnings.push('JWT_SECRET uses default value - INSECURE');
  console.log('⚠️  JWT_SECRET: USING DEFAULT VALUE (INSECURE for production)');
} else {
  validationResults.passed.push('JWT_SECRET');
  console.log('✅ JWT_SECRET: configured');
}

// Google Maps
if (!process.env.GOOGLE_MAPS_API_KEY) {
  validationResults.warnings.push('GOOGLE_MAPS_API_KEY not set - Maps features disabled');
  console.log('⚠️  GOOGLE_MAPS_API_KEY: NOT SET (Maps features disabled)');
} else if (process.env.GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') {
  validationResults.warnings.push('GOOGLE_MAPS_API_KEY uses placeholder value');
  console.log('⚠️  GOOGLE_MAPS_API_KEY: PLACEHOLDER VALUE (Maps features will not work)');
} else {
  validationResults.passed.push('GOOGLE_MAPS_API_KEY');
  console.log('✅ GOOGLE_MAPS_API_KEY: configured');
}

// WhatsApp
const whatsappEnabled = process.env.ENABLE_WHATSAPP === 'true';
if (whatsappEnabled) {
  validationResults.passed.push('ENABLE_WHATSAPP');
  console.log('✅ ENABLE_WHATSAPP: true');
  console.log(`   Session Path: ${process.env.WHATSAPP_SESSION_PATH || './sessions'}`);
} else {
  console.log('ℹ️  ENABLE_WHATSAPP: false (WhatsApp features disabled)');
}

// Cron Jobs
const cronEnabled = process.env.ENABLE_CRON === 'true';
if (cronEnabled) {
  validationResults.passed.push('ENABLE_CRON');
  console.log('✅ ENABLE_CRON: true');
} else {
  console.log('ℹ️  ENABLE_CRON: false (Scheduled jobs disabled)');
}

// CORS
if (process.env.CORS_ORIGIN) {
  validationResults.passed.push('CORS_ORIGIN');
  console.log(`✅ CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
} else {
  validationResults.warnings.push('CORS_ORIGIN not set - allowing all origins');
  console.log('⚠️  CORS_ORIGIN: NOT SET (allowing all origins - INSECURE for production)');
}

console.log();
console.log('='.repeat(60));
console.log('Validation Summary:');
console.log('='.repeat(60));
console.log(`✅ Passed: ${validationResults.passed.length}`);
console.log(`⚠️  Warnings: ${validationResults.warnings.length}`);
console.log(`❌ Failed: ${validationResults.failed.length}`);
console.log();

if (validationResults.warnings.length > 0) {
  console.log('Warnings:');
  validationResults.warnings.forEach(warning => {
    console.log(`  ⚠️  ${warning}`);
  });
  console.log();
}

if (validationResults.failed.length > 0) {
  console.log('Critical Issues:');
  validationResults.failed.forEach(error => {
    console.log(`  ❌ ${error}`);
  });
  console.log();
  console.error('❌ Environment validation FAILED!');
  console.log('   Please fix the issues above before starting the server.');
  process.exit(1);
} else if (validationResults.warnings.length > 0) {
  console.log('⚠️  Environment validation passed with warnings.');
  console.log('   Review warnings above for production readiness.');
  process.exit(0);
} else {
  console.log('✅ Environment validation PASSED!');
  console.log('   All required variables are properly configured.');
  process.exit(0);
}

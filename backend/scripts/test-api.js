import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

/**
 * API Endpoint Testing Script
 * Tests all major API endpoints without requiring a database
 */

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(endpoint, method, status, message = '') {
  const passed = status === 'pass';
  const symbol = passed ? '✅' : '❌';
  
  results.tests.push({ endpoint, method, status, message });
  if (passed) results.passed++;
  else results.failed++;
  
  console.log(`${symbol} ${method} ${endpoint}: ${message || status.toUpperCase()}`);
}

async function testEndpoint(method, endpoint, expectedStatus = 200, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      validateStatus: () => true // Don't throw on any status
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      logTest(endpoint, method, 'pass', `Status ${response.status}`);
      return { success: true, data: response.data };
    } else {
      logTest(endpoint, method, 'fail', `Expected ${expectedStatus}, got ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    logTest(endpoint, method, 'fail', error.message);
    return { success: false, error: error.message };
  }
}

async function runAPITests() {
  console.log('='.repeat(70));
  console.log('KsheerMitra - API Endpoint Testing');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(70));
  console.log();
  
  // Give server time to start
  console.log('Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log();
  
  // Test 1: Health Check
  console.log('1. Health & Meta Endpoints:');
  console.log('-'.repeat(70));
  await testEndpoint('GET', '/health', 200);
  await testEndpoint('GET', '/meta', 200);
  console.log();
  
  // Test 2: Public Endpoints (should work without auth)
  console.log('2. Public Endpoints (No Auth Required):');
  console.log('-'.repeat(70));
  
  // These should return 401 or similar without proper auth
  // We're just checking they respond
  await testEndpoint('GET', '/products', [200, 401, 500]);
  console.log();
  
  // Test 3: Auth Endpoints
  console.log('3. Authentication Endpoints:');
  console.log('-'.repeat(70));
  
  // OTP endpoints (should validate input)
  const otpResult = await testEndpoint('POST', '/api/auth/send-otp', [400, 500], {
    phone: '' // Invalid phone should return 400
  });
  
  if (otpResult.success || otpResult.status === 400) {
    logTest('/api/auth/send-otp', 'POST', 'pass', 'Validation working');
  }
  
  // Legacy signup (should validate)
  await testEndpoint('POST', '/auth/signup', [400, 500], {
    // Empty data should fail validation
  });
  console.log();
  
  // Test 4: Protected Endpoints (should return 401)
  console.log('4. Protected Endpoints (Should Require Auth):');
  console.log('-'.repeat(70));
  
  const protectedEndpoints = [
    { method: 'GET', path: '/users/me' },
    { method: 'GET', path: '/api/auth/profile' },
    { method: 'GET', path: '/subscriptions' },
    { method: 'GET', path: '/orders' },
    { method: 'GET', path: '/delivery/assigned' },
    { method: 'GET', path: '/admin/users' }
  ];
  
  for (const { method, path } of protectedEndpoints) {
    const result = await testEndpoint(method, path, [401, 403, 500]);
    if (result.status === 401 || result.status === 403) {
      console.log(`   ✅ ${path} properly requires authentication`);
    }
  }
  console.log();
  
  // Test 5: Invalid Endpoints
  console.log('5. Error Handling:');
  console.log('-'.repeat(70));
  await testEndpoint('GET', '/nonexistent', 404);
  await testEndpoint('POST', '/invalid/endpoint', 404);
  console.log();
  
  // Summary
  console.log('='.repeat(70));
  console.log('API Test Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log();
  
  if (results.failed === 0) {
    console.log('✅ All API endpoint tests PASSED!');
    console.log('   Server is responding correctly to requests.');
    return true;
  } else {
    console.log('❌ Some API endpoint tests FAILED!');
    console.log('   Review the failures above.');
    return false;
  }
}

// Check if server is running
async function checkServerRunning() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('Checking if server is running...');
  const isRunning = await checkServerRunning();
  
  if (!isRunning) {
    console.error('❌ Server is not running!');
    console.log('   Please start the server first:');
    console.log('   $ npm start');
    console.log();
    console.log('   Or run this script with the server:');
    console.log('   $ npm start & sleep 3 && node scripts/test-api.js');
    process.exit(1);
  }
  
  const success = await runAPITests();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});

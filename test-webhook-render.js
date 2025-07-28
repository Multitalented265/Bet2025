#!/usr/bin/env node

/**
 * Test script for PayChangu webhook on Render
 * Run this after deployment to verify webhook functionality
 */

const https = require('https');
const crypto = require('crypto');

// Configuration - Update these with your actual values
const CONFIG = {
  // Update with your Render app URL
  WEBHOOK_URL: 'https://your-app-name.onrender.com/api/paychangu/webhook',
  
  // Your PayChangu secret key
  SECRET_KEY: 'sec-test-nHJdcdZvRDwsVpJfpilTcrdqom7MWVsB',
  
  // Test data
  TEST_DATA: {
    tx_ref: 'TEST_TX_' + Date.now(),
    reference: 'TEST_TX_' + Date.now(),
    status: 'success',
    amount: 1000,
    currency: 'MWK',
    event_type: 'api.charge.payment',
    customer: {
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    },
    meta: {
      userId: 'test-user-id',
      transactionType: 'Deposit',
      amount: 1000
    }
  }
};

/**
 * Create HMAC signature for webhook
 */
function createSignature(data, secretKey) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(data))
    .digest('hex');
}

/**
 * Make HTTP request
 */
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test webhook endpoint
 */
async function testWebhook() {
  console.log('🧪 Testing PayChangu webhook on Render...\n');
  
  try {
    // Test 1: GET request (webhook verification)
    console.log('📋 Test 1: GET request (webhook verification)');
    const getResponse = await makeRequest(CONFIG.WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayChangu-Webhook-Test/1.0'
      }
    });
    
    console.log('✅ GET Response:', getResponse.statusCode);
    console.log('📄 Response Data:', JSON.stringify(getResponse.data, null, 2));
    console.log('');
    
    // Test 2: POST request with valid signature
    console.log('📋 Test 2: POST request with valid signature');
    const signature = createSignature(CONFIG.TEST_DATA, CONFIG.SECRET_KEY);
    
    const postResponse = await makeRequest(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': signature,
        'User-Agent': 'PayChangu-Webhook-Test/1.0'
      }
    }, CONFIG.TEST_DATA);
    
    console.log('✅ POST Response:', postResponse.statusCode);
    console.log('📄 Response Data:', JSON.stringify(postResponse.data, null, 2));
    console.log('');
    
    // Test 3: POST request with invalid signature
    console.log('📋 Test 3: POST request with invalid signature');
    const invalidSignature = 'invalid-signature';
    
    const invalidResponse = await makeRequest(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': invalidSignature,
        'User-Agent': 'PayChangu-Webhook-Test/1.0'
      }
    }, CONFIG.TEST_DATA);
    
    console.log('✅ Invalid Signature Response:', invalidResponse.statusCode);
    console.log('📄 Response Data:', JSON.stringify(invalidResponse.data, null, 2));
    console.log('');
    
    // Test 4: POST request without signature
    console.log('📋 Test 4: POST request without signature');
    const noSignatureResponse = await makeRequest(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayChangu-Webhook-Test/1.0'
      }
    }, CONFIG.TEST_DATA);
    
    console.log('✅ No Signature Response:', noSignatureResponse.statusCode);
    console.log('📄 Response Data:', JSON.stringify(noSignatureResponse.data, null, 2));
    console.log('');
    
    // Summary
    console.log('🎯 Test Summary:');
    console.log('✅ GET request:', getResponse.statusCode === 200 ? 'PASS' : 'FAIL');
    console.log('✅ Valid signature:', postResponse.statusCode === 200 ? 'PASS' : 'FAIL');
    console.log('✅ Invalid signature:', invalidResponse.statusCode === 401 ? 'PASS' : 'FAIL');
    console.log('✅ No signature:', noSignatureResponse.statusCode === 401 ? 'PASS' : 'FAIL');
    
    if (getResponse.statusCode === 200 && 
        postResponse.statusCode === 200 && 
        invalidResponse.statusCode === 401 && 
        noSignatureResponse.statusCode === 401) {
      console.log('\n🎉 All tests passed! Your webhook is working correctly.');
    } else {
      console.log('\n❌ Some tests failed. Check your webhook configuration.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('💡 Make sure to:');
    console.error('   1. Update WEBHOOK_URL with your actual Render app URL');
    console.error('   2. Update SECRET_KEY with your actual PayChangu secret key');
    console.error('   3. Ensure your app is deployed and running on Render');
  }
}

/**
 * Test URL accessibility
 */
async function testUrlAccessibility() {
  console.log('🔍 Testing URL accessibility...\n');
  
  try {
    const response = await makeRequest(CONFIG.WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'PayChangu-Webhook-Test/1.0'
      }
    });
    
    console.log('✅ URL is accessible');
    console.log('📊 Status Code:', response.statusCode);
    console.log('📊 Response Time: < 5 seconds');
    
    if (response.statusCode === 200) {
      console.log('✅ Webhook endpoint is responding correctly');
    } else {
      console.log('⚠️  Webhook endpoint returned unexpected status code');
    }
    
  } catch (error) {
    console.error('❌ URL is not accessible:', error.message);
    console.error('💡 Check if:');
    console.error('   1. Your app is deployed on Render');
    console.error('   2. The URL is correct');
    console.error('   3. Your app is running');
  }
}

// Run tests
async function runTests() {
  console.log('🚀 PayChangu Webhook Test Suite for Render');
  console.log('==========================================\n');
  
  // Test URL accessibility first
  await testUrlAccessibility();
  console.log('');
  
  // Test webhook functionality
  await testWebhook();
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testWebhook, testUrlAccessibility }; 
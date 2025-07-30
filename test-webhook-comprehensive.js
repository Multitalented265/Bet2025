// Comprehensive webhook test script
const crypto = require('crypto');

const WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/webhook';
const TEST_WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/test-webhook';
const DEBUG_URL = 'https://bet2025-2.onrender.com/api/paychangu/debug';

// Test data that matches PayChangu's expected format
const testWebhookData = {
  tx_ref: 'TEST_TX_' + Date.now(),
  reference: 'TEST_TX_' + Date.now(),
  status: 'success',
  amount: 1004,
  currency: 'MWK',
  event_type: 'api.charge.payment',
  customer: {
    email: 'usherkamwendo@gmail.com',
    first_name: 'Usher',
    last_name: 'Kamwendo'
  },
  meta: {
    userId: 'cmdkf898l0000txjgw5236qri',
    transactionType: 'Deposit',
    amount: 1004
  }
};

// Create a test signature (for testing purposes)
function createTestSignature(data, secretKey = 'sec-test-key') {
  return crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(data))
    .digest('hex');
}

async function testWebhookEndpoint(url, data, headers = {}) {
  try {
    console.log(`🔍 Testing endpoint: ${url}`);
    console.log(`📦 Data:`, JSON.stringify(data, null, 2));
    console.log(`🔗 Headers:`, headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayChangu-Webhook-Test/1.0',
        ...headers
      },
      body: JSON.stringify(data)
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Data:`, responseData);
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`❌ Error testing ${url}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runComprehensiveTests() {
  console.log('🧪 ===== COMPREHENSIVE WEBHOOK TESTING =====\n');
  
  // Test 1: Check if webhook endpoint is accessible
  console.log('📋 Test 1: Checking webhook endpoint accessibility...');
  try {
    const response = await fetch(WEBHOOK_URL, { method: 'GET' });
    const data = await response.json();
    console.log('✅ Webhook endpoint is accessible:', data);
  } catch (error) {
    console.log('❌ Webhook endpoint not accessible:', error.message);
  }
  
  // Test 2: Test with valid signature
  console.log('\n📋 Test 2: Testing webhook with valid signature...');
  const signature = createTestSignature(testWebhookData);
  const result1 = await testWebhookEndpoint(WEBHOOK_URL, testWebhookData, {
    'Signature': signature,
    'X-Test-Mode': 'true'
  });
  
  // Test 3: Test without signature (should work in development)
  console.log('\n📋 Test 3: Testing webhook without signature...');
  const result2 = await testWebhookEndpoint(WEBHOOK_URL, testWebhookData, {
    'X-Test-Mode': 'true'
  });
  
  // Test 4: Test with test webhook endpoint
  console.log('\n📋 Test 4: Testing test webhook endpoint...');
  const result3 = await testWebhookEndpoint(TEST_WEBHOOK_URL, testWebhookData);
  
  // Test 5: Test debug endpoint
  console.log('\n📋 Test 5: Testing debug endpoint...');
  try {
    const debugResponse = await fetch(DEBUG_URL, { method: 'GET' });
    const debugData = await debugResponse.json();
    console.log('✅ Debug endpoint response:', debugData);
  } catch (error) {
    console.log('❌ Debug endpoint error:', error.message);
  }
  
  // Summary
  console.log('\n📊 ===== TEST SUMMARY =====');
  console.log(`✅ Test 1 (Accessibility): ${result1.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Test 2 (With Signature): ${result1.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Test 3 (Without Signature): ${result2.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Test 4 (Test Webhook): ${result3.success ? 'PASS' : 'FAIL'}`);
  
  // Recommendations
  console.log('\n💡 ===== RECOMMENDATIONS =====');
  if (!result1.success && !result2.success) {
    console.log('❌ Webhook endpoint is not processing requests properly');
    console.log('🔧 Check:');
    console.log('  1. Webhook URL is correctly configured in PayChangu dashboard');
    console.log('  2. PayChangu is sending webhooks to the correct URL');
    console.log('  3. Webhook signature verification is working');
    console.log('  4. Event type is "api.charge.payment"');
  } else {
    console.log('✅ Webhook endpoint is working correctly');
    console.log('🔧 The issue might be:');
    console.log('  1. PayChangu not sending webhooks to the correct URL');
    console.log('  2. Webhook signature verification failing in production');
    console.log('  3. Event type mismatch');
  }
}

runComprehensiveTests().catch(console.error); 
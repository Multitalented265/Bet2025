// Test script for PayChangu webhook
const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/webhook';
const TEST_WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/test-webhook';

// Test webhook status
async function testWebhookStatus() {
  console.log('🧪 Testing webhook status...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Webhook status:', data);
    return data;
  } catch (error) {
    console.error('❌ Webhook status test failed:', error);
    return null;
  }
}

// Test webhook with sample data
async function testWebhookWithData() {
  console.log('🧪 Testing webhook with sample data...');
  
  const testData = {
    tx_ref: 'TEST_TX_' + Date.now(),
    status: 'success',
    amount: 1000,
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
      amount: 1000
    }
  };
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': 'test-signature'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('✅ Webhook test response:', data);
    return data;
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    return null;
  }
}

// Test the test webhook endpoint
async function testTestWebhook() {
  console.log('🧪 Testing test webhook endpoint...');
  
  const testData = {
    userId: 'cmdkf898l0000txjgw5236qri',
    amount: 500,
    txRef: 'TEST_TX_' + Date.now(),
    testType: 'Deposit'
  };
  
  try {
    const response = await fetch(TEST_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('✅ Test webhook response:', data);
    return data;
  } catch (error) {
    console.error('❌ Test webhook failed:', error);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting webhook tests...\n');
  
  // Test 1: Check webhook status
  await testWebhookStatus();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test webhook with sample data
  await testWebhookWithData();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Test the test webhook endpoint
  await testTestWebhook();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ All tests completed!');
}

// Run the tests
runTests().catch(console.error); 
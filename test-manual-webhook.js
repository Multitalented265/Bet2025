// Manual webhook test script
const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/webhook';

// Test webhook with real PayChangu-like data
async function testWebhook() {
  console.log('🧪 Testing webhook with PayChangu-like data...');
  
  const webhookData = {
    tx_ref: 'TX_671637823', // Use the actual tx_ref from your payment
    status: 'success',
    amount: 1700,
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
      amount: 1700
    }
  };
  
  try {
    console.log('📦 Sending webhook data:', JSON.stringify(webhookData, null, 2));
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': 'test-signature-for-development'
      },
      body: JSON.stringify(webhookData)
    });
    
    const responseData = await response.json();
    console.log('✅ Webhook response status:', response.status);
    console.log('✅ Webhook response data:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    return null;
  }
}

// Test database update
async function testDatabaseUpdate() {
  console.log('🧪 Testing database update...');
  
  const testData = {
    userId: 'cmdkf898l0000txjgw5236qri',
    amount: 500,
    txRef: 'TEST_TX_' + Date.now(),
    testType: 'Deposit'
  };
  
  try {
    const response = await fetch('https://bet2025-2.onrender.com/api/paychangu/test-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    console.log('✅ Database test response:', data);
    return data;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return null;
  }
}

// Check current database state
async function checkDatabaseState() {
  console.log('🧪 Checking database state...');
  
  try {
    const response = await fetch('https://bet2025-2.onrender.com/api/paychangu/debug', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('✅ Database state:', data);
    return data;
  } catch (error) {
    console.error('❌ Database state check failed:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive webhook tests...\n');
  
  // Test 1: Check current state
  console.log('1️⃣ Checking current database state...');
  await checkDatabaseState();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test database update
  console.log('2️⃣ Testing database update...');
  await testDatabaseUpdate();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Test webhook with PayChangu data
  console.log('3️⃣ Testing webhook with PayChangu-like data...');
  await testWebhook();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Check final state
  console.log('4️⃣ Checking final database state...');
  await checkDatabaseState();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ All tests completed!');
}

// Run the tests
runAllTests().catch(console.error); 
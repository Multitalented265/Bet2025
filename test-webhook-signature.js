#!/usr/bin/env node

/**
 * Test script to diagnose PayChangu webhook signature issues
 * Run this to test your webhook signature verification
 */

const crypto = require('crypto');

// Configuration - Update these with your actual values
const CONFIG = {
  // Your PayChangu secret key
  SECRET_KEY: process.env.PAYCHANGU_SECRET_KEY || 'sec-test-your-secret-key',
  
  // Test webhook data (similar to what PayChangu sends)
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
 * Test signature verification
 */
function testSignatureVerification() {
  console.log('🧪 ===== WEBHOOK SIGNATURE TEST =====\n');
  
  console.log('📋 Configuration:');
  console.log('  Secret Key:', CONFIG.SECRET_KEY.substring(0, 10) + '...');
  console.log('  Secret Key Length:', CONFIG.SECRET_KEY.length);
  console.log('  Secret Key Format:', CONFIG.SECRET_KEY.startsWith('sec-') ? '✅ Valid' : '❌ Invalid');
  console.log('');
  
  console.log('📦 Test Data:');
  console.log('  tx_ref:', CONFIG.TEST_DATA.tx_ref);
  console.log('  status:', CONFIG.TEST_DATA.status);
  console.log('  amount:', CONFIG.TEST_DATA.amount);
  console.log('  event_type:', CONFIG.TEST_DATA.event_type);
  console.log('');
  
  // Test different data formats
  const testFormats = [
    {
      name: 'Standard JSON.stringify',
      data: JSON.stringify(CONFIG.TEST_DATA)
    },
    {
      name: 'Compact JSON (no spaces)',
      data: JSON.stringify(CONFIG.TEST_DATA, null, 0)
    },
    {
      name: 'Pretty JSON (2 spaces)',
      data: JSON.stringify(CONFIG.TEST_DATA, null, 2)
    }
  ];
  
  console.log('🔐 Signature Tests:');
  
  testFormats.forEach((format, index) => {
    const signature = createSignature(CONFIG.TEST_DATA, CONFIG.SECRET_KEY);
    const dataString = format.data;
    
    console.log(`\n  Test ${index + 1}: ${format.name}`);
    console.log(`    Data Length: ${dataString.length} characters`);
    console.log(`    Signature: ${signature.substring(0, 20)}...`);
    console.log(`    Signature Length: ${signature.length} characters`);
    
    // Test verification
    try {
      const expectedSignature = crypto
        .createHmac('sha256', CONFIG.SECRET_KEY)
        .update(dataString)
        .digest('hex');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
      
      console.log(`    Verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`    Expected: ${expectedSignature.substring(0, 20)}...`);
      console.log(`    Matches: ${signature === expectedSignature ? '✅ Yes' : '❌ No'}`);
      
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
  });
  
  console.log('\n🔍 Common Issues:');
  console.log('  1. Secret key format should start with "sec-"');
  console.log('  2. Data must be exactly the same string that was signed');
  console.log('  3. JSON formatting (spaces, newlines) must match exactly');
  console.log('  4. Signature header name might be different');
  console.log('  5. PayChangu might use a different data format');
  
  console.log('\n📝 Next Steps:');
  console.log('  1. Check your PayChangu dashboard for the correct secret key');
  console.log('  2. Verify the webhook URL is correct');
  console.log('  3. Test with the debug endpoint: /api/paychangu/debug');
  console.log('  4. Check server logs for detailed error messages');
}

// Run the test
testSignatureVerification(); 
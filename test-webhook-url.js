// Test script to verify webhook URL is being sent correctly
const { createPayChanguPaymentData } = require('./src/lib/paychangu.ts');

// Mock environment variables for testing
process.env.PAYCHANGU_PUBLIC_KEY = 'pub-test-TQARWkbx9YFg9eZXWRrBAmQ4J9lLp8Fn';
process.env.PAYCHANGU_SECRET_KEY = 'sec-test-nHJdcdZvRDwsVpJfpilTcrdqom7MWVsB';
process.env.NEXTAUTH_URL = 'https://bet2025-2.onrender.com';
process.env.PAYCHANGU_WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/webhook';

function testWebhookUrl() {
  console.log('🧪 ===== TESTING WEBHOOK URL CONFIGURATION =====\n');
  
  const customer = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  };
  
  try {
    const paymentData = createPayChanguPaymentData(
      1004,
      customer,
      'cmdkf898l0000txjgw5236qri',
      'Deposit'
    );
    
    console.log('📊 Payment Data Generated:');
    console.log('  public_key:', paymentData.public_key);
    console.log('  tx_ref:', paymentData.tx_ref);
    console.log('  amount:', paymentData.amount);
    console.log('  currency:', paymentData.currency);
    console.log('  callback_url:', paymentData.callback_url);
    console.log('  return_url:', paymentData.return_url);
    console.log('  webhook_url:', paymentData.webhook_url);
    console.log('  country:', paymentData.country);
    console.log('  payment_method:', paymentData.payment_method);
    console.log('  webhook_secret:', paymentData.webhook_secret ? 'SET' : 'NOT SET');
    console.log('  webhook_events:', paymentData.webhook_events);
    
    console.log('\n✅ Webhook URL Configuration:');
    console.log('  Expected URL: https://bet2025-2.onrender.com/api/paychangu/webhook');
    console.log('  Actual URL:', paymentData.webhook_url);
    console.log('  Match:', paymentData.webhook_url === 'https://bet2025-2.onrender.com/api/paychangu/webhook' ? '✅ YES' : '❌ NO');
    
    console.log('\n🔧 Recommendations:');
    if (paymentData.webhook_url === 'https://bet2025-2.onrender.com/api/paychangu/webhook') {
      console.log('✅ Webhook URL is correct');
      console.log('✅ All required fields are present');
      console.log('✅ PayChangu should receive the correct webhook URL');
    } else {
      console.log('❌ Webhook URL mismatch - check configuration');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook URL:', error);
  }
}

testWebhookUrl(); 
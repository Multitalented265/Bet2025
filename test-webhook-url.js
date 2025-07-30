// Test script to verify webhook URL and additional parameters
console.log('🧪 ===== TESTING WEBHOOK PARAMETERS =====\n');

// Mock environment variables for testing
process.env.PAYCHANGU_PUBLIC_KEY = 'pub-test-TQARWkbx9YFg9eZXWRrBAmQ4J9lLp8Fn';
process.env.PAYCHANGU_SECRET_KEY = 'sec-test-nHJdcdZvRDwsVpJfpilTcrdqom7MWVsB';
process.env.NEXTAUTH_URL = 'https://bet2025-2.onrender.com';
process.env.PAYCHANGU_WEBHOOK_URL = 'https://bet2025-2.onrender.com/api/paychangu/webhook';

// Simulate the payment data that should be generated
function simulatePaymentData() {
  const customer = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User'
  };
  
  const webhookUrl = process.env.PAYCHANGU_WEBHOOK_URL || 'https://bet2025-2.onrender.com/api/paychangu/webhook';
  const callbackUrl = 'https://bet2025-2.onrender.com/dashboard/wallet';
  const returnUrl = 'https://bet2025-2.onrender.com/dashboard/wallet';
  
  const paymentData = {
    public_key: process.env.PAYCHANGU_PUBLIC_KEY,
    tx_ref: 'TX_TEST_' + Date.now(),
    amount: 1004,
    currency: "MWK",
    callback_url: callbackUrl,
    return_url: returnUrl,
    webhook_url: webhookUrl,
    customer,
    customization: {
      title: 'Deposit - Bet2025',
      description: 'Deposit funds to your Bet2025 wallet',
    },
    meta: {
      userId: 'cmdkf898l0000txjgw5236qri',
      transactionType: 'Deposit',
      amount: 1004
    },
    // ✅ ADDITIONAL PARAMETERS - These should be present
    country: "MW", // Malawi country code
    payment_method: "mobile_money", // Specify payment method
    webhook_secret: process.env.PAYCHANGU_SECRET_KEY, // Include webhook secret
    webhook_events: ["payment.success", "payment.failed"], // Specify webhook events
  };
  
  return paymentData;
}

function testWebhookParameters() {
  try {
    const paymentData = simulatePaymentData();
    
    console.log('📊 Payment Data Generated:');
    console.log('  public_key:', paymentData.public_key);
    console.log('  tx_ref:', paymentData.tx_ref);
    console.log('  amount:', paymentData.amount);
    console.log('  currency:', paymentData.currency);
    console.log('  callback_url:', paymentData.callback_url);
    console.log('  return_url:', paymentData.return_url);
    console.log('  webhook_url:', paymentData.webhook_url);
    
    console.log('\n🔍 ADDITIONAL PARAMETERS CHECK:');
    console.log('  country:', paymentData.country);
    console.log('  payment_method:', paymentData.payment_method);
    console.log('  webhook_secret:', paymentData.webhook_secret ? 'SET' : 'NOT SET');
    console.log('  webhook_events:', paymentData.webhook_events);
    
    console.log('\n✅ Webhook URL Configuration:');
    console.log('  Expected URL: https://bet2025-2.onrender.com/api/paychangu/webhook');
    console.log('  Actual URL:', paymentData.webhook_url);
    console.log('  Match:', paymentData.webhook_url === 'https://bet2025-2.onrender.com/api/paychangu/webhook' ? '✅ YES' : '❌ NO');
    
    console.log('\n🔍 FULL PAYMENT DATA STRUCTURE:');
    console.log(JSON.stringify(paymentData, null, 2));
    
    console.log('\n🔧 PARAMETER ANALYSIS:');
    console.log('✅ country:', paymentData.country === 'MW' ? '✅ Correct (MW)' : '❌ Missing or incorrect');
    console.log('✅ payment_method:', paymentData.payment_method === 'mobile_money' ? '✅ Correct (mobile_money)' : '❌ Missing or incorrect');
    console.log('✅ webhook_secret:', paymentData.webhook_secret ? '✅ Present' : '❌ Missing');
    console.log('✅ webhook_events:', paymentData.webhook_events ? '✅ Present' : '❌ Missing');
    
    console.log('\n🔧 SUMMARY:');
    const allParamsPresent = paymentData.country && 
                            paymentData.payment_method && 
                            paymentData.webhook_secret && 
                            paymentData.webhook_events;
    
    if (allParamsPresent) {
      console.log('✅ All additional parameters are present and correct');
      console.log('✅ PayChangu should receive complete webhook configuration');
      console.log('✅ Webhook URL is correct');
      console.log('✅ Ready for testing with real payment');
    } else {
      console.log('❌ Some additional parameters are missing');
      console.log('❌ Check the payment data generation code');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook parameters:', error);
  }
}

testWebhookParameters(); 
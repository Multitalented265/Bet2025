const https = require('https');

// Test the config endpoint to see what URLs are being provided
function testConfig() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'bet2025-2.onrender.com',
      port: 443,
      path: '/api/paychangu/config',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const config = JSON.parse(data);
          console.log('🔍 PayChangu Configuration:');
          console.log('  Webhook URL:', config.configuration?.webhookUrl);
          console.log('  Callback URL:', config.configuration?.callbackUrl);
          console.log('  Return URL:', config.configuration?.returnUrl);
          console.log('  Public Key:', config.configuration?.publicKey ? 'SET' : 'MISSING');
          console.log('  Environment:', config.environment);
          console.log('  Validation:', config.validation);
          resolve(config);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test the webhook endpoint directly
function testWebhook() {
  return new Promise((resolve, reject) => {
    const testData = {
      tx_ref: 'TEST_' + Date.now(),
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
    };

    const postData = JSON.stringify(testData);

    const options = {
      hostname: 'bet2025-2.onrender.com',
      port: 443,
      path: '/api/paychangu/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Signature': 'test-signature'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('🔍 Webhook Test Response:');
          console.log('  Status Code:', res.statusCode);
          console.log('  Response:', response);
          resolve({ statusCode: res.statusCode, response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ===== PAYMENT WEBHOOK TESTING =====');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('');

  try {
    // Test 1: Check configuration
    console.log('🔍 Test 1: Checking PayChangu configuration...');
    const config = await testConfig();
    
    if (config.configuration?.webhookUrl) {
      console.log('✅ Webhook URL is configured:', config.configuration.webhookUrl);
    } else {
      console.log('❌ Webhook URL is missing from configuration');
    }

    console.log('');

    // Test 2: Test webhook endpoint
    console.log('🔍 Test 2: Testing webhook endpoint...');
    const webhookResult = await testWebhook();
    
    if (webhookResult.statusCode === 200 || webhookResult.statusCode === 401) {
      console.log('✅ Webhook endpoint is responding (401 expected for test signature)');
    } else {
      console.log('❌ Webhook endpoint error:', webhookResult.statusCode);
    }

    console.log('');
    console.log('🏁 ===== TESTING COMPLETE =====');
    console.log('');
    console.log('📋 Summary:');
    console.log('  - Configuration loaded:', !!config);
    console.log('  - Webhook URL configured:', !!config.configuration?.webhookUrl);
    console.log('  - Webhook endpoint accessible:', webhookResult.statusCode < 500);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('  1. Make a real payment through your app');
    console.log('  2. Check your deployment logs for webhook activity');
    console.log('  3. Verify PayChangu dashboard has webhook URL configured');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests(); 
// Test Webhook Delivery
// This script tests if webhooks can be delivered to your endpoint

const https = require('https');

async function testWebhookDelivery() {
  console.log('🔍 Testing webhook delivery to your endpoint...');
  
  const testData = {
    status: "success",
    message: "Test webhook delivery",
    data: {
      payment_link: {
        reference_id: "WEBHOOK_DELIVERY_TEST_" + Date.now(),
        email: "test@webhook.com",
        amount: 1000,
        currency: "MWK"
      }
    },
    timestamp: new Date().toISOString()
  };

  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'bet2025-2.onrender.com',
    port: 443,
    path: '/api/paychangu/webhook-test',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'WebhookDeliveryTester/1.0'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ Webhook delivery test completed`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Webhook delivery test failed: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test the main webhook endpoint too
async function testMainWebhook() {
  console.log('\n🔍 Testing main webhook endpoint...');
  
  const testData = {
    status: "success",
    message: "Test main webhook",
    data: {
      payment_link: {
        reference_id: "MAIN_WEBHOOK_TEST_" + Date.now(),
        email: "test@mainwebhook.com",
        amount: 2000,
        currency: "MWK"
      }
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
      'x-test-mode': 'true'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ Main webhook test completed`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response: ${data}`);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Main webhook test failed: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runWebhookTests() {
  console.log('🚀 Starting webhook delivery tests...\n');
  
  try {
    // Test 1: Test webhook test endpoint
    await testWebhookDelivery();
    
    // Test 2: Test main webhook endpoint
    await testMainWebhook();
    
    console.log('\n🎉 Webhook delivery tests completed!');
    console.log('📋 Check your server logs to see if the webhooks were received.');
    
  } catch (error) {
    console.error('❌ Webhook tests failed:', error);
  }
}

// Run the tests
runWebhookTests().catch(console.error); 
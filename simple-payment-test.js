// Simple Payment Flow Test
// This script tests the basic payment flow endpoints

const https = require('https');

async function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PaymentFlowTester/1.0'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runSimpleTests() {
  console.log('🚀 Running simple payment flow tests...\n');
  
  const baseUrl = 'https://bet2025-2.onrender.com';
  
  // Test 1: PayChangu Configuration
  console.log('📋 Test 1: PayChangu Configuration');
  try {
    const configResponse = await testEndpoint(`${baseUrl}/api/paychangu/config`);
    if (configResponse.status === 200) {
      console.log('✅ PayChangu config working');
      console.log(`   Status: ${configResponse.status}`);
      console.log(`   Message: ${configResponse.data.message}`);
    } else {
      console.log(`❌ PayChangu config failed: ${configResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ PayChangu config error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 2: Session Endpoint (expected to fail without auth)
  console.log('📋 Test 2: Session Endpoint');
  try {
    const sessionResponse = await testEndpoint(`${baseUrl}/api/test-session`);
    if (sessionResponse.status === 401) {
      console.log('✅ Session endpoint working (correctly rejecting unauthorized)');
    } else {
      console.log(`⚠️ Session endpoint returned: ${sessionResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Session endpoint error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 3: Webhook Endpoint
  console.log('📋 Test 3: Webhook Endpoint');
  try {
    const webhookData = {
      status: "success",
      data: {
        payment_link: {
          reference_id: "SIMPLE_TEST_123",
          email: "test@example.com",
          amount: 1000,
          currency: "MWK"
        }
      }
    };
    
    const webhookResponse = await testEndpoint(
      `${baseUrl}/api/paychangu/webhook`,
      'POST',
      JSON.stringify(webhookData)
    );
    
    if (webhookResponse.status === 200) {
      console.log('✅ Webhook endpoint working');
    } else {
      console.log(`⚠️ Webhook endpoint returned: ${webhookResponse.status}`);
      console.log(`   Response: ${JSON.stringify(webhookResponse.data)}`);
    }
  } catch (error) {
    console.log(`❌ Webhook endpoint error: ${error.message}`);
  }
  
  console.log('');
  
  // Test 4: Process Payment Endpoint
  console.log('📋 Test 4: Process Payment Endpoint');
  try {
    const paymentData = {
      status: "success",
      data: {
        payment_link: {
          reference_id: "PROCESS_SIMPLE_123",
          email: "test@example.com",
          amount: 500,
          currency: "MWK"
        }
      }
    };
    
    const processResponse = await testEndpoint(
      `${baseUrl}/api/paychangu/process-payment`,
      'POST',
      JSON.stringify(paymentData)
    );
    
    if (processResponse.status === 200) {
      console.log('✅ Process payment endpoint working');
    } else {
      console.log(`⚠️ Process payment endpoint returned: ${processResponse.status}`);
      console.log(`   Response: ${JSON.stringify(processResponse.data)}`);
    }
  } catch (error) {
    console.log(`❌ Process payment endpoint error: ${error.message}`);
  }
  
  console.log('\n🎉 Simple payment flow tests completed!');
}

// Run the tests
runSimpleTests().catch(console.error); 
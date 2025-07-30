// Manual Payment Test Script
// This script simulates a complete payment flow for testing

const https = require('https');

class ManualPaymentTester {
  constructor() {
    this.baseUrl = 'https://bet2025-2.onrender.com';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ManualPaymentTester/1.0',
          ...options.headers
        }
      };

      if (options.body) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  async testCompletePaymentFlow() {
    this.log('🚀 Starting manual payment flow test...');
    this.log('==========================================');

    // Step 1: Test PayChangu Configuration
    this.log('\n📋 Step 1: Testing PayChangu Configuration');
    try {
      const configResponse = await this.makeRequest(`${this.baseUrl}/api/paychangu/config`);
      if (configResponse.status === 200) {
        this.log('✅ PayChangu configuration is working', 'success');
        this.log(`   Environment: ${configResponse.data.environment}`);
        this.log(`   Status: ${configResponse.data.status}`);
      } else {
        this.log(`❌ PayChangu configuration failed: ${configResponse.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ PayChangu configuration error: ${error.message}`, 'error');
      return false;
    }

    // Step 2: Test Webhook with Test Mode
    this.log('\n📋 Step 2: Testing Webhook with Test Mode');
    try {
      const webhookData = {
        status: "success",
        message: "Payment details retrieved.",
        data: {
          available_payment_methods: ["card", "mobile_money", "mobile_bank_transfer"],
          callback_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=MANUAL_TEST_123",
          mobile_money_providers: [{}, {}],
          payment_amounts_by_processors: {
            currency: "MWK",
            card: "5,000.00",
            mobile_bank_transfer: "5,000.00",
            airtel: "5,000.00",
            tnm: "5,000.00"
          },
          payment_link: {
            reference_id: "MANUAL_TEST_123",
            email: "manual.test@example.com",
            amount: 5000,
            payableAmount: 5000,
            currency: "MWK"
          },
          return_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=MANUAL_TEST_123",
          traceId: null
        }
      };

      const webhookResponse = await this.makeRequest(`${this.baseUrl}/api/paychangu/webhook`, {
        method: 'POST',
        headers: {
          'x-test-mode': 'true'
        },
        body: JSON.stringify(webhookData)
      });

      if (webhookResponse.status === 200) {
        this.log('✅ Webhook processing successful', 'success');
        this.log(`   Response: ${JSON.stringify(webhookResponse.data, null, 2)}`);
      } else {
        this.log(`⚠️ Webhook returned status ${webhookResponse.status}`, 'error');
        this.log(`   Response: ${JSON.stringify(webhookResponse.data, null, 2)}`);
      }
    } catch (error) {
      this.log(`❌ Webhook test error: ${error.message}`, 'error');
    }

    // Step 3: Test Process Payment Endpoint
    this.log('\n📋 Step 3: Testing Process Payment Endpoint');
    try {
      const paymentData = {
        status: "success",
        message: "Payment details retrieved.",
        data: {
          payment_link: {
            reference_id: "MANUAL_PROCESS_123",
            email: "manual.process@example.com",
            amount: 2500,
            payableAmount: 2500,
            currency: "MWK"
          }
        }
      };

      const processResponse = await this.makeRequest(`${this.baseUrl}/api/paychangu/process-payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (processResponse.status === 200) {
        this.log('✅ Process payment successful', 'success');
        this.log(`   Response: ${JSON.stringify(processResponse.data, null, 2)}`);
      } else {
        this.log(`⚠️ Process payment returned status ${processResponse.status}`, 'error');
        this.log(`   Response: ${JSON.stringify(processResponse.data, null, 2)}`);
      }
    } catch (error) {
      this.log(`❌ Process payment error: ${error.message}`, 'error');
    }

    // Step 4: Test Payment Status URLs
    this.log('\n📋 Step 4: Testing Payment Status URLs');
    const testUrls = [
      `${this.baseUrl}/dashboard/wallet?payment=success&tx_ref=TEST_SUCCESS_123`,
      `${this.baseUrl}/dashboard/wallet?payment=failed&tx_ref=TEST_FAILED_123`,
      `${this.baseUrl}/dashboard/wallet?tx_ref=TEST_NO_STATUS_123`
    ];

    for (const url of testUrls) {
      try {
        const response = await this.makeRequest(url);
        this.log(`✅ URL ${url} returned status ${response.status}`);
      } catch (error) {
        this.log(`❌ URL ${url} error: ${error.message}`, 'error');
      }
    }

    this.log('\n🎉 Manual payment flow test completed!');
    this.log('==========================================');
    this.log('📋 Next Steps:');
    this.log('   1. Login to your application');
    this.log('   2. Navigate to the wallet page');
    this.log('   3. Try to make a deposit');
    this.log('   4. Check the browser console for paymentDetails null logs');
    this.log('   5. Monitor the payment flow in the browser');

    return true;
  }
}

// Run the manual test
async function runManualTest() {
  const tester = new ManualPaymentTester();
  await tester.testCompletePaymentFlow();
}

// Export for use in other scripts
module.exports = { ManualPaymentTester, runManualTest };

// Run if this file is executed directly
if (require.main === module) {
  runManualTest().catch(console.error);
} 
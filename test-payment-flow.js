// Comprehensive Payment Flow Test
// This script tests the entire PayChangu payment flow from start to finish

const https = require('https');
const http = require('http');

class PaymentFlowTester {
  constructor() {
    this.baseUrl = 'https://bet2025-2.onrender.com';
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      if (options.body) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
      }

      const req = client.request(requestOptions, (res) => {
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

  async testPayChanguConfig() {
    this.log('Testing PayChangu configuration endpoint...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/paychangu/config`);
      
      if (response.status === 200) {
        this.log('✅ PayChangu config endpoint working', 'success');
        this.log(`Configuration: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      } else {
        this.log(`❌ PayChangu config failed with status ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ PayChangu config error: ${error.message}`, 'error');
      return false;
    }
  }

  async testSessionEndpoint() {
    this.log('Testing session endpoint...');
    
    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/test-session`);
      
      if (response.status === 200) {
        this.log('✅ Session endpoint working', 'success');
        this.log(`Session data: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      } else {
        this.log(`❌ Session endpoint failed with status ${response.status}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`❌ Session endpoint error: ${error.message}`, 'error');
      return false;
    }
  }

  async testWebhookEndpoint() {
    this.log('Testing webhook endpoint with test data...');
    
    const testWebhookData = {
      status: "success",
      message: "Payment details retrieved.",
      data: {
        available_payment_methods: ["card", "mobile_money", "mobile_bank_transfer"],
        callback_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=TEST_TX_123",
        mobile_money_providers: [{}, {}],
        payment_amounts_by_processors: {
          currency: "MWK",
          card: "1,000.00",
          mobile_bank_transfer: "1,000.00",
          airtel: "1,000.00",
          tnm: "1,000.00"
        },
        payment_link: {
          reference_id: "TEST_REF_123",
          email: "test@example.com",
          amount: 1000,
          payableAmount: 1000,
          currency: "MWK"
        },
        return_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=TEST_TX_123",
        traceId: null
      }
    };

    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/paychangu/webhook`, {
        method: 'POST',
        headers: {
          'x-test-mode': 'true'
        },
        body: JSON.stringify(testWebhookData)
      });
      
      if (response.status === 200) {
        this.log('✅ Webhook endpoint working', 'success');
        this.log(`Webhook response: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      } else {
        this.log(`❌ Webhook endpoint failed with status ${response.status}`, 'error');
        this.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ Webhook endpoint error: ${error.message}`, 'error');
      return false;
    }
  }

  async testProcessPaymentEndpoint() {
    this.log('Testing process payment endpoint...');
    
    const testPaymentData = {
      status: "success",
      message: "Payment details retrieved.",
      data: {
        payment_link: {
          reference_id: "PROCESS_TEST_123",
          email: "test@example.com",
          amount: 500,
          payableAmount: 500,
          currency: "MWK"
        }
      }
    };

    try {
      const response = await this.makeRequest(`${this.baseUrl}/api/paychangu/process-payment`, {
        method: 'POST',
        body: JSON.stringify(testPaymentData)
      });
      
      if (response.status === 200) {
        this.log('✅ Process payment endpoint working', 'success');
        this.log(`Process payment response: ${JSON.stringify(response.data, null, 2)}`);
        return true;
      } else {
        this.log(`❌ Process payment endpoint failed with status ${response.status}`, 'error');
        this.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ Process payment endpoint error: ${error.message}`, 'error');
      return false;
    }
  }

  async testPaymentFlow() {
    this.log('🚀 Starting comprehensive payment flow test...');
    this.log('==========================================');
    
    const tests = [
      { name: 'PayChangu Configuration', test: () => this.testPayChanguConfig() },
      { name: 'Session Endpoint', test: () => this.testSessionEndpoint() },
      { name: 'Webhook Endpoint', test: () => this.testWebhookEndpoint() },
      { name: 'Process Payment Endpoint', test: () => this.testProcessPaymentEndpoint() }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      this.log(`\n📋 Running test: ${test.name}`);
      try {
        const result = await test.test();
        if (result) {
          passedTests++;
          this.testResults.push({ name: test.name, status: 'PASS' });
        } else {
          this.testResults.push({ name: test.name, status: 'FAIL' });
        }
      } catch (error) {
        this.log(`❌ Test ${test.name} threw an error: ${error.message}`, 'error');
        this.testResults.push({ name: test.name, status: 'ERROR' });
      }
    }

    this.log('\n📊 Test Results Summary:');
    this.log('========================');
    this.log(`✅ Passed: ${passedTests}/${totalTests}`);
    this.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      this.log(`${icon} ${result.name}: ${result.status}`);
    });

    if (passedTests === totalTests) {
      this.log('\n🎉 All tests passed! Payment flow is working correctly.', 'success');
    } else {
      this.log('\n⚠️ Some tests failed. Please check the logs above.', 'error');
    }

    return passedTests === totalTests;
  }
}

// Run the test
async function runPaymentFlowTest() {
  const tester = new PaymentFlowTester();
  await tester.testPaymentFlow();
}

// Export for use in other scripts
module.exports = { PaymentFlowTester, runPaymentFlowTest };

// Run if this file is executed directly
if (require.main === module) {
  runPaymentFlowTest().catch(console.error);
} 
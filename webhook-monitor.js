// Webhook Monitor Script
// This script will help us track if PayChangu is sending webhooks to your endpoint

const https = require('https');
const http = require('http');

class WebhookMonitor {
  constructor() {
    this.baseUrl = 'https://bet2025-2.onrender.com';
    this.webhookUrl = `${this.baseUrl}/api/paychangu/webhook`;
    this.logs = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
    this.logs.push({ timestamp, type, message });
  }

  async testWebhookEndpoint() {
    this.log('🔍 Testing webhook endpoint accessibility...');
    
    try {
      const response = await this.makeRequest(this.webhookUrl, {
        method: 'POST',
        headers: {
          'x-test-mode': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: "success",
          message: "Test webhook from monitor",
          data: {
            payment_link: {
              reference_id: "MONITOR_TEST_" + Date.now(),
              email: "monitor@test.com",
              amount: 1000,
              currency: "MWK"
            }
          }
        })
      });
      
      this.log(`✅ Webhook endpoint accessible - Status: ${response.status}`);
      this.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } catch (error) {
      this.log(`❌ Webhook endpoint error: ${error.message}`, 'error');
      return false;
    }
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
          'User-Agent': 'WebhookMonitor/1.0',
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

  async checkPayChanguWebhookConfiguration() {
    this.log('🔍 Checking PayChangu webhook configuration...');
    
    try {
      const configResponse = await this.makeRequest(`${this.baseUrl}/api/paychangu/config`);
      
      if (configResponse.status === 200) {
        const config = configResponse.data;
        this.log('✅ PayChangu configuration loaded');
        this.log(`   Webhook URL: ${config.configuration.webhookUrl}`);
        this.log(`   Callback URL: ${config.configuration.callbackUrl}`);
        this.log(`   Return URL: ${config.configuration.returnUrl}`);
        this.log(`   Environment: ${config.environment}`);
        
        // Check if webhook URL is accessible from external sources
        this.log('🔍 Checking if webhook URL is publicly accessible...');
        
        // Test with a simple GET request first
        try {
          const testResponse = await this.makeRequest(config.configuration.webhookUrl, {
            method: 'GET'
          });
          this.log(`✅ Webhook URL is accessible (GET): ${testResponse.status}`);
        } catch (error) {
          this.log(`⚠️ Webhook URL GET test failed: ${error.message}`);
        }
        
        return config.configuration.webhookUrl;
      } else {
        this.log(`❌ Failed to load PayChangu config: ${configResponse.status}`);
        return null;
      }
    } catch (error) {
      this.log(`❌ PayChangu config error: ${error.message}`, 'error');
      return null;
    }
  }

  async simulatePayChanguWebhook() {
    this.log('🔍 Simulating PayChangu webhook...');
    
    const webhookData = {
      status: "success",
      message: "Payment details retrieved.",
      data: {
        available_payment_methods: ["card", "mobile_money", "mobile_bank_transfer"],
        callback_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=SIMULATED_WEBHOOK_123",
        mobile_money_providers: [{}, {}],
        payment_amounts_by_processors: {
          currency: "MWK",
          card: "2,000.00",
          mobile_bank_transfer: "2,000.00",
          airtel: "2,000.00",
          tnm: "2,000.00"
        },
        payment_link: {
          reference_id: "SIMULATED_WEBHOOK_" + Date.now(),
          email: "simulated@paychangu.com",
          amount: 2000,
          payableAmount: 2000,
          currency: "MWK"
        },
        return_url: "https://bet2025-2.onrender.com/dashboard/wallet?tx_ref=SIMULATED_WEBHOOK_123",
        traceId: null
      }
    };

    try {
      const response = await this.makeRequest(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true'
        },
        body: JSON.stringify(webhookData)
      });
      
      this.log(`✅ Simulated webhook sent - Status: ${response.status}`);
      this.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      return true;
    } catch (error) {
      this.log(`❌ Simulated webhook failed: ${error.message}`, 'error');
      return false;
    }
  }

  async checkWebhookLogs() {
    this.log('🔍 Checking for webhook logs in your application...');
    
    // Test different webhook scenarios
    const testScenarios = [
      {
        name: 'Successful Payment Webhook',
        data: {
          status: "success",
          data: {
            payment_link: {
              reference_id: "WEBHOOK_LOG_TEST_" + Date.now(),
              email: "webhook@test.com",
              amount: 1500,
              currency: "MWK"
            }
          }
        }
      },
      {
        name: 'Failed Payment Webhook',
        data: {
          status: "failed",
          data: {
            payment_link: {
              reference_id: "WEBHOOK_FAILED_" + Date.now(),
              email: "failed@test.com",
              amount: 1000,
              currency: "MWK"
            }
          }
        }
      }
    ];

    for (const scenario of testScenarios) {
      this.log(`📋 Testing: ${scenario.name}`);
      try {
        const response = await this.makeRequest(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-test-mode': 'true'
          },
          body: JSON.stringify(scenario.data)
        });
        
        this.log(`   Status: ${response.status}`);
        this.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      } catch (error) {
        this.log(`   Error: ${error.message}`, 'error');
      }
    }
  }

  async runWebhookDiagnostics() {
    this.log('🚀 Starting webhook diagnostics...');
    this.log('==========================================');
    
    // Step 1: Check PayChangu configuration
    const webhookUrl = await this.checkPayChanguWebhookConfiguration();
    
    if (!webhookUrl) {
      this.log('❌ Cannot proceed without webhook URL');
      return;
    }
    
    // Step 2: Test webhook endpoint
    await this.testWebhookEndpoint();
    
    // Step 3: Simulate PayChangu webhook
    await this.simulatePayChanguWebhook();
    
    // Step 4: Check webhook logs
    await this.checkWebhookLogs();
    
    this.log('\n📊 Webhook Diagnostics Summary:');
    this.log('===============================');
    this.log('✅ If you see successful responses above, your webhook endpoint is working');
    this.log('❌ If you see errors, there might be issues with:');
    this.log('   1. Webhook URL configuration in PayChangu dashboard');
    this.log('   2. Network connectivity between PayChangu and your server');
    this.log('   3. Webhook signature verification');
    this.log('   4. Server configuration');
    
    this.log('\n🔍 Next Steps:');
    this.log('   1. Check your PayChangu dashboard for webhook URL configuration');
    this.log('   2. Verify the webhook URL is exactly: ' + webhookUrl);
    this.log('   3. Check your server logs for incoming webhook requests');
    this.log('   4. Test with a real payment to see if PayChangu sends webhooks');
    
    return this.logs;
  }
}

// Run the webhook diagnostics
async function runWebhookDiagnostics() {
  const monitor = new WebhookMonitor();
  await monitor.runWebhookDiagnostics();
}

// Export for use in other scripts
module.exports = { WebhookMonitor, runWebhookDiagnostics };

// Run if this file is executed directly
if (require.main === module) {
  runWebhookDiagnostics().catch(console.error);
} 
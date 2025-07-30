const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://bet2025-web.onrender.com';
const ENDPOINTS = [
  '/api/paychangu/ping',
  '/api/paychangu/webhook-test',
  '/api/paychangu/webhook',
  '/api/paychangu/debug'
];

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Test-Script/1.0'
      }
    };
    
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 ===== WEBHOOK ENDPOINT TESTING =====');
  console.log('🌐 Base URL:', BASE_URL);
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('');
  
  for (const endpoint of ENDPOINTS) {
    const url = BASE_URL + endpoint;
    console.log(`🔍 Testing: ${url}`);
    
    try {
      // Test GET request
      const getResult = await makeRequest(url, 'GET');
      console.log(`✅ GET ${endpoint}: ${getResult.status}`);
      console.log(`📋 Response:`, getResult.data);
      
      // Test POST request with sample data
      const postData = JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Test webhook data'
      });
      
      const postResult = await makeRequest(url, 'POST', postData);
      console.log(`✅ POST ${endpoint}: ${postResult.status}`);
      console.log(`📋 Response:`, postResult.data);
      
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
    }
    
    console.log('---');
  }
  
  console.log('🏁 ===== TESTING COMPLETE =====');
}

// Run the test
testEndpoints().catch(console.error); 
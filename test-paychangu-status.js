const https = require('https');

console.log('🔍 ===== PAYCHANGU LIVE MODE STATUS CHECK =====');

// Test PayChangu API endpoints
const endpoints = [
  'https://api.paychangu.com/health',
  'https://in.paychangu.com/js/popup.js',
  'https://api.paychangu.com/transaction/status'
];

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`✅ ${url}: ${res.statusCode} ${res.statusMessage}`);
      resolve({ url, status: res.statusCode, ok: res.statusCode < 400 });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url}: ${err.message}`);
      resolve({ url, status: 'ERROR', ok: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${url}: Timeout`);
      req.destroy();
      resolve({ url, status: 'TIMEOUT', ok: false });
    });
  });
}

async function runTests() {
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🌐 Testing PayChangu endpoints...');
  
  const results = await Promise.all(endpoints.map(testEndpoint));
  
  console.log('\n📊 Results:');
  results.forEach(result => {
    console.log(`  ${result.ok ? '✅' : '❌'} ${result.url}: ${result.status}`);
  });
  
  const allOk = results.every(r => r.ok);
  console.log(`\n🎯 Overall Status: ${allOk ? '✅ All endpoints working' : '❌ Some endpoints failing'}`);
  
  if (!allOk) {
    console.log('\n💡 Recommendations:');
    console.log('1. Check if PayChangu service is experiencing issues');
    console.log('2. Verify your live mode credentials are correct');
    console.log('3. Try switching to test mode temporarily');
    console.log('4. Contact PayChangu support if issues persist');
  }
}

runTests().catch(console.error); 
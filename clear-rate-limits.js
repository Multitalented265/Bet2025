const https = require('https');

// Configuration
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';
const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';

const makeRequest = (method) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'bet2025-2-saau.onrender.com',
      port: 443,
      path: method.path,
      method: method.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          resolve({ 
            success: false, 
            message: 'Failed to parse response',
            rawData: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method.data) {
      req.write(JSON.stringify(method.data));
    }
    
    req.end();
  });
};

async function main() {
  console.log('🚀 Clearing rate limits and testing admin login...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Step 1: Clear rate limits
    console.log('🔧 Step 1: Clearing rate limits...');
    const clearResult = await makeRequest({
      name: 'Clear rate limits',
      path: '/api/admin/clear-rate-limits',
      method: 'POST'
    });

    console.log('Clear result:', clearResult);

    if (clearResult.success) {
      console.log('✅ Rate limits cleared successfully!');
    } else {
      console.log('❌ Rate limit clear failed:', clearResult.message);
    }

    // Step 2: Wait a moment for changes to take effect
    console.log('\n⏳ Waiting 5 seconds for changes to take effect...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Test admin login
    console.log('\n🔧 Step 2: Testing admin login...');
    const loginResult = await makeRequest({
      name: 'Test admin login',
      path: '/api/admin/login',
      method: 'POST',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });

    console.log('Login result:', loginResult);

    if (loginResult.success) {
      console.log('✅ Login successful! Admin credentials are working.');
      console.log('');
      console.log('🎉 SUCCESS! You can now log in with:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      console.log(`Login URL: ${DEPLOYMENT_URL}/admin-auth/login`);
    } else {
      console.log('❌ Login failed:', loginResult.message);
      console.log('');
      console.log('⚠️  If login still fails:');
      console.log('1. Wait 10-15 minutes for rate limits to clear naturally');
      console.log('2. Try logging in manually at the URL above');
      console.log('3. Check your Render deployment logs for errors');
    }

  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

main();

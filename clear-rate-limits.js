const https = require('https');

const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';

async function makeRequest({ name, path, method = 'GET', data = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 ${name} - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ ${name} - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${name} - Error:`, error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

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
    console.log('\n⏳ Waiting 3 seconds for changes to take effect...');
    await new Promise(resolve => setTimeout(resolve, 3000));

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
      console.log('✅ Admin login successful!');
      console.log('Admin details:', loginResult.admin);
    } else {
      console.log('❌ Admin login failed:', loginResult.message);
      
      // Step 4: Try to setup admin if login failed
      console.log('\n🔧 Step 3: Attempting to setup admin account...');
      const setupResult = await makeRequest({
        name: 'Setup admin',
        path: '/api/setup-admin',
        method: 'POST'
      });

      console.log('Setup result:', setupResult);

      if (setupResult.success) {
        console.log('✅ Admin account setup successful!');
        
        // Step 5: Try login again after setup
        console.log('\n🔧 Step 4: Testing admin login after setup...');
        const retryLoginResult = await makeRequest({
          name: 'Retry admin login',
          path: '/api/admin/login',
          method: 'POST',
          data: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          }
        });

        console.log('Retry login result:', retryLoginResult);

        if (retryLoginResult.success) {
          console.log('✅ Admin login successful after setup!');
        } else {
          console.log('❌ Admin login still failed after setup:', retryLoginResult.message);
        }
      } else {
        console.log('❌ Admin setup failed:', setupResult.message);
      }
    }

    console.log('\n📋 Summary:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      console.log(`Login URL: ${DEPLOYMENT_URL}/admin-auth/login`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main();

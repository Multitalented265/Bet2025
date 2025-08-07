const https = require('https');

const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';
const ADMIN_NAME = 'Administrator';

async function clearRateLimits() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/admin/clear-rate-limits',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Fix-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Clear Rate Limits - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Clear Rate Limits - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Clear Rate Limits - Error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function setupAdminAccount() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/setup-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Fix-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Setup - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Admin Setup - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Admin Setup - Error:`, error.message);
      reject(error);
    });

    const setupData = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME
    };

    req.write(JSON.stringify(setupData));
    req.end();
  });
}

async function testAdminLogin() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Fix-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Login Test - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Admin Login Test - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Admin Login Test - Error:`, error.message);
      reject(error);
    });

    const loginData = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    };

    req.write(JSON.stringify(loginData));
    req.end();
  });
}

async function main() {
  console.log('🔧 Fixing Admin Credentials...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Step 1: Clear rate limits
    console.log('🔧 Step 1: Clearing rate limits...');
    const clearResult = await clearRateLimits();
    console.log('Clear result:', clearResult);

    if (clearResult.success) {
      console.log('✅ Rate limits cleared successfully!');
    } else {
      console.log('❌ Rate limit clear failed:', clearResult.message);
    }

    // Step 2: Wait a moment
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Setup admin account
    console.log('\n🔧 Step 2: Setting up admin account...');
    const setupResult = await setupAdminAccount();
    console.log('Setup result:', setupResult);

    if (setupResult.success) {
      console.log('✅ Admin account setup successful!');
    } else {
      console.log('❌ Admin account setup failed:', setupResult.message);
    }

    // Step 4: Wait a moment
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Test admin login
    console.log('\n🔧 Step 3: Testing admin login...');
    const loginResult = await testAdminLogin();
    console.log('Login result:', loginResult);

    if (loginResult.success) {
      console.log('✅ Admin login successful!');
      console.log('Admin details:', loginResult.admin);
    } else {
      console.log('❌ Admin login failed:', loginResult.message);
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

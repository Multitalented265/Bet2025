const https = require('https');

const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';

async function testAdminLogin() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Bypass/1.0',
        'X-Forwarded-For': '127.0.0.1', // Use localhost IP to avoid rate limiting
        'X-Real-IP': '127.0.0.1'
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

async function checkAdminSetup() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/setup-admin',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Test-Bypass/1.0',
        'X-Forwarded-For': '127.0.0.1',
        'X-Real-IP': '127.0.0.1'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Setup Check - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Admin Setup Check - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Admin Setup Check - Error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Testing Admin Login (Bypass Mode)...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Step 1: Check admin setup
    console.log('🔧 Step 1: Checking admin setup...');
    const setupCheck = await checkAdminSetup();
    console.log('Setup check result:', setupCheck);

    if (setupCheck.success && setupCheck.admins && setupCheck.admins.length > 0) {
      console.log('✅ Found admin accounts:');
      setupCheck.admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.name})`);
      });
    } else {
      console.log('❌ No admin accounts found');
    }

    // Step 2: Test admin login
    console.log('\n🔧 Step 2: Testing admin login...');
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

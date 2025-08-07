const https = require('https');

const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';
const ADMIN_NAME = 'Administrator';

async function setupAdminAccount() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/setup-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Setup-Script/1.0'
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

async function checkAdminAccounts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/setup-admin',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Setup-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Check - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Admin Check - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Admin Check - Error:`, error.message);
      reject(error);
    });

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
        'User-Agent': 'Admin-Setup-Script/1.0'
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
  console.log('🔧 Setting up Admin Account...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Admin Name: ${ADMIN_NAME}`);
  console.log('');

  try {
    // Step 1: Check existing admin accounts
    console.log('🔧 Step 1: Checking existing admin accounts...');
    const checkResult = await checkAdminAccounts();
    console.log('Check result:', checkResult);

    if (checkResult.success && checkResult.admins && checkResult.admins.length > 0) {
      console.log('✅ Found existing admin accounts:');
      checkResult.admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.name})`);
      });
    } else {
      console.log('❌ No admin accounts found');
    }

    // Step 2: Setup admin account
    console.log('\n🔧 Step 2: Setting up admin account...');
    const setupResult = await setupAdminAccount();
    console.log('Setup result:', setupResult);

    if (setupResult.success) {
      console.log('✅ Admin account setup successful!');
    } else {
      console.log('❌ Admin account setup failed:', setupResult.message);
    }

    // Step 3: Test admin login
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

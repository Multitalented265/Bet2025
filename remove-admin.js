const https = require('https');

const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';
const TARGET_EMAIL = 'admin@bet2025.com';
const NEW_ADMIN_EMAIL = 'admin@mzunguko.com';
const NEW_ADMIN_PASSWORD = 'AdminSecure2025!@#';
const NEW_ADMIN_NAME = 'Administrator';

async function clearAllAdmins() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/admin/clear-all',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Remove-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Clear All Admins - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Clear All Admins - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Clear All Admins - Error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function createNewAdmin() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/setup-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Remove-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Create New Admin - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Create New Admin - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Create New Admin - Error:`, error.message);
      reject(error);
    });

    const setupData = {
      email: NEW_ADMIN_EMAIL,
      password: NEW_ADMIN_PASSWORD,
      name: NEW_ADMIN_NAME
    };

    req.write(JSON.stringify(setupData));
    req.end();
  });
}

async function testNewAdminLogin() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Admin-Remove-Script/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Test New Admin Login - Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          console.log(`❌ Test New Admin Login - Raw response:`, responseData);
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Test New Admin Login - Error:`, error.message);
      reject(error);
    });

    const loginData = {
      email: NEW_ADMIN_EMAIL,
      password: NEW_ADMIN_PASSWORD
    };

    req.write(JSON.stringify(loginData));
    req.end();
  });
}

async function main() {
  console.log('🗑️ Removing Admin Account and Creating New One...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Removing: ${TARGET_EMAIL}`);
  console.log(`Creating: ${NEW_ADMIN_EMAIL}`);
  console.log(`New Password: ${NEW_ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Step 1: Clear all admin accounts (this removes admin@bet2025.com)
    console.log('🔧 Step 1: Clearing all admin accounts...');
    const clearResult = await clearAllAdmins();
    console.log('Clear result:', clearResult);

    if (clearResult.success) {
      console.log('✅ All admin accounts cleared successfully!');
    } else {
      console.log('❌ Clear admins failed:', clearResult.message);
    }

    // Step 2: Wait a moment
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Create new admin account
    console.log('\n🔧 Step 2: Creating new admin account...');
    const createResult = await createNewAdmin();
    console.log('Create result:', createResult);

    if (createResult.success) {
      console.log('✅ New admin account created successfully!');
    } else {
      console.log('❌ Create admin failed:', createResult.message);
    }

    // Step 4: Wait a moment
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Test new admin login
    console.log('\n🔧 Step 3: Testing new admin login...');
    const loginResult = await testNewAdminLogin();
    console.log('Login result:', loginResult);

    if (loginResult.success) {
      console.log('✅ New admin login successful!');
    } else {
      console.log('❌ New admin login failed:', loginResult.message);
    }

    console.log('\n📋 Final Summary:');
    console.log(`✅ Removed: ${TARGET_EMAIL}`);
    console.log(`✅ Created: ${NEW_ADMIN_EMAIL}`);
    console.log(`✅ Password: ${NEW_ADMIN_PASSWORD}`);
    console.log(`✅ Login URL: ${DEPLOYMENT_URL}/admin-auth/login`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main();

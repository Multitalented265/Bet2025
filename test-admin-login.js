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
        'User-Agent': 'Admin-Test-Script/1.0'
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
        'User-Agent': 'Admin-Test-Script/1.0'
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
  console.log('🔍 Testing Admin Login and Setup...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`Admin Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    // Step 1: Check if admin account exists
    console.log('🔧 Step 1: Checking admin account setup...');
    const setupCheck = await checkAdminSetup();
    console.log('Setup check result:', setupCheck);

    if (setupCheck.success && setupCheck.admin) {
      console.log('✅ Admin account exists:', setupCheck.admin);
    } else {
      console.log('❌ Admin account not found or setup failed');
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
      
      // Step 3: Try to setup admin if login failed
      console.log('\n🔧 Step 3: Attempting to setup admin account...');
      const setupResult = await new Promise((resolve, reject) => {
        const options = {
          hostname: DEPLOYMENT_URL.replace('https://', ''),
          port: 443,
          path: '/api/setup-admin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Admin-Test-Script/1.0'
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

        req.end();
      });

      console.log('Setup result:', setupResult);

      if (setupResult.success) {
        console.log('✅ Admin account setup successful!');
        
        // Step 4: Try login again after setup
        console.log('\n🔧 Step 4: Testing admin login after setup...');
        const retryLoginResult = await testAdminLogin();
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

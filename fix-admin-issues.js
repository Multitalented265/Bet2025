const https = require('https');

// Configuration
const ADMIN_EMAIL = 'admin@mzunguko.com';
const NEW_PASSWORD = 'AdminSecure2025!@#';
const DEPLOYMENT_URL = 'https://bet2025-2-saau.onrender.com';

// Step 1: Clear rate limiting and check current admin status
const checkAndClearRateLimit = async () => {
  console.log('🔧 Step 1: Checking current admin status and clearing rate limits...');
  
  const methods = [
    {
      name: 'Check existing admin accounts',
      path: '/api/setup-admin',
      method: 'GET'
    },
    {
      name: 'Check admin login status',
      path: '/api/admin/login',
      method: 'POST',
      data: {
        email: ADMIN_EMAIL,
        password: NEW_PASSWORD
      }
    }
  ];

  for (const method of methods) {
    console.log(`\n🔄 ${method.name}...`);
    
    try {
      const result = await makeRequest(method);
      console.log(`Result:`, result);
      
      if (result.success) {
        console.log(`✅ ${method.name} succeeded!`);
      } else {
        console.log(`❌ ${method.name} failed:`, result.message);
      }
    } catch (error) {
      console.log(`❌ ${method.name} error:`, error.message);
    }
  }
};

// Step 2: Reset admin account with proper credentials
const resetAdminAccount = async () => {
  console.log('\n🔧 Step 2: Resetting admin account with proper credentials...');
  
  const resetData = {
    email: ADMIN_EMAIL,
    password: NEW_PASSWORD,
    name: 'Administrator'
  };

  try {
    const result = await makeRequest({
      name: 'Reset admin account',
      path: '/api/setup-admin',
      method: 'POST',
      data: resetData
    });

    console.log('Reset result:', result);

    if (result.success) {
      console.log('✅ Admin account reset successfully!');
      return true;
    } else {
      console.log('❌ Admin account reset failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error resetting admin account:', error.message);
    return false;
  }
};

// Step 3: Test login with new credentials
const testLogin = async () => {
  console.log('\n🔧 Step 3: Testing login with new credentials...');
  
  try {
    const result = await makeRequest({
      name: 'Test admin login',
      path: '/api/admin/login',
      method: 'POST',
      data: {
        email: ADMIN_EMAIL,
        password: NEW_PASSWORD
      }
    });

    console.log('Login test result:', result);

    if (result.success) {
      console.log('✅ Login successful! Admin credentials are working.');
      console.log('');
      console.log('🎉 SUCCESS! You can now log in with:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${NEW_PASSWORD}`);
      console.log(`Login URL: ${DEPLOYMENT_URL}/admin-auth/login`);
      return true;
    } else {
      console.log('❌ Login failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing login:', error.message);
    return false;
  }
};

// Step 4: Clear all admin accounts and create a single main admin
const clearAndCreateMainAdmin = async () => {
  console.log('\n🔧 Step 4: Clearing all admin accounts and creating single main admin...');
  
  try {
    // First, try to delete all existing admin accounts
    const deleteResult = await makeRequest({
      name: 'Clear all admin accounts',
      path: '/api/admin/clear-all',
      method: 'DELETE'
    });

    console.log('Delete result:', deleteResult);

    // Then create the main admin account
    const createResult = await makeRequest({
      name: 'Create main admin account',
      path: '/api/setup-admin',
      method: 'POST',
      data: {
        email: ADMIN_EMAIL,
        password: NEW_PASSWORD,
        name: 'Main Administrator'
      }
    });

    console.log('Create result:', createResult);

    if (createResult.success) {
      console.log('✅ Main admin account created successfully!');
      return true;
    } else {
      console.log('❌ Main admin account creation failed:', createResult.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error in clear and create process:', error.message);
    return false;
  }
};

// Step 5: Clear rate limits and banned IPs
const clearRateLimits = async () => {
  console.log('\n🔧 Step 5: Clearing rate limits and banned IPs...');
  
  try {
    const result = await makeRequest({
      name: 'Clear rate limits',
      path: '/api/admin/clear-rate-limits',
      method: 'POST'
    });

    console.log('Rate limit clear result:', result);

    if (result.success) {
      console.log('✅ Rate limits cleared successfully!');
      return true;
    } else {
      console.log('❌ Rate limit clear failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error clearing rate limits:', error.message);
    return false;
  }
};

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

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive admin issue fix...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`New Password: ${NEW_PASSWORD}`);
  console.log('');

  try {
    // Step 1: Check current status
    await checkAndClearRateLimit();
    
    // Step 2: Clear rate limits
    await clearRateLimits();
    
    // Step 3: Clear all admins and create main admin
    const clearSuccess = await clearAndCreateMainAdmin();
    
    // Step 4: Test login
    if (clearSuccess) {
      await testLogin();
    } else {
      console.log('\n⚠️  Admin reset failed, trying to test existing credentials...');
      await testLogin();
    }
    
    console.log('\n📋 Summary:');
    console.log('1. Rate limiting should be cleared');
    console.log('2. All admin accounts should be cleared');
    console.log('3. Single main admin account should be created');
    console.log('4. Login should work with the new credentials');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Wait 2-3 minutes for changes to take effect');
    console.log('2. Try logging in at: https://bet2025-2-saau.onrender.com/admin-auth/login');
    console.log('3. Use the credentials shown above');
    console.log('4. If still having issues, check Render deployment logs');
    console.log('');
    console.log('🔐 Main Admin Account:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

main(); 
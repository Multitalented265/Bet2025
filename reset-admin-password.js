const https = require('https');

// Configuration
const ADMIN_EMAIL = 'admin@mzunguko.com';
const NEW_PASSWORD = 'AdminSecure2025!@#';
const DEPLOYMENT_URL = 'https://bet2025-2.onrender.com';

// First, let's check if the admin exists
const checkAdmin = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'bet2025-2.onrender.com',
      port: 443,
      path: '/api/setup-admin',
      method: 'GET',
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
          resolve({ success: false, message: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// Reset admin password using the existing endpoint
const resetAdminPassword = () => {
  return new Promise((resolve, reject) => {
    const resetData = {
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD,
      name: 'Administrator'
    };

    const options = {
      hostname: 'bet2025-2.onrender.com',
      port: 443,
      path: '/api/setup-admin',
      method: 'POST',
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
          resolve({ success: false, message: 'Failed to parse response' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(resetData));
    req.end();
  });
};

// Main execution
async function main() {
  console.log('🔧 Checking admin account status...');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`New Password: ${NEW_PASSWORD}`);
  console.log(`Deployment URL: ${DEPLOYMENT_URL}`);
  console.log('');

  try {
    // First check if admin exists
    const checkResult = await checkAdmin();
    console.log('Check result:', checkResult);

    if (checkResult.success && checkResult.admin) {
      console.log('✅ Admin account exists, attempting to reset password...');
    } else {
      console.log('❌ Admin account not found or check failed');
    }

    // Try to reset/create admin
    const resetResult = await resetAdminPassword();
    console.log('Reset result:', resetResult);

    if (resetResult.success) {
      console.log('✅ Admin password reset successfully!');
      console.log('');
      console.log('You can now log in with:');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log(`Password: ${NEW_PASSWORD}`);
      console.log('');
      console.log(`Login URL: ${DEPLOYMENT_URL}/admin/login`);
    } else {
      console.log('❌ Admin password reset failed:', resetResult.message);
      if (resetResult.message.includes('already exists')) {
        console.log('The admin account already exists but password reset failed.');
        console.log('You may need to manually update the password in the database.');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 
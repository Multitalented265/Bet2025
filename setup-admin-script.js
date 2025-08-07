const https = require('https');

// Configuration - change these values as needed
const ADMIN_EMAIL = 'admin@mzunguko.com';
const ADMIN_PASSWORD = 'AdminSecure2025!@#';
const ADMIN_NAME = 'Administrator';
const DEPLOYMENT_URL = 'https://bet2025-2.onrender.com';

const setupData = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  name: ADMIN_NAME
};

const options = {
  hostname: 'bet2025-2.onrender.com',
  port: 443,
  path: '/api/admin/setup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🔧 Setting up admin account...');
console.log(`Email: ${ADMIN_EMAIL}`);
console.log(`Name: ${ADMIN_NAME}`);
console.log(`Deployment URL: ${DEPLOYMENT_URL}`);
console.log('');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', result);
      
      if (result.success) {
        console.log('✅ Admin account created successfully!');
        console.log('');
        console.log('You can now log in with:');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log('');
        console.log(`Login URL: ${DEPLOYMENT_URL}/admin/login`);
      } else {
        console.log('❌ Admin account setup failed:', result.message);
        if (result.message.includes('already exists')) {
          console.log('The admin account already exists. You can try logging in.');
        }
      }
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(JSON.stringify(setupData));
req.end(); 
const https = require('https');

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
        console.log('✅ Admin account setup successful!');
        console.log('You can now log in with:');
        console.log('Email: admin@mzunguko.com');
        console.log('Password: AdminSecure2025!@#');
      } else {
        console.log('❌ Admin account setup failed:', result.message);
      }
    } catch (error) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end(); 
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
        'User-Agent': 'Session-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Login Test - Status: ${res.statusCode}`);
      
      // Get cookies from response headers
      const setCookieHeader = res.headers['set-cookie'];
      console.log('🍪 Set-Cookie headers:', setCookieHeader);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ result, cookies: setCookieHeader });
        } catch (error) {
          console.log(`❌ Admin Login Test - Raw response:`, responseData);
          resolve({ result: { success: false, message: 'Invalid JSON response' }, cookies: setCookieHeader });
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

async function testAdminSession(cookies) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DEPLOYMENT_URL.replace('https://', ''),
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Session-Test/1.0',
        'Cookie': cookies
      }
    };

    const req = https.request(options, (res) => {
      console.log(`📡 Admin Session Test - Status: ${res.statusCode}`);
      console.log(`📡 Location header: ${res.headers.location}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Redirect response
          resolve({ 
            success: false, 
            message: `Redirected to: ${res.headers.location}`,
            statusCode: res.statusCode
          });
        } else if (res.statusCode === 200) {
          // Success - check if it's the dashboard or login page
          if (responseData.includes('admin-session') || responseData.includes('login')) {
            resolve({ 
              success: false, 
              message: 'Redirected to login page',
              statusCode: res.statusCode
            });
          } else {
            resolve({ 
              success: true, 
              message: 'Successfully accessed admin dashboard',
              statusCode: res.statusCode
            });
          }
        } else {
          resolve({ 
            success: false, 
            message: `HTTP ${res.statusCode}`,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Admin Session Test - Error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Testing Admin Session Management...');
  console.log(`Target URL: ${DEPLOYMENT_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Step 1: Test admin login
    console.log('🔧 Step 1: Testing admin login...');
    const loginResult = await testAdminLogin();
    console.log('Login result:', loginResult.result);
    console.log('Cookies received:', loginResult.cookies);

    if (loginResult.result.success) {
      console.log('✅ Admin login successful!');
      
      // Step 2: Test session with cookies
      if (loginResult.cookies && loginResult.cookies.length > 0) {
        console.log('\n🔧 Step 2: Testing session with cookies...');
        const sessionResult = await testAdminSession(loginResult.cookies.join('; '));
        console.log('Session result:', sessionResult);
        
        if (sessionResult.success) {
          console.log('✅ Session test successful!');
        } else {
          console.log('❌ Session test failed:', sessionResult.message);
        }
      } else {
        console.log('❌ No cookies received from login');
      }
    } else {
      console.log('❌ Admin login failed:', loginResult.result.message);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

main();

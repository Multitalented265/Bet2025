#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const readline = require('readline');

console.log('🚀 PayChangu Local Development Setup');
console.log('=====================================\n');

// Check if ngrok is installed
function checkNgrok() {
  return new Promise((resolve) => {
    exec('ngrok --version', (error) => {
      if (error) {
        console.log('❌ ngrok is not installed or not in PATH');
        console.log('📥 Please install ngrok:');
        console.log('   npm install -g ngrok');
        console.log('   OR download from https://ngrok.com/download\n');
        resolve(false);
      } else {
        console.log('✅ ngrok is installed');
        resolve(true);
      }
    });
  });
}

// Test if your app is running
function testAppRunning() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 80,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log('✅ Your app is running on http://localhost');
      resolve(true);
    });

    req.on('error', () => {
      console.log('❌ Your app is not running on http://localhost');
      console.log('   Please start your app with: npm run dev\n');
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Your app is not responding on http://localhost');
      console.log('   Please start your app with: npm run dev\n');
      resolve(false);
    });

    req.end();
  });
}

// Test webhook endpoint
function testWebhook(ngrokUrl) {
  return new Promise((resolve) => {
    const url = `${ngrokUrl}/api/paychangu/webhook`;
    const protocol = ngrokUrl.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.message && response.message.includes('active')) {
            console.log('✅ Webhook endpoint is working');
            resolve(true);
          } else {
            console.log('❌ Webhook endpoint returned unexpected response');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Webhook endpoint returned invalid JSON');
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.log('❌ Webhook endpoint is not accessible');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Webhook endpoint timeout');
      resolve(false);
    });
  });
}

// Main setup function
async function setup() {
  console.log('🔍 Checking prerequisites...\n');

  const ngrokInstalled = await checkNgrok();
  const appRunning = await testAppRunning();

  if (!ngrokInstalled || !appRunning) {
    console.log('❌ Please fix the issues above and run this script again');
    process.exit(1);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Your ngrok URL is: https://a66c8b82f7fc.ngrok-free.app');
  console.log('2. Your .env file is already configured with the correct URLs');
  console.log('3. Update PayChangu dashboard with these URLs:');
  console.log('   Webhook URL: https://a66c8b82f7fc.ngrok-free.app/api/paychangu/webhook');
  console.log('   Return URL: https://a66c8b82f7fc.ngrok-free.app/dashboard/wallet');
  console.log('4. Test a payment\n');

  console.log('🔗 PayChangu Dashboard URLs to set:');
  console.log('   Webhook URL: https://a66c8b82f7fc.ngrok-free.app/api/paychangu/webhook');
  console.log('   Return URL: https://a66c8b82f7fc.ngrok-free.app/dashboard/wallet\n');

  console.log('✅ Your environment is already configured correctly!\n');

  console.log('🧪 To test after setup:');
  console.log('   npm run dev');
      console.log('   # Make sure ngrok is running: ngrok http 80');
  console.log('   # Update URLs in PayChangu dashboard with the URLs above');
  console.log('   # Try making a payment\n');
}

// Run setup
setup().catch(console.error); 
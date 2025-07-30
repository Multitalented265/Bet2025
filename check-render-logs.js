// Script to check Render logs for webhook activity
const { exec } = require('child_process');

function checkRenderLogs() {
  console.log('🔍 ===== CHECKING RENDER LOGS FOR WEBHOOK ACTIVITY =====\n');
  
  // Check if we're in a Render environment
  if (process.env.RENDER) {
    console.log('✅ Running in Render environment');
    console.log('📊 Render Service ID:', process.env.RENDER_SERVICE_ID);
    console.log('📊 Render Environment:', process.env.RENDER_ENVIRONMENT);
  } else {
    console.log('⚠️ Not running in Render environment');
  }
  
  console.log('\n📋 Instructions to check Render logs:');
  console.log('1. Go to https://dashboard.render.com');
  console.log('2. Find your service: bet2025-2');
  console.log('3. Click on "Logs" tab');
  console.log('4. Look for webhook-related log entries');
  console.log('5. Search for these keywords:');
  console.log('   - "WEBHOOK REQUEST RECEIVED"');
  console.log('   - "PayChangu webhook received"');
  console.log('   - "Webhook processed successfully"');
  console.log('   - "Transaction already processed"');
  
  console.log('\n🔍 Expected webhook log entries:');
  console.log('✅ "🔔 ===== WEBHOOK REQUEST RECEIVED ====="');
  console.log('✅ "📅 Timestamp: [ISO timestamp]"');
  console.log('✅ "🌐 Request URL: [webhook URL]"');
  console.log('✅ "📦 Raw request body: [JSON data]"');
  console.log('✅ "🔍 PayChangu webhook received: [payment data]"');
  
  console.log('\n❌ If you don\'t see these logs, it means:');
  console.log('   1. PayChangu is not sending webhooks to your URL');
  console.log('   2. Webhooks are being sent but failing before reaching your code');
  console.log('   3. There\'s a network/routing issue');
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Verify webhook URL in PayChangu dashboard');
  console.log('2. Check PayChangu webhook logs in their dashboard');
  console.log('3. Test webhook endpoint manually');
  console.log('4. Contact PayChangu support');
  
  console.log('\n📊 Current webhook configuration:');
  console.log('   URL: https://bet2025-2.onrender.com/api/paychangu/webhook');
  console.log('   Secret: sec-test-nHJdcdZvRDwsVpJfpilTcrdqom7MWVsB');
  console.log('   Status: Enabled');
  
  console.log('\n🧪 To test webhook manually:');
  console.log('   Run: node test-webhook-comprehensive.js');
  
  console.log('\n📝 To monitor webhook activity:');
  console.log('   Run: node monitor-webhooks.js');
}

checkRenderLogs(); 
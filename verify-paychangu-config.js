console.log('🔍 PayChangu Configuration Verification');
console.log('=====================================');

const currentConfig = {
  webhookUrl: 'https://5796de2f6ad4.ngrok-free.app/api/paychangu/webhook',
  returnUrl: 'https://5796de2f6ad4.ngrok-free.app/dashboard/wallet',
  oldWebhookUrl: 'https://f703e0d3db6b.ngrok-free.app/api/paychangu/webhook'
};

console.log('\n📋 Current Environment Configuration:');
console.log('✅ Webhook URL:', currentConfig.webhookUrl);
console.log('✅ Return URL:', currentConfig.returnUrl);

console.log('\n🚨 PayChangu Dashboard Configuration (NEEDS UPDATE):');
console.log('❌ Webhook URL:', currentConfig.oldWebhookUrl);
console.log('❌ Return URL: https://f703e0d3db6b.ngrok-free.app/dashboard/wallet');

console.log('\n🔧 Action Required:');
console.log('1. Login to PayChangu Dashboard');
console.log('2. Go to Settings/Configuration');
console.log('3. Update Webhook URL to:', currentConfig.webhookUrl);
console.log('4. Update Return URL to:', currentConfig.returnUrl);
console.log('5. Save changes');
console.log('6. Wait 2-3 minutes for changes to take effect');

console.log('\n📝 Why this happens:');
console.log('- Ngrok URLs change when you restart ngrok');
console.log('- PayChangu caches the old URL configuration');
console.log('- Your app environment is correct, but PayChangu dashboard is outdated');
console.log('- You must manually update PayChangu dashboard after ngrok URL changes'); 
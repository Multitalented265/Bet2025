// Test runner for webhook parameters
console.log('🧪 Running webhook parameter test...\n');

// Import and run the test
const { exec } = require('child_process');

exec('node test-webhook-url.js', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Test execution error:', error);
    return;
  }
  
  if (stderr) {
    console.error('❌ Test stderr:', stderr);
  }
  
  console.log('📊 Test Output:');
  console.log(stdout);
  
  console.log('\n🎯 TEST COMPLETED');
  console.log('Check the output above to verify webhook parameters are present.');
}); 
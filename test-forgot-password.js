// Simple test script to verify forgot password functionality
// Run this with: node test-forgot-password.js

const testForgotPassword = async () => {
  console.log('🧪 Testing Admin Forgot Password Functionality...\n');

  const testCases = [
    {
      name: 'Valid email',
      email: 'admin@example.com',
      expectedSuccess: true
    },
    {
      name: 'Empty email',
      email: '',
      expectedSuccess: false
    },
    {
      name: 'Invalid email format',
      email: 'invalid-email',
      expectedSuccess: false
    },
    {
      name: 'Email with spaces',
      email: '  admin@example.com  ',
      expectedSuccess: true
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Email: "${testCase.email}"`);
    
    try {
      const response = await fetch('http://localhost:80/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testCase.email }),
      });

      const data = await response.json();
      
      console.log(`Response Status: ${response.status}`);
      console.log(`Success: ${data.success}`);
      console.log(`Message: ${data.message}`);
      
      if (data.success === testCase.expectedSuccess) {
        console.log('✅ Test PASSED\n');
      } else {
        console.log('❌ Test FAILED\n');
      }
    } catch (error) {
      console.log(`❌ Test FAILED - Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Forgot password functionality test completed!');
  console.log('\n📝 Note: Check the server console for detailed logs of password reset requests.');
};

// Run the test if this file is executed directly
if (require.main === module) {
  testForgotPassword().catch(console.error);
}

module.exports = { testForgotPassword }; 
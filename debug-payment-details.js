// Debug script to identify where paymentDetails null log is coming from
// This script will help us track down the source of the paymentDetails null log

console.log('🔍 Starting paymentDetails debug script...');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected');
  
  // Override console.log to capture paymentDetails logs
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('paymentDetails')) {
      console.error('🚨 PAYMENTDETAILS LOG DETECTED:', {
        message: message,
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      });
    }
    originalConsoleLog.apply(console, args);
  };
  
  // Monitor URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  const txRef = urlParams.get('tx_ref');
  
  console.log('🔍 URL Parameters:', {
    paymentStatus,
    txRef,
    hasPaymentStatus: !!paymentStatus,
    hasTxRef: !!txRef
  });
  
  // Check for any global variables that might contain paymentDetails
  if (window.paymentDetails !== undefined) {
    console.log('🚨 Global paymentDetails found:', window.paymentDetails);
  }
  
  // Monitor localStorage and sessionStorage
  try {
    const localStoragePayment = localStorage.getItem('paymentDetails');
    const sessionStoragePayment = sessionStorage.getItem('paymentDetails');
    
    if (localStoragePayment) {
      console.log('🚨 paymentDetails found in localStorage:', localStoragePayment);
    }
    if (sessionStoragePayment) {
      console.log('🚨 paymentDetails found in sessionStorage:', sessionStoragePayment);
    }
  } catch (error) {
    console.log('📋 No paymentDetails in storage');
  }
  
} else {
  console.log('🖥️ Node.js environment detected');
  
  // Check for any environment variables or global variables
  if (global.paymentDetails !== undefined) {
    console.log('🚨 Global paymentDetails found:', global.paymentDetails);
  }
  
  // Check process.env for any payment-related variables
  const paymentEnvVars = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('payment') || 
    key.toLowerCase().includes('paychangu')
  );
  
  if (paymentEnvVars.length > 0) {
    console.log('🔍 Payment-related environment variables:', paymentEnvVars);
  }
}

// Test PayChangu configuration
async function testPayChanguConfig() {
  try {
    const response = await fetch('/api/paychangu/config');
    const config = await response.json();
    console.log('✅ PayChangu config loaded:', config);
    
    // Check if config contains any null values
    const nullValues = [];
    function findNullValues(obj, path = '') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (value === null) {
          nullValues.push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
          findNullValues(value, currentPath);
        }
      }
    }
    
    findNullValues(config);
    if (nullValues.length > 0) {
      console.log('🚨 Null values found in config:', nullValues);
    }
    
  } catch (error) {
    console.error('❌ Failed to load PayChangu config:', error);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPayChanguConfig };
}

// Run the test if in browser
if (typeof window !== 'undefined') {
  testPayChanguConfig();
} 
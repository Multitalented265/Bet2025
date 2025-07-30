// Webhook monitoring script
const fs = require('fs');
const path = require('path');

const LOG_FILE = 'webhook-activity.log';
const MONITOR_INTERVAL = 30000; // 30 seconds

function logActivity(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logEntry);
}

function checkWebhookEndpoint() {
  const webhookUrl = 'https://bet2025-2.onrender.com/api/paychangu/webhook';
  
  fetch(webhookUrl, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      logActivity(`✅ Webhook endpoint is accessible: ${data.message}`);
    })
    .catch(error => {
      logActivity(`❌ Webhook endpoint error: ${error.message}`);
    });
}

function checkRecentActivity() {
  // Check if log file exists and has recent entries
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    const lastModified = new Date(stats.mtime);
    const now = new Date();
    const timeDiff = now - lastModified;
    
    if (timeDiff < 300000) { // 5 minutes
      logActivity(`📊 Log file was last modified: ${lastModified.toISOString()}`);
    } else {
      logActivity(`⚠️ No recent webhook activity detected (last: ${lastModified.toISOString()})`);
    }
  } else {
    logActivity(`📝 Creating new webhook activity log file`);
  }
}

function startMonitoring() {
  console.log('🔍 ===== WEBHOOK MONITORING STARTED =====');
  console.log(`📝 Log file: ${LOG_FILE}`);
  console.log(`⏰ Check interval: ${MONITOR_INTERVAL / 1000} seconds`);
  console.log(`🌐 Webhook URL: https://bet2025-2.onrender.com/api/paychangu/webhook`);
  console.log('Press Ctrl+C to stop monitoring\n');
  
  // Initial check
  checkWebhookEndpoint();
  checkRecentActivity();
  
  // Set up periodic monitoring
  setInterval(() => {
    logActivity('🔍 Periodic webhook endpoint check...');
    checkWebhookEndpoint();
    checkRecentActivity();
  }, MONITOR_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Webhook monitoring stopped');
  process.exit(0);
});

// Start monitoring
startMonitoring(); 
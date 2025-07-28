const http = require('http');
const url = require('url');

// Simple redirect server for port 80
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  console.log('🔍 Redirect request received:', {
    path: parsedUrl.pathname,
    query: parsedUrl.query
  });
  
  // Check if this is a PayChangu callback
  if (parsedUrl.pathname === '/api/paychangu/callback') {
    const txRef = parsedUrl.query.tx_ref;
    const status = parsedUrl.query.status;
    
    // Redirect to the correct port
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost';
    const redirectUrl = `${baseUrl}/api/paychangu/callback?tx_ref=${txRef}&status=${status}`;
    
    console.log('🔄 Redirecting to:', redirectUrl);
    
    res.writeHead(302, {
      'Location': redirectUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end();
  } else {
    // For other requests, redirect to the main app
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost';
    const redirectUrl = `${baseUrl}${req.url}`;
    
    console.log('🔄 Redirecting to:', redirectUrl);
    
    res.writeHead(302, {
      'Location': redirectUrl,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end();
  }
});

const PORT = 80;

server.listen(PORT, () => {
  console.log(`🚀 Redirect server running on port ${PORT}`);
  console.log('📋 This will redirect PayChangu callbacks to localhost');
  console.log('⚠️  Note: This requires admin privileges to run on port 80');
});

server.on('error', (error) => {
  if (error.code === 'EACCES') {
    console.error('❌ Permission denied. Try running with admin privileges:');
    console.error('   sudo node redirect-handler.js (Linux/Mac)');
    console.error('   Run as Administrator (Windows)');
  } else {
    console.error('❌ Server error:', error);
  }
}); 
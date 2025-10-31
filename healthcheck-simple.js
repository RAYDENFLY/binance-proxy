// Simple health check script untuk debugging
// Usage: node healthcheck-simple.js

const http = require('http');

const PORT = process.env.PORT || 80;

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log(`Testing health check at http://localhost:${PORT}/api/health`);

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (error) => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();

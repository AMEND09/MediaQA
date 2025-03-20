const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate self-signed certificates for local HTTPS development
console.log('Generating self-signed certificates for HTTPS...');

try {
  // Check if OpenSSL is available
  execSync('openssl version', { stdio: 'ignore' });
  
  // Generate certificates if they don't exist
  if (!fs.existsSync('server.key') || !fs.existsSync('server.cert')) {
    console.log('Creating new certificates...');
    
    execSync(
      'openssl req -nodes -new -x509 ' +
      '-keyout server.key -out server.cert ' +
      '-subj "/CN=localhost" ' +
      '-days 365'
    );
    
    console.log('Certificates generated successfully!');
  } else {
    console.log('Certificates already exist.');
  }
  
  console.log('\nYou can now run:');
  console.log('1. npm run build');
  console.log('2. node serve.js');
  console.log('\nThen visit https://localhost:3443 in your browser.');
  console.log('Note: You will need to accept the security exception for the self-signed certificate.');
  
} catch (error) {
  console.error('Error generating certificates:', error.message);
  console.log('\nAlternative methods:');
  console.log('1. Install mkcert for proper local certificates');
  console.log('2. Use a production HTTPS hosting solution');
  console.log('3. For development only, you can also try running Chrome with:');
  console.log('   --unsafely-treat-insecure-origin-as-secure="http://localhost:3000"');
  console.log('   --user-data-dir=/tmp/chrome-dev');
}

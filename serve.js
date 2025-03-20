/**
 * Simple HTTPS server for development
 * This helps overcome the MediaDevices API restrictions
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = 3443;

// Create self-signed certificates for local HTTPS
// In a real production environment, you would use proper certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// All other requests go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Create HTTPS server
const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
  console.log('Media devices should now work correctly');
});

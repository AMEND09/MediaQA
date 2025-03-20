/**
 * This script fixes common issues that prevent React from starting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Fixing React App setup...');

// Make sure we have a package.json
if (!fs.existsSync('package.json')) {
  console.log('Creating package.json...');
  
  const packageJson = {
    "name": "gemini-media-qa",
    "version": "0.1.0",
    "private": true,
    "dependencies": {
      "@emotion/react": "^11.11.1",
      "@emotion/styled": "^11.11.0",
      "@mui/icons-material": "^5.14.3",
      "@mui/material": "^5.14.3",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1",
      "web-vitals": "^2.1.4"
    },
    "scripts": {
      "prestart": "node ./public/create-assets.js",
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    "eslintConfig": {
      "extends": [
        "react-app",
        "react-app/jest"
      ]
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

// Make sure we have a public folder with required files
if (!fs.existsSync('public')) {
  console.log('Creating public folder...');
  fs.mkdirSync('public', { recursive: true });
}

// Create index.html if it doesn't exist
if (!fs.existsSync('public/index.html')) {
  console.log('Creating index.html...');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3498db" />
    <meta
      name="description"
      content="Media Q&A App powered by Google Gemini - Analyze documents, images, videos and more"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
    />
    <title>Media Q&A with Gemini</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  
  fs.writeFileSync('public/index.html', indexHtml);
}

// Create manifest.json if it doesn't exist
if (!fs.existsSync('public/manifest.json')) {
  console.log('Creating manifest.json...');
  const manifestJson = {
    "short_name": "Media Q&A",
    "name": "Media Q&A with Gemini",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      },
      {
        "src": "logo192.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "logo512.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#3498db",
    "background_color": "#f5f5f5"
  };
  
  fs.writeFileSync('public/manifest.json', JSON.stringify(manifestJson, null, 2));
}

// Create robots.txt if it doesn't exist
if (!fs.existsSync('public/robots.txt')) {
  console.log('Creating robots.txt...');
  fs.writeFileSync('public/robots.txt', 'User-agent: *\nDisallow:\n');
}

// Make sure we have the create-assets.js script
const createAssetsPath = path.join('public', 'create-assets.js');
if (!fs.existsSync(createAssetsPath)) {
  console.log('Creating asset creation script...');
  const createAssets = `const fs = require('fs');
const path = require('path');

try {
  // Create simple placeholder files
  const faviconPath = path.join(__dirname, 'favicon.ico');
  const logo192Path = path.join(__dirname, 'logo192.png');
  const logo512Path = path.join(__dirname, 'logo512.png');

  if (!fs.existsSync(faviconPath)) {
    console.log('Creating favicon.ico');
    fs.writeFileSync(faviconPath, Buffer.alloc(0));
  }

  if (!fs.existsSync(logo192Path)) {
    console.log('Creating logo192.png');
    fs.writeFileSync(logo192Path, Buffer.alloc(0));
  }

  if (!fs.existsSync(logo512Path)) {
    console.log('Creating logo512.png');
    fs.writeFileSync(logo512Path, Buffer.alloc(0));
  }

  console.log('Assets created successfully');
} catch (error) {
  console.error('Error creating assets:', error);
  process.exit(1);
}
`;

  fs.writeFileSync(createAssetsPath, createAssets);
}

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('Creating .env file...');
  fs.writeFileSync('.env', 'REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE\n');
}

// Make sure we have a src folder with the necessary files
if (!fs.existsSync('src')) {
  console.log('Creating src folder...');
  fs.mkdirSync('src', { recursive: true });
}

console.log('Running create-assets script...');
try {
  require('./public/create-assets.js');
} catch (error) {
  console.error('Error running create-assets script:', error);
}

console.log('Checking dependencies...');
try {
  // Check if we have node_modules
  if (!fs.existsSync('node_modules')) {
    console.log('Installing dependencies (this may take a while)...');
    execSync('npm install', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error installing dependencies:', error);
  console.log('Please run "npm install" manually.');
}

console.log('Setup complete. You can now run "npm start" to start the development server.');

@echo off
echo Starting React Development Server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo npm is not installed or not in PATH. Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

REM Ensure the public directory exists
if not exist public mkdir public

REM Create script to handle assets
if not exist public\create-assets.js (
  echo Creating asset creation script...
  echo const fs = require('fs');> public\create-assets.js
  echo const path = require('path');>> public\create-assets.js
  echo.>> public\create-assets.js
  echo // Ensure the public directory exists>> public\create-assets.js
  echo try {>> public\create-assets.js
  echo   // Create simple placeholder files>> public\create-assets.js
  echo   const faviconPath = path.join(__dirname, 'favicon.ico');>> public\create-assets.js
  echo   const logo192Path = path.join(__dirname, 'logo192.png');>> public\create-assets.js
  echo   const logo512Path = path.join(__dirname, 'logo512.png');>> public\create-assets.js
  echo.>> public\create-assets.js
  echo   if (!fs.existsSync(faviconPath)) {>> public\create-assets.js
  echo     console.log('Creating favicon.ico');>> public\create-assets.js
  echo     fs.writeFileSync(faviconPath, Buffer.alloc(0));>> public\create-assets.js
  echo   }>> public\create-assets.js
  echo.>> public\create-assets.js
  echo   if (!fs.existsSync(logo192Path)) {>> public\create-assets.js
  echo     console.log('Creating logo192.png');>> public\create-assets.js
  echo     fs.writeFileSync(logo192Path, Buffer.alloc(0));>> public\create-assets.js
  echo   }>> public\create-assets.js
  echo.>> public\create-assets.js
  echo   if (!fs.existsSync(logo512Path)) {>> public\create-assets.js
  echo     console.log('Creating logo512.png');>> public\create-assets.js
  echo     fs.writeFileSync(logo512Path, Buffer.alloc(0));>> public\create-assets.js
  echo   }>> public\create-assets.js
  echo.>> public\create-assets.js
  echo   console.log('Assets created successfully');>> public\create-assets.js
  echo } catch (error) {>> public\create-assets.js
  echo   console.error('Error creating assets:', error);>> public\create-assets.js
  echo   process.exit(1);>> public\create-assets.js
  echo }>> public\create-assets.js
)

REM Create the default environment file if it doesn't exist
if not exist .env (
  echo Creating default .env file...
  echo REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE> .env
)

REM Check if node_modules exists
if not exist node_modules (
  echo Node modules not found. Installing dependencies...
  npm install
  if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies. Please try running 'npm install' manually.
    pause
    exit /b 1
  )
)

echo Starting development server...
npm start

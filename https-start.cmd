@echo off
echo === React App HTTPS Launcher ===
echo This script will prepare and launch the app with HTTPS for media access

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

:: Install required dependencies
echo Checking dependencies...
call npm install express --save 2>nul

:: Generate certificates if needed
echo Generating certificates for HTTPS...
node generate-certificates.js
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Certificate generation failed. MediaDevices API may not work.
  pause
)

:: Build the app
echo Building React app...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Failed to build the app
  pause
  exit /b 1
)

:: Start HTTPS server
echo Starting HTTPS server...
node serve.js

pause

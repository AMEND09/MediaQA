@echo off
echo Fixing React app and starting development server...

REM Ensure node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Node.js is not installed. Please install it from https://nodejs.org/
  pause
  exit /b 1
)

REM Run the fix script to set up the environment
node fix-start.js
if %ERRORLEVEL% NEQ 0 (
  echo Failed to run fix-start.js
  pause
  exit /b 1
)

REM Start the React development server
echo Starting development server...
npx react-scripts start

REM If the server failed to start, show an error message
if %ERRORLEVEL% NEQ 0 (
  echo Failed to start React development server.
  echo Try running 'npm install' and then 'npm start' manually.
  pause
)

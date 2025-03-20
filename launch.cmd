@echo off
echo === React App Launcher ===
echo This script will help resolve connection issues and launch the app

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

:: Create public directory if it doesn't exist
if not exist "public" (
  echo Creating public directory...
  mkdir public
)

:: Run the asset creation script if it exists
if exist "public\create-assets.js" (
  echo Running asset creation script...
  node public\create-assets.js
)

:: Check for dependencies
if not exist "node_modules" (
  echo Installing dependencies...
  npm install
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
  )
)

:: Kill any existing React server processes that might be blocking ports
echo Closing any existing React development servers...
taskkill /f /im node.exe >nul 2>nul

:: Wait a moment for ports to be released
timeout /t 2 >nul

:: Start the React app directly (bypassing VS Code Live Preview)
echo Starting React application on port 3000...
echo.
echo If your browser doesn't open automatically, go to:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server when done
echo.
npm start

pause

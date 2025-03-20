# Fixing VS Code Live Preview WebSocket Connection Issues

If you're seeing the error:

> Firefox can't establish a connection to the server at ws://127.0.0.1:3001/...

This is likely due to VS Code's Live Preview extension having conflicts with React's development server. Here are some solutions:

## Solution 1: Use the launch.cmd Script

1. Close VS Code completely
2. Run the `launch.cmd` script included in this directory
3. This script will:
   - Ensure all dependencies are installed
   - Kill any conflicting Node processes
   - Start the React app directly on port 3000

## Solution 2: Disable VS Code Live Preview

1. In VS Code, go to Extensions (Ctrl+Shift+X)
2. Search for "Live Preview"
3. Disable this extension when working with React apps
4. Restart VS Code
5. Run `npm start` from the terminal

## Solution 3: Change VS Code Live Preview Port

1. Open VS Code Settings (Ctrl+,)
2. Search for "livePreview.serverPort"
3. Change the default port from 3001 to something else (e.g., 5500)
4. Restart VS Code

## Solution 4: Use a Different Browser

VS Code's Live Preview may be using your default browser. Try:
1. Close all browser windows
2. Run `npm start` from a terminal
3. Let the React script open the browser automatically

## If All Else Fails

Run the React app from outside VS Code:
1. Open a command prompt 
2. Navigate to your project directory
3. Run `npm start`

This bypasses any VS Code extensions that might interfere with the development server.

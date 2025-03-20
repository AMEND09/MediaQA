import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Polyfill for legacy browsers
if (!window.SpeechRecognition && window.webkitSpeechRecognition) {
  window.SpeechRecognition = window.webkitSpeechRecognition;
}

if (!window.AudioContext && window.webkitAudioContext) {
  window.AudioContext = window.webkitAudioContext;
}

// Log environment info for debugging
if (process.env.NODE_ENV === 'development') {
  console.log(`
React Media Q&A App
------------------
Environment: ${process.env.NODE_ENV}
React Version: ${React.version}
Browser: ${navigator.userAgent}
Media Devices API: ${navigator.mediaDevices ? 'Available' : 'Not available'}
Secure Context: ${window.isSecureContext ? 'Yes' : 'No'}
  `);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

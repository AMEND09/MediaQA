import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

function BrowserCompatibilityChecker() {
  const [open, setOpen] = useState(false);
  const [compatibilityResults, setCompatibilityResults] = useState({
    mediaDevices: { supported: false, details: '' },
    webRTC: { supported: false, details: '' },
    audioContext: { supported: false, details: '' },
    webSpeech: { supported: false, details: '' },
    secureContext: { supported: false, details: '' },
    browser: { supported: false, details: '' }
  });
  
  // Check for critical issues that would severely impact app functionality
  const hasCriticalIssues = !compatibilityResults.mediaDevices.supported || 
                            !compatibilityResults.secureContext.supported;
  
  // Check browser compatibility
  useEffect(() => {
    const checkCompatibility = () => {
      // Check media devices
      const hasMediaDevices = typeof navigator !== 'undefined' && 
                              navigator.mediaDevices && 
                              typeof navigator.mediaDevices.getUserMedia === 'function';
      
      // Check WebRTC support
      const hasWebRTC = typeof RTCPeerConnection !== 'undefined';
      
      // Check Audio Context
      const hasAudioContext = typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined';
      
      // Check Web Speech API
      const hasWebSpeech = typeof (window.SpeechRecognition || window.webkitSpeechRecognition) !== 'undefined';
      
      // Check if in secure context
      const isSecureContext = window.isSecureContext === true;
      
      // Check browser
      const userAgent = navigator.userAgent;
      const isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1;
      const isFirefox = userAgent.indexOf("Firefox") > -1;
      const isEdge = userAgent.indexOf("Edg") > -1;
      const isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1;
      const browserInfo = isChrome ? "Google Chrome" : 
                          isFirefox ? "Mozilla Firefox" : 
                          isEdge ? "Microsoft Edge" : 
                          isSafari ? "Apple Safari" : 
                          "Unknown browser";
      const isSupportedBrowser = isChrome || isFirefox || isEdge;
      
      setCompatibilityResults({
        mediaDevices: { 
          supported: hasMediaDevices, 
          details: hasMediaDevices ? 'Available' : 'Not available - camera and microphone features will not work'
        },
        webRTC: { 
          supported: hasWebRTC, 
          details: hasWebRTC ? 'Available' : 'Not available - some features may not work properly'
        },
        audioContext: { 
          supported: hasAudioContext, 
          details: hasAudioContext ? 'Available' : 'Not available - audio recording may not work'
        },
        webSpeech: { 
          supported: hasWebSpeech, 
          details: hasWebSpeech ? 'Available' : 'Not available - speech recognition will not work'
        },
        secureContext: { 
          supported: isSecureContext, 
          details: isSecureContext ? 'Using secure context' : 'Not using secure context (HTTPS or localhost) - media features will be limited'
        },
        browser: { 
          supported: isSupportedBrowser,
          details: `${browserInfo}${isSupportedBrowser ? ' (supported)' : ' (limited support)'}`
        }
      });
      
      // Show dialog if there are critical issues
      if (!hasMediaDevices || !isSecureContext) {
        setOpen(true);
      }
    };
    
    // Run the compatibility check
    checkCompatibility();
  }, []);
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Browser Compatibility Check</DialogTitle>
      <DialogContent>
        {hasCriticalIssues && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              Your browser environment has compatibility issues that may limit app functionality:
            </Typography>
          </Alert>
        )}
        
        <List>
          {Object.entries(compatibilityResults).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemIcon>
                {value.supported ? 
                  <CheckIcon color="success" /> : 
                  key === 'mediaDevices' || key === 'secureContext' ? 
                    <ErrorIcon color="error" /> : 
                    <WarningIcon color="warning" />
                }
              </ListItemIcon>
              <ListItemText 
                primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
                secondary={value.details} 
                primaryTypographyProps={{
                  fontWeight: value.supported ? 'normal' : 'bold'
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recommendations for best experience:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Use Chrome, Firefox, or Edge for full functionality" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Ensure the site is accessed via HTTPS or localhost" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Grant camera and microphone permissions when prompted" />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          Continue Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BrowserCompatibilityChecker;

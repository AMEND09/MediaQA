import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Collapse, Snackbar, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon from '@mui/icons-material/Mic';

/**
 * Helper component for Firefox-specific media permissions
 * Shows helpful guidance when Firefox is detected and permissions might be needed
 */
function FirefoxHelper() {
  const [isFirefox, setIsFirefox] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [open, setOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: null,
    microphone: null
  });

  useEffect(() => {
    // Detect Firefox
    const isFF = navigator.userAgent.indexOf("Firefox") > -1;
    setIsFirefox(isFF);
    
    // Only show helper in Firefox
    if (isFF) {
      // Check permissions if available
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        // Check camera permission
        navigator.permissions.query({ name: 'camera' })
          .then(status => {
            setPermissionStatus(prev => ({ ...prev, camera: status.state }));
            
            // Show guidance if permissions are denied or not determined
            if (status.state === 'denied') {
              setHasError(true);
              setOpen(true);
            }
            
            // Listen for changes
            status.onchange = () => {
              setPermissionStatus(prev => ({ ...prev, camera: status.state }));
              if (status.state === 'granted') {
                setHasError(false);
              }
            };
          })
          .catch(err => {
            console.log("Could not check camera permission:", err);
          });
        
        // Check microphone permission
        navigator.permissions.query({ name: 'microphone' })
          .then(status => {
            setPermissionStatus(prev => ({ ...prev, microphone: status.state }));
            
            // Show guidance if permissions are denied or not determined
            if (status.state === 'denied' && !hasError) {
              setHasError(true);
              setOpen(true);
            }
            
            // Listen for changes
            status.onchange = () => {
              setPermissionStatus(prev => ({ ...prev, microphone: status.state }));
              if (status.state === 'granted' && permissionStatus.camera !== 'denied') {
                setHasError(false);
              }
            };
          })
          .catch(err => {
            console.log("Could not check microphone permission:", err);
          });
      }
      
      // Show guidance after a delay
      const timer = setTimeout(() => {
        if (!open && !hasError) {
          setOpen(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isFirefox, hasError, open, permissionStatus.camera]);
  
  const handleRequestPermission = async (device) => {
    try {
      const constraints = device === 'camera' 
        ? { video: true } 
        : { audio: true };
      
      // Request permission
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop all tracks immediately
      stream.getTracks().forEach(track => track.stop());
      
      // Close the snackbar
      setOpen(false);
    } catch (error) {
      console.error(`Error getting ${device} permission:`, error);
      setHasError(true);
    }
  };

  if (!isFirefox) return null;

  return (
    <>
      {/* Helpful snackbar for Firefox users */}
      <Snackbar
        open={open && !hasError}
        autoHideDuration={15000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpen(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          <Typography variant="body2" gutterBottom>
            Firefox requires explicit permission for camera/microphone. Allow access when prompted or test now:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={() => handleRequestPermission('camera')}
            >
              Test Camera
            </Button>
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<MicIcon />}
              onClick={() => handleRequestPermission('microphone')}
            >
              Test Mic
            </Button>
          </Box>
        </Alert>
      </Snackbar>
      
      {/* Error notification if permissions are denied */}
      <Collapse in={hasError}>
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          onClose={() => setHasError(false)}
        >
          <Typography variant="body2">
            Firefox has blocked {permissionStatus.camera === 'denied' ? 'camera' : 'microphone'} access. 
            Look for the blocked permission icon in the address bar and click "Allow."
          </Typography>
        </Alert>
      </Collapse>
    </>
  );
}

export default FirefoxHelper;

import React, { useState, useEffect } from 'react';
import { Alert, Button, Link, IconButton, Collapse, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';

function DevToolsPrompt() {
  const [open, setOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  
  useEffect(() => {
    // Only show in development mode
    setIsDev(process.env.NODE_ENV === 'development');
    
    // Check if React DevTools are installed
    const hasReactDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
    
    // If in development and no DevTools, show the prompt
    if (process.env.NODE_ENV === 'development' && !hasReactDevTools) {
      // Let the app render first before showing the alert
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Don't render anything if not in dev mode or if alert is dismissed
  if (!isDev || !open) return null;
  
  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000, maxWidth: 450 }}>
      <Collapse in={open}>
        <Alert
          severity="info"
          icon={<CodeIcon />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          For a better development experience, install React DevTools:
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              component={Link}
              href="https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi"
              target="_blank"
              rel="noopener"
            >
              Chrome
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              component={Link}
              href="https://addons.mozilla.org/en-US/firefox/addon/react-devtools/"
              target="_blank"
              rel="noopener"
            >
              Firefox
            </Button>
          </Box>
        </Alert>
      </Collapse>
    </Box>
  );
}

export default DevToolsPrompt;

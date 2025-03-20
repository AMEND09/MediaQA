import React from 'react';
import { Box, Paper, Typography, Link } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function MediaUnsupportedOverlay({ message }) {
  return (
    <Paper 
      elevation={3}
      sx={{
        p: 3,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        maxWidth: '600px',
        mx: 'auto',
        mt: 4
      }}
    >
      <ErrorOutlineIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Media Access Unavailable
      </Typography>
      
      <Typography variant="body1" paragraph>
        {message || "Camera or microphone access is not available in this environment."}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Possible solutions:
        </Typography>
        
        <Typography variant="body2" component="ul" sx={{ textAlign: 'left', maxWidth: '80%', mx: 'auto' }}>
          <li>Make sure you're using a secure connection (HTTPS or localhost)</li>
          <li>Check that camera/microphone permissions are enabled in your browser</li>
          <li>Try using a different browser (Chrome or Firefox recommended)</li>
          <li>Try uploading files instead of using camera/microphone</li>
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ mt: 2 }}>
        For more information, see the <Link href="https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia" target="_blank" rel="noopener">MDN documentation</Link>.
      </Typography>
    </Paper>
  );
}

export default MediaUnsupportedOverlay;

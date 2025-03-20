import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useGeminiApi } from '../context/GeminiApiContext';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import YouTubeIcon from '@mui/icons-material/YouTube';

function MediaPreview({ videoRef }) {
  const { currentFile, youtubeUrl, isCameraActive } = useGeminiApi();
  
  if (isCameraActive && videoRef?.current) {
    return null; // Video is rendered in the MediaSelector component
  }
  
  if (!currentFile && !youtubeUrl) {
    return null;
  }
  
  // YouTube preview
  if (youtubeUrl) {
    const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
    
    if (!videoId) return null;
    
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Paper 
          elevation={1}
          sx={{ 
            display: 'inline-block', 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: 2,
            maxWidth: '100%'
          }}
        >
          <img 
            src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
            alt="YouTube Thumbnail"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              display: 'block'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <YouTubeIcon fontSize="large" />
          </Box>
        </Paper>
      </Box>
    );
  }
  
  // File preview
  if (currentFile) {
    // Image preview
    if (currentFile.type.startsWith('image/')) {
      return (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <img
            src={URL.createObjectURL(currentFile)}
            alt="Preview"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Box>
      );
    }
    
    // Video preview
    if (currentFile.type.startsWith('video/')) {
      return (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <video
            src={URL.createObjectURL(currentFile)}
            controls
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Box>
      );
    }
    
    // Audio preview
    if (currentFile.type.startsWith('audio/')) {
      return (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <audio
            src={URL.createObjectURL(currentFile)}
            controls
            style={{ 
              width: '100%',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          />
        </Box>
      );
    }
    
    // PDF icon
    if (currentFile.type === 'application/pdf') {
      return (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Paper 
            elevation={1}
            sx={{ 
              display: 'inline-flex', 
              flexDirection: 'column',
              alignItems: 'center',
              p: 3,
              borderRadius: 2
            }}
          >
            <PictureAsPdfIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              PDF Document
            </Typography>
          </Paper>
        </Box>
      );
    }
    
    // Text/other files
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Paper 
          elevation={1}
          sx={{ 
            display: 'inline-flex', 
            flexDirection: 'column',
            alignItems: 'center',
            p: 3,
            borderRadius: 2
          }}
        >
          <DescriptionIcon color="primary" sx={{ fontSize: 60 }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Text Document
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  return null;
}

export default MediaPreview;

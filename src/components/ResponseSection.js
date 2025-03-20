import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useGeminiApi } from '../context/GeminiApiContext';

function ResponseSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { response, isLoading } = useGeminiApi();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(response).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Answer
      </Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          minHeight: '150px', 
          mb: 2,
          backgroundColor: theme.palette.background.default
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 120 }}>
            <CircularProgress size={40} thickness={4} />
          </Box>
        ) : response ? (
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              lineHeight: 1.8 
            }}
          >
            {response}
          </Typography>
        ) : (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%', 
              minHeight: 120,
              fontStyle: 'italic'
            }}
          >
            Responses will appear here
          </Typography>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<VolumeUpIcon />}
          onClick={handleSpeak}
          disabled={isLoading || !response || isSpeaking}
          size={isMobile ? "small" : "medium"}
        >
          Read Aloud
        </Button>
        
        {isSpeaking && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStopSpeaking}
            size={isMobile ? "small" : "medium"}
          >
            Stop
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyToClipboard}
          disabled={isLoading || !response}
          size={isMobile ? "small" : "medium"}
          color={copiedToClipboard ? "success" : "primary"}
        >
          {copiedToClipboard ? "Copied!" : "Copy"}
        </Button>
      </Box>
    </Box>
  );
}

export default ResponseSection;

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  IconButton,
  useMediaQuery,
  Paper,
  InputAdornment
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import { useGeminiApi } from '../context/GeminiApiContext';
import ChatInterface from './ChatInterface';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

function QuestionSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const { 
    askQuestion, 
    startSpeechRecognition,
    currentFiles,
    youtubeUrl,
    isCameraActive,
    isRecordingAudio,
    isLoading
  } = useGeminiApi();
  
  const hasMedia = currentFiles.length > 0 || !!youtubeUrl || isCameraActive || isRecordingAudio;
  
  const handleAsk = async () => {
    if (!question.trim()) return;
    
    try {
      await askQuestion(question);
      setQuestion(''); // Clear input after sending
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };
  
  const handleSpeechRecognition = async () => {
    try {
      setIsListening(true);
      const transcript = await startSpeechRecognition();
      if (transcript) {
        setQuestion(transcript);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Box>
      <ChatInterface />
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 1.5, 
          display: 'flex', 
          alignItems: 'flex-end',
          gap: 1,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper'
        }}
      >
        <StyledTextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSpeechRecognition} 
                  disabled={isLoading}
                  color={isListening ? "error" : "default"}
                  sx={{ 
                    animation: isListening ? 'pulse 1.5s infinite' : 'none' 
                  }}
                  size="small"
                >
                  <MicIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAsk}
          disabled={!hasMedia || isLoading || !question.trim()}
          sx={{ minWidth: 0, p: '8px' }}
        >
          <SendIcon fontSize="small" />
        </Button>
      </Paper>
      
      {!hasMedia && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            color: 'error.main', 
            fontSize: '0.75rem', 
            mt: 0.5
          }}
        >
          Please select a media source first
        </Box>
      )}
    </Box>
  );
}

export default QuestionSection;

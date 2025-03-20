import React, { useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  useMediaQuery,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useGeminiApi } from '../context/GeminiApiContext';
import MessageAttachments from './MessageAttachments';

function ChatInterface() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { messages, isLoading, response } = useGeminiApi();
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, response, isLoading]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'calc(100vh - 150px)' : '450px',
      overflowY: 'auto',
      pt: 2,
      pb: 2,
      px: 1,
      mb: 2,
      backgroundColor: theme.palette.grey[50],
      borderRadius: 1,
    }}>
      {/* Welcome message if no messages yet */}
      {messages.length === 0 && !isLoading && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          color: theme.palette.text.secondary,
          px: 3
        }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Media Q&A
          </Typography>
          <Typography variant="body1">
            Upload files, share a YouTube link, or use your camera/microphone, 
            then ask a question to start a conversation.
          </Typography>
        </Box>
      )}
      
      {/* Render chat messages */}
      {messages.map((message, index) => (
        <Box key={index} sx={{ mb: 2, maxWidth: '85%', alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.role === 'assistant' ? 'flex-start' : 'flex-end' }}>
            {/* Show time in correct position */}
            <Typography 
              variant="caption" 
              color="textSecondary" 
              sx={{ 
                mb: 0.5, 
                alignSelf: message.role === 'assistant' ? 'flex-start' : 'flex-end',
                fontSize: '0.65rem'
              }}
            >
              {message.role === 'assistant' ? 'Gemini' : 'You'} • {formatTime(message.timestamp)}
            </Typography>
            
            {/* Show files if the message has them */}
            {message.files && message.files.length > 0 && (
              <MessageAttachments files={message.files} />
            )}
            
            {/* Show YouTube URL if present */}
            {message.youtubeUrl && (
              <Chip 
                label={`YouTube: ${message.youtubeUrl.substring(0, 30)}...`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1, maxWidth: '100%' }}
              />
            )}
            
            {/* Message Bubble */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                maxWidth: '100%',
                wordBreak: 'break-word',
                backgroundColor: message.role === 'assistant' 
                  ? theme.palette.background.paper
                  : theme.palette.primary.main,
                color: message.role === 'assistant' 
                  ? theme.palette.text.primary 
                  : theme.palette.primary.contrastText,
                ...(message.role === 'error' && {
                  backgroundColor: theme.palette.error.light,
                  color: theme.palette.error.contrastText,
                }),
                // Add chat bubble tail
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  ...(message.role === 'assistant'
                    ? {
                        borderWidth: '0 10px 10px 0',
                        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
                        top: 0,
                        left: -10,
                      }
                    : {
                        borderWidth: '0 0 10px 10px',
                        borderColor: `transparent transparent transparent ${theme.palette.primary.main}`,
                        top: 0,
                        right: -10,
                      }),
                },
              }}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  children={message.content}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          children={String(children).replace(/\n$/, '')}
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                />
              ) : (
                <Typography variant="body1">{message.content}</Typography>
              )}
            </Paper>
          </Box>
        </Box>
      ))}
      
      {/* Loading message when waiting for response */}
      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          mb: 2, 
          maxWidth: '85%',
          alignSelf: 'flex-start'
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 10px 10px 0',
                borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
                top: 0,
                left: -10,
              },
            }}
          >
            <CircularProgress size={16} thickness={5} />
            <Typography>
              {response || "Thinking..."}
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
}

export default ChatInterface;

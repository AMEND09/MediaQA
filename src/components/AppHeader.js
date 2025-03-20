import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Box, 
  Tooltip, 
  Chip,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import KeyIcon from '@mui/icons-material/Key';
import { useGeminiApi } from '../context/GeminiApiContext';
import { useApiKey } from '../context/ApiKeyContext';
import ApiKeyDialog from './ApiKeyDialog';

const LiveChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.6 },
    '100%': { opacity: 1 }
  }
}));

function AppHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isLiveMode, toggleLiveMode, isLoading } = useGeminiApi();
  const { isCustomKey } = useApiKey();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            flexGrow: 1, 
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 600,
            my: 1
          }}
        >
          Media Q&A
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Configure API Key">
            <IconButton 
              color="inherit" 
              onClick={() => setApiKeyDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              <KeyIcon color={isCustomKey ? "inherit" : "warning"} />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch 
                checked={isLiveMode} 
                onChange={toggleLiveMode}
                disabled={isLoading}
                color="default"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                {isMobile ? 'Live' : 'Live Mode'}
              </Typography>
            }
            sx={{ color: 'white' }}
          />
          
          {isLiveMode && (
            <LiveChip 
              size="small" 
              label="LIVE" 
            />
          )}
          
          <Tooltip 
            title="Live mode connects directly to Gemini's API for real-time interaction, enabling streaming responses as they're generated."
            arrow
          >
            <InfoIcon sx={{ ml: 1, fontSize: 20, color: 'rgba(255,255,255,0.7)' }} />
          </Tooltip>
        </Box>
      </Toolbar>
      
      <ApiKeyDialog 
        open={apiKeyDialogOpen} 
        onClose={() => setApiKeyDialogOpen(false)}
      />
    </AppBar>
  );
}

export default AppHeader;

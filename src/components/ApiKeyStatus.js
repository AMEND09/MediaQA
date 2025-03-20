import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Chip, 
  Typography, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApiKey } from '../context/ApiKeyContext';
import ApiKeyDialog from './ApiKeyDialog';

function ApiKeyStatus() {
  const { apiKey, isCustomKey, DEFAULT_API_KEY } = useApiKey();
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  // Determine status color and icon
  const getStatusInfo = () => {
    if (isCustomKey) {
      return {
        color: 'success',
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Custom API Key',
        tooltip: 'Using your custom API key'
      };
    } else {
      return {
        color: 'warning',
        icon: <WarningIcon fontSize="small" />,
        label: 'Default API Key',
        tooltip: 'Using the default API key. For best results, set your own key.'
      };
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Tooltip title={statusInfo.tooltip}>
        <Chip
          icon={statusInfo.icon}
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          onClick={() => setInfoDialogOpen(true)}
          sx={{ mr: 1 }}
        />
      </Tooltip>
      
      <Button
        startIcon={<KeyIcon />}
        size="small"
        variant="outlined"
        onClick={() => setApiKeyDialogOpen(true)}
      >
        Configure API Key
      </Button>
      
      {/* API Key Dialog */}
      <ApiKeyDialog 
        open={apiKeyDialogOpen}
        onClose={() => setApiKeyDialogOpen(false)}
      />
      
      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)}>
        <DialogTitle>About API Keys</DialogTitle>
        <DialogContent>
          {!isCustomKey ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You're currently using the default API key, which may have rate limits or stop working in the future.
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              You're using your own custom API key stored in your browser.
            </Alert>
          )}
          
          <Typography variant="body2" paragraph>
            For the best experience and to avoid sharing API keys with others, we recommend using your own personal API key from Google AI Studio.
          </Typography>
          
          <Typography variant="body2">
            Your API key is stored only in your browser's local storage and never transmitted except directly to Google's APIs.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setInfoDialogOpen(false);
              setApiKeyDialogOpen(true);
            }}
          >
            Configure API Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApiKeyStatus;

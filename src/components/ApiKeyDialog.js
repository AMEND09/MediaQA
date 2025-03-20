import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Box
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useApiKey } from '../context/ApiKeyContext';

function ApiKeyDialog({ open, onClose }) {
  const { apiKey, setApiKey, resetApiKey, isCustomKey, DEFAULT_API_KEY } = useApiKey();
  const [editedKey, setEditedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  // Update local state when the dialog opens
  useEffect(() => {
    if (open) {
      setEditedKey(apiKey);
      setError('');
    }
  }, [open, apiKey]);

  const handleSave = () => {
    if (!editedKey || editedKey.trim() === '') {
      setError('API key cannot be empty');
      return;
    }

    try {
      setApiKey(editedKey);
      onClose();
    } catch (error) {
      setError(`Failed to save API key: ${error.message}`);
    }
  };

  const handleReset = () => {
    resetApiKey();
    setEditedKey(DEFAULT_API_KEY);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gemini API Key Settings</DialogTitle>
      <DialogContent>
        {!isCustomKey && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Currently using the default API key. For best results, configure your own API key.
          </Alert>
        )}

        {isCustomKey && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Using your custom API key from local storage.
          </Alert>
        )}

        <TextField
          label="Gemini API Key"
          fullWidth
          variant="outlined"
          value={editedKey || ''}
          onChange={(e) => setEditedKey(e.target.value)}
          error={!!error}
          helperText={error || ''}
          margin="normal"
          type={showKey ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle key visibility"
                  onClick={() => setShowKey(!showKey)}
                  edge="end"
                >
                  {showKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            To get your API key:
          </Typography>
          <ol style={{ paddingLeft: '1.5rem', margin: 0 }}>
            <li>Go to <Link href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</Link></li>
            <li>Create or select a project</li>
            <li>Generate or copy an existing API key</li>
            <li>Paste it above</li>
          </ol>
        </Box>

        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
          Your API key is stored only in your browser's local storage and never transmitted except to Google's APIs.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="warning">
          Reset to Default
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save API Key
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApiKeyDialog;

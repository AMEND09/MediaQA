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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box
} from '@mui/material';
import { useGeminiApi } from '../context/GeminiApiContext';

// Predefined system prompts - add a description of how they're used now
const PRESET_PROMPTS = {
  default: "You are a helpful AI assistant that specializes in analyzing documents, images, videos, and audio files. Respond to the user in a friendly, informative manner.",
  teacher: "You are an educational assistant. Analyze media in a way that explains concepts clearly for students at all levels. Use educational terms and provide explanations that would help someone learn from the content.",
  researcher: "You are a research assistant with expertise in data analysis. When analyzing media, focus on methodology, statistical significance, and academic rigor. Cite relevant academic concepts when applicable.",
  creative: "You are a creative writing assistant. Analyze media with an eye for narrative elements, artistic choices, and creative expression. Highlight aesthetic aspects and offer interpretations from a creative perspective.",
  technical: "You are a technical documentation specialist. Analyze media with precise technical details, focusing on specifications, technical processes, and implementation details. Use technical language where appropriate.",
  simple: "You are a helpful assistant that explains things simply. Analyze media and respond in straightforward language avoiding jargon. Use analogies and simple examples that anyone can understand."
};

function SystemPromptDialog({ open, onClose }) {
  const { systemPrompt, setSystemPrompt } = useGeminiApi();
  const [editedPrompt, setEditedPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('custom');
  
  // Update local state when the global prompt changes
  useEffect(() => {
    setEditedPrompt(systemPrompt);
    
    // Determine if the current prompt matches a preset
    const presetEntry = Object.entries(PRESET_PROMPTS).find(([key, value]) => value === systemPrompt);
    setSelectedPreset(presetEntry ? presetEntry[0] : 'custom');
  }, [systemPrompt, open]);
  
  const handlePresetChange = (event) => {
    const preset = event.target.value;
    setSelectedPreset(preset);
    
    if (preset !== 'custom') {
      setEditedPrompt(PRESET_PROMPTS[preset]);
    }
  };
  
  const handleSave = () => {
    setSystemPrompt(editedPrompt);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure System Prompt</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          The system prompt helps define how Gemini responds to your questions. It sets the behavior, 
          style, and perspective of the AI. It will be prepended to each of your questions.
        </Alert>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="preset-prompt-label">Preset Prompts</InputLabel>
          <Select
            labelId="preset-prompt-label"
            id="preset-prompt"
            value={selectedPreset}
            label="Preset Prompts"
            onChange={handlePresetChange}
          >
            <MenuItem value="custom">Custom Prompt</MenuItem>
            <MenuItem value="default">Default Assistant</MenuItem>
            <MenuItem value="teacher">Educational Assistant</MenuItem>
            <MenuItem value="researcher">Research Assistant</MenuItem>
            <MenuItem value="creative">Creative Assistant</MenuItem>
            <MenuItem value="technical">Technical Assistant</MenuItem>
            <MenuItem value="simple">Simple Explainer</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          autoFocus
          label="System Prompt"
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder="Enter instructions for how the AI should behave..."
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Tips for effective system prompts:
          </Typography>
          <ul style={{ color: 'text.secondary', fontSize: '0.875rem', paddingLeft: '1.5rem', margin: 0 }}>
            <li>Be specific about expertise levels, tone, and format</li>
            <li>Define constraints like "only use information from the document"</li>
            <li>Specify output formats like "bullet points" or "detailed paragraphs"</li>
            <li>Include any ethical guidelines or response limitations</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SystemPromptDialog;

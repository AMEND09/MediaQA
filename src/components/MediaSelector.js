import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Alert,
  Tab, 
  Tabs,
  useMediaQuery,
  Chip,
  Stack,
  IconButton,
  Paper
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon from '@mui/icons-material/Mic';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGeminiApi } from '../context/GeminiApiContext';
import MediaPreview from './MediaPreview';
import SystemPromptDialog from './SystemPromptDialog';
import ApiKeyStatus from './ApiKeyStatus';

const Input = styled('input')({
  display: 'none',
});

function MediaSelector() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    handleFileUpload, 
    handleYoutubeUrl,
    startCamera,
    stopCamera,
    isCameraActive,
    startAudioRecording,
    stopAudioRecording,
    cancelAudioRecording,
    isRecordingAudio,
    fileInfo,
    currentFiles,
    clearFiles,
    removeFile
  } = useGeminiApi();
  
  const [activeTab, setActiveTab] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState('');
  const [systemPromptOpen, setSystemPromptOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  
  // Improved Firefox-specific media device detection
  const mediaDevicesSupport = (() => {
    // Check if Firefox and initialize mediaDevices if needed
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    
    if (isFirefox && typeof navigator !== 'undefined' && !navigator.mediaDevices) {
      // This helps initialize mediaDevices in some Firefox versions
      navigator.mediaDevices = {};
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(new Error("getUserMedia is not implemented in this browser"));
        }
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    
    // Check if basic API is available
    const hasApi = typeof navigator !== 'undefined' && 
                  navigator.mediaDevices && 
                  typeof navigator.mediaDevices.getUserMedia === 'function';
    
    // Firefox on localhost is always considered secure
    const isSecure = window.isSecureContext === true || 
                  (isFirefox && window.location.hostname === 'localhost');
    
    // Determine support level and reason
    let supportLevel = 'full';
    let reason = '';
    
    if (!hasApi) {
      supportLevel = 'none';
      reason = isFirefox ? 
        "Firefox can't access media devices. Try refreshing the page or checking your privacy settings." : 
        "Your browser doesn't support media device access";
    } else if (!isSecure) {
      supportLevel = 'limited';
      reason = "Not using a secure connection (HTTPS or localhost)";
    }
    
    return { 
      supportLevel, 
      reason,
      isAvailable: hasApi && isSecure,
      isFirefox
    };
  })();
  
  // Add permissions check for Firefox
  useEffect(() => {
    if (mediaDevicesSupport.isFirefox && activeTab >= 2) {
      // For Firefox, check if permissions were previously granted
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        navigator.permissions.query({ name: activeTab === 2 ? 'camera' : 'microphone' })
          .then(permissionStatus => {
            if (permissionStatus.state === 'denied') {
              setError(`Firefox has blocked ${activeTab === 2 ? 'camera' : 'microphone'} access. Click the permission icon in the address bar and select 'Allow'.`);
            } else if (permissionStatus.state === 'prompt') {
              // Firefox will show a permission prompt when we try to access
              console.log(`Firefox will ask for ${activeTab === 2 ? 'camera' : 'microphone'} permission`);
            }
          })
          .catch(err => {
            console.log("Could not check permission status:", err);
          });
      }
    }
  }, [activeTab, mediaDevicesSupport.isFirefox]);
  
  // Handle file upload - now supporting multiple files
  const onFileSelected = async (event) => {
    try {
      setError('');
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      await handleFileUpload(files);
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Handle YouTube URL
  const onYoutubeSubmit = () => {
    try {
      setError('');
      handleYoutubeUrl(youtubeUrl);
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Handle camera toggling with improved Firefox support
  const toggleCamera = async () => {
    try {
      setError('');
      if (!isCameraActive) {
        if (!mediaDevicesSupport.isAvailable) {
          if (mediaDevicesSupport.isFirefox) {
            throw new Error(
              "Camera access is blocked in Firefox. Check your permission settings by clicking the camera icon in the address bar."
            );
          } else {
            throw new Error(
              `Camera access is not available. ${mediaDevicesSupport.reason}. ` +
              "Try using Chrome or Firefox with HTTPS."
            );
          }
        }
        
        const stream = await startCamera();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        stopCamera();
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Handle audio recording with improved Firefox support
  const toggleAudioRecording = async () => {
    try {
      setError('');
      if (!isRecordingAudio) {
        if (!mediaDevicesSupport.isAvailable) {
          if (mediaDevicesSupport.isFirefox) {
            throw new Error(
              "Microphone access is blocked in Firefox. Check your permission settings by clicking the microphone icon in the address bar."
            );
          } else {
            throw new Error(
              `Microphone access is not available. ${mediaDevicesSupport.reason}. ` +
              "Try using Chrome or Firefox with HTTPS."
            );
          }
        }
        
        await startAudioRecording();
      } else {
        await stopAudioRecording();
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleCancelAudioRecording = async () => {
    try {
      await cancelAudioRecording();
    } catch (error) {
      setError(error.message);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h2" sx={{ mb: 0 }}>
          Select Media
        </Typography>
        
        <IconButton 
          color="primary" 
          onClick={() => setSystemPromptOpen(true)}
          title="Configure System Prompt"
        >
          <SettingsIcon />
        </IconButton>
      </Box>
      
      {/* Add API key status component */}
      <ApiKeyStatus />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<UploadFileIcon />} label="Upload" />
        <Tab icon={<YouTubeIcon />} label="YouTube" />
        <Tab icon={<CameraAltIcon />} label="Camera" />
        <Tab icon={<MicIcon />} label="Audio" />
      </Tabs>
      
      {/* File Upload Tab */}
      {activeTab === 0 && (
        <Box sx={{ py: 2 }}>
          <label htmlFor="file-input">
            <Input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx,.html,.css,.js,.md,.csv,.xml,.rtf,.png,.jpg,.jpeg,.webp,.heic,.heif,.mp4,.mpeg,.mov,.avi,.flv,.mpg,.webm,.wmv,.3gp,.mp3,.wav,.ogg,.aac,.m4a"
              onChange={onFileSelected}
              multiple
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadFileIcon />}
              fullWidth={isMobile}
            >
              Select Files
            </Button>
          </label>
          
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Supported: PDF, TXT, HTML, Images, Videos, Audio (Max 20MB per file)
          </Typography>
          
          {/* File chips for selected files */}
          {currentFiles.length > 0 && (
            <Paper elevation={0} sx={{ p: 1, mt: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Selected Files:
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<ClearAllIcon />} 
                  onClick={clearFiles}
                  sx={{ py: 0 }}
                >
                  Clear All
                </Button>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {currentFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeFile(index)}
                    deleteIcon={<DeleteIcon />}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Paper>
          )}
        </Box>
      )}
      
      {/* YouTube URL Tab */}
      {activeTab === 1 && (
        <Box sx={{ py: 2 }}>
          <TextField
            fullWidth
            label="YouTube URL"
            variant="outlined"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<YouTubeIcon />}
            onClick={onYoutubeSubmit}
            fullWidth={isMobile}
          >
            Process YouTube
          </Button>
        </Box>
      )}
      
      {/* Camera Tab with improved Firefox-specific messaging */}
      {activeTab === 2 && (
        <Box sx={{ py: 2 }}>
          <Button
            variant="contained"
            color={isCameraActive ? "error" : "primary"}
            startIcon={<CameraAltIcon />}
            onClick={toggleCamera}
            fullWidth={isMobile}
            disabled={mediaDevicesSupport.supportLevel === 'none'}
          >
            {isCameraActive ? "Stop Camera" : "Start Camera"}
          </Button>
          
          {mediaDevicesSupport.supportLevel !== 'full' && (
            <Alert 
              severity={mediaDevicesSupport.supportLevel === 'none' ? "error" : "warning"} 
              sx={{ mt: 2 }}
            >
              {mediaDevicesSupport.isFirefox ? 
                "Firefox requires camera permissions. If blocked, click the camera icon in the address bar and select 'Allow'." :
                mediaDevicesSupport.reason + (mediaDevicesSupport.supportLevel === 'limited' ? 
                ". Some features may not work properly." : "")}
            </Alert>
          )}
          
          {isCameraActive && (
            <Box sx={{ mt: 2 }}>
              <video
                ref={videoRef}
                style={{ width: '100%', maxHeight: '300px', borderRadius: '8px' }}
                autoPlay
                muted
              />
            </Box>
          )}
        </Box>
      )}
      
      {/* Audio Tab with improved Firefox-specific messaging */}
      {activeTab === 3 && (
        <Box sx={{ py: 2 }}>
          <Button
            variant="contained"
            color={isRecordingAudio ? "error" : "secondary"}
            startIcon={<MicIcon />}
            onClick={toggleAudioRecording}
            fullWidth={isMobile}
            className={isRecordingAudio ? "pulse-animation" : ""}
            disabled={mediaDevicesSupport.supportLevel === 'none'}
          >
            {isRecordingAudio ? "Stop Recording" : "Record Audio"}
          </Button>
          
          {mediaDevicesSupport.supportLevel !== 'full' && (
            <Alert 
              severity={mediaDevicesSupport.supportLevel === 'none' ? "error" : "warning"} 
              sx={{ mt: 2 }}
            >
              {mediaDevicesSupport.isFirefox ? 
                "Firefox requires microphone permissions. If blocked, click the microphone icon in the address bar and select 'Allow'." :
                mediaDevicesSupport.reason + (mediaDevicesSupport.supportLevel === 'limited' ? 
                ". Some features may not work properly." : "")}
            </Alert>
          )}
          
          {isRecordingAudio && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleCancelAudioRecording}
                sx={{ ml: 1 }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {fileInfo && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {fileInfo}
        </Alert>
      )}
      
      <MediaPreview videoRef={videoRef} />
      
      <SystemPromptDialog
        open={systemPromptOpen}
        onClose={() => setSystemPromptOpen(false)}
      />
    </Box>
  );
}

export default MediaSelector;

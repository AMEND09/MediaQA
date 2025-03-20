import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import GeminiApi from '../services/GeminiApi';
import { useApiKey } from './ApiKeyContext';

const GeminiApiContext = createContext();

export const useGeminiApi = () => useContext(GeminiApiContext);

export const GeminiApiProvider = ({ children }) => {
  const { apiKey } = useApiKey();
  
  // Create a stable reference to the API instance that updates when apiKey changes
  const apiInstanceRef = useRef(null);
  
  // Update the API instance when the API key changes
  useEffect(() => {
    // Reinitialize the API with the new key
    apiInstanceRef.current = new GeminiApi(apiKey);
    
    // Set up event handlers for the new instance
    apiInstanceRef.current.onLiveMessage((text, isComplete) => {
      if (text.includes("connection") || text.includes("WebSocket") || text.includes("Streaming mode")) {
        setResponse(text);
      } else {
        setResponse(prev => prev + text);
      }
      
      if (isComplete) {
        // Add the complete AI response to the messages array
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            role: 'assistant', 
            content: response + text,
            timestamp: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
      }
    });
    
    // Return a cleanup function
    return () => {
      if (apiInstanceRef.current) {
        // Close any open connections
        apiInstanceRef.current.closeLiveSession().catch(console.error);
      }
    };
  }, [apiKey]);
  
  // Chat history
  const [messages, setMessages] = useState([]);
  
  // Media state
  const [currentFiles, setCurrentFiles] = useState([]);
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [fileInfo, setFileInfo] = useState('');
  
  // Camera and mic state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
  // Response state
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  // Live mode state
  const [isLiveMode, setIsLiveMode] = useState(false);

  // System prompt
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant that specializes in analyzing documents, images, videos, and audio files."
  );
  
  // Initialize live message handler
  useEffect(() => {
    apiInstanceRef.current.onLiveMessage((text, isComplete) => {
      if (text.includes("connection") || text.includes("WebSocket") || text.includes("Streaming mode")) {
        setResponse(text);
      } else {
        setResponse(prev => prev + text);
      }
      
      if (isComplete) {
        // Add the complete AI response to the messages array
        setMessages(prevMessages => [
          ...prevMessages,
          { 
            role: 'assistant', 
            content: response + text,
            timestamp: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
      }
    });
  }, [apiInstanceRef, response]);
  
  // Handle file upload - now supports multiple files
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    
    // Validate file sizes (20MB max per file)
    for (const file of newFiles) {
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Please upload files smaller than 20MB.`);
      }
    }
    
    // Update current files
    setCurrentFiles(prev => [...prev, ...newFiles]);
    
    // Update fileInfo with a summary of all files
    const fileCount = newFiles.length + currentFiles.length;
    const totalSize = [...currentFiles, ...newFiles].reduce((sum, file) => sum + file.size, 0);
    
    setFileInfo(`${fileCount} file${fileCount !== 1 ? 's' : ''} selected (${formatFileSize(totalSize)})`);
    
    return newFiles;
  };
  
  // Reset all files
  const clearFiles = () => {
    setCurrentFiles([]);
    setFileContent('');
    setFileName('');
    setFileInfo('');
  };

  // Remove a specific file
  const removeFile = (fileIndex) => {
    setCurrentFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(fileIndex, 1);
      
      if (newFiles.length === 0) {
        setFileInfo('');
      } else {
        const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
        setFileInfo(`${newFiles.length} file${newFiles.length !== 1 ? 's' : ''} selected (${formatFileSize(totalSize)})`);
      }
      
      return newFiles;
    });
  };
  
  // Handle YouTube URL
  const handleYoutubeUrl = (url) => {
    if (!url || !url.includes('youtube.com/watch?v=')) {
      throw new Error('Please enter a valid YouTube URL');
    }
    
    setYoutubeUrl(url);
    clearFiles();
    setFileInfo(`YouTube video: ${url}`);
    return url;
  };
  
  // Ask a question - updated to include system prompt in the requests
  const askQuestion = async (question) => {
    if (!question.trim()) {
      throw new Error('Please enter a question');
    }
    
    setIsLoading(true);
    setResponse('');
    
    // Add user message to chat history
    const userMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      files: currentFiles.length > 0 ? [...currentFiles] : null,
      youtubeUrl: youtubeUrl || null
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      let answer;
      
      if (isCameraActive) {
        if (apiInstanceRef.current.liveApiSupported) {
          await apiInstanceRef.current.processLiveCameraCapture(question, systemPrompt);
        } else {
          await apiInstanceRef.current.processCameraCapture(question, systemPrompt);
        }
      } else if (isRecordingAudio) {
        await apiInstanceRef.current.processAudioRecording(question, systemPrompt);
      } else if (isLiveMode) {
        if (currentFiles.length > 0) {
          // For live mode with multiple files, process them sequentially
          const firstFile = currentFiles[0];
          const fileInfoText = currentFiles.length > 1 
            ? `I'm analyzing ${currentFiles.length} files. First processing: ${firstFile.name}` 
            : '';
          
          await apiInstanceRef.current.processFileLive(firstFile, question, fileInfoText, systemPrompt);
        } else if (youtubeUrl) {
          await apiInstanceRef.current.sendLiveMessage(`About this YouTube video: ${youtubeUrl}\n\nQuestion: ${question}`, null, systemPrompt);
        } else {
          // Plain text conversation
          await apiInstanceRef.current.sendLiveMessage(question, null, systemPrompt);
        }
      } else {
        // Standard mode
        if (youtubeUrl) {
          answer = await apiInstanceRef.current.processYouTubeURL(youtubeUrl, question, systemPrompt);
        } else if (currentFiles.length > 0) {
          // Process multiple files
          const combinedResults = [];
          
          for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];
            let fileResult;
            
            // Show intermediate loading state for multiple files
            if (currentFiles.length > 1) {
              setResponse(prev => 
                prev + `\n\nProcessing file ${i+1}/${currentFiles.length}: ${file.name}...\n`
              );
            }
            
            if (file.type.startsWith('image/') || 
                file.type.startsWith('video/') || 
                file.type === 'application/pdf' || 
                file.type.startsWith('audio/')) {
              fileResult = await apiInstanceRef.current.processFile('', 
                i === 0 ? question : `Continue analyzing with this file: ${file.name}. Original question: ${question}`, 
                file,
                systemPrompt
              );
            } else {
              // For text files
              const fileContentText = await readFileContent(file);
              fileResult = await apiInstanceRef.current.processFile(
                fileContentText, 
                i === 0 ? question : `Continue analyzing with this file: ${file.name}. Original question: ${question}`, 
                file,
                systemPrompt
              );
            }
            
            combinedResults.push(`File ${i+1}: ${file.name}\n${fileResult}`);
          }
          
          // Combine results from all files
          if (currentFiles.length > 1) {
            answer = `I've analyzed ${currentFiles.length} files:\n\n${combinedResults.join('\n\n---\n\n')}`;
            
            // If we have many files, ask for a summary
            if (currentFiles.length > 2) {
              const summaryPrompt = `I've analyzed these files individually. Now provide a brief, cohesive summary addressing the original question: "${question}"`;
              const summary = await apiInstanceRef.current.processFile('', summaryPrompt, null, systemPrompt);
              answer += `\n\n## Summary\n${summary}`;
            }
          } else {
            answer = combinedResults[0]; // Just return the single result without file headers
          }
        } else {
          // No files or YouTube URL - just a conversational query
          answer = await apiInstanceRef.current.processFile('', question, null, systemPrompt);
        }
        
        // Add the AI response to messages
        setResponse(answer);
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: answer,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error processing question:', error);
      const errorMessage = `Error: ${error.message || 'An unknown error occurred'}`;
      setResponse(errorMessage);
      
      // Add error message to chat history
      setMessages(prev => [
        ...prev, 
        { 
          role: 'error', 
          content: errorMessage,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      if (!isLiveMode) {
        setIsLoading(false);
      }
    }
  };
  
  // Toggle live mode
  const toggleLiveMode = async () => {
    try {
      if (!isLiveMode) {
        setIsLoading(true);
        setResponse('Initializing live connection...');
        await apiInstanceRef.current.initLiveSession();
        setIsLiveMode(true);
      } else {
        await apiInstanceRef.current.closeLiveSession();
        setIsLiveMode(false);
        setResponse('');
      }
    } catch (error) {
      console.error('Error toggling live mode:', error);
      setResponse(`Error: ${error.message}`);
      setIsLiveMode(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Camera controls with system prompt
  const startCamera = async () => {
    try {
      setCurrentFiles([]);
      setFileContent('');
      setYoutubeUrl('');
      setFileName('');
      
      const stream = await apiInstanceRef.current.startCameraCapture();
      setIsCameraActive(true);
      setFileInfo('Camera active: Ask a question about what the camera sees');
      return stream;
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  };
  
  const stopCamera = () => {
    apiInstanceRef.current.stopCameraCapture();
    setIsCameraActive(false);
    setFileInfo('');
  };
  
  const takePhoto = async (question) => {
    try {
      setIsLoading(true);
      setResponse('');
      const defaultQuestion = question || "What do you see in this image?";
      await apiInstanceRef.current.processPhoto(defaultQuestion, systemPrompt);
    } catch (error) {
      console.error('Error taking photo:', error);
      setResponse(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  // Audio recording controls with system prompt
  const startAudioRecording = async () => {
    try {
      setCurrentFiles([]);
      setFileContent('');
      setYoutubeUrl('');
      setFileName('');
      
      if (isCameraActive) {
        stopCamera();
      }
      
      const stream = await apiInstanceRef.current.startAudioRecording();
      setIsRecordingAudio(true);
      setFileInfo('Recording audio... Ask a question or press stop to analyze.');
      return stream;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  };
  
  const stopAudioRecording = async (question) => {
    try {
      setIsLoading(true);
      setResponse('');
      const defaultQuestion = question || "Please analyze this audio and tell me what you hear.";
      await apiInstanceRef.current.processAudioRecording(defaultQuestion, systemPrompt);
    } catch (error) {
      console.error('Error processing audio:', error);
      setResponse(`Error: ${error.message}`);
      setIsLoading(false);
    } finally {
      setIsRecordingAudio(false);
      setFileInfo('');
    }
  };
  
  const cancelAudioRecording = async () => {
    try {
      await apiInstanceRef.current.stopAudioRecording();
    } catch (error) {
      console.error('Error canceling recording:', error);
    } finally {
      setIsRecordingAudio(false);
      setFileInfo('');
    }
  };
  
  // Speech recognition
  const startSpeechRecognition = async () => {
    try {
      return await apiInstanceRef.current.startSpeechRecognition();
    } catch (error) {
      console.error('Error with speech recognition:', error);
      throw error;
    }
  };
  
  // Helper functions
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const getFileTypeLabel = (file) => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type.startsWith('audio/')) return 'Audio';
    if (file.type === 'application/pdf') return 'PDF';
    return 'File';
  };
  
  return (
    <GeminiApiContext.Provider
      value={{
        // State
        currentFiles,
        fileContent,
        fileName,
        youtubeUrl,
        fileInfo,
        isCameraActive,
        isRecordingAudio,
        isLoading,
        response,
        isLiveMode,
        messages,
        systemPrompt, // Still pass systemPrompt for UI purposes
        setSystemPrompt, // Still allow setting systemPrompt for UI purposes
        
        // Functions
        handleFileUpload,
        handleYoutubeUrl,
        askQuestion,
        toggleLiveMode,
        startCamera,
        stopCamera,
        takePhoto,
        startAudioRecording,
        stopAudioRecording,
        cancelAudioRecording,
        startSpeechRecognition,
        clearFiles,
        removeFile,
        
        // Add API key related property
        apiKey,
      }}
    >
      {children}
    </GeminiApiContext.Provider>
  );
};

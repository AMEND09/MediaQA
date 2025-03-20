class GeminiApi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Reinitialize everything when the API key changes
    this.socket = null;
    this.isLiveSessionActive = false;
    this.messageQueue = [];
    this.onMessageCallback = null;
    this.currentConversation = [];
    this.liveApiSupported = null;
    
    // Camera and media recording state
    this.mediaRecorder = null;
    this.mediaStream = null;
    this.videoChunks = [];
    this.isCapturing = false;
    
    // Audio recording state
    this.audioRecorder = null;
    this.audioChunks = [];
    this.isRecordingAudio = false;
    
    // Improved media devices support detection with Firefox-specific checks
    this.mediaDevicesSupported = false;
    this.mediaDeviceErrors = [];
    
    try {
      // Check if navigator and mediaDevices exist
      if (typeof navigator !== 'undefined') {
        // Firefox sometimes initializes mediaDevices only after first access
        if (!navigator.mediaDevices && navigator.userAgent.indexOf("Firefox") > -1) {
          console.log("Firefox detected, initializing mediaDevices");
          // Force Firefox to initialize mediaDevices
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
        
        if (navigator.mediaDevices) {
          if (typeof navigator.mediaDevices.getUserMedia === 'function') {
            this.mediaDevicesSupported = true;
            console.log("Media devices API is available");
          } else {
            this.mediaDeviceErrors.push("Browser has mediaDevices but doesn't support getUserMedia");
            console.warn("Browser has mediaDevices but doesn't support getUserMedia");
          }
        } else {
          this.mediaDeviceErrors.push("Browser doesn't support mediaDevices API");
          console.warn("Media devices API not found in this browser environment");
        }
      } else {
        this.mediaDeviceErrors.push("Navigator API not available");
        console.warn("Navigator API not available in this environment");
      }
      
      // In Firefox, isSecureContext might be true even on HTTP when it's localhost
      // so we don't need to add this as an error
      if (window.isSecureContext === false && window.location.hostname !== 'localhost') {
        this.mediaDeviceErrors.push("Not in a secure context (HTTPS or localhost)");
        console.warn("Media devices may not work outside secure context (HTTPS or localhost)");
      }
    } catch (err) {
      this.mediaDeviceErrors.push(`Media API detection error: ${err.message}`);
      console.error("Error detecting media devices support:", err);
    }
    
    console.log(`GeminiAPI initialized with API key: ${this.maskApiKey(apiKey)}`);
  }

  // Utility method to mask the API key for logging
  maskApiKey(key) {
    if (!key) return 'undefined';
    if (key.length <= 8) return '****';
    return key.substr(0, 4) + '****' + key.substr(-4);
  }

  // Modified to prepend system prompt to question
  async processFile(fileContent, question, file = null, systemPrompt = null) {
    try {
      // Prepend system prompt if provided
      const enhancedQuestion = this.preparePromptWithSystem(question, systemPrompt);
      return await this.processWithFetchAPI(fileContent, enhancedQuestion, file);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
  
  // Helper method to prepend system prompt to question
  preparePromptWithSystem(question, systemPrompt) {
    if (!systemPrompt) return question;
    
    // Format the system prompt and question together
    return `${systemPrompt}\n\nUser query: ${question}`;
  }
  
  // Modified to remove system prompt parameter
  async processWithFetchAPI(fileContent, question, file = null) {
    try {
      let payload;
      
      if (file && (file.type === 'application/pdf' || file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        const fileBase64 = await this.fileToBase64(file);
        
        payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: question },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: fileBase64
                  }
                }
              ]
            }
          ]
        };
      } else {
        const promptText = fileContent ? 
          `I have the following document content:\n\n${fileContent}\n\nBased on this document, please answer the following question:\n${question}\n\nGive a detailed and informative response using only information from the document.` 
          : question;
        
        payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: promptText }
              ]
            }
          ]
        };
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `Status ${response.status}` } }));
        // Special handling for API key related errors
        if (response.status === 400 && errorData.error?.message?.includes('API key')) {
          throw new Error(`Invalid API key. Please check your API key in settings: ${errorData.error?.message || 'Unknown API key error'}`);
        } else if (response.status === 403) {
          throw new Error(`API key unauthorized. Please check your API key in settings: ${errorData.error?.message || 'API key not authorized'}`);
        } else {
          throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter(part => part.text)
          .map(part => part.text);
        
        return textParts.join('\n');
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.error('Error in API call:', error);
      throw error;
    }
  }
  
  // Modified to prepend system prompt to question
  async processYouTubeURL(youtubeURL, question, systemPrompt = null) {
    try {
      // Prepend system prompt if provided
      const enhancedQuestion = this.preparePromptWithSystem(question, systemPrompt);
      
      // For YouTube URLs, we'll use a simpler approach that works with the REST API
      const combinedPrompt = `Please analyze this YouTube video: ${youtubeURL}\n\nQuestion: ${enhancedQuestion}\n\nIf you can directly access the video content, please analyze it and answer the question. If not, please indicate that you cannot directly access YouTube content.`;
      
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: combinedPrompt }
            ]
          }
        ]
      };
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `Status ${response.status}` } }));
        throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const textParts = data.candidates[0].content.parts
          .filter(part => part.text)
          .map(part => part.text);
        
        return textParts.join('\n');
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      console.error('Error processing YouTube URL:', error);
      // Fall back to treating the YouTube URL as context
      return this.processWithFetchAPI(`This is a YouTube video: ${youtubeURL}`, question);
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Get the base64 string by removing the prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  // Set callback for receiving messages
  onLiveMessage(callback) {
    this.onMessageCallback = callback;
  }
  
  // Initialize streaming mode (fallback for WebSocket)
  async initStreamingMode() {
    console.log("Initializing streaming mode as fallback");
    this.isLiveSessionActive = true;
    this.liveApiSupported = false;
    
    if (this.onMessageCallback) {
      this.onMessageCallback("Using HTTP streaming for real-time responses instead of WebSockets. All functionality is still available.", true);
    }
    
    return Promise.resolve();
  }
  
  // Live API methods with simplified WebSocket implementation for React
  async initLiveSession() {
    if (this.isLiveSessionActive) {
      console.log("Live session already active");
      return;
    }
    
    return this.initStreamingMode();
  }
  
  async closeLiveSession() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
    }
    
    this.isLiveSessionActive = false;
    this.currentConversation = [];
    console.log("Session closed");
  }
  
  // Modified to prepend system prompt to question
  async sendLiveMessage(message, mediaFile = null, systemPrompt = null) {
    // Check if we have an active live session, if not initialize one
    if (!this.isLiveSessionActive) {
      await this.initLiveSession();
    }
    
    try {
      // Prepend system prompt if provided
      const enhancedMessage = this.preparePromptWithSystem(message, systemPrompt);
      
      if (mediaFile) {
        return await this.processFile('', enhancedMessage, mediaFile);
      } else {
        return await this.processFile('', enhancedMessage, null);
      }
    } catch (error) {
      console.error("Error in streaming message:", error);
      throw error;
    }
  }
  
  // Modified to prepend system prompt to question
  async processFileLive(file, message, fileInfoText = '', systemPrompt = null) {
    // Prepend system prompt if provided
    const enhancedMessage = this.preparePromptWithSystem(message, systemPrompt);
    return this.processFile('', enhancedMessage, file);
  }

  // Camera and microphone capture methods
  async startCameraCapture() {
    try {
      // First check if media devices are supported
      if (!this.mediaDevicesSupported) {
        const errorDetails = this.mediaDeviceErrors.length > 0 
          ? this.mediaDeviceErrors.join(". ") 
          : "Unknown compatibility issue";
          
        throw new Error(
          `Camera access is not supported: ${errorDetails}. ` +
          "If you're using Firefox, make sure you've granted permission."
        );
      }
      
      // Request access to camera and microphone with Firefox-specific error handling
      try {
        // In Firefox, sometimes requesting audio and video simultaneously can fail
        // if permissions weren't previously granted for both
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (err) {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        
        if (err.name === 'NotAllowedError') {
          if (isFirefox) {
            throw new Error("Camera access was denied. In Firefox, click the camera icon in the address bar and select 'Allow'.");
          } else {
            throw new Error("Camera access was denied. Please grant permission in your browser.");
          }
        } else if (err.name === 'NotFoundError') {
          throw new Error("No camera found on your device.");
        } else if (err.name === 'NotReadableError') {
          throw new Error("Camera is already in use by another application.");
        } else if (err.name === 'OverconstrainedError') {
          throw new Error("Camera does not meet the requested constraints.");
        } else if (err.name === 'SecurityError') {
          throw new Error("Camera access is blocked due to security restrictions. Try using HTTPS or localhost.");
        } else {
          // If audio fails, try video only as a fallback
          console.warn("Could not access microphone, trying video only:", err);
          try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          } catch (videoErr) {
            throw new Error(`Could not access camera: ${videoErr.message || videoErr.name}`);
          }
        }
        
        // Firefox-specific fallback: try video-only if audio+video fails
        if (isFirefox) {
          console.warn("Firefox: Trying video-only as fallback for camera access");
          try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          } catch (videoErr) {
            throw new Error(`Firefox camera access failed: ${videoErr.message || videoErr.name}. Try clicking the camera icon in the address bar.`);
          }
        }
      }
      
      this.isCapturing = true;
      
      // Setup media recorder with fallback for unsupported codecs
      try {
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
          mimeType: 'video/webm;codecs=vp9,opus'
        });
      } catch (e) {
        // Try without specifying codecs
        try {
          this.mediaRecorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'video/webm'
          });
        } catch (e2) {
          // Fallback to default
          this.mediaRecorder = new MediaRecorder(this.mediaStream);
        }
      }
      
      this.videoChunks = [];
      
      // Collect video chunks as they are available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.videoChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Capture in 1-second chunks
      
      return this.mediaStream;
    } catch (error) {
      console.error("Error starting camera capture:", error);
      throw error;
    }
  }
  
  stopCameraCapture() {
    if (this.mediaRecorder && this.isCapturing) {
      this.mediaRecorder.stop();
      this.isCapturing = false;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
  
  async getCapturedVideoBlob() {
    return new Promise((resolve) => {
      if (this.videoChunks.length === 0) {
        resolve(null);
        return;
      }
      
      const blob = new Blob(this.videoChunks, { type: 'video/webm' });
      resolve(blob);
    });
  }
  
  // Modified to prepend system prompt to question
  async processCameraCapture(question, systemPrompt = null) {
    try {
      // Stop recording if active
      if (this.mediaRecorder && this.isCapturing) {
        this.mediaRecorder.stop();
        this.isCapturing = false;
        
        // Give some time for the last chunks to be processed
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Get the recorded video as blob
      const videoBlob = await this.getCapturedVideoBlob();
      
      if (!videoBlob) {
        throw new Error("No video captured");
      }
      
      // Show processing status
      if (this.onMessageCallback) {
        this.onMessageCallback("Processing camera capture...", false);
      }
      
      // Process with the API, including system prompt
      const enhancedQuestion = this.preparePromptWithSystem(question, systemPrompt);
      const result = await this.processFile('', enhancedQuestion, new File([videoBlob], 'camera.webm', { type: 'video/webm' }));
      
      if (this.onMessageCallback) {
        this.onMessageCallback(result, true);
      }
      
      return result;
    } catch (error) {
      console.error("Error processing camera capture:", error);
      
      // Notify with error message
      if (this.onMessageCallback) {
        this.onMessageCallback(`Error processing video: ${error.message}`, true);
      }
      
      throw error;
    } finally {
      // Clean up
      this.stopCameraCapture();
      this.videoChunks = [];
    }
  }
  
  // Process live camera (simplified in the React version)
  async processLiveCameraCapture(question) {
    return this.processCameraCapture(question);
  }
  
  // Helper: Convert blob to base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }
  
  // Take a single photo from the camera
  async takeSinglePhoto() {
    try {
      // First check if media devices are supported
      if (!this.mediaDevicesSupported) {
        throw new Error(
          "Camera access is not supported in this browser or environment. " +
          "Try using a modern browser like Chrome or Firefox."
        );
      }
      
      // Get access to the camera with better error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Create a video element to capture the stream
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Wait for the video to be ready
        await new Promise(resolve => {
          video.onloadedmetadata = () => {
            resolve();
          };
        });
        
        // Create a canvas to capture the image
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
        
        // Convert the canvas to a blob
        return new Promise(resolve => {
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/jpeg', 0.95);
        });
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          throw new Error("Camera access was denied. Please grant permission in your browser.");
        } else if (err.name === 'NotFoundError') {
          throw new Error("No camera found on your device.");  
        } else {
          throw new Error(`Could not access camera: ${err.message || err.name}`);
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      throw error;
    }
  }
  
  // Modified to prepend system prompt to question
  async processPhoto(question, systemPrompt = null) {
    try {
      // Take a photo
      const photoBlob = await this.takeSinglePhoto();
      
      // Show processing message through callback
      if (this.onMessageCallback) {
        this.onMessageCallback("Processing photo...", false);
      }
      
      // Process with the API, including system prompt
      const enhancedQuestion = this.preparePromptWithSystem(question, systemPrompt);
      const photoFile = new File([photoBlob], 'photo.jpg', { type: 'image/jpeg' });
      const result = await this.processFile('', enhancedQuestion, photoFile);
      
      // Send the complete result to the callback
      if (this.onMessageCallback) {
        this.onMessageCallback(result, true);
      }
      
      return result;
    } catch (error) {
      console.error("Error processing photo:", error);
      
      // Notify with error message
      if (this.onMessageCallback) {
        this.onMessageCallback(`Error: ${error.message}`, true);
      }
      
      throw error;
    }
  }
  
  // Start audio recording
  async startAudioRecording() {
    try {
      // First check if media devices are supported
      if (!this.mediaDevicesSupported) {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        throw new Error(
          "Microphone access is not supported in this browser or environment. " +
          (isFirefox ? "In Firefox, check that you've allowed microphone access." : "Try using a modern browser like Chrome or Firefox.")
        );
      }
      
      // Request access to microphone with Firefox-specific error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        this.isRecordingAudio = true;
        this.audioChunks = [];
        
        // Setup audio recorder with fallback for unsupported codecs
        try {
          this.audioRecorder = new MediaRecorder(stream, { 
            mimeType: 'audio/webm' 
          });
        } catch (e) {
          // Fallback to default
          this.audioRecorder = new MediaRecorder(stream);
        }
        
        // Collect audio chunks as they are available
        this.audioRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        
        // Start recording
        this.audioRecorder.start(100); // Capture in 100ms chunks for smoother output
        
        return stream;
      } catch (err) {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        
        if (err.name === 'NotAllowedError') {
          if (isFirefox) {
            throw new Error("Microphone access was denied. In Firefox, click the microphone icon in the address bar and select 'Allow'.");
          } else {
            throw new Error("Microphone access was denied. Please grant permission in your browser.");
          }
        } else if (err.name === 'NotFoundError') {
          throw new Error("No microphone found on your device.");
        } else if (err.name === 'NotReadableError') {
          throw new Error("Microphone is already in use by another application.");
        } else if (err.name === 'SecurityError') {
          throw new Error("Microphone access is blocked due to security restrictions. Try using HTTPS or localhost.");
        } else {
          throw new Error(`Could not access microphone: ${err.message || err.name}`);
        }
      }
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }
  
  // Stop audio recording
  stopAudioRecording() {
    return new Promise((resolve, reject) => {
      if (!this.audioRecorder || !this.isRecordingAudio) {
        resolve(null);
        return;
      }
      
      this.audioRecorder.onstop = async () => {
        this.isRecordingAudio = false;
        
        // Get audio blob
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.audioRecorder.mimeType || 'audio/webm' 
        });
        
        // Stop all audio tracks
        this.audioRecorder.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };
      
      this.audioRecorder.onerror = (error) => {
        reject(error);
      };
      
      // Stop recording
      this.audioRecorder.stop();
    });
  }
  
  // Modified to prepend system prompt to question
  async processAudioRecording(question, systemPrompt = null) {
    try {
      if (this.onMessageCallback) {
        this.onMessageCallback("Processing audio...", false);
      }
      
      // Get audio blob
      const audioBlob = await this.stopAudioRecording();
      
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("No audio recorded or recording is too short");
      }
      
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type || 'audio/webm' 
      });
      
      // Process with the API, including system prompt
      const defaultQuestion = question || "Please analyze this audio and tell me what you hear.";
      const enhancedQuestion = this.preparePromptWithSystem(defaultQuestion, systemPrompt);
      const result = await this.processFile('', enhancedQuestion, audioFile);
      
      if (this.onMessageCallback) {
        this.onMessageCallback(result, true);
      }
      
      return result;
    } catch (error) {
      console.error("Error processing audio:", error);
      
      if (this.onMessageCallback) {
        this.onMessageCallback(`Error processing audio: ${error.message}`, true);
      }
      
      throw error;
    } finally {
      this.audioChunks = [];
    }
  }
  
  // Speech recognition support
  async startSpeechRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error("Your browser doesn't support speech recognition");
    }
    
    return new Promise((resolve) => {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      let finalTranscript = '';
      let recognitionEnded = false;
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Update UI with interim results
        if (this.onMessageCallback && interimTranscript) {
          this.onMessageCallback(`Transcribing: ${interimTranscript}`, false);
        }
      };
      
      recognition.onend = () => {
        recognitionEnded = true;
        // Prevent multiple resolves if this fires after error
        resolve(finalTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        recognitionEnded = true;
        resolve(finalTranscript); // Return what we have so far
      };
      
      recognition.start();
      
      // Safety timeout to ensure we don't wait forever
      setTimeout(() => {
        if (!recognitionEnded) {
          recognition.stop();
        }
      }, 10000); // 10 second maximum
    });
  }
}

export default GeminiApi;

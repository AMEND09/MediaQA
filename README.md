# Gemini Media Q&A React App

A modern React application that allows users to analyze various media types using Google's Gemini API and ask questions about the content. Optimized for both desktop and mobile devices.

## Features

- **Modern React UI**: Built with React 18 and Material-UI for a responsive, mobile-optimized experience
- **Multiple Media Sources**: Support for file uploads, YouTube videos, live camera, and audio recording
- **Voice Interaction**: Speech-to-text for questions and text-to-speech for answers
- **Real-time Processing**: Live mode for streaming responses as they're generated
- **Mobile-First Design**: Optimized interface that works well on phones and tablets

## Supported Media Types

- Documents: PDF, TXT, HTML, CSS, JS, Markdown, CSV, XML, RTF
- Images: PNG, JPEG, WEBP, HEIC, HEIF
- Videos: MP4, MPEG, MOV, AVI, FLV, MPG, WEBM, WMV, 3GP
- Audio: MP3, WAV, OGG, AAC, M4A
- Live Media: Camera and microphone input

## Installation and Setup

1. Navigate to the project directory:
   ```
   cd react-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root and add your Gemini API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Deployment to GitHub Pages

This app can be automatically deployed to GitHub Pages using the included GitHub Actions workflow.

### To set up automatic deployment:

1. Push this repository to GitHub
2. Go to your repository's Settings tab
3. Navigate to Pages and select GitHub Actions as the source
4. Add your Gemini API key as a repository secret named `REACT_APP_GEMINI_API_KEY`
5. Edit the `homepage` field in package.json to match your username and repository name
6. Push a change to the main branch to trigger the deployment workflow

### Manual deployment:

You can also deploy manually using:
```
npm run build
```
and then deploy the contents of the `build` directory to your GitHub Pages branch.

#   M e d i a Q A  
 
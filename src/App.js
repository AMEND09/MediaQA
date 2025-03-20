import React, { useState } from 'react';
import { Container, Box, Paper } from '@mui/material';
import AppHeader from './components/AppHeader';
import MediaSelector from './components/MediaSelector';
import QuestionSection from './components/QuestionSection';
import { GeminiApiProvider } from './context/GeminiApiContext';
import { ApiKeyProvider } from './context/ApiKeyContext';
import MobileNavigation from './components/MobileNavigation';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DevToolsPrompt from './components/DevToolsPrompt';
import BrowserCompatibilityChecker from './components/BrowserCompatibilityChecker';
import FirefoxHelper from './components/FirefoxHelper';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  
  // Tabs for mobile navigation
  const tabs = [
    { label: 'Media', icon: 'upload' },
    { label: 'Chat', icon: 'question' }
  ];
  
  return (
    <ApiKeyProvider>
      <GeminiApiProvider>
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          pb: isMobile ? 7 : 0 
        }}>
          <AppHeader />
          
          <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 3 }}>
            {/* Show compatibility checker */}
            <BrowserCompatibilityChecker />
            
            {/* Firefox-specific helper for permissions */}
            <FirefoxHelper />
            
            {isMobile ? (
              <Box>
                {currentTab === 0 && (
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <MediaSelector />
                  </Paper>
                )}
                
                {currentTab === 1 && (
                  <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                    <QuestionSection />
                  </Paper>
                )}
              </Box>
            ) : (
              <Box>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <MediaSelector />
                </Paper>
                
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <QuestionSection />
                </Paper>
              </Box>
            )}
          </Container>
          
          {isMobile && (
            <MobileNavigation 
              tabs={tabs}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
            />
          )}
          
          {/* Development tools prompt */}
          <DevToolsPrompt />
        </Box>
      </GeminiApiProvider>
    </ApiKeyProvider>
  );
}

export default App;

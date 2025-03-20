import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const ApiKeyContext = createContext();

// Custom hook to use the API key context
export const useApiKey = () => useContext(ApiKeyContext);

// Default API key to use if none is found in local storage
const DEFAULT_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

export const ApiKeyProvider = ({ children }) => {
  // Initialize state from local storage or default
  const [apiKey, setApiKeyState] = useState(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    return savedKey || DEFAULT_API_KEY;
  });
  
  // Track whether the key is customized or using the default
  const [isCustomKey, setIsCustomKey] = useState(() => {
    return !!localStorage.getItem('gemini_api_key');
  });

  // Update local storage when API key changes
  const setApiKey = (newKey) => {
    if (newKey && newKey.trim() !== '') {
      localStorage.setItem('gemini_api_key', newKey.trim());
      setApiKeyState(newKey.trim());
      setIsCustomKey(true);
    }
  };

  // Reset to default key
  const resetApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKeyState(DEFAULT_API_KEY);
    setIsCustomKey(false);
  };

  // Check if API key is valid (basic format check)
  const isValidApiKey = (key) => {
    return key && typeof key === 'string' && key.trim().length > 10;
  };

  // Value object to be provided by the context
  const value = {
    apiKey,
    setApiKey,
    resetApiKey,
    isCustomKey,
    isValidApiKey,
    DEFAULT_API_KEY
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
};

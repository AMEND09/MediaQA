import React from 'react';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function MobileNavigation({ tabs, currentTab, setCurrentTab }) {
  const getIcon = (icon) => {
    switch (icon) {
      case 'upload':
        return <FileUploadIcon />;
      case 'question':
        return <QuestionAnswerIcon />;
      case 'answer':
        return <AutoAwesomeIcon />;
      default:
        return null;
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 10,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={currentTab}
        onChange={(event, newValue) => {
          setCurrentTab(newValue);
        }}
        showLabels
      >
        {tabs.map((tab, index) => (
          <BottomNavigationAction 
            key={index}
            label={tab.label} 
            icon={getIcon(tab.icon)} 
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default MobileNavigation;

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2ecc71',
      light: '#58d68d',
      dark: '#27ae60',
      contrastText: '#fff',
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b',
    },
    warning: {
      main: '#f39c12',
      light: '#f5b041',
      dark: '#d35400',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '1.5rem',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 500,
      marginBottom: '0.8rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;

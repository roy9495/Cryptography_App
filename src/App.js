import React, { useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

function App() {
  // Read theme mode from localStorage, defaulting to light (white mode)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.body.classList.add('dark-mode-scrollbar');
    } else {
      document.body.classList.remove('dark-mode-scrollbar');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Define custom MUI Theme
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: darkMode ? '#ff6f00' : '#e65100', // Neon amber/orange
          light: darkMode ? '#ffa040' : '#ff8f00',
          dark: darkMode ? '#c43e00' : '#b23c00',
        },
        secondary: {
          main: darkMode ? '#00e676' : '#2e7d32', // Terminal green
          light: darkMode ? '#66ffa6' : '#60ad5e',
          dark: darkMode ? '#00b248' : '#005005',
        },
        background: {
          default: darkMode ? '#090909' : '#f4f4f5',
          paper: darkMode ? '#121212' : '#ffffff',
        },
        text: {
          primary: darkMode ? '#f0f0f0' : '#18181b',
          secondary: darkMode ? '#8a8a8a' : '#71717a',
        },
        divider: darkMode ? 'rgba(255, 111, 0, 0.15)' : 'rgba(0, 0, 0, 0.12)',
      },
      typography: {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        h3: {
          fontWeight: 800,
        },
        h4: {
          fontWeight: 800,
        },
        h5: {
          fontWeight: 800,
        },
        h6: {
          fontWeight: 700,
        },
        button: {
          fontWeight: 700,
          textTransform: 'none',
        },
      },
      shape: {
        borderRadius: 4, // Retro sharp corners
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '4px',
              padding: '8px 16px',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
              }
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              border: darkMode ? '1px solid rgba(255, 111, 0, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  transition: 'border-color 0.2s ease',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderWidth: '1px',
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '1.5px',
                }
              },
            },
          },
        },
      },
    }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        background: darkMode 
          ? 'radial-gradient(ellipse at top, #181818 0%, #090909 80%)' 
          : 'radial-gradient(ellipse at top, #fafafa 0%, #eaeaea 80%)',
      }}>
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Dashboard />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default App;

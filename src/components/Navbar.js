import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function Navbar({ darkMode, toggleDarkMode }) {
  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? '#121212' 
          : '#f4f4f5',
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'primary.main',
              borderRadius: '4px',
              p: 1,
              background: 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)',
              boxShadow: '0 0 15px rgba(255, 111, 0, 0.4)',
              animation: 'pulse 2s infinite ease-in-out',
            }}
          >
            <LockIcon sx={{ color: '#ffffff' }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '1px',
                background: 'linear-gradient(45deg, #ff6f00 30%, #ffa040 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CipherForge
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

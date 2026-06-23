import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';

function Footer() {
  const theme = useTheme();

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto', 
        backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#f8fafc',
        borderTop: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}
        {' '}
        <Link color="inherit" href="#" sx={{ textDecoration: 'none', fontWeight: 700 }}>
          CipherForge
        </Link>
        {'. Powered by Web Cryptography API & CryptoJS. Standardized & Secure.'}
      </Typography>
    </Box>
  );
}

export default Footer;

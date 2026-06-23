import React, { useState } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Card, CardContent, 
  Container, useTheme 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import ShieldIcon from '@mui/icons-material/Shield';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import SyncAltIcon from '@mui/icons-material/SyncAlt';

import SymmetricTab from './SymmetricTab';
import AsymmetricTab from './AsymmetricTab';
import HashTab from './HashTab';
import FileTab from './FileTab';
import EncodingTab from './EncodingTab';

function Dashboard() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getEngineStatus = () => {
    return [
      {
        title: 'Symmetric Cipher',
        desc: 'AES-256 / DES / 3DES / RC4',
        icon: <LockIcon color="primary" />,
        status: 'Ready',
        active: activeTab === 0
      },
      {
        title: 'Asymmetric RSA',
        desc: 'Keygen / Sign / OAEP / PSS',
        icon: <KeyIcon color="secondary" />,
        status: 'Ready',
        active: activeTab === 1
      },
      {
        title: 'Hashing & HMAC',
        desc: 'SHA-3 / SHA-512 / CRC32',
        icon: <ShieldIcon color="success" />,
        status: 'Ready',
        active: activeTab === 2
      },
      {
        title: 'File Protection',
        desc: 'AES-GCM-256 + PBKDF2',
        icon: <FolderZipIcon color="warning" />,
        status: 'Ready',
        active: activeTab === 3
      }
    ];
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 1. Header Banner */}
      <Box 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: '4px',
          background: theme.palette.mode === 'dark' 
            ? '#121212' 
            : '#ffffff',
          border: `1px solid ${theme.palette.divider}`,
          borderLeft: `5px solid ${theme.palette.primary.main}`,
          boxShadow: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Glowing Orbs */}
        {theme.palette.mode === 'dark' && (
          <>
            <Box sx={{
              position: 'absolute', width: '200px', height: '200px',
              background: 'radial-gradient(circle, rgba(255,111,0,0.1) 0%, rgba(0,0,0,0) 70%)',
              top: '-50px', right: '10%', pointerEvents: 'none'
            }} />
            <Box sx={{
              position: 'absolute', width: '250px', height: '250px',
              background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, rgba(0,0,0,0) 70%)',
              bottom: '-80px', left: '20%', pointerEvents: 'none'
            }} />
          </>
        )}

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-1px',
                mb: 1.5,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #ff6f00 30%, #ffa040 90%)'
                  : 'linear-gradient(45deg, #e65100 30%, #ff8f00 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Enterprise-Grade Cryptography
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '650px', lineHeight: 1.7, fontSize: '1.05rem' }}>
              Welcome to the standardized cryptographic tool. Compute digests, sign payloads, encode strings, and encrypt files or texts with absolute security—running 100% client-side.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 2. Engines Status Diagnostics */}
      <Grid container spacing={2}>
        {getEngineStatus().map((engine, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card 
              sx={{ 
                borderRadius: '4px',
                border: `1px solid ${engine.active ? theme.palette.primary.main : theme.palette.divider}`,
                background: engine.active 
                  ? (theme.palette.mode === 'dark' ? 'rgba(255, 111, 0, 0.05)' : 'rgba(255, 111, 0, 0.03)')
                  : (theme.palette.mode === 'dark' ? '#121212' : '#ffffff'),
                transition: 'all 0.3s ease',
                boxShadow: engine.active ? '0 0 15px rgba(255, 111, 0, 0.15)' : 'none',
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {engine.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {engine.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {engine.desc}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 3. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              minHeight: '48px',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              }
            }
          }}
        >
          <Tab label="Symmetric Encryption" icon={<LockIcon />} iconPosition="start" />
          <Tab label="Asymmetric RSA" icon={<KeyIcon />} iconPosition="start" />
          <Tab label="Hashing & Checksums" icon={<ShieldIcon />} iconPosition="start" />
          <Tab label="File Cryptography" icon={<FolderZipIcon />} iconPosition="start" />
          <Tab label="Encoding & Ciphers" icon={<SyncAltIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* 4. Tab Content Panel */}
      <Box sx={{ mt: 1, minHeight: '400px' }}>
        {activeTab === 0 && <SymmetricTab />}
        {activeTab === 1 && <AsymmetricTab />}
        {activeTab === 2 && <HashTab />}
        {activeTab === 3 && <FileTab />}
        {activeTab === 4 && <EncodingTab />}
      </Box>
    </Container>
  );
}

export default Dashboard;

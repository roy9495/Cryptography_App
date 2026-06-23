import React, { useState } from 'react';
import { 
  Box, TextField, Button, Grid, Typography, Card, CardContent, 
  IconButton, Alert, LinearProgress, useTheme, InputAdornment
} from '@mui/material';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import ClearIcon from '@mui/icons-material/Clear';

import { fileCrypto } from '../utils/cryptoHelper';

function FileTab() {
  const theme = useTheme();

  // Inputs
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [operation, setOperation] = useState('encrypt'); // 'encrypt' or 'decrypt'

  // Outputs / Status
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultFile, setResultFile] = useState(null); // { name, data, type }

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResultFile(null);
      setErrorMsg('');
      setSuccessMsg('');
      setProgress(0);
      
      // Auto-detect operation based on extension
      if (selectedFile.name.endsWith('.enc')) {
        setOperation('decrypt');
      } else {
        setOperation('encrypt');
      }
    }
  };

  const handleProcessFile = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setResultFile(null);
    setProgress(0);

    if (!file) {
      setErrorMsg('Please select a file to process.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter a strong password.');
      return;
    }

    setWorking(true);
    try {
      let result;
      if (operation === 'encrypt') {
        result = await fileCrypto.encrypt(file, password, (p) => setProgress(p));
        setSuccessMsg(`File successfully encrypted! Download your secure file below.`);
      } else {
        result = await fileCrypto.decrypt(file, password, (p) => setProgress(p));
        setSuccessMsg(`File successfully decrypted! Download your original file below.`);
      }
      setResultFile(result);
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Ensure your file and password are correct.');
    } finally {
      setWorking(false);
    }
  };

  const handleDownload = () => {
    if (!resultFile) return;

    const blob = new Blob([resultFile.data], { type: resultFile.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultFile.name;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg('Download initiated!');
  };

  const clearAll = () => {
    setFile(null);
    setPassword('');
    setResultFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setProgress(0);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Local File Encryption
              </Typography>
              <Button 
                size="small" 
                color="inherit" 
                startIcon={<ClearIcon />}
                onClick={clearAll}
                sx={{ borderRadius: '8px' }}
              >
                Clear
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* File Upload Zone */}
              <Box sx={{ 
                border: `2px dashed ${file ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: '12px',
                p: file ? 3 : 5,
                textAlign: 'center',
                backgroundColor: file 
                  ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)')
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.3s ease',
              }}>
                <FolderZipIcon sx={{ fontSize: '3rem', color: file ? 'primary.main' : 'text.secondary' }} />
                {file ? (
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Selected: {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Size: {(file.size / 1024).toFixed(2)} KB ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
                      Select any file to encrypt or decrypt locally in-browser
                    </Typography>
                    <input
                      accept="*/*"
                      style={{ display: 'none' }}
                      id="file-crypt-button"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-crypt-button">
                      <Button variant="outlined" component="span">
                        Choose File
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>

              {file && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Keyphrase / Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant={operation === 'encrypt' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setOperation('encrypt')}
                      fullWidth
                      sx={{ borderRadius: '8px', py: 1.2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Set to Encrypt
                    </Button>
                    <Button
                      variant={operation === 'decrypt' ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setOperation('decrypt')}
                      fullWidth
                      sx={{ borderRadius: '8px', py: 1.2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Set to Decrypt
                    </Button>
                  </Grid>
                </Grid>
              )}

              {working && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                    Processing file... {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}

              {errorMsg && <Alert severity="error" sx={{ borderRadius: '8px' }}>{errorMsg}</Alert>}
              {successMsg && <Alert severity="success" sx={{ borderRadius: '8px' }}>{successMsg}</Alert>}

              {file && !working && (
                <Button
                  variant="contained"
                  onClick={handleProcessFile}
                  startIcon={operation === 'encrypt' ? <LockIcon /> : <LockOpenIcon />}
                  sx={{ 
                    borderRadius: '8px', 
                    py: 1.5, 
                    fontWeight: 800, 
                    textTransform: 'none',
                    background: operation === 'encrypt' 
                      ? 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)'
                      : 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                    boxShadow: operation === 'encrypt'
                      ? '0 4px 15px rgba(255, 111, 0, 0.3)'
                      : '0 4px 15px rgba(198, 40, 40, 0.3)',
                    '&:hover': {
                      background: operation === 'encrypt'
                        ? 'linear-gradient(135deg, #ffa040 0%, #ff8f00 100%)'
                        : 'linear-gradient(135deg, #b71c1c 0%, #8e0000 100%)',
                    }
                  }}
                >
                  {operation === 'encrypt' ? 'Encrypt & Secure File' : 'Decrypt & Restore File'}
                </Button>
              )}

              {resultFile && (
                <Box sx={{ 
                  p: 3, 
                  border: `1px solid ${theme.palette.divider}`, 
                  borderRadius: '12px',
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 2
                }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Processed: {resultFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ready for download
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#f8fafc',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          height: '100%'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Cryptography Standard
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              AES-GCM-256 + PBKDF2
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
              This tool utilizes military-grade symmetric encryption:
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, pl: 1 }}>
              • <strong>PBKDF2 Key Derivation:</strong> Your password is converted into a 256-bit AES key using PBKDF2 with 100,000 iterations of SHA-256 and a cryptographically random 16-byte salt. This makes brute-force attacks extremely difficult.
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, pl: 1 }}>
              • <strong>AES-GCM (Galois/Counter Mode):</strong> An authenticated symmetric encryption mode that provides both confidentiality and data integrity. Any alteration of the encrypted file will be detected during decryption, causing it to fail securely.
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6, pl: 1 }}>
              • <strong>Zero Data Transmission:</strong> The entire process is executed client-side. The file never leaves your computer, ensuring absolute privacy.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default FileTab;

import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, Grid, Typography, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails,
  IconButton, Tooltip, InputAdornment, Alert, useTheme
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';

import { symmetricCrypto } from '../utils/cryptoHelper';

const ALGORITHMS = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit'];
const MODES = ['CBC', 'CFB', 'CTR', 'OFB', 'ECB'];
const PADDINGS = ['Pkcs7', 'ZeroPadding', 'NoPadding'];

const ALGO_INFO = {
  AES: {
    security: 'Highly Secure (Industry Standard)',
    desc: 'Advanced Encryption Standard (AES) is the gold standard for symmetric encryption. It supports key sizes of 128, 192, and 256 bits. It is used worldwide to encrypt sensitive data.',
    recommendation: 'Recommended for all general symmetric encryption purposes.'
  },
  DES: {
    security: 'Insecure (Obsolete)',
    desc: 'Data Encryption Standard (DES) is an older symmetric key algorithm with a 56-bit key size. It is vulnerable to brute-force attacks and is considered cryptographically broken.',
    recommendation: 'Do NOT use for securing sensitive data. Kept for educational and legacy compatibility purposes.'
  },
  TripleDES: {
    security: 'Legacy Secure / Deprecated',
    desc: 'Triple DES (3DES) applies the DES cipher three times to each data block to extend the key size. It is much slower than AES and is being phased out.',
    recommendation: 'Only use when interacting with legacy systems that require it.'
  },
  RC4: {
    security: 'Insecure / Broken',
    desc: 'RC4 is a stream cipher notable for its simplicity and speed. However, multiple vulnerabilities have been discovered in RC4, rendering it insecure.',
    recommendation: 'Do NOT use for secure applications.'
  },
  Rabbit: {
    security: 'Legacy Stream Cipher',
    desc: 'Rabbit is a high-speed stream cipher first presented in 2003. It has a 128-bit key and provides good security margins but is not widely standardized compared to AES.',
    recommendation: 'Use mainly for niche high-performance stream encryption needs.'
  }
};

function SymmetricTab() {
  const theme = useTheme();
  const [algorithm, setAlgorithm] = useState('AES');
  const [inputText, setInputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Advanced configurations
  const [mode, setMode] = useState('CBC');
  const [padding, setPadding] = useState('Pkcs7');
  const [iv, setIv] = useState('');
  const [outputFormat, setOutputFormat] = useState('base64');

  // Trigger default IV generation if mode changes and requires IV
  useEffect(() => {
    if (algorithm === 'AES' || algorithm === 'DES' || algorithm === 'TripleDES') {
      if (mode !== 'ECB' && !iv) {
        generateRandomIV();
      }
    } else {
      setIv(''); // Stream ciphers don't use Block Mode IV in this CryptoJS interface
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, mode]);

  const generateRandomKey = () => {
    // Generate a secure random 32-character string (16 bytes hex/ascii equivalents)
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let key = '';
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < array.length; i++) {
      key += charset[array[i] % charset.length];
    }
    setSecretKey(key);
    setErrorMsg('');
  };

  const generateRandomIV = () => {
    let size = 16; // 16 bytes for AES (128-bit blocks)
    if (algorithm === 'DES' || algorithm === 'TripleDES') {
      size = 8; // 8 bytes for DES (64-bit blocks)
    }
    const ivArray = new Uint8Array(size);
    window.crypto.getRandomValues(ivArray);
    const ivHex = Array.from(ivArray).map(b => b.toString(16).padStart(2, '0')).join('');
    setIv(ivHex);
  };

  const handleEncrypt = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!inputText) {
      setErrorMsg('Please enter input text to encrypt.');
      return;
    }
    if (!secretKey) {
      setErrorMsg('Please enter a secret key.');
      return;
    }

    try {
      const config = {
        mode,
        padding,
        iv: mode !== 'ECB' ? iv : undefined,
        outputFormat
      };
      const result = symmetricCrypto.encrypt(algorithm, inputText, secretKey, config);
      setOutputText(result);
      setSuccessMsg(`${algorithm} Encryption Successful!`);
    } catch (err) {
      setErrorMsg(err.message || 'Encryption failed!');
    }
  };

  const handleDecrypt = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!inputText) {
      setErrorMsg('Please enter ciphertext to decrypt.');
      return;
    }
    if (!secretKey) {
      setErrorMsg('Please enter the secret key used for encryption.');
      return;
    }

    try {
      const config = {
        mode,
        padding,
        iv: mode !== 'ECB' ? iv : undefined,
        outputFormat
      };
      const result = symmetricCrypto.decrypt(algorithm, inputText, secretKey, config);
      setOutputText(result);
      setSuccessMsg(`${algorithm} Decryption Successful!`);
    } catch (err) {
      setErrorMsg(err.message || 'Decryption failed! Verify key, IV, and formatting.');
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSuccessMsg('Copied to clipboard!');
  };

  const swapInputs = () => {
    setInputText(outputText);
    setOutputText('');
    setSuccessMsg('Swapped output to input.');
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const isBlockCipher = algorithm === 'AES' || algorithm === 'DES' || algorithm === 'TripleDES';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
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
                Symmetric Ciphers
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Algorithm</InputLabel>
                    <Select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      label="Algorithm"
                      sx={{ borderRadius: '8px' }}
                    >
                      {ALGORITHMS.map((algo) => (
                        <MenuItem key={algo} value={algo}>{algo}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Secret Key"
                    type={showKey ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowKey(!showKey)} edge="end">
                            {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                          <Tooltip title="Generate Random Key">
                            <IconButton onClick={generateRandomKey} edge="end" sx={{ ml: 0.5 }}>
                              <ShuffleIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Input Text (Plaintext for encryption, Ciphertext for decryption)"
                multiline
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                fullWidth
                placeholder="Type or paste your message here..."
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                }}
              />

              {/* Advanced Block Cipher Config */}
              {isBlockCipher && (
                <Accordion sx={{ 
                  backgroundColor: 'transparent', 
                  boxShadow: 'none', 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '12px !important',
                  overflow: 'hidden',
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      Advanced Parameter Settings
                      <Tooltip title="Block Ciphers like AES allow setting custom modes of operation, padding types, and Initialization Vectors (IVs) for enhanced security customization.">
                        <HelpOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      </Tooltip>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Cipher Mode</InputLabel>
                          <Select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            label="Cipher Mode"
                            sx={{ borderRadius: '8px' }}
                          >
                            {MODES.map((m) => (
                              <MenuItem key={m} value={m}>{m}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Padding Scheme</InputLabel>
                          <Select
                            value={padding}
                            onChange={(e) => setPadding(e.target.value)}
                            label="Padding Scheme"
                            sx={{ borderRadius: '8px' }}
                          >
                            {PADDINGS.map((p) => (
                              <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Initialization Vector (IV) [Hex]"
                          size="small"
                          value={iv}
                          onChange={(e) => setIv(e.target.value)}
                          disabled={mode === 'ECB'}
                          fullWidth
                          placeholder="HEX representation of IV"
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                          }}
                          InputProps={{
                            endAdornment: mode !== 'ECB' && (
                              <InputAdornment position="end">
                                <Tooltip title="Regenerate IV">
                                  <IconButton onClick={generateRandomIV} edge="end">
                                    <ShuffleIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Output Format</InputLabel>
                          <Select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            label="Output Format"
                            sx={{ borderRadius: '8px' }}
                          >
                            <MenuItem value="base64">Base64 (Standard)</MenuItem>
                            <MenuItem value="hex">Hexadecimal (Hex)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {errorMsg && <Alert severity="error" sx={{ borderRadius: '8px' }}>{errorMsg}</Alert>}
              {successMsg && <Alert severity="success" sx={{ borderRadius: '8px' }}>{successMsg}</Alert>}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  startIcon={<LockIcon />} 
                  onClick={handleEncrypt}
                  sx={{ 
                    borderRadius: '8px',
                    px: 3, py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)',
                    boxShadow: '0 4px 15px rgba(255, 111, 0, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffa040 0%, #ff8f00 100%)',
                    }
                  }}
                >
                  Encrypt
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  startIcon={<LockOpenIcon />} 
                  onClick={handleDecrypt}
                  sx={{ 
                    borderRadius: '8px', 
                    px: 3, py: 1.2, 
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  Decrypt
                </Button>
                {outputText && (
                  <Button 
                    variant="text" 
                    color="inherit"
                    startIcon={<SwapVertIcon />} 
                    onClick={swapInputs}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Swap Output to Input
                  </Button>
                )}
              </Box>

              {outputText && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                    Resulting Ciphertext / Plaintext:
                  </Typography>
                  <Box sx={{ 
                    position: 'relative', 
                    borderRadius: '12px',
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#f1f5f9',
                    border: `1px solid ${theme.palette.divider}`,
                    p: 2,
                    pr: 7,
                    minHeight: '60px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    {outputText}
                    <Tooltip title="Copy Output">
                      <IconButton 
                        onClick={() => copyToClipboard(outputText)}
                        sx={{ 
                          position: 'absolute', 
                          top: '8px', 
                          right: '8px',
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#f8fafc',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          height: '100%'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HelpOutlineIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Algorithm Insights
              </Typography>
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
              {algorithm}
            </Typography>

            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Security Rating:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 700, 
                  color: ALGO_INFO[algorithm].security.includes('Highly Secure') 
                    ? 'success.main' 
                    : ALGO_INFO[algorithm].security.includes('Legacy') 
                    ? 'warning.main' 
                    : 'error.main' 
                }}
              >
                {ALGO_INFO[algorithm].security}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
              {ALGO_INFO[algorithm].desc}
            </Typography>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SymmetricTab;

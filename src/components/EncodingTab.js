import React, { useState } from 'react';
import { 
  Box, TextField, Button, Grid, Typography, Card, CardContent, 
  IconButton, Tooltip, Alert, Slider, Tabs, Tab, useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ClearIcon from '@mui/icons-material/Clear';

import { encodingConvert, classicCiphers } from '../utils/cryptoHelper';

function EncodingTab() {
  const theme = useTheme();
  const [subTab, setSubTab] = useState(0); // 0: Encoding Converter, 1: Classic Ciphers

  // States for Converter
  const [textVal, setTextVal] = useState('');
  const [base64Val, setBase64Val] = useState('');
  const [hexVal, setHexVal] = useState('');
  const [binaryVal, setBinaryVal] = useState('');
  const [urlVal, setUrlVal] = useState('');
  const [convError, setConvError] = useState('');

  // States for Caesar/ROT13
  const [classicInput, setClassicInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [classicOutput, setClassicOutput] = useState('');
  const [classicSuccess, setClassicSuccess] = useState('');

  // Real-time update handlers for each field
  const updateFromText = (val) => {
    setTextVal(val);
    setConvError('');
    if (!val) {
      setBase64Val('');
      setHexVal('');
      setBinaryVal('');
      setUrlVal('');
      return;
    }
    setBase64Val(encodingConvert.textToBase64(val));
    setHexVal(encodingConvert.textToHex(val));
    setBinaryVal(encodingConvert.textToBinary(val));
    setUrlVal(encodingConvert.textToUrl(val));
  };

  const updateFromBase64 = (val) => {
    setBase64Val(val);
    setConvError('');
    if (!val.trim()) {
      setTextVal('');
      setHexVal('');
      setBinaryVal('');
      setUrlVal('');
      return;
    }
    const decoded = encodingConvert.base64ToText(val);
    if (decoded.startsWith('Error:')) {
      setConvError(decoded);
      return;
    }
    setTextVal(decoded);
    setHexVal(encodingConvert.textToHex(decoded));
    setBinaryVal(encodingConvert.textToBinary(decoded));
    setUrlVal(encodingConvert.textToUrl(decoded));
  };

  const updateFromHex = (val) => {
    setHexVal(val);
    setConvError('');
    const clean = val.replace(/[^0-9a-fA-F]/g, '');
    if (!clean) {
      setTextVal('');
      setBase64Val('');
      setBinaryVal('');
      setUrlVal('');
      return;
    }
    const decoded = encodingConvert.hexToText(clean);
    if (decoded.startsWith('Error:')) {
      // Don't show error immediately as they might be typing
      if (clean.length % 2 === 0) setConvError(decoded);
      return;
    }
    setTextVal(decoded);
    setBase64Val(encodingConvert.textToBase64(decoded));
    setBinaryVal(encodingConvert.textToBinary(decoded));
    setUrlVal(encodingConvert.textToUrl(decoded));
  };

  const updateFromBinary = (val) => {
    setBinaryVal(val);
    setConvError('');
    const clean = val.replace(/[^01]/g, '');
    if (!clean) {
      setTextVal('');
      setBase64Val('');
      setHexVal('');
      setUrlVal('');
      return;
    }
    const decoded = encodingConvert.binaryToText(clean);
    if (decoded.startsWith('Error:')) {
      if (clean.length % 8 === 0) setConvError(decoded);
      return;
    }
    setTextVal(decoded);
    setBase64Val(encodingConvert.textToBase64(decoded));
    setHexVal(encodingConvert.textToHex(decoded));
    setUrlVal(encodingConvert.textToUrl(decoded));
  };

  const updateFromUrl = (val) => {
    setUrlVal(val);
    setConvError('');
    if (!val) {
      setTextVal('');
      setBase64Val('');
      setHexVal('');
      setBinaryVal('');
      return;
    }
    const decoded = encodingConvert.urlToText(val);
    if (decoded.startsWith('Error:')) {
      setConvError(decoded);
      return;
    }
    setTextVal(decoded);
    setBase64Val(encodingConvert.textToBase64(decoded));
    setHexVal(encodingConvert.textToHex(decoded));
    setBinaryVal(encodingConvert.textToBinary(decoded));
  };

  // Classic operations
  const handleCaesarEncrypt = () => {
    setClassicSuccess('');
    const res = classicCiphers.caesarEncrypt(classicInput, caesarShift);
    setClassicOutput(res);
  };

  const handleCaesarDecrypt = () => {
    setClassicSuccess('');
    const res = classicCiphers.caesarDecrypt(classicInput, caesarShift);
    setClassicOutput(res);
  };

  const handleRot13 = () => {
    setClassicSuccess('');
    const res = classicCiphers.rot13(classicInput);
    setClassicOutput(res);
  };

  const copyFieldVal = (val, fieldName) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setClassicSuccess(`${fieldName} copied to clipboard!`);
  };

  const clearConverter = () => {
    setTextVal('');
    setBase64Val('');
    setHexVal('');
    setBinaryVal('');
    setUrlVal('');
    setConvError('');
  };

  const clearClassic = () => {
    setClassicInput('');
    setClassicOutput('');
    setClassicSuccess('');
  };

  return (
    <Card sx={{ 
      background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    }}>
      <CardContent sx={{ p: 4 }}>
        <Tabs 
          value={subTab} 
          onChange={(e, val) => setSubTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Encoding Converter" icon={<CompareArrowsIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="Classical Ciphers" icon={<BorderColorIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>

        {subTab === 0 ? (
          // ==================== TAB 0: ENCODING CONVERTER ====================
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Dynamic Encoding Translator
              </Typography>
              <Button size="small" color="inherit" onClick={clearConverter} startIcon={<ClearIcon />}>
                Clear All
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              Type in any text area to translate string representations in real time. Standardized to UTF-8.
            </Typography>

            {convError && <Alert severity="warning" sx={{ mb: 3, borderRadius: '8px' }}>{convError}</Alert>}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Text (UTF-8 / Plaintext)"
                  multiline
                  rows={3}
                  value={textVal}
                  onChange={(e) => updateFromText(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  InputProps={{
                    endAdornment: textVal && (
                      <IconButton size="small" onClick={() => copyFieldVal(textVal, 'Text')} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Base64 Encoding"
                  multiline
                  rows={3}
                  value={base64Val}
                  onChange={(e) => updateFromBase64(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  InputProps={{
                    endAdornment: base64Val && (
                      <IconButton size="small" onClick={() => copyFieldVal(base64Val, 'Base64')} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hexadecimal (Hex String)"
                  multiline
                  rows={3}
                  value={hexVal}
                  onChange={(e) => updateFromHex(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  InputProps={{
                    endAdornment: hexVal && (
                      <IconButton size="small" onClick={() => copyFieldVal(hexVal, 'Hex')} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="URL Encoded"
                  multiline
                  rows={3}
                  value={urlVal}
                  onChange={(e) => updateFromUrl(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  InputProps={{
                    endAdornment: urlVal && (
                      <IconButton size="small" onClick={() => copyFieldVal(urlVal, 'URL')} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Binary (01010101... space separated)"
                  multiline
                  rows={3}
                  value={binaryVal}
                  onChange={(e) => updateFromBinary(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  InputProps={{
                    endAdornment: binaryVal && (
                      <IconButton size="small" onClick={() => copyFieldVal(binaryVal, 'Binary')} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          // ==================== TAB 1: CLASSIC CIPHERS ====================
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Caesar & ROT13 Ciphers
              </Typography>
              <Button size="small" color="inherit" onClick={clearClassic} startIcon={<ClearIcon />}>
                Clear
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Input Plaintext / Ciphertext"
                    multiline
                    rows={4}
                    value={classicInput}
                    onChange={(e) => setClassicInput(e.target.value)}
                    fullWidth
                    placeholder="Type Caesar message here..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />

                  {/* Slider for Shift */}
                  <Box sx={{ px: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                      Caesar Shift Key: {caesarShift}
                    </Typography>
                    <Slider
                      value={caesarShift}
                      onChange={(e, val) => setCaesarShift(val)}
                      min={-25}
                      max={25}
                      step={1}
                      marks={[
                        { value: -25, label: '-25' },
                        { value: 0, label: '0' },
                        { value: 3, label: '3 (Default)' },
                        { value: 13, label: '13' },
                        { value: 25, label: '25' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  {classicSuccess && <Alert severity="success" sx={{ borderRadius: '8px' }}>{classicSuccess}</Alert>}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={handleCaesarEncrypt} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                      Caesar Encrypt
                    </Button>
                    <Button variant="outlined" onClick={handleCaesarDecrypt} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                      Caesar Decrypt
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleRot13} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}>
                      ROT13 (Shift 13)
                    </Button>
                  </Box>

                  {classicOutput && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                        Result:
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
                        fontSize: '0.95rem'
                      }}>
                        {classicOutput}
                        <Tooltip title="Copy Output">
                          <IconButton 
                            onClick={() => copyFieldVal(classicOutput, 'Output')}
                            sx={{ 
                              position: 'absolute', 
                              top: '8px', 
                              right: '8px',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ 
                  background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <HelpOutlineIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Classical Ciphers Info
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                      • <strong>Caesar Cipher:</strong> One of the earliest and simplest ciphers. It is a substitution cipher where each letter in the plaintext is shifted a fixed number of positions down the alphabet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                      • <strong>ROT13:</strong> A special case of the Caesar cipher with a shift of 13. Since there are 26 letters in the basic Latin alphabet, ROT13 is its own inverse; encrypting and decrypting are performed by the exact same operation.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      These algorithms are trivial to break and are kept solely for historical interest and educational play.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default EncodingTab;

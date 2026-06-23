import React, { useState } from 'react';
import { 
  Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, Grid, Typography, Card, CardContent, 
  Tabs, Tab, IconButton, Tooltip, Alert, CircularProgress, useTheme
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ClearIcon from '@mui/icons-material/Clear';

import { asymmetricCrypto } from '../utils/cryptoHelper';

function AsymmetricTab() {
  const theme = useTheme();
  
  // States for Key Generation
  const [keySize, setKeySize] = useState(2048);
  const [keyType, setKeyType] = useState('encrypt'); // 'encrypt' for RSA-OAEP, 'sign' for RSASSA-PKCS1-v1_5
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [generating, setGenerating] = useState(false);

  // States for Operations
  const [operationTab, setOperationTab] = useState(0); // 0: Encrypt, 1: Decrypt, 2: Sign, 3: Verify
  const [pemKey, setPemKey] = useState('');
  const [inputText, setInputText] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [outputText, setOutputText] = useState('');
  
  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sigStatus, setSigStatus] = useState(null); // null, true (valid), false (invalid)

  const handleGenerateKeys = async () => {
    setGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const pair = await asymmetricCrypto.generateKeyPair(keySize, keyType);
      setPublicKey(pair.publicKey);
      setPrivateKey(pair.privateKey);
      
      // Auto-load public key for encryption/verification, or private key for decryption/signing
      if (keyType === 'encrypt') {
        setPemKey(operationTab === 0 ? pair.publicKey : pair.privateKey);
      } else {
        setPemKey(operationTab === 2 ? pair.privateKey : pair.publicKey);
      }
      
      setSuccessMsg(`Successfully generated ${keySize}-bit RSA key pair for ${keyType === 'encrypt' ? 'Encryption' : 'Digital Signatures'}!`);
    } catch (err) {
      setErrorMsg('Key generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExecuteOperation = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setOutputText('');
    setSigStatus(null);

    if (!pemKey) {
      setErrorMsg('Please provide the corresponding RSA PEM key.');
      return;
    }
    if (!inputText) {
      setErrorMsg('Please enter the input text.');
      return;
    }

    try {
      if (operationTab === 0) {
        // RSA Encrypt
        const result = await asymmetricCrypto.encrypt(pemKey, inputText);
        setOutputText(result);
        setSuccessMsg('Text successfully encrypted with RSA-OAEP!');
      } else if (operationTab === 1) {
        // RSA Decrypt
        const result = await asymmetricCrypto.decrypt(pemKey, inputText);
        setOutputText(result);
        setSuccessMsg('Ciphertext successfully decrypted with RSA-OAEP!');
      } else if (operationTab === 2) {
        // RSA Sign
        const result = await asymmetricCrypto.sign(pemKey, inputText);
        setOutputText(result);
        setSuccessMsg('Message successfully signed using RSASSA-PKCS1-v1_5!');
      } else if (operationTab === 3) {
        // RSA Verify
        if (!signatureText) {
          setErrorMsg('Please enter the signature to verify.');
          return;
        }
        const isValid = await asymmetricCrypto.verify(pemKey, inputText, signatureText);
        setSigStatus(isValid);
        if (isValid) {
          setSuccessMsg('Signature is VALID. The message has integrity and authenticity.');
        } else {
          setErrorMsg('Signature is INVALID! The key mismatch or data was tampered.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Ensure your key type and format are correct.');
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSuccessMsg('Copied to clipboard!');
  };

  const loadGeneratedKey = (type) => {
    if (type === 'public') {
      setPemKey(publicKey);
    } else {
      setPemKey(privateKey);
    }
    setSuccessMsg(`Loaded generated ${type} key.`);
  };

  const clearAll = () => {
    setPemKey('');
    setInputText('');
    setSignatureText('');
    setOutputText('');
    setErrorMsg('');
    setSuccessMsg('');
    setSigStatus(null);
  };

  return (
    <Grid container spacing={3}>
      {/* 1. Key Generation Card */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          height: '100%'
        }}>
          <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon color="primary" /> RSA Key Generator
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Key Size (bits)</InputLabel>
                  <Select
                    value={keySize}
                    onChange={(e) => setKeySize(e.target.value)}
                    label="Key Size (bits)"
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value={1024}>1024 (Legacy/Fast)</MenuItem>
                    <MenuItem value={2048}>2048 (Recommended)</MenuItem>
                    <MenuItem value={4096}>4096 (Ultra-Secure)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Key Usage Purpose</InputLabel>
                  <Select
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value)}
                    label="Key Usage Purpose"
                    sx={{ borderRadius: '8px' }}
                  >
                    <MenuItem value="encrypt">Encryption (RSA-OAEP)</MenuItem>
                    <MenuItem value="sign">Signatures (PKCS1_v1.5)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              fullWidth
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <KeyIcon />}
              onClick={handleGenerateKeys}
              disabled={generating}
              sx={{ 
                borderRadius: '8px',
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)',
                boxShadow: '0 4px 15px rgba(255, 111, 0, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ffa040 0%, #ff8f00 100%)',
                }
              }}
            >
              {generating ? 'Generating Key Pair...' : 'Generate Secure RSA Key Pair'}
            </Button>

            {publicKey && (
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Public Key</Typography>
                    <Box>
                      <Button size="small" onClick={() => loadGeneratedKey('public')} sx={{ mr: 1, textTransform: 'none' }}>
                        Load as Active Key
                      </Button>
                      <IconButton size="small" onClick={() => copyToClipboard(publicKey)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <TextField
                    multiline
                    rows={4}
                    value={publicKey}
                    readOnly
                    fullWidth
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem' }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Private Key</Typography>
                    <Box>
                      <Button size="small" onClick={() => loadGeneratedKey('private')} sx={{ mr: 1, textTransform: 'none' }}>
                        Load as Active Key
                      </Button>
                      <IconButton size="small" onClick={() => copyToClipboard(privateKey)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <TextField
                    multiline
                    rows={4}
                    value={privateKey}
                    readOnly
                    fullWidth
                    InputProps={{ readOnly: true }}
                    type="password"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.75rem' }
                    }}
                  />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* 2. Operations Card */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : '#ffffff',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          height: '100%'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Asymmetric Operations
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

            <Tabs 
              value={operationTab} 
              onChange={(e, val) => {
                setOperationTab(val);
                setErrorMsg('');
                setSuccessMsg('');
                setOutputText('');
                setSigStatus(null);
              }}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Encrypt" icon={<LockIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
              <Tab label="Decrypt" icon={<LockOpenIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
              <Tab label="Sign" icon={<DriveFileRenameOutlineIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
              <Tab label="Verify" icon={<VerifiedIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 700 }} />
            </Tabs>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  {operationTab === 0 || operationTab === 3 ? 'Public Key (PEM format)' : 'Private Key (PEM format)'}
                </Typography>
                <TextField
                  placeholder={`Paste RSA PEM ${operationTab === 0 || operationTab === 3 ? 'Public' : 'Private'} Key here...`}
                  multiline
                  rows={5}
                  value={pemKey}
                  onChange={(e) => setPemKey(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }
                  }}
                />
              </Box>

              <TextField
                label={operationTab === 1 ? "Ciphertext (Base64)" : "Input Message / Data"}
                multiline
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                fullWidth
                placeholder={operationTab === 1 ? "Paste the encrypted text here..." : "Type the message here..."}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                }}
              />

              {operationTab === 3 && (
                <TextField
                  label="Digital Signature to Verify (Base64)"
                  multiline
                  rows={2}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  fullWidth
                  placeholder="Paste signature here..."
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                  }}
                />
              )}

              {errorMsg && <Alert severity="error" sx={{ borderRadius: '8px' }}>{errorMsg}</Alert>}
              {successMsg && <Alert severity="success" sx={{ borderRadius: '8px' }}>{successMsg}</Alert>}

              {sigStatus !== null && (
                <Alert 
                  severity={sigStatus ? 'success' : 'error'} 
                  sx={{ borderRadius: '8px', fontWeight: 700 }}
                  icon={sigStatus ? <VerifiedIcon fontSize="inherit" /> : undefined}
                >
                  {sigStatus ? 'Signature Verification PASSED! Integrity verified.' : 'Signature Verification FAILED! The data might have been edited or key is incorrect.'}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleExecuteOperation}
                startIcon={
                  operationTab === 0 ? <LockIcon /> : 
                  operationTab === 1 ? <LockOpenIcon /> : 
                  operationTab === 2 ? <DriveFileRenameOutlineIcon /> : <VerifiedIcon />
                }
                sx={{ 
                  borderRadius: '8px', 
                  py: 1.2, 
                  fontWeight: 700, 
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
                }}
              >
                {operationTab === 0 ? 'Encrypt with Public Key' : 
                 operationTab === 1 ? 'Decrypt with Private Key' : 
                 operationTab === 2 ? 'Generate Signature' : 'Verify Signature'}
              </Button>

              {outputText && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                    {operationTab === 2 ? 'Resulting Signature (Base64):' : 'Output Result:'}
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default AsymmetricTab;

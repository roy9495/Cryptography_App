import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, Grid, Typography, Card, CardContent, 
  Switch, FormControlLabel, IconButton, Tooltip, Alert, 
  LinearProgress, useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import ClearIcon from '@mui/icons-material/Clear';

import CryptoJS from 'crypto-js';
import CRC32 from 'crc-32';
import { hashingCrypto } from '../utils/cryptoHelper';

const ALGORITHMS = ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512', 'SHA3', 'CRC32', 'Adler32'];

const HASH_INFO = {
  MD5: {
    security: 'Broken (Cryptographically Vulnerable)',
    desc: 'MD5 is a widely used hash function that produces a 128-bit hash value. It has been shown to suffer from collision vulnerabilities. It should not be used for security-critical tasks.',
    recommendation: 'Use only for verification of legacy files.'
  },
  SHA1: {
    security: 'Deprecated (Cryptographically Broken)',
    desc: 'SHA-1 produces a 160-bit digest. Theoretical and practical attacks have demonstrated that collisions can be generated in under a day. Deprecated by major web standards.',
    recommendation: 'Avoid for any security-related design.'
  },
  SHA224: {
    security: 'Secure (SHA-2 Family)',
    desc: 'SHA-224 is a variant of SHA-256 with a truncated 224-bit hash size. It offers strong security but is less commonly used than SHA-256.',
    recommendation: 'Safe for cryptographic hashing.'
  },
  SHA256: {
    security: 'Highly Secure (Industry Standard)',
    desc: 'SHA-256 produces a 256-bit hash. It is widely used in security protocols (SSL/TLS, SSH), blockchain systems (Bitcoin), and file integrity verification.',
    recommendation: 'Excellent choice for file verification, key derivation, and standard hashing.'
  },
  SHA384: {
    security: 'Highly Secure (SHA-2 Family)',
    desc: 'SHA-384 is a variant of SHA-512 with a truncated 384-bit output size. It offers extremely high security.',
    recommendation: 'Great for high-security applications.'
  },
  SHA512: {
    security: 'Highly Secure (SHA-2 Family)',
    desc: 'SHA-512 produces a 512-bit digest. It is very fast on 64-bit architectures and provides extreme cryptographic strength.',
    recommendation: 'Recommended for heavy cryptography and signatures.'
  },
  SHA3: {
    security: 'Highly Secure (Latest Keccak Standard)',
    desc: 'SHA-3 is the newest member of the Secure Hash Algorithm family, standardized in 2015. It uses a completely different Keccak design than SHA-2, offering an alternative in case SHA-2 is ever compromised.',
    recommendation: 'Excellent modern choice for state-of-the-art systems.'
  },
  CRC32: {
    security: 'No Cryptographic Security (Error-Detecting Code)',
    desc: 'CRC-32 is a cyclic redundancy check designed to detect accidental changes in digital data (e.g. network packets, ZIP file structures). It is NOT a cryptographic hash and can be easily forged.',
    recommendation: 'Use only for non-secure data integrity checks.'
  },
  Adler32: {
    security: 'No Cryptographic Security (Checksum)',
    desc: 'Adler-32 is a checksum algorithm that is faster but less reliable than CRC-32 for detecting data corruption. It has zero cryptographic strength.',
    recommendation: 'Use for quick, non-secure checksum applications.'
  }
};

function HashTab() {
  const theme = useTheme();

  // Basic States
  const [algorithm, setAlgorithm] = useState('SHA256');
  const [inputText, setInputText] = useState('');
  const [hmacMode, setHmacMode] = useState(false);
  const [hmacKey, setHmacKey] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  
  // File Hashing States
  const [file, setFile] = useState(null);
  const [hashingFile, setHashingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);

  // Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculate hash for text input
  useEffect(() => {
    if (!file) {
      calculateTextHash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, algorithm, hmacMode, hmacKey, file]);

  const calculateTextHash = () => {
    setErrorMsg('');
    if (!inputText) {
      setHashOutput('');
      return;
    }

    try {
      let result = '';
      if (hmacMode) {
        if (!hmacKey) {
          setHashOutput('');
          return;
        }
        if (algorithm === 'CRC32' || algorithm === 'Adler32') {
          setErrorMsg('HMAC is not supported for CRC32 or Adler32 checksums.');
          setHashOutput('');
          return;
        }
        result = hashingCrypto.hmac(algorithm, inputText, hmacKey);
      } else {
        result = hashingCrypto.hash(algorithm, inputText);
      }
      setHashOutput(result);
    } catch (e) {
      setErrorMsg('Hashing calculation error.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setInputText(''); // Reset text input when file is loaded
      setHashOutput('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const calculateFileHash = () => {
    if (!file) return;
    if (hmacMode && !hmacKey) {
      setErrorMsg('Please enter an HMAC key to authenticate the file.');
      return;
    }
    if ((algorithm === 'CRC32' || algorithm === 'Adler32') && hmacMode) {
      setErrorMsg('HMAC is not supported for CRC32 or Adler32.');
      return;
    }

    setHashingFile(true);
    setFileProgress(0);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();

    // Custom progress handler for larger files
    reader.onprogress = (data) => {
      if (data.lengthComputable) {
        const progress = Math.round((data.loaded / data.total) * 100);
        setFileProgress(progress);
      }
    };

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        // CryptoJS requires WordArray. We convert the ArrayBuffer to WordArray.
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        
        let result = '';
        if (hmacMode) {
          let hmacAlgo;
          switch (algorithm) {
            case 'MD5': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.MD5, hmacKey); break;
            case 'SHA1': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, hmacKey); break;
            case 'SHA224': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA224, hmacKey); break;
            case 'SHA256': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, hmacKey); break;
            case 'SHA384': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA384, hmacKey); break;
            case 'SHA512': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA512, hmacKey); break;
            case 'SHA3': hmacAlgo = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA3, hmacKey); break;
            default: throw new Error('Unsupported HMAC algorithm.');
          }
          hmacAlgo.update(wordArray);
          result = hmacAlgo.finalize().toString();
        } else {
          if (algorithm === 'CRC32') {
            // Read as binary string or process using crc-32 buffer converter
            const bytes = new Uint8Array(arrayBuffer);
            const crc = CRC32.buf(bytes);
            result = (crc >>> 0).toString(16).padStart(8, '0');
          } else if (algorithm === 'Adler32') {
            // Manual Adler32 for file bytes
            const bytes = new Uint8Array(arrayBuffer);
            let a = 1, b = 0;
            for (let i = 0; i < bytes.length; i++) {
              a = (a + bytes[i]) % 65521;
              b = (b + a) % 65521;
            }
            result = ((b << 16) | a).toString(16).padStart(8, '0');
          } else {
            let hashAlgo;
            switch (algorithm) {
              case 'MD5': hashAlgo = CryptoJS.algo.MD5.create(); break;
              case 'SHA1': hashAlgo = CryptoJS.algo.SHA1.create(); break;
              case 'SHA224': hashAlgo = CryptoJS.algo.SHA224.create(); break;
              case 'SHA256': hashAlgo = CryptoJS.algo.SHA256.create(); break;
              case 'SHA384': hashAlgo = CryptoJS.algo.SHA384.create(); break;
              case 'SHA512': hashAlgo = CryptoJS.algo.SHA512.create(); break;
              case 'SHA3': hashAlgo = CryptoJS.algo.SHA3.create(); break;
              default: throw new Error('Unsupported algorithm.');
            }
            hashAlgo.update(wordArray);
            result = hashAlgo.finalize().toString();
          }
        }

        setHashOutput(result);
        setSuccessMsg(`File checksum computed successfully!`);
      } catch (err) {
        setErrorMsg('Error computing hash for the file.');
      } finally {
        setHashingFile(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading file.');
      setHashingFile(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSuccessMsg('Hash copied to clipboard!');
  };

  const clearAll = () => {
    setInputText('');
    setFile(null);
    setHashOutput('');
    setErrorMsg('');
    setSuccessMsg('');
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
                Secure Hashing & Checksums
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
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hash Function</InputLabel>
                    <Select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      label="Hash Function"
                      sx={{ borderRadius: '8px' }}
                    >
                      {ALGORITHMS.map((algo) => (
                        <MenuItem key={algo} value={algo}>{algo}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={hmacMode} 
                        onChange={(e) => setHmacMode(e.target.checked)} 
                        disabled={algorithm === 'CRC32' || algorithm === 'Adler32'}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Enable HMAC (Hash Message Authentication)
                        <Tooltip title="HMAC combines a cryptographic hash function with a secret cryptographic key. It is used to simultaneously verify both the data integrity and the authenticity of a message.">
                          <HelpOutlineIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>

              {hmacMode && (
                <TextField
                  label="HMAC Secret Key"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  fullWidth
                  placeholder="Enter secret key to authenticate hash"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                  }}
                />
              )}

              {/* Toggle Input: Text or File */}
              {!file ? (
                <Box>
                  <TextField
                    label="Input Message for Hashing"
                    multiline
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    fullWidth
                    placeholder="Type or paste text to hash instantly..."
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      — OR —
                    </Typography>
                  </Box>
                </Box>
              ) : null}

              {/* File Uploader */}
              <Box sx={{ 
                border: `2px dashed ${file ? theme.palette.success.main : theme.palette.divider}`,
                borderRadius: '12px',
                p: file ? 2 : 4,
                textAlign: 'center',
                backgroundColor: file 
                  ? (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.05)' : 'rgba(46, 125, 50, 0.02)')
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <FilePresentIcon sx={{ fontSize: '2.5rem', color: file ? 'success.main' : 'text.secondary' }} />
                {file ? (
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Selected File: {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Size: {(file.size / 1024).toFixed(2)} KB ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={calculateFileHash}
                        disabled={hashingFile}
                      >
                        Compute Checksum
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        color="error" 
                        onClick={() => setFile(null)}
                        disabled={hashingFile}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Select a file to calculate its cryptographic hash
                    </Typography>
                    <input
                      accept="*/*"
                      style={{ display: 'none' }}
                      id="hash-file-button"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="hash-file-button">
                      <Button variant="outlined" component="span" size="small">
                        Browse File
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>

              {hashingFile && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                    Reading and hashing file... {fileProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={fileProgress} />
                </Box>
              )}

              {errorMsg && <Alert severity="error" sx={{ borderRadius: '8px' }}>{errorMsg}</Alert>}
              {successMsg && <Alert severity="success" sx={{ borderRadius: '8px' }}>{successMsg}</Alert>}

              {hashOutput && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                    Calculated Hash ({hmacMode ? `HMAC-${algorithm}` : algorithm}):
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
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    {hashOutput}
                    <Tooltip title="Copy Checksum">
                      <IconButton 
                        onClick={() => copyToClipboard(hashOutput)}
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

      <Grid item xs={12} md={5}>
        <Card sx={{ 
          background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.2)' : '#f8fafc',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          height: '100%'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShieldIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Security Analysis
              </Typography>
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
              {algorithm}
            </Typography>

            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="caption" display="block" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Status:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 700, 
                  color: HASH_INFO[algorithm].security.includes('Highly Secure') || HASH_INFO[algorithm].security.includes('Secure') 
                    ? 'success.main' 
                    : HASH_INFO[algorithm].security.includes('Deprecated') 
                    ? 'warning.main' 
                    : 'error.main' 
                }}
              >
                {HASH_INFO[algorithm].security}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
              {HASH_INFO[algorithm].desc}
            </Typography>

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default HashTab;

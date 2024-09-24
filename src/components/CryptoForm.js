import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import CryptoJS from 'crypto-js';
import CRC32 from 'crc-32';

const algorithms = ['MD5', 'SHA1', 'SHA256', 'SHA512', 'CRC32', 'AES'];

function CryptoForm() {
  const [inputText, setInputText] = useState('');
  const [algorithm, setAlgorithm] = useState('MD5');
  const [outputText, setOutputText] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleEncrypt = () => {
    let result = '';
    switch (algorithm) {
      case 'MD5':
        result = CryptoJS.MD5(inputText).toString();
        break;
      case 'SHA1':
        result = CryptoJS.SHA1(inputText).toString();
        break;
      case 'SHA256':
        result = CryptoJS.SHA256(inputText).toString();
        break;
      case 'SHA512':
        result = CryptoJS.SHA512(inputText).toString();
        break;
      case 'CRC32':
        result = CRC32.str(inputText).toString(16); // CRC32 as hexadecimal
        break;
      case 'AES':
        result = CryptoJS.AES.encrypt(inputText, secretKey).toString();
        break;
      default:
        result = inputText;
    }
    setOutputText(result);
  };

  const handleDecrypt = () => {
    let result = '';
    if (algorithm === 'AES') {
      try {
        const decrypted = CryptoJS.AES.decrypt(inputText, secretKey);
        result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) {
          result = 'Invalid key or text!';
        }
      } catch (error) {
        result = 'Decryption failed!';
      }
    } else {
      result = 'Decryption is not supported for hash algorithms.';
    }
    setOutputText(result);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Input Text"
        variant="outlined"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        fullWidth
      />
      {algorithm === 'AES' && (
        <TextField
          label="Secret Key"
          variant="outlined"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          fullWidth
          type="password"
        />
      )}
      <FormControl fullWidth>
        <InputLabel>Algorithm</InputLabel>
        <Select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          label="Algorithm"
        >
          {algorithms.map((algo) => (
            <MenuItem key={algo} value={algo}>
              {algo}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={handleEncrypt}>
          Encrypt
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDecrypt}>
          Decrypt
        </Button>
      </Box>
      {outputText && (
        <Typography variant="body1" sx={{ wordBreak: 'break-all', mt: 2 }}>
          Output: {outputText}
        </Typography>
      )}
    </Box>
  );
}

export default CryptoForm;

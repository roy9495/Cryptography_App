import CryptoJS from 'crypto-js';
import CRC32 from 'crc-32';

// ==========================================
// 1. Encoding Converters (Text, Hex, Base64, Binary, URL)
// ==========================================

export const encodingConvert = {
  textToBase64: (str) => {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return 'Error: Invalid UTF-8 text';
    }
  },
  base64ToText: (str) => {
    try {
      return decodeURIComponent(escape(window.atob(str.trim())));
    } catch (e) {
      return 'Error: Invalid Base64 string';
    }
  },
  textToHex: (str) => {
    try {
      return Array.from(new TextEncoder().encode(str))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      return 'Error';
    }
  },
  hexToText: (hex) => {
    try {
      const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
      if (cleanHex.length % 2 !== 0) return 'Error: Hex string must have an even length';
      const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return 'Error: Invalid Hex string';
    }
  },
  textToBinary: (str) => {
    try {
      return Array.from(new TextEncoder().encode(str))
        .map(b => b.toString(2).padStart(8, '0'))
        .join(' ');
    } catch (e) {
      return 'Error';
    }
  },
  binaryToText: (bin) => {
    try {
      const cleanBin = bin.replace(/[^01]/g, '');
      if (cleanBin.length % 8 !== 0) return 'Error: Binary string length must be a multiple of 8';
      const bytes = new Uint8Array(cleanBin.match(/.{1,8}/g).map(byte => parseInt(byte, 2)));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return 'Error: Invalid Binary string';
    }
  },
  textToUrl: (str) => {
    try {
      return encodeURIComponent(str);
    } catch (e) {
      return 'Error';
    }
  },
  urlToText: (str) => {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return 'Error: Invalid URL encoded string';
    }
  }
};

// ==========================================
// 2. Symmetric Cryptography (Crypto-js Wrapper)
// ==========================================

export const symmetricCrypto = {
  encrypt: (algorithm, text, key, config = {}) => {
    if (!text) return '';
    if (!key && algorithm !== 'Caesar' && algorithm !== 'ROT13') {
      throw new Error('Key is required for symmetric encryption.');
    }

    let mode, padding;
    if (config.mode) {
      mode = CryptoJS.mode[config.mode];
    }
    if (config.padding) {
      padding = CryptoJS.pad[config.padding];
    }

    const cryptoOptions = { mode, padding };
    if (config.iv) {
      cryptoOptions.iv = CryptoJS.enc.Hex.parse(config.iv);
    }

    let encrypted;
    switch (algorithm) {
      case 'AES':
        encrypted = CryptoJS.AES.encrypt(text, key, cryptoOptions);
        break;
      case 'DES':
        encrypted = CryptoJS.DES.encrypt(text, key, cryptoOptions);
        break;
      case 'TripleDES':
        encrypted = CryptoJS.TripleDES.encrypt(text, key, cryptoOptions);
        break;
      case 'RC4':
        encrypted = CryptoJS.RC4.encrypt(text, key);
        break;
      case 'Rabbit':
        encrypted = CryptoJS.Rabbit.encrypt(text, key);
        break;
      default:
        throw new Error(`Unsupported symmetric algorithm: ${algorithm}`);
    }

    // Output formats: Base64 (default) or Hex
    if (config.outputFormat === 'hex') {
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }
    return encrypted.toString(); // Default Base64 string
  },

  decrypt: (algorithm, ciphertext, key, config = {}) => {
    if (!ciphertext) return '';
    if (!key) {
      throw new Error('Key is required for symmetric decryption.');
    }

    let mode, padding;
    if (config.mode) {
      mode = CryptoJS.mode[config.mode];
    }
    if (config.padding) {
      padding = CryptoJS.pad[config.padding];
    }

    const cryptoOptions = { mode, padding };
    if (config.iv) {
      cryptoOptions.iv = CryptoJS.enc.Hex.parse(config.iv);
    }

    // If input is in Hex format, parse it to cipher params
    let inputData = ciphertext;
    if (config.outputFormat === 'hex') {
      inputData = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
      });
    }

    let decrypted;
    switch (algorithm) {
      case 'AES':
        decrypted = CryptoJS.AES.decrypt(inputData, key, cryptoOptions);
        break;
      case 'DES':
        decrypted = CryptoJS.DES.decrypt(inputData, key, cryptoOptions);
        break;
      case 'TripleDES':
        decrypted = CryptoJS.TripleDES.decrypt(inputData, key, cryptoOptions);
        break;
      case 'RC4':
        decrypted = CryptoJS.RC4.decrypt(inputData, key);
        break;
      case 'Rabbit':
        decrypted = CryptoJS.Rabbit.decrypt(inputData, key);
        break;
      default:
        throw new Error(`Unsupported symmetric algorithm: ${algorithm}`);
    }

    try {
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Incorrect key or corrupted ciphertext');
      return result;
    } catch (e) {
      throw new Error('Decryption failed! Please check your key, IV, or formatting.');
    }
  }
};

// ==========================================
// 3. Hashing & HMAC
// ==========================================

export const hashingCrypto = {
  hash: (algorithm, text) => {
    if (!text) return '';
    switch (algorithm) {
      case 'MD5':
        return CryptoJS.MD5(text).toString();
      case 'SHA1':
        return CryptoJS.SHA1(text).toString();
      case 'SHA224':
        return CryptoJS.SHA224(text).toString();
      case 'SHA256':
        return CryptoJS.SHA256(text).toString();
      case 'SHA384':
        return CryptoJS.SHA384(text).toString();
      case 'SHA512':
        return CryptoJS.SHA512(text).toString();
      case 'SHA3':
        return CryptoJS.SHA3(text).toString();
      case 'CRC32':
        // CRC32 returns a 32-bit signed integer. Convert to hex string.
        const crc = CRC32.str(text);
        return (crc >>> 0).toString(16).padStart(8, '0');
      case 'Adler32':
        return adler32(text).toString(16).padStart(8, '0');
      default:
        return '';
    }
  },

  hmac: (algorithm, text, key) => {
    if (!text || !key) return '';
    switch (algorithm) {
      case 'MD5':
        return CryptoJS.HmacMD5(text, key).toString();
      case 'SHA1':
        return CryptoJS.HmacSHA1(text, key).toString();
      case 'SHA224':
        return CryptoJS.HmacSHA224(text, key).toString();
      case 'SHA256':
        return CryptoJS.HmacSHA256(text, key).toString();
      case 'SHA384':
        return CryptoJS.HmacSHA384(text, key).toString();
      case 'SHA512':
        return CryptoJS.HmacSHA512(text, key).toString();
      case 'SHA3':
        return CryptoJS.HmacSHA3(text, key).toString();
      default:
        return '';
    }
  }
};

// Helper Adler32 algorithm implementation
function adler32(str) {
  let a = 1, b = 0;
  for (let i = 0; i < str.length; i++) {
    a = (a + str.charCodeAt(i)) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

// ==========================================
// 4. Asymmetric Cryptography (RSA via Web Crypto API)
// ==========================================

// Helper functions for base64 / PEM conversion
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function formatBase64(str) {
  const matches = str.match(/.{1,64}/g);
  return matches ? matches.join('\n') : str;
}

function pemToArrayBuffer(pem, type) {
  const header = `-----BEGIN ${type} KEY-----`;
  const footer = `-----END ${type} KEY-----`;
  let pemContents = pem.trim();
  if (pemContents.startsWith(header)) {
    pemContents = pemContents.substring(header.length);
  }
  if (pemContents.endsWith(footer)) {
    pemContents = pemContents.substring(0, pemContents.length - footer.length);
  }
  pemContents = pemContents.replace(/\s/g, '');
  const binary = window.atob(pemContents);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const asymmetricCrypto = {
  // Generate RSA Keypair
  generateKeyPair: async (keySize = 2048, type = 'encrypt') => {
    const isEncrypt = type === 'encrypt';
    const algorithm = {
      name: isEncrypt ? 'RSA-OAEP' : 'RSASSA-PKCS1-v1_5',
      modulusLength: keySize,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    };

    const keyUsages = isEncrypt ? ['encrypt', 'decrypt'] : ['sign', 'verify'];
    const keyPair = await window.crypto.subtle.generateKey(algorithm, true, keyUsages);

    // Export keys
    const pubBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const pubPEM = `-----BEGIN PUBLIC KEY-----\n${formatBase64(arrayBufferToBase64(pubBuffer))}\n-----END PUBLIC KEY-----`;
    const privPEM = `-----BEGIN PRIVATE KEY-----\n${formatBase64(arrayBufferToBase64(privBuffer))}\n-----END PRIVATE KEY-----`;

    return { publicKey: pubPEM, privateKey: privPEM };
  },

  // RSA Encrypt
  encrypt: async (publicKeyPem, text) => {
    try {
      const spkiBuffer = pemToArrayBuffer(publicKeyPem, 'PUBLIC');
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        spkiBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );

      const encoder = new TextEncoder();
      const encodedText = encoder.encode(text);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        encodedText
      );

      return arrayBufferToBase64(encryptedBuffer);
    } catch (e) {
      console.error(e);
      throw new Error('Encryption failed! Ensure the public key is a valid RSA-OAEP PEM key.');
    }
  },

  // RSA Decrypt
  decrypt: async (privateKeyPem, ciphertextBase64) => {
    try {
      const pkcs8Buffer = pemToArrayBuffer(privateKeyPem, 'PRIVATE');
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        pkcs8Buffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
      );

      const binaryCipher = window.atob(ciphertextBase64.trim().replace(/\s/g, ''));
      const cipherBytes = new Uint8Array(binaryCipher.length);
      for (let i = 0; i < binaryCipher.length; i++) {
        cipherBytes[i] = binaryCipher.charCodeAt(i);
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        cipherBytes
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      console.error(e);
      throw new Error('Decryption failed! Ensure the private key is a valid RSA-OAEP PEM key and matches the ciphertext.');
    }
  },

  // RSA Sign
  sign: async (privateKeyPem, text) => {
    try {
      const pkcs8Buffer = pemToArrayBuffer(privateKeyPem, 'PRIVATE');
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        pkcs8Buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        privateKey,
        data
      );

      return arrayBufferToBase64(signatureBuffer);
    } catch (e) {
      console.error(e);
      throw new Error('Signing failed! Ensure private key is a valid RSASSA-PKCS1-v1_5 private key.');
    }
  },

  // RSA Verify
  verify: async (publicKeyPem, text, signatureBase64) => {
    try {
      const spkiBuffer = pemToArrayBuffer(publicKeyPem, 'PUBLIC');
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        spkiBuffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const binarySignature = window.atob(signatureBase64.trim().replace(/\s/g, ''));
      const sigBytes = new Uint8Array(binarySignature.length);
      for (let i = 0; i < binarySignature.length; i++) {
        sigBytes[i] = binarySignature.charCodeAt(i);
      }

      const isValid = await window.crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        publicKey,
        sigBytes,
        data
      );

      return isValid;
    } catch (e) {
      console.error(e);
      throw new Error('Verification failed! Check your public key, input data, and signature format.');
    }
  }
};

// ==========================================
// 5. File Cryptography (PBKDF2 + AES-256-GCM)
// ==========================================

export const fileCrypto = {
  encrypt: async (file, password, onProgress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileData = e.target.result;

          // 1. Generate random salt (16 bytes) and IV (12 bytes)
          const salt = window.crypto.getRandomValues(new Uint8Array(16));
          const iv = window.crypto.getRandomValues(new Uint8Array(12));

          // 2. Import password as Key material
          const encoder = new TextEncoder();
          const baseKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
          );

          // 3. Derive 256-bit AES-GCM Key using PBKDF2
          const aesKey = await window.crypto.subtle.deriveKey(
            {
              name: 'PBKDF2',
              salt: salt,
              iterations: 100000,
              hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
          );

          // 4. Encrypt file contents
          if (onProgress) onProgress(40);
          const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
              name: 'AES-GCM',
              iv: iv
            },
            aesKey,
            fileData
          );
          if (onProgress) onProgress(80);

          // 5. Combine [Salt] + [IV] + [Ciphertext]
          const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
          combined.set(salt, 0);
          combined.set(iv, salt.length);
          combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

          if (onProgress) onProgress(100);
          resolve({
            data: combined,
            name: `${file.name}.enc`,
            type: 'application/octet-stream'
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    });
  },

  decrypt: async (file, password, onProgress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const combinedData = new Uint8Array(e.target.result);

          if (combinedData.length < 28) {
            throw new Error('Encrypted file is too short/invalid.');
          }

          // 1. Extract Salt, IV, and Ciphertext
          const salt = combinedData.slice(0, 16);
          const iv = combinedData.slice(16, 28);
          const ciphertext = combinedData.slice(28);

          // 2. Import password
          const encoder = new TextEncoder();
          const baseKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
          );

          // 3. Derive AES-GCM Key
          const aesKey = await window.crypto.subtle.deriveKey(
            {
              name: 'PBKDF2',
              salt: salt,
              iterations: 100000,
              hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
          );

          if (onProgress) onProgress(50);

          // 4. Decrypt
          const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: iv
            },
            aesKey,
            ciphertext
          );

          if (onProgress) onProgress(100);

          // Restore original filename
          let originalName = file.name;
          if (originalName.endsWith('.enc')) {
            originalName = originalName.slice(0, -4);
          } else {
            originalName = `decrypted_${originalName}`;
          }

          resolve({
            data: decryptedBuffer,
            name: originalName,
            type: 'application/octet-stream'
          });
        } catch (err) {
          reject(new Error('Decryption failed. Please check your password or file integrity.'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    });
  }
};

// ==========================================
// 6. Classical Ciphers (Caesar & ROT13)
// ==========================================

export const classicCiphers = {
  caesarEncrypt: (text, shift) => {
    if (!text) return '';
    shift = ((shift % 26) + 26) % 26; // Normalise shift
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join('');
  },

  caesarDecrypt: (text, shift) => {
    return classicCiphers.caesarEncrypt(text, -shift);
  },

  rot13: (text) => {
    return classicCiphers.caesarEncrypt(text, 13);
  }
};

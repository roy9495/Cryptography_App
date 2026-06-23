#  CipherForge - Secure Cryptography Suite

CipherForge is a formalized, standardized, and modern cryptography suite built using React and Material-UI. It provides a comprehensive set of client-side cryptographic utilities, from symmetric ciphers and asymmetric key generation to file encryption and real-time encoding translators.

##  Features

### 1. Symmetric Cryptography
- **Algorithms:** AES, DES, TripleDES, RC4, Rabbit
- **Advanced Parameters:** Customize Cipher Block Modes (CBC, CFB, CTR, OFB, ECB), padding schemes (Pkcs7, ZeroPadding, NoPadding), and Initialization Vectors (IV).
- **Key Utilities:** Integrated random secure password generator, random IV generator, and instant Hex/Base64 output selectors.

### 2. Asymmetric RSA Cryptography (Web Crypto API)
- **Keypair Generator:** Generate 1024, 2048, or 4096-bit RSA keys locally in PEM format.
- **RSA-OAEP:** Encrypt and decrypt messages with public/private keypairs.
- **RSASSA-PKCS1-v1_5:** Sign messages and verify signatures to guarantee data authenticity and integrity.

### 3. Hash & Checksums
- **Digests:** MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-3, CRC-32, Adler-32.
- **HMAC:** Keyed-hash Message Authentication Code toggle support for all standard hashing algorithms.
- **File Hashing:** Drop any file in the browser to compute its exact hash/checksum with real-time progress bars.

### 4. Local File Locker
- **Security:** Encrypt and decrypt any local file (images, PDFs, documents, zips) in-browser.
- **Specifications:** Uses **AES-GCM (256-bit)** for authenticated symmetric encryption and **PBKDF2** key derivation with 100,000 iterations of SHA-256 and a random 16-byte salt.
- **Privacy:** 100% client-side computation. Files never leave your local environment.

### 5. Multi-Encoding Translator & Classical Ciphers
- **Real-Time Translator:** Real-time multi-field converter updating Text (UTF-8), Base64, Hexadecimal, Binary, and URL Encoded formats concurrently as you type.
- **Classical Ciphers:** Play with historical algorithms like the Caesar Cipher (with interactive shift slider) and ROT13.

---

##  Security Architecture
CipherForge is engineered with privacy and standards in mind:
- **W3C SubtleCrypto:** Standardized native Web Cryptography API guarantees hardware-accelerated, secure, and modern cryptographic operations.
- **100% Local Sandbox:** No data, keys, files, or plaintexts are ever sent to any remote server. Everything runs directly inside your browser sandbox.
- **Input Sanitization:** Automatically handles and validates encodings, sizes, and formats.

---

##  Developer Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- NPM

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository_url>
   cd Cryptography_App
   ```
2. Install standard dependencies:
   ```bash
   npm install
   ```

### Execution
To run the developer server locally:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

To run tests:
```bash
npm test
```

To compile production bundles:
```bash
npm run build
```

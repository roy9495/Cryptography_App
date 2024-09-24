import React from 'react';
import CryptoForm from './components/CryptoForm';
import { Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Cryptography App
      </Typography>
      <CryptoForm />
    </Container>
  );
}

export default App;

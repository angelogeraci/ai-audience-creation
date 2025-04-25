import React, { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Header from './components/Header';
import AudienceForm from './components/AudienceForm';
import AudienceResult from './components/AudienceResult';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorAlert from './components/ErrorAlert';
import api from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (description) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.createAudience(description);
      setResult(response.data);
    } catch (err) {
      console.error('Erreur lors de la création de l\'audience:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la création de l\'audience. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Créez votre audience Meta avec l'IA
          </Typography>

          <Typography variant="body1" paragraph>
            Décrivez l'audience que vous souhaitez cibler sur Meta, et notre IA la convertira en critères d'audience optimisés et validés.
          </Typography>

          {error && <ErrorAlert message={error} />}

          <Box sx={{ mt: 4 }}>
            {!result ? (
              <AudienceForm onSubmit={handleSubmit} />
            ) : (
              <AudienceResult result={result} onReset={handleReset} />
            )}
          </Box>
        </Paper>
      </Container>

      {loading && <LoadingOverlay />}
    </div>
  );
}

export default App;
import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

const ErrorAlert = ({ message }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="error" variant="filled">
        <AlertTitle>Erreur</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;
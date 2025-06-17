import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const LoadingOverlay = () => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        backdropFilter: 'blur(3px)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
      open={true}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="h6" component="div" gutterBottom>
          Creating your audience...
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: '400px' }}>
          We are analyzing your description, generating the criteria, and validating them with the Meta API.
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
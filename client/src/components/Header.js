import React from 'react';
import { AppBar, Toolbar, Typography, Box, useTheme } from '@mui/material';
import TargetIcon from '@mui/icons-material/TrackChanges';

const Header = () => {
  const theme = useTheme();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
        boxShadow: '0 3px 5px 2px rgba(24, 119, 242, .3)',
      }}
    >
      <Toolbar>
        <TargetIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
          AI Audience Creation
        </Typography>
        <Box>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Powered by OpenAI + Meta Marketing API
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
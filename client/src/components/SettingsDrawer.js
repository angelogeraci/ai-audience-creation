import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

const SettingsDrawer = ({ open, onClose, prompt, model, onSave }) => {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localModel, setLocalModel] = useState(model);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalPrompt(prompt);
    setLocalModel(model);
  }, [prompt, model, open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      api.getOpenAIModels()
        .then(res => {
          setModels(res.data.models);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load OpenAI models');
          setLoading(false);
        });
    }
  }, [open]);

  const handleSave = () => {
    onSave(localPrompt, localModel);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            OpenAI Settings
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Edit the prompt and model used for OpenAI requests.
        </Typography>
        <TextField
          label="Default prompt"
          multiline
          minRows={4}
          value={localPrompt}
          onChange={e => setLocalPrompt(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        ) : (
          <TextField
            select
            label="OpenAI model"
            value={localModel}
            onChange={e => setLocalModel(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          >
            {models.map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading || !localModel}
        >
          Save
        </Button>
      </Box>
    </Drawer>
  );
};

export default SettingsDrawer; 
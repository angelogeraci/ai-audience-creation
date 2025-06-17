import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const EXAMPLE_DESCRIPTIONS = [
  {
    title: "Luxury enthusiasts",
    description: "I want to target people who are passionate about Ferrari luxury cars and are also interested in high-end fashion and luxury watches."
  },
  {
    title: "Tech entrepreneurs",
    description: "I'm looking to reach tech sector entrepreneurs who are interested in digital marketing, artificial intelligence, and who follow startup news."
  },
  {
    title: "Fitness parents",
    description: "I want to target parents who are interested in fitness, healthy nutrition, and who seek to balance family life and personal well-being."
  }
];

const AudienceForm = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [retryOpenAI, setRetryOpenAI] = useState(false);
  const [maxRetries, setMaxRetries] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description, { retryOpenAI, maxRetries });
    }
  };

  const handleExampleClick = (exampleDescription) => {
    setDescription(exampleDescription);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        multiline
        rows={6}
        variant="outlined"
        label="Audience description"
        placeholder="Describe the audience you want to target in natural language. For example: I want to target people who love photography and travel, who are between 25 and 40 years old..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
              <DescriptionIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        size="large"
        disabled={!description.trim()}
        endIcon={<SendIcon />}
        sx={{ mb: 2 }}
      >
        Generate audience
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={retryOpenAI}
              onChange={e => setRetryOpenAI(e.target.checked)}
              color="primary"
            />
          }
          label="Retry OpenAI if no Meta interest is found"
        />
        <TextField
          type="number"
          label="Number of attempts"
          size="small"
          value={maxRetries}
          onChange={e => setMaxRetries(Number(e.target.value))}
          disabled={!retryOpenAI}
          inputProps={{ min: 1, max: 5 }}
          sx={{ width: 160, ml: 2 }}
        />
      </Box>

      <Divider sx={{ my: 4 }}>
        <Typography variant="body2" color="text.secondary">
          or use an example
        </Typography>
      </Divider>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1 }} color="secondary" />
          Example descriptions
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {EXAMPLE_DESCRIPTIONS.map((example, index) => (
            <Card 
              key={index} 
              className="audience-card"
              sx={{ 
                width: 'calc(33.333% - 16px)', 
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
                border: '1px solid #e0e0e0'
              }}
              onClick={() => handleExampleClick(example.description)}
            >
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  {example.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {example.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default AudienceForm;
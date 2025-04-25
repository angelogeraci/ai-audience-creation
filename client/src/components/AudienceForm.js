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
  Divider
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const EXAMPLE_DESCRIPTIONS = [
  {
    title: "Passionnés de luxe",
    description: "Je souhaite cibler les personnes qui sont passionnées par les voitures de luxe Ferrari et qui s'intéressent également à la mode haut de gamme et aux montres de luxe."
  },
  {
    title: "Entrepreneurs tech",
    description: "Je cherche à atteindre des entrepreneurs du secteur tech qui s'intéressent au marketing digital, à l'intelligence artificielle et qui suivent les actualités des startups."
  },
  {
    title: "Parents fitness",
    description: "Je veux cibler les parents qui s'intéressent au fitness, à la nutrition saine et qui cherchent à concilier vie de famille et bien-être personnel."
  }
];

const AudienceForm = ({ onSubmit }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      onSubmit(description);
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
        label="Description de l'audience"
        placeholder="Décrivez l'audience que vous souhaitez cibler en langage naturel. Par exemple: Je souhaite cibler les personnes qui aiment la photographie et les voyages, qui ont entre 25 et 40 ans..."
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
        sx={{ mb: 4 }}
      >
        Générer l'audience
      </Button>

      <Divider sx={{ my: 4 }}>
        <Typography variant="body2" color="text.secondary">
          ou utilisez un exemple
        </Typography>
      </Divider>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesomeIcon sx={{ mr: 1 }} color="secondary" />
          Exemples de descriptions
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
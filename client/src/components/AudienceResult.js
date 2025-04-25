import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AudienceResult = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const { description, finalAudience, aiCriteria, validatedCriteria } = result;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalAudience.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculer des métriques de l'audience pour l'affichage
  const totalGroups = finalAudience.structure.groups.length;
  const totalInterests = finalAudience.structure.groups.reduce(
    (acc, group) => acc + group.interests.length, 0
  );
  
  // Calculer l'audience estimée (basée sur les données Meta si disponibles)
  let audienceSize = 'Non disponible';
  if (validatedCriteria.groups && validatedCriteria.groups.length > 0) {
    const firstGroup = validatedCriteria.groups[0];
    if (firstGroup.interests && firstGroup.interests.length > 0) {
      const firstInterest = firstGroup.interests[0];
      if (firstInterest.audience_size_lower_bound && firstInterest.audience_size_upper_bound) {
        const minSize = firstInterest.audience_size_lower_bound.toLocaleString();
        const maxSize = firstInterest.audience_size_upper_bound.toLocaleString();
        audienceSize = `${minSize} - ${maxSize} personnes`;
      }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Résultat de l'audience
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RestartAltIcon />}
          onClick={onReset}
        >
          Nouvelle audience
        </Button>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description d'origine
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            "{description}"
          </Typography>
        </CardContent>
      </Card>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Card sx={{ flexGrow: 1, minWidth: '200px' }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {totalGroups}
            </Typography>
            <Typography variant="body2">Groupes d'intérêt</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '200px' }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {totalInterests}
            </Typography>
            <Typography variant="body2">Intérêts ciblés</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '200px' }}>
          <CardContent>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} />
              {audienceSize}
            </Typography>
            <Typography variant="body2">Audience estimée</Typography>
          </CardContent>
        </Card>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Définition d'audience" />
          <Tab label="Critères validés" />
          <Tab label="Critères proposés par l'IA" />
        </Tabs>
        
        <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderTop: 0 }}>
          {activeTab === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  color={copied ? "success" : "primary"}
                >
                  {copied ? "Copié !" : "Copier"}
                </Button>
              </Box>
              
              <SyntaxHighlighter
                language="text"
                style={materialLight}
                customStyle={{ borderRadius: '4px' }}
              >
                {finalAudience.text}
              </SyntaxHighlighter>
            </>
          )}
          
          {activeTab === 1 && (
            <>
              {validatedCriteria.groups.map((group, groupIndex) => (
                <Box key={groupIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {group.name}
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Intérêt suggéré</TableCell>
                          <TableCell>Intérêt validé</TableCell>
                          <TableCell>ID Meta</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.interests.map((interest, interestIndex) => (
                          <TableRow key={interestIndex}>
                            <TableCell>{interest.original}</TableCell>
                            <TableCell>{interest.matched}</TableCell>
                            <TableCell>{interest.id}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </>
          )}
          
          {activeTab === 2 && (
            <>
              {aiCriteria.groups.map((group, groupIndex) => (
                <Box key={groupIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {group.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {group.interests.map((interest, interestIndex) => (
                      <Chip 
                        key={interestIndex} 
                        label={interest} 
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AudienceResult;
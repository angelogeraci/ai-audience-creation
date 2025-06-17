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

  const { description, finalAudience, aiCriteria, validatedCriteria, generationTimeMs, timings } = result;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalAudience.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute audience metrics for display
  const totalThemes = finalAudience.structure.themes ? finalAudience.structure.themes.length : 0;
  const totalInterests = finalAudience.structure.themes
    ? finalAudience.structure.themes.reduce((acc, theme) => {
        return acc + Object.entries(theme)
          .filter(([key, value]) => key !== 'name' && Array.isArray(value))
          .reduce((sum, [key, value]) => sum + value.length, 0);
      }, 0)
    : 0;
  
  // Compute estimated audience (based on Meta data if available)
  let audienceSize = 'Not available';
  if (validatedCriteria.themes && validatedCriteria.themes.length > 0) {
    const firstTheme = validatedCriteria.themes[0];
    // Find the first non-empty interest subsection
    const firstSection = Object.entries(firstTheme).find(
      ([key, value]) => key !== 'name' && Array.isArray(value) && value.length > 0
    );
    if (firstSection) {
      const firstInterest = firstSection[1][0];
      if (firstInterest.audience_size_lower_bound && firstInterest.audience_size_upper_bound) {
        const minSize = firstInterest.audience_size_lower_bound.toLocaleString();
        const maxSize = firstInterest.audience_size_upper_bound.toLocaleString();
        audienceSize = `${minSize} - ${maxSize} personnes`;
      }
    }
  }

  // Direct extraction of sociodemographic fields from raw OpenAI response
  let openAISocioDemo = { gender: 'Not specified', geolocation: 'Not specified', age: 'Not specified' };
  try {
    const raw = typeof result.rawOpenAIResponse === 'string'
      ? JSON.parse(result.rawOpenAIResponse)
      : result.rawOpenAIResponse;
    const extracted = raw['Extracted Fields'] || raw['fields'] || {};
    openAISocioDemo = {
      gender: extracted.Gender || extracted.gender || 'Not specified',
      geolocation: extracted.Geolocation || extracted.geolocation || 'Not specified',
      age: extracted.Age || extracted.age || 'Not specified'
    };
  } catch (e) {
    // fallback already initialized
  }

  // Generate the consistent line to display
  const socioDemoLine = `Gender: ${openAISocioDemo.gender} | Geolocation: ${openAISocioDemo.geolocation} | Age: ${openAISocioDemo.age}`;
  // Replace all occurrences of the sociodemo line with the consistent version
  let audienceText = finalAudience.text;
  audienceText = audienceText.replace(
    /Gender\s*:\s*.*\|\s*Geolocation\s*:\s*.*\|\s*Age\s*:\s*.*/gi,
    socioDemoLine
  );

  // Add a utility function to parse the structured output of the prompt
  function parseStructuredOutput(text) {
    // Split by lines and group by sections
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const fields = {};
    const themes = [];
    let currentTheme = null;
    let currentSection = null;

    for (let line of lines) {
      if (/^Gender:/i.test(line)) fields.gender = line.replace(/^Gender:/i, '').trim();
      else if (/^Geolocation:/i.test(line)) fields.geolocation = line.replace(/^Geolocation:/i, '').trim();
      else if (/^Age:/i.test(line)) fields.age = line.replace(/^Age:/i, '').trim();
      else if (/^Theme \d+\s*–/i.test(line)) {
        if (currentTheme) themes.push(currentTheme);
        currentTheme = { title: line, clusters: [], ands: [] };
        currentSection = null;
      } else if (/^TargetingClusters/i.test(line)) {
        currentSection = 'clusters';
      } else if (/^AND\d+/i.test(line)) {
        currentSection = 'ands';
      } else if (line && currentSection && currentTheme) {
        // Add the line to the current section
        if (currentSection === 'clusters') {
          currentTheme.clusters = currentTheme.clusters.concat(line.split(',').map(s => s.trim()).filter(Boolean));
        } else if (currentSection === 'ands') {
          currentTheme.ands = currentTheme.ands.concat(line.split(',').map(s => s.trim()).filter(Boolean));
        }
      }
    }
    if (currentTheme) themes.push(currentTheme);
    return { fields, themes };
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Audience result
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RestartAltIcon />}
          onClick={onReset}
        >
          New audience
        </Button>
      </Box>
      {timings && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <b>Generation time details:</b><br/>
            OpenAI generation: <b>{timings.openai}s</b><br/>
            Meta validation: <b>{timings.meta}s</b><br/>
            Similarity search: <b>{timings.similarity}s</b><br/>
            <span style={{textDecoration: 'underline'}}>Total duration</span>: <b>{timings.total}s</b>
          </Typography>
        </Box>
      )}
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Original description
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
              {totalThemes}
            </Typography>
            <Typography variant="body2">Themes</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '200px' }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {totalInterests}
            </Typography>
            <Typography variant="body2">Targeted interests</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1, minWidth: '200px' }}>
          <CardContent>
            <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} />
              {audienceSize}
            </Typography>
            <Typography variant="body2">Estimated audience</Typography>
          </CardContent>
        </Card>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Audience definition" />
          <Tab label="Validated criteria" />
          <Tab label="AI proposed criteria" />
          <Tab label="Raw response" />
        </Tabs>
        
        <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderTop: 0 }}>
          {activeTab === 0 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <b>Gender:</b> {openAISocioDemo.gender}
                  {'  |  '}
                  <b>Geolocation:</b> {openAISocioDemo.geolocation}
                  {'  |  '}
                  <b>Age:</b> {openAISocioDemo.age}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  color={copied ? "success" : "primary"}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Box>
              <SyntaxHighlighter
                language="text"
                style={materialLight}
                customStyle={{ borderRadius: '4px' }}
              >
                {audienceText}
              </SyntaxHighlighter>
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <b>Gender:</b> {finalAudience.structure.fields?.gender || 'Not specified'}
                  {'  |  '}
                  <b>Geolocation:</b> {finalAudience.structure.fields?.geolocation || 'Not specified'}
                  {'  |  '}
                  <b>Age:</b> {finalAudience.structure.fields?.age || 'Not specified'}
                </Typography>
              </Box>
              {validatedCriteria.themes && validatedCriteria.themes.map((theme, themeIndex) => (
                <Box key={themeIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {theme.name}
                  </Typography>
                  {Object.entries(theme).filter(([key, value]) => key !== 'name' && Array.isArray(value)).map(([section, interests], sectionIdx) => (
                    <Box key={sectionIdx} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {section}
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Suggested interest</TableCell>
                              <TableCell>Validated interest</TableCell>
                              <TableCell>Meta ID</TableCell>
                              <TableCell>Similarity score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {interests.map((interest, interestIndex) => (
                              <TableRow key={interestIndex}>
                                <TableCell>{interest.original}</TableCell>
                                <TableCell>{interest.matched}</TableCell>
                                <TableCell>{interest.id}</TableCell>
                                <TableCell>{interest.score !== undefined ? `${(interest.score * 100).toFixed(0)}%` : '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Box>
              ))}
            </>
          )}
          
          {activeTab === 2 && (
            <>
              {aiCriteria.themes && aiCriteria.themes.map((theme, themeIndex) => (
                <Box key={themeIndex} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {theme.name}
                  </Typography>
                  {Object.entries(theme).filter(([key, value]) => key !== 'name' && Array.isArray(value)).map(([section, interests], sectionIdx) => (
                    <Box key={sectionIdx} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {section}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {interests.map((interest, interestIndex) => (
                          <Chip 
                            key={interestIndex} 
                            label={typeof interest === 'string' ? interest : (interest.original || interest.matched || interest.id || '')} 
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Raw OpenAI response
              </Typography>
              <SyntaxHighlighter
                language="json"
                style={materialLight}
                customStyle={{ borderRadius: '4px', maxHeight: 400, overflow: 'auto' }}
              >
                {typeof result.rawOpenAIResponse === 'string' ? result.rawOpenAIResponse : JSON.stringify(result.rawOpenAIResponse, null, 2)}
              </SyntaxHighlighter>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AudienceResult;
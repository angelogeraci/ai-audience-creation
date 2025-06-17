import React, { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Header from './components/Header';
import AudienceForm from './components/AudienceForm';
import AudienceResult from './components/AudienceResult';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorAlert from './components/ErrorAlert';
import api from './services/api';
import SettingsDrawer from './components/SettingsDrawer';

const DEFAULT_PROMPT = `Instructions for Audience Targeting Extraction from Any Thematic Briefing\n\nStep 1 – Analyze the Audience Briefing Thoroughly:\nFrom the input briefing, extract the following explicit data points (only if mentioned):\n\nGender\n\nGeolocation\n\nAge\n\nIdentify all main themes present in the briefing.\n\nDetermine whether there is one central theme or multiple distinct themes.\n\nSummarize each theme clearly and concisely.\n\nStep 2 – Build the Audience Structure Based on the Identified Theme(s):\n\n➤ For the first theme (Theme 1):\nCreate two distinct sections:\n\n1. TargetingClusters:\nList a minimum of 40 specific and precise interests closely connected to the theme.\nThese can include (depending on the context):\n\nBrands\n\nKey events or festivals\n\nCompetitions or awards\n\nPublic figures or influencers\n\nSpecialized media or publications\n\nSpecific products, tools, or platforms\n⚠️ Always prioritize concrete entities, not general categories.\n\n2. AND1:\nDefine a broad industry or sector filter that captures the general domain of the theme.\nExamples:\n\n"Healthcare"\n\n"Video Games"\n\n"Luxury Goods"\n\n"Green Tech"\n\n"Finance & Investing"\n\n"Contemporary Art"\n→ Use terminology adapted to the theme context.\n\n➤ For each additional theme (if multiple are identified):\nRepeat the same structure using numbered sections to differentiate:\n\nTheme 2 → AND2 (targeting cluster) + AND3 (broad filter)\n\nTheme 3 → AND4 + AND5\n\n...up to a maximum of 5 themes total.\n\nStep 3 – Mandatory Rules:\n\nResponses must be in English, regardless of the language used in the original briefing.\n\nGender, geolocation, and age must only appear in their respective fields, not in any TargetingClusters or AND sections.\n\nAvoid general or vague terms. Only include specific, identifiable interests.\n\nEach theme must include at least 40 unique interests.\n\nAdapt interest types to the theme context (e.g., no car brands if the theme is about skincare).\n\nEt voici un exemple d'output que je veux obtenir :\n\nExtracted Fields:\n\nGender: Not specified\n\nGeolocation: Not specified\n\nAge: Not specified\n\nTheme 1 – Luxury Cars (Ferrari focus)\n\nTargetingClusters\nFerrari, Lamborghini, Bugatti, McLaren, Aston Martin, Rolls-Royce, Bentley, Porsche, Koenigsegg, Pagani, Maserati, Maybach, Rimac Automobili, Lotus Cars, Supercar Blondie, Top Gear, Carwow, Evo Magazine, Motor1, Road & Track, Geneva International Motor Show, Pebble Beach Concours d'Elegance, Goodwood Festival of Speed, Ferrari F1 Team, Formula 1, Ferrari Owners' Club, Ferrari World, Cavallino Magazine, Supercar Owners Circle, Le Mans, GT World Challenge, Auto Express, Carfection, DriveTribe, Drive.com, Pirelli, Scuderia Ferrari, Enzo Ferrari, Monza Circuit, Fiorano Circuit, Red Bull Racing (as competitor), Luxury car auctions (e.g., RM Sotheby's), Autocar, Supercar spotting, Nürburgring.\n\nAND1\nLuxury Sports Cars, Supercars, High-Performance Vehicles, Automotive, Exotic Cars\n\nTheme 2 – High-End Fashion\n\nAND2\nChanel, Louis Vuitton, Dior, Gucci, Hermès, Balenciaga, Saint Laurent, Givenchy, Bottega Veneta, Prada, Valentino, Versace, Tom Ford, Off-White, Maison Margiela, Alexander McQueen, Loewe, Rick Owens, Celine, Jacquemus, Fendi, Vogue, Harper's Bazaar, GQ Style, Fashion Week (Paris, Milan, New York), Met Gala, Haute Couture, Net-a-Porter, MatchesFashion, Farfetch, LVMH, Fashion influencers (Chiara Ferragni, Olivia Palermo), Business of Fashion, CFDA, FashionTV, W Magazine, The Fashion Awards, Suzy Menkes, Man Repeller, Dazed, CR Fashion Book, Hypebeast, The Sartorialist, Streetstyle, Runway shows, Lookbooks, Moda Operandi.\n\nAND3\nHigh-End Fashion, Luxury Apparel, Designer Clothing, Fashion Industry, Couture\n\nTheme 3 – Luxury Watches\n\nAND4\nRolex, Audemars Piguet, Patek Philippe, Richard Mille, TAG Heuer, Omega, Hublot, Vacheron Constantin, Jaeger-LeCoultre, IWC Schaffhausen, Panerai, Breitling, Zenith, Breguet, Grand Seiko, MB&F, Piaget, Chopard, A. Lange & Söhne, WatchBox, Watchfinder, Hodinkee, WatchTime, Revolution Watch, Chrono24, Baselworld, Watches & Wonders, Time+Tide, RedBar Group, Crown & Caliber, Fratello Watches, Deployant, The Hour Glass, Watchuseek, Luxury Watch Collector, Watch Anish, Haute Time, Wrist Enthusiast, Collector's Circle, Instagram Watch Influencers, Vintage Watch Market, Independent Watchmakers.\n\nAND5\nLuxury Watches, Haute Horlogerie, Fine Timepieces, Watchmaking Industry, Horology`;

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const getInitialPrompt = () => {
    const stored = localStorage.getItem('openaiPrompt');
    if (!stored || stored === 'undefined') {
      return DEFAULT_PROMPT;
    }
    return stored;
  };

  const [prompt, setPrompt] = useState(getInitialPrompt);
  const [model, setModel] = useState(() => localStorage.getItem('openaiModel') || '');

  const handleOpenSettings = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);

  const handleSaveSettings = (newPrompt, newModel) => {
    setPrompt(newPrompt);
    setModel(newModel);
    localStorage.setItem('openaiPrompt', newPrompt);
    localStorage.setItem('openaiModel', newModel);
    setSettingsOpen(false);
  };

  const handleSubmit = async (description, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.createAudience(description, prompt, model, options);
      setResult(response.data);
    } catch (err) {
      console.error('Error while creating the audience:', err);
      setError(
        err.response?.data?.message || 
        'An error occurred while creating the audience. Please try again.'
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
      <Header onOpenSettings={handleOpenSettings} />
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
            Create your Meta audience with AI
          </Typography>

          <Typography variant="body1" paragraph>
            Describe the audience you want to target on Meta, and our AI will convert it into optimized and validated audience criteria.
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
      <SettingsDrawer
        open={settingsOpen}
        onClose={handleCloseSettings}
        prompt={prompt}
        model={model}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
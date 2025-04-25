import axios from 'axios';

// Configuration de l'instance axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Créer une audience à partir d'une description
const createAudience = (description) => {
  return api.post('/audience', { description });
};

// Obtenir des suggestions d'intérêts depuis Meta
const getSuggestions = (query) => {
  return api.get('/suggestions', { params: { query } });
};

export default {
  createAudience,
  getSuggestions,
};
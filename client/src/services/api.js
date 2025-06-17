import axios from 'axios';

// Axios instance configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an audience from a description, prompt, and model
const createAudience = (description, prompt, model, options = {}) => {
  return api.post('/audience', { description, prompt, model, ...options });
};

// Get interest suggestions from Meta
const getSuggestions = (query) => {
  return api.get('/suggestions', { params: { query } });
};

// Get the list of available OpenAI models
const getOpenAIModels = () => {
  return api.get('/models');
};

export default {
  createAudience,
  getSuggestions,
  getOpenAIModels,
};
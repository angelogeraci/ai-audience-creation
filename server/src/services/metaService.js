const axios = require('axios');
const openaiService = require('./openaiService');

// Configuration de l'API Meta
const META_API_VERSION = 'v18.0';
const META_API_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

/**
 * Récupérer des suggestions d'intérêts depuis l'API Meta
 * @param {string} query - Texte de recherche
 * @returns {Promise<Array>} - Liste des suggestions
 */
async function getSuggestions(query) {
  try {
    const url = `${META_API_BASE_URL}/search`;
    const params = {
      type: 'adinterest',
      q: query,
      limit: 10,
      access_token: META_ACCESS_TOKEN
    };

    const response = await axios.get(url, { params });
    return response.data?.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des suggestions Meta:', error.response?.data || error);
    return [];
  }
}

/**
 * Trouver la meilleure correspondance parmi les suggestions Meta pour un critère donné
 * @param {string} criterion - Critère original
 * @param {Array} suggestions - Liste des suggestions Meta
 * @param {string} context - Contexte de l'audience pour l'évaluation de pertinence
 * @returns {Object|null} - Meilleure correspondance ou null si aucune n'est trouvée
 */
async function findBestMatch(criterion, suggestions, context) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Si une correspondance exacte existe, la retourner
  const exactMatch = suggestions.find(s => {
    return s.name.toLowerCase() === criterion.toLowerCase();
  });

  if (exactMatch) {
    return {
      original: criterion,
      matched: exactMatch.name,
      id: exactMatch.id,
      path: exactMatch.path || [],
      audience_size_lower_bound: exactMatch.audience_size_lower_bound,
      audience_size_upper_bound: exactMatch.audience_size_upper_bound
    };
  }

  // Sinon, essayer de trouver la meilleure correspondance contextuelle
  // En utilisant une heuristique simple pour l'instant
  const bestMatch = suggestions[0]; // Pour l'instant, on prend simplement la première suggestion
  
  if (bestMatch) {
    return {
      original: criterion,
      matched: bestMatch.name,
      id: bestMatch.id,
      path: bestMatch.path || [],
      audience_size_lower_bound: bestMatch.audience_size_lower_bound,
      audience_size_upper_bound: bestMatch.audience_size_upper_bound
    };
  }

  return null;
}

/**
 * Valider les critères proposés par OpenAI avec l'API Meta
 * @param {Object} aiCriteria - Structure de critères générée par OpenAI
 * @returns {Promise<Object>} - Structure de critères validés
 */
async function validateCriteria(aiCriteria) {
  try {
    const validatedGroups = [];
    
    // Contexte global pour aider à la recherche d'alternatives
    const context = aiCriteria.groups
      .map(group => group.interests.join(', '))
      .join('; ');

    // Traiter chaque groupe
    for (const group of aiCriteria.groups) {
      const validatedInterests = [];
      
      // Traiter chaque intérêt dans le groupe
      for (const interest of group.interests) {
        // Récupérer les suggestions de Meta
        const suggestions = await getSuggestions(interest);
        
        // Trouver la meilleure correspondance
        let match = await findBestMatch(interest, suggestions, context);
        
        // Si aucune correspondance n'est trouvée, essayer des alternatives
        if (!match && suggestions.length === 0) {
          const alternatives = await openaiService.findAlternativeCriteria(interest, context);
          
          // Essayer chaque alternative jusqu'à en trouver une qui fonctionne
          for (const alt of alternatives) {
            const altSuggestions = await getSuggestions(alt);
            match = await findBestMatch(alt, altSuggestions, context);
            
            if (match) {
              match.original = interest; // Garder une trace du critère original
              break;
            }
          }
        }
        
        if (match) {
          validatedInterests.push(match);
        }
      }
      
      // Ajouter le groupe validé s'il contient des intérêts
      if (validatedInterests.length > 0) {
        validatedGroups.push({
          name: group.name,
          interests: validatedInterests
        });
      }
    }
    
    return {
      groups: validatedGroups
    };
  } catch (error) {
    console.error('Erreur lors de la validation des critères:', error);
    throw new Error('Erreur lors de la validation des critères d\'audience');
  }
}

module.exports = {
  getSuggestions,
  validateCriteria
};
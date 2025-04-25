const openaiService = require('../services/openaiService');
const metaService = require('../services/metaService');
const audienceUtils = require('../utils/audienceUtils');

/**
 * Créer une audience Meta basée sur une description en langage naturel
 */
const createAudience = async (req, res, next) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'La description est requise' });
    }

    // Étape 1: Traduction de la description en critères via OpenAI
    const aiCriteria = await openaiService.translateDescriptionToCriteria(description);
    
    // Étape 2: Validation des critères via l'API Meta et récupération des suggestions
    const validatedCriteria = await metaService.validateCriteria(aiCriteria);
    
    // Étape 3: Construction de la définition d'audience finale
    const finalAudience = audienceUtils.buildFinalAudience(validatedCriteria);
    
    res.json({
      description,
      aiCriteria,
      validatedCriteria,
      finalAudience
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir des suggestions de critères depuis Meta
 */
const getMetaSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'La requête est requise' });
    }
    
    const suggestions = await metaService.getSuggestions(query);
    
    res.json({ suggestions });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAudience,
  getMetaSuggestions
};
const openaiService = require('../services/openaiService');
const metaService = require('../services/metaService');
const audienceUtils = require('../utils/audienceUtils');

/**
 * Create a Meta audience based on a natural language description
 */
const createAudience = async (req, res, next) => {
  const startTime = Date.now();
  let openaiStart, openaiEnd, metaStart, metaEnd, similarityStart, similarityEnd;
  try {
    const { description, prompt, model, retryOpenAI = false, maxRetries = 1 } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    // Step 1: Translate the description into criteria via OpenAI
    openaiStart = Date.now();
    const { parsed: aiCriteria, rawOpenAIResponse } = await openaiService.translateDescriptionToCriteria(description, prompt, model);
    openaiEnd = Date.now();
    
    // Step 2: Validate criteria via Meta API and retrieve suggestions
    metaStart = Date.now();
    // We'll measure similarity timing in the validateCriteria function
    let similarityTimeMs = 0;
    const validatedCriteria = await metaService.validateCriteria(aiCriteria, { retryOpenAI, maxRetries, onSimilarityTiming: (ms) => { similarityTimeMs += ms; } });
    metaEnd = Date.now();
    
    // Step 3: Build the final audience definition
    // Robust search for the sociodemographic fields key
    let fields = aiCriteria.fields || aiCriteria["Extracted Fields"] || aiCriteria["extracted_fields"] || aiCriteria["extractedFields"] || {};
    if (!fields || Object.keys(fields).length === 0) {
      const key = Object.keys(aiCriteria).find(k => k.replace(/\s|_/g, '').toLowerCase().includes('extractedfields'));
      if (key) fields = aiCriteria[key];
    }
    // Force the 'fields' key in validatedCriteria for the final structure
    const validatedCriteriaWithFields = { ...validatedCriteria, fields };
    const finalAudience = audienceUtils.buildFinalAudience(validatedCriteriaWithFields);
    
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    res.json({
      description,
      aiCriteria,
      validatedCriteria,
      finalAudience,
      timings: {
        openai: ((openaiEnd - openaiStart) / 1000).toFixed(2),
        meta: ((metaEnd - metaStart - similarityTimeMs) / 1000).toFixed(2),
        similarity: (similarityTimeMs / 1000).toFixed(2),
        total: ((endTime - startTime) / 1000).toFixed(2)
      },
      rawOpenAIResponse
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggestions from Meta
 */
const getMetaSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Request is required' });
    }
    
    const suggestions = await metaService.getSuggestions(query);
    
    res.json({ suggestions });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve the list of available OpenAI models
 */
const getOpenAIModels = async (req, res, next) => {
  try {
    const models = await openaiService.getAvailableModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAudience,
  getMetaSuggestions,
  getOpenAIModels
};
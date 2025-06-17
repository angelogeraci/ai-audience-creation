const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');

// Routes for audience creation
router.post('/audience', audienceController.createAudience);

// Route to get the list of OpenAI models
router.get('/models', audienceController.getOpenAIModels);

// Route for obtaining Meta suggestions
router.get('/suggestions', audienceController.getMetaSuggestions);

module.exports = router;
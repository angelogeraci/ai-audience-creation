const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');

// Routes pour la création d'audience
router.post('/audience', audienceController.createAudience);

// Route pour obtenir des suggestions Meta
router.get('/suggestions', audienceController.getMetaSuggestions);

module.exports = router;
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Translate a natural language description into Meta audience criteria
 * @param {string} description - Desired audience description
 * @param {string} [customPrompt] - Custom prompt
 * @param {string} [customModel] - Custom OpenAI model
 * @returns {Promise<Object>} - Audience criteria structure
 */
async function translateDescriptionToCriteria(description, customPrompt, customModel) {
  try {
    const prompt = customPrompt && customPrompt.trim().length > 0 ? customPrompt : `
I want to create an audience for Meta Ads based on this description:
{description}

Create an audience structure that follows this format:

Group 1 (Broad definition): [List of general interests related to the main topic, with OR operators]
Group 2 (Main topic): [List of specific interests directly related to the main topic, with OR operators]
Group 3+ (Complementary interests): [Lists of secondary interests mentioned in the description, with OR operators]

- Each group must contain 3 to 5 interests linked by OR
- Groups are linked by AND
- Avoid any duplicates between the different groups
- Return the result in JSON format with this structure:

[
  {
    "name": "Group 1 (Broad definition)",
    "interests": ["Interest 1", "Interest 2", "Interest 3"]
  },
  {
    "name": "Group 2 (Main topic)",
    "interests": ["Interest 1", "Interest 2", "Interest 3"]
  }
]
`;
    const model = customModel && customModel.trim().length > 0 ? customModel : (process.env.OPENAI_MODEL || 'gpt-4-turbo-preview');

    // Consigne explicite pour OpenAI
    const fieldsInstruction = `\nIf a field (Gender, Geolocation, Age) is not specified in the briefing, output 'All' for that field. Otherwise, output the value.`;
    // Exemple minimaliste et consigne explicite
    const formatInstruction = `\n\nHere is an example of the expected format. Do not copy the content, adapt all values to the user's briefing.\n\nExtracted Fields:\nGender: All\nGeolocation: All\nAge: All\nTheme 1 – [Theme name]\nTargetingClusters\nInterest 1, Interest 2, ...\nAND1\nBroad filter 1, Broad filter 2, ...\nTheme 2 – [Theme name]\nAND2\nInterest 1, Interest 2, ...\nAND3\nBroad filter 1, Broad filter 2, ...\n\nReturn the result in this exact format. The output must contain the word 'json'.`;
    // Robust replacement of {description} (all occurrences, case-insensitive)
    let promptWithDescription = prompt.replace(/\{description\}/gi, description);
    // If the prompt does not contain {description}, append the description at the end
    if (!/\{description\}/i.test(prompt)) {
      promptWithDescription += `\n\nBriefing: ${description}`;
    }
    let promptToSend = promptWithDescription + fieldsInstruction + formatInstruction;
    // Ensure the word 'json' is present (extra safety)
    if (!/json/i.test(promptToSend)) {
      promptToSend += '\nReturn the result in JSON format.';
    }
    // Log du prompt pour debug
    console.log('Prompt envoyé à OpenAI :\n', promptToSend);

    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptToSend }],
      response_format: { type: 'json_object' }
    });

    // Extraire et parser la réponse JSON
    const jsonContent = chatCompletion.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (e) {
      parsed = null;
    }
    // Nouveau parsing hiérarchique si la structure attendue n'est pas présente
    if (!parsed || !parsed.themes) {
      // Extraction des champs principaux
      const fields = {};
      const fieldsMatch = /Extracted Fields:\s*Gender: ([^\n]*)\s*Geolocation: ([^\n]*)\s*Age: ([^\n]*)/i.exec(jsonContent);
      if (fieldsMatch) {
        fields.gender = fieldsMatch[1]?.trim() || 'All';
        fields.geolocation = fieldsMatch[2]?.trim() || 'All';
        fields.age = fieldsMatch[3]?.trim() || 'All';
      } else {
        fields.gender = 'All';
        fields.geolocation = 'All';
        fields.age = 'All';
      }
      // Extraction des thèmes et sous-sections
      const themeRegex = /(Theme \d+ – [^\n]+)([\s\S]*?)(?=Theme \d+ – |$)/gi;
      const themes = [];
      let themeMatch;
      while ((themeMatch = themeRegex.exec(jsonContent)) !== null) {
        const themeName = themeMatch[1].trim();
        const themeContent = themeMatch[2];
        // Extraction des sous-sections TargetingClusters et ANDx
        const sectionRegex = /(TargetingClusters|AND\d+)\s*([\s\S]*?)(?=TargetingClusters|AND\d+|Theme \d+ – |$)/gi;
        let sectionMatch;
        const themeObj = { name: themeName };
        while ((sectionMatch = sectionRegex.exec(themeContent)) !== null) {
          const sectionName = sectionMatch[1];
          const sectionValues = sectionMatch[2].split(',').map(s => s.trim()).filter(Boolean);
          // On stocke chaque section dans l'objet du thème
          themeObj[sectionName.toLowerCase()] = sectionValues;
        }
        themes.push(themeObj);
      }
      parsed = { fields, themes };
    }
    // Post-traitement pour forcer 'All' si champ vide ou non spécifié
    if (parsed && parsed.fields) {
      ['gender', 'geolocation', 'age'].forEach(field => {
        if (!parsed.fields[field] || /not specified|n\/a|none|undefined|empty/i.test(parsed.fields[field])) {
          parsed.fields[field] = 'All';
        }
      });
    } else if (parsed && parsed["Extracted Fields"]) {
      // Si 'fields' n'existe pas mais 'Extracted Fields' oui, on copie
      parsed.fields = parsed["Extracted Fields"];
      ['gender', 'geolocation', 'age'].forEach(field => {
        if (!parsed.fields[field] || /not specified|n\/a|none|undefined|empty/i.test(parsed.fields[field])) {
          parsed.fields[field] = 'All';
        }
      });
    }
    return { parsed, rawOpenAIResponse: jsonContent };
  } catch (error) {
    console.error('Erreur lors de la traduction via OpenAI:', error);
    throw new Error('Erreur lors de la génération des critères d\'audience');
  }
}

/**
 * Essayer de trouver des alternatives pour un critère non trouvé dans Meta
 * @param {string} originalCriteria - Critère original
 * @param {string} context - Contexte de l'audience
 * @returns {Promise<Array>} - Liste d'alternatives suggérées
 */
async function findAlternativeCriteria(originalCriteria, context) {
  try {
    const prompt = `
Compare uniquement les intérêts (TargetingClusters et ANDx) générés par l'IA avec ceux disponibles dans Meta.
- Pour chaque intérêt IA, vérifie s'il existe un intérêt Meta très similaire (proximité sémantique ET thématique).
- La similarité doit être évaluée à la fois sur la ressemblance des mots ET sur la cohérence avec le thème et la description utilisateur.
- Si l'intérêt IA n'existe pas ou n'est pas pertinent dans Meta, propose 3 alternatives très proches, en justifiant brièvement la pertinence de chaque alternative par rapport au thème et à la description utilisateur.
- Ignore complètement les champs Gender, Age, Geolocation.

Retourne uniquement un tableau JSON d'objets, chaque objet contenant :
- "alternative": le nom de l'intérêt Meta proposé
- "reason": une phrase expliquant pourquoi cette alternative est pertinente

Intérêt à vérifier : "${originalCriteria}"
Contexte (thème et description utilisateur) : "${context}"
Le résultat doit contenir le mot 'json'.`;

    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    // Extraire et parser la réponse JSON
    const jsonContent = chatCompletion.choices[0].message.content;
    const result = JSON.parse(jsonContent);
    return Array.isArray(result.alternatives) ? result.alternatives : [];
  } catch (error) {
    console.error('Erreur lors de la recherche d\'alternatives:', error);
    return [];
  }
}

/**
 * Récupérer dynamiquement la liste des modèles OpenAI disponibles
 * @returns {Promise<Array>} - Liste des modèles
 */
async function getAvailableModels() {
  try {
    const response = await openai.models.list();
    // On filtre pour ne garder que les modèles pertinents (ex: gpt)
    return response.data.filter(model => model.id.startsWith('gpt')).map(model => model.id);
  } catch (error) {
    console.error('Erreur lors de la récupération des modèles OpenAI:', error);
    throw new Error('Impossible de récupérer la liste des modèles OpenAI');
  }
}

module.exports = {
  translateDescriptionToCriteria,
  findAlternativeCriteria,
  getAvailableModels
};
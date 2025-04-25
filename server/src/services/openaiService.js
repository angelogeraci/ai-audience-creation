const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Traduire une description en langage naturel en critères d'audience Meta
 * @param {string} description - Description de l'audience souhaitée
 * @returns {Promise<Object>} - Structure de critères d'audience
 */
async function translateDescriptionToCriteria(description) {
  try {
    const prompt = `
Je souhaite créer une audience pour Meta Ads basée sur cette description :
"${description}"

Crée une structure d'audience qui suit ce format :

Groupe 1 (Définition large): [Liste d'intérêts généraux liés au sujet principal, avec opérateurs OR]
Groupe 2 (Topic principal): [Liste d'intérêts spécifiques directement liés au sujet principal, avec opérateurs OR]
Groupe 3+ (Intérêts complémentaires): [Listes d'intérêts secondaires mentionnés dans la description, avec opérateurs OR]

Notes importantes:
- Chaque groupe doit contenir 3 à 5 intérêts reliés par OR
- Les groupes sont reliés par AND
- Il doit y avoir au moins 2 ou 3 groupes pour une audience qualitative
- Évite tout doublon entre les différents groupes
- Retourne le résultat au format JSON avec cette structure :
{
  "groups": [
    {
      "name": "Groupe 1 (Définition large)",
      "interests": ["Intérêt 1", "Intérêt 2", "Intérêt 3"]
    },
    {
      "name": "Groupe 2 (Topic principal)",
      "interests": ["Intérêt 1", "Intérêt 2", "Intérêt 3"]
    },
    ...
  ]
}
`;

    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    // Extraire et parser la réponse JSON
    const jsonContent = chatCompletion.choices[0].message.content;
    return JSON.parse(jsonContent);
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
Je cherche à trouver des alternatives à l'intérêt "${originalCriteria}" pour une audience Meta Ads.
Le contexte général de l'audience est : "${context}"

L'intérêt exact n'a pas été trouvé dans Meta. Suggère 3 alternatives pertinentes qui pourraient exister dans la plateforme Meta Ads.
Retourne uniquement un tableau JSON de chaînes de caractères, sans explications.
`;

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

module.exports = {
  translateDescriptionToCriteria,
  findAlternativeCriteria
};
# AI Audience Creation

Application pour créer des audiences Meta basées sur des descriptions en langage naturel en utilisant l'IA.

## Fonctionnalités

- Saisie de description d'audience en langage naturel
- Traduction en critères d'audience Meta via OpenAI
- Validation des critères via l'API Marketing de Meta
- Génération d'une définition d'audience utilisable sur Meta Campaign Manager
- Élimination des doublons entre critères

## Structure de l'application

L'application est divisée en deux parties principales :

- **Frontend (React)** : Interface utilisateur pour saisir les descriptions et visualiser les audiences générées
- **Backend (Node.js)** : API pour traiter les requêtes, communiquer avec OpenAI et l'API Marketing de Meta
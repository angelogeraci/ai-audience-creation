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

## Captures d'écran

### Interface principale
![Interface principale](https://via.placeholder.com/800x450.png?text=Interface+principale)

### Résultats d'audience
![Résultats d'audience](https://via.placeholder.com/800x450.png?text=Resultats+d%27audience)

## Installation

### Prérequis

- Node.js (v14+)
- npm ou yarn
- Compte développeur Meta avec accès à l'API Marketing
- Clé API OpenAI

### Configuration

1. Cloner le repository
   ```
   git clone https://github.com/angelogeraci/ai-audience-creation.git
   cd ai-audience-creation
   ```

2. Installer les dépendances (backend et frontend)
   ```
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. Configurer les variables d'environnement
   - Créer un fichier `.env` dans le dossier `server` basé sur `.env.example`
   - Ajouter vos clés API Meta et OpenAI

   ```
   # server/.env
   PORT=5000
   
   # Meta API
   META_APP_ID=votre_app_id
   META_APP_SECRET=votre_app_secret
   META_ACCESS_TOKEN=votre_access_token
   
   # OpenAI API
   OPENAI_API_KEY=votre_cle_api
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## Démarrage

Pour exécuter l'application en mode développement :

```
# Backend (dans un terminal)
cd server
npm run dev

# Frontend (dans un autre terminal)
cd client
npm start
```

L'application sera accessible à l'adresse http://localhost:3000

## Flux de travail

1. L'utilisateur saisit une description de l'audience souhaitée en langage naturel
2. L'IA (OpenAI) traduit cette description en critères d'audience structurés
3. L'application valide ces critères via l'API Marketing de Meta
4. Si des critères n'existent pas sur Meta, l'IA suggère des alternatives
5. L'application génère une définition d'audience finale, prête à être utilisée dans Meta Campaign Manager

## Structure du code

### Backend
- `server/src/index.js` - Point d'entrée du serveur
- `server/src/services/` - Services pour OpenAI et Meta
- `server/src/controllers/` - Contrôleurs pour gérer les requêtes API
- `server/src/utils/` - Utilitaires pour la manipulation des audiences

### Frontend
- `client/src/App.js` - Composant principal
- `client/src/components/` - Composants React pour l'interface utilisateur
- `client/src/services/` - Services pour communiquer avec l'API backend

## Améliorations futures possibles

- Ajout d'un système d'authentification
- Sauvegarde des audiences générées dans une base de données
- Option pour modifier manuellement les critères avant la finalisation
- Exportation au format JSON pour intégration directe avec l'API Meta
- Estimation de la taille d'audience plus précise

## Licence

MIT
# AI Audience Creation

Application to create Meta audiences based on natural language descriptions using AI.

## Features

- Input audience description in natural language
- Translation into Meta audience criteria via OpenAI
- Validation of criteria via Meta Marketing API
- Generation of an audience definition usable in Meta Campaign Manager
- Removal of duplicate criteria

## Application Structure

The application is divided into two main parts:

- **Frontend (React)**: User interface to input descriptions and view generated audiences
- **Backend (Node.js)**: API to process requests, communicate with OpenAI and the Meta Marketing API

## Screenshots

### Main Interface
![screencapture-localhost-3000-2025-06-17-22_06_13](https://github.com/user-attachments/assets/45cc7070-8203-4aa9-ab1f-77f8790bbd21)

### Audience Results
![screencapture-localhost-3000-2025-06-17-22_08_44](https://github.com/user-attachments/assets/c89e73be-4cb5-470a-90a4-66cce7f12f15)

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Meta developer account with access to the Marketing API
- OpenAI API key

### Setup

1. Clone the repository
   ```
   git clone https://github.com/angelogeraci/ai-audience-creation.git
   cd ai-audience-creation
   ```

2. Install dependencies (backend and frontend)
   ```
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. Configure environment variables
   - Create a `.env` file in the `server` folder based on `.env.example`
   - Add your Meta and OpenAI API keys

   ```
   # server/.env
   PORT=5000
   
   # Meta API
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   META_ACCESS_TOKEN=your_access_token
   
   # OpenAI API
   OPENAI_API_KEY=your_api_key
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## Getting Started

To run the application in development mode:

```
# Backend (in one terminal)
cd server
npm run dev

# Frontend (in another terminal)
cd client
npm start
```

The application will be accessible at http://localhost:3000

## Workflow

1. The user enters a desired audience description in natural language
2. The AI (OpenAI) translates this description into structured audience criteria
3. The application validates these criteria via the Meta Marketing API
4. If some criteria do not exist on Meta, the AI suggests alternatives
5. The application generates a final audience definition, ready to use in Meta Campaign Manager

## Code Structure

### Backend
- `server/src/index.js` - Server entry point
- `server/src/services/` - Services for OpenAI and Meta
- `server/src/controllers/` - Controllers to handle API requests
- `server/src/utils/` - Utilities for audience manipulation

### Frontend
- `client/src/App.js` - Main component
- `client/src/components/` - React components for the user interface
- `client/src/services/` - Services to communicate with the backend API

## Possible Future Improvements

- Add authentication system
- Save generated audiences in a database
- Option to manually edit criteria before finalization
- Export as JSON for direct integration with the Meta API
- More accurate audience size estimation

## License

MIT

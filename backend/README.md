# Backend for VPBank AI Chatbot

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Create a `.env` file in the backend folder with the following variables:
   ```env
   BEDROCK_AGENT_ID=your-bedrock-agent-id
   BEDROCK_AGENT_ALIAS_ID=your-bedrock-agent-alias-id
   AWS_REGION=us-east-1
   PORT=3001
   ```
   Ensure your AWS credentials are set up (via environment, AWS CLI, or IAM role).

3. Start the server:
   ```sh
   node index.js
   ```

The backend will run on `http://localhost:3001` by default.

## Endpoint

- `POST /api/chat`
  - Body: `{ "message": "your message", "sessionId": "optional-session-id" }`
  - Returns: `{ "response": "agent reply" }` 
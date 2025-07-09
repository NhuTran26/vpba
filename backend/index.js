require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Bedrock Agent config from .env
  const agentId = process.env.BEDROCK_AGENT_ID;
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
  const region = process.env.AWS_REGION;

  if (!agentId || !agentAliasId || !region) {
    return res.status(500).json({ error: 'Bedrock Agent config missing in .env' });
  }

  const client = new BedrockAgentRuntimeClient({ region });

  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId: req.body.sessionId || 'default-session',
    inputText: message,
  });

  try {
    const response = await client.send(command);
    let completion = '';
    if (response.completion === undefined) {
      throw new Error('Completion is undefined');
    }
    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk;
      if (chunk && chunk.bytes) {
        const decoded = new TextDecoder('utf-8').decode(chunk.bytes);
        completion += decoded;
      }
    }
    res.json({ response: completion || 'No response from agent.' });
  } catch (error) {
    console.error('Bedrock Agent error:', error);
    res.status(500).json({ error: 'Failed to get response from Bedrock Agent.' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
}); 
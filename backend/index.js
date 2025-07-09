require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Create Cognito JWT verifier
let jwtVerifier = null;
if (process.env.USER_POOL_ID && process.env.CLIENT_ID) {
  jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'id',
    clientId: process.env.CLIENT_ID,
  });
}

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!jwtVerifier) {
    console.error('JWT Verifier not configured. Check USER_POOL_ID and CLIENT_ID in .env');
    return res.status(500).json({ error: 'Authentication not configured' });
  }

  try {
    // Verify the token
    const payload = await jwtVerifier.verify(token);
    
    // Attach user info to request
    req.user = {
      email: payload.email,
      sub: payload.sub,
      groups: payload['cognito:groups'] || [],
      username: payload['cognito:username']
    };
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Public health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VPBA Backend Service',
    authentication: jwtVerifier ? 'enabled' : 'disabled'
  });
});

// Protected profile endpoint
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Profile endpoint accessed successfully',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Protected chat endpoint with Bedrock integration
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Log user making the request
  console.log(`Chat request from user: ${req.user.email}`);

  // Bedrock Agent config from .env
  const agentId = process.env.BEDROCK_AGENT_ID;
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
  const region = process.env.AWS_REGION;

  if (!agentId || !agentAliasId || !region) {
    return res.status(500).json({ error: 'Bedrock Agent config missing in .env' });
  }

  const client = new BedrockAgentRuntimeClient({ region });

  // Use user's sub as session ID for conversation continuity
  const sessionId = req.body.sessionId || `session-${req.user.sub}`;

  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId,
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
    res.json({ 
      response: completion || 'No response from agent.',
      sessionId,
      user: req.user.email
    });
  } catch (error) {
    console.error('Bedrock Agent error:', error);
    res.status(500).json({ error: 'Failed to get response from Bedrock Agent.' });
  }
});

// Protected customer search endpoint (example from setup.sh)
app.post('/api/customers/search', authenticateToken, async (req, res) => {
  const { query } = req.body;
  
  // Check if user has appropriate permissions (e.g., admin or analyst group)
  const userGroups = req.user.groups || [];
  if (!userGroups.includes('admin') && !userGroups.includes('analyst')) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Mock customer search - replace with actual database query
  res.json({
    message: 'Customer search endpoint accessed',
    query: query,
    results: [
      { id: 1, name: 'Test Customer 1', email: 'customer1@vpbank.com' },
      { id: 2, name: 'Test Customer 2', email: 'customer2@vpbank.com' }
    ],
    searchedBy: req.user.email,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
  console.log(`Authentication: ${jwtVerifier ? 'Enabled' : 'Disabled'}`);
  if (jwtVerifier) {
    console.log(`User Pool ID: ${process.env.USER_POOL_ID}`);
    console.log(`Client ID: ${process.env.CLIENT_ID}`);
  }
}); 
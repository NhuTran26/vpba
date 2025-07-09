// middleware/auth.js
const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Create Cognito JWT verifier
const createVerifier = () => {
  if (!process.env.USER_POOL_ID || !process.env.CLIENT_ID) {
    console.warn('Cognito configuration missing. Authentication will be disabled.');
    return null;
  }

  return CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'id',
    clientId: process.env.CLIENT_ID,
  });
};

const jwtVerifier = createVerifier();

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
      username: payload['cognito:username'],
      tokenExp: payload.exp,
      tokenIat: payload.iat
    };
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token has expired' });
    }
    
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Authorization middleware - checks if user has required group
const requireGroup = (allowedGroups) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userGroups = req.user.groups || [];
    const hasPermission = allowedGroups.some(group => userGroups.includes(group));

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedGroups,
        userGroups: userGroups
      });
    }

    next();
  };
};

// Rate limiting middleware based on user groups
const getRateLimit = (user) => {
  const groups = user?.groups || [];
  
  if (groups.includes('admin')) {
    return { requests: 1000, window: '1h' };
  } else if (groups.includes('analyst')) {
    return { requests: 500, window: '1h' };
  } else {
    return { requests: 100, window: '1h' };
  }
};

module.exports = {
  authenticateToken,
  requireGroup,
  getRateLimit,
  jwtVerifier
};
#!/bin/bash

# VPBA EC2 Setup Script - Deploy React App with Cognito Authentication
# Run this script on a fresh EC2 instance to set up everything

set -e  # Exit on error

echo "========================================="
echo "VPBA EC2 Setup Script"
echo "========================================="

# Update these variables with your actual values
USER_POOL_ID="${USER_POOL_ID:-us-east-1_bh42p2hEJ}"
CLIENT_ID="${CLIENT_ID:-3jtrpqalis6jpreoifcic6jssg}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ALB_ENDPOINT="${ALB_ENDPOINT:-vpba-ALB-176820702.us-east-1.elb.amazonaws.com}"

# Update system
echo "1. Updating system packages..."
sudo yum update -y

# Install Docker
echo "2. Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "3. Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for initial setup)
echo "4. Installing Node.js..."
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Create application directory
echo "5. Creating application directory..."
mkdir -p /home/ec2-user/vpba-auth-test
cd /home/ec2-user/vpba-auth-test

# Create React App files
echo "6. Creating React application files..."

# Create package.json
cat > package.json << 'EOF'
{
  "name": "vpba-auth-test",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "amazon-cognito-identity-js": "^6.3.1",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": ["react-app"]
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
EOF

# Create public/index.html
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>VPBA Authentication Test</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# Create src directory
mkdir -p src

# Create src/index.js
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create src/App.js with Cognito authentication
cat > src/App.js << 'EOF'
import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import axios from 'axios';

// Cognito configuration - will be replaced by environment variables
const poolData = {
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

function App() {
  const [email, setEmail] = useState('admin@vpbank.com');
  const [password, setPassword] = useState('VPBAdmin2025!');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [idToken, setIdToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setLoading(true);
    setError('');

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();
        
        setIdToken(idToken);
        setIsAuthenticated(true);
        setLoading(false);
        
        // Decode token to get user info
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        setUserInfo({
          email: payload.email,
          sub: payload.sub,
          groups: payload['cognito:groups'] || [],
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
      },
      onFailure: (err) => {
        setError(err.message || 'Authentication failed');
        setLoading(false);
      }
    });
  };

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setIsAuthenticated(false);
    setIdToken('');
    setUserInfo(null);
    setApiResponse('');
  };

  const testApiCall = async (endpoint) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `http://${process.env.REACT_APP_ALB_ENDPOINT}${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      
      setApiResponse(JSON.stringify(response.data, null, 2));
      setLoading(false);
    } catch (err) {
      setError(`API call failed: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  const testDatabaseQuery = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `http://${process.env.REACT_APP_ALB_ENDPOINT}/api/customers/search`,
        { query: 'test' },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setApiResponse(JSON.stringify(response.data, null, 2));
      setLoading(false);
    } catch (err) {
      setError(`Database query failed: ${err.response?.data?.error || err.message}`);
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>VPBA Authentication Test</h1>
        <div>
          <h2>Login with Cognito</h2>
          <div>
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>
              Password:
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <button 
            onClick={handleLogin} 
            disabled={loading}
            style={{ marginTop: '10px', padding: '10px 20px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <p><strong>Test Credentials:</strong></p>
          <p>Admin: admin@vpbank.com / VPBAdmin2025!</p>
          <p>Analyst: analyst@vpbank.com / VPBAnalyst2025!</p>
          <p>API User: api@vpbank.com / VPBApi2025!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>VPBA Authentication Test - Logged In</h1>
      <button onClick={handleLogout} style={{ float: 'right', padding: '10px 20px' }}>
        Logout
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>User Information</h2>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>ID Token (truncated)</h2>
        <p style={{ wordBreak: 'break-all', backgroundColor: '#f0f0f0', padding: '10px' }}>
          {idToken.substring(0, 50)}...
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Test API Endpoints</h2>
        <button 
          onClick={() => testApiCall('/health')} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          Test Health (Public)
        </button>
        <button 
          onClick={() => testApiCall('/api/profile')} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          Test Profile (Protected)
        </button>
        <button 
          onClick={testDatabaseQuery} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test Database Query
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {apiResponse && (
        <div style={{ marginTop: '20px' }}>
          <h3>API Response:</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', overflow: 'auto' }}>
            {apiResponse}
          </pre>
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
}

export default App;
EOF

# Create .env file with placeholders
cat > .env << EOF
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_CLIENT_ID=$CLIENT_ID
REACT_APP_ALB_ENDPOINT=$ALB_ENDPOINT
EOF

# Create Dockerfile
echo "7. Creating Dockerfile..."
cat > Dockerfile << 'EOF'
# Multi-stage build for React app
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx.conf
echo "8. Creating nginx configuration..."
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Create docker-compose.yml
echo "9. Creating docker-compose.yml..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  vpba-auth-test:
    build: .
    container_name: vpba-auth-test
    ports:
      - "80:80"
    environment:
      - REACT_APP_USER_POOL_ID=$USER_POOL_ID
      - REACT_APP_CLIENT_ID=$CLIENT_ID
      - REACT_APP_ALB_ENDPOINT=$ALB_ENDPOINT
    restart: unless-stopped
EOF

# Create a simple backend API server (optional)
echo "10. Creating simple backend API server..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Public endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VPBA Auth Test Backend'
  });
});

// Protected endpoints (in real implementation, these would validate the token)
app.get('/api/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  res.json({
    message: 'Profile endpoint accessed successfully',
    timestamp: new Date().toISOString(),
    token: authHeader.substring(0, 20) + '...'
  });
});

app.post('/api/customers/search', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  res.json({
    message: 'Customer search endpoint accessed',
    query: req.body.query,
    results: [
      { id: 1, name: 'Test Customer 1' },
      { id: 2, name: 'Test Customer 2' }
    ],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test backend server running on port ${PORT}`);
});
EOF

# Create backend package.json
cat > backend-package.json << 'EOF'
{
  "name": "vpba-test-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Build and run with Docker
echo "11. Building and running Docker container..."
sudo docker-compose down || true
sudo docker-compose build
sudo docker-compose up -d

# Create test script
echo "12. Creating test script..."
cat > test-auth.sh << 'EOF'
#!/bin/bash

echo "VPBA Authentication Test Script"
echo "=============================="

# Check if container is running
if sudo docker ps | grep -q vpba-auth-test; then
    echo "✓ Container is running"
else
    echo "✗ Container is not running"
    exit 1
fi

# Get container IP
CONTAINER_IP=$(sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vpba-auth-test)
echo "Container IP: $CONTAINER_IP"

# Test nginx is responding
echo -n "Testing nginx response... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✓ OK"
else
    echo "✗ Failed"
fi

# Show access URLs
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo ""
echo "Access the application at:"
echo "- Local: http://localhost"
echo "- EC2 Public IP: http://$EC2_PUBLIC_IP"
echo ""
echo "Make sure security group allows inbound traffic on port 80"
EOF

chmod +x test-auth.sh

# Create cleanup script
echo "13. Creating cleanup script..."
cat > cleanup.sh << 'EOF'
#!/bin/bash

echo "Cleaning up VPBA Auth Test..."
sudo docker-compose down
sudo docker system prune -f
rm -rf node_modules
echo "Cleanup complete"
EOF

chmod +x cleanup.sh

# Show summary
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "The React app with Cognito authentication is now running in Docker."
echo ""
echo "Configuration:"
echo "- User Pool ID: $USER_POOL_ID"
echo "- Client ID: $CLIENT_ID"
echo "- ALB Endpoint: $ALB_ENDPOINT"
echo ""
echo "To test:"
echo "1. Run: ./test-auth.sh"
echo "2. Access: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "3. Login with: admin@vpbank.com / VPBAdmin2025!"
echo ""
echo "Useful commands:"
echo "- View logs: sudo docker-compose logs -f"
echo "- Restart: sudo docker-compose restart"
echo "- Stop: sudo docker-compose down"
echo "- Cleanup: ./cleanup.sh"
echo ""
echo "Make sure your EC2 security group allows inbound traffic on port 80!"
echo ""

# Run the test script
./test-auth.sh
/// <reference types="vite/client" />
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_CLIENT_ID,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    oauth: {
      domain: import.meta.env.VITE_COGNITO_DOMAIN, // e.g. myapp.auth.us-east-1.amazoncognito.com
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code', // or 'token'
    },
  } as any,
});

export default {}; 
import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';

// Component that handles the redirect logic
const AuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (authStatus === 'authenticated') {
        try {
          // Double-check that user is actually authenticated
          await getCurrentUser();
          navigate('/chat');
        } catch (error) {
          console.log('User not authenticated:', error);
        }
      }
    };

    checkAuthAndRedirect();
  }, [authStatus, navigate]);

  return null; // This component doesn't render anything
};

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center font-sans bg-gradient-to-br from-green-700 to-blue-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <Authenticator>
          <AuthRedirectHandler />
        </Authenticator>
      </div>
    </div>
  );
};

export default Login;
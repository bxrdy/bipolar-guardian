
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SessionManager from '@/components/SessionManager';
import AuthenticatedApp from '@/components/AuthenticatedApp';
import ImprovedLandingPage from '@/components/landing/ImprovedLandingPage';
import { useAuthHandler } from '@/hooks/useAuthHandler';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  const {
    isSigningIn,
    isSigningUp,
    handleEmailPasswordAuth,
  } = useAuthHandler();

  // Create wrapper function to match expected signature
  const handleAuth = async (email: string, password: string, isSignUp: boolean): Promise<void> => {
    await handleEmailPasswordAuth(email, password, isSignUp);
  };

  const handleShowAuth = (isSignUp: boolean) => {
    setIsSignUpMode(isSignUp);
    setShowAuth(true);
  };

  return (
    <SessionManager>
      {({ 
        session, 
        currentScreen, 
        setCurrentScreen, 
        userData, 
        setUserData, 
        isLoading,
        handleSignOut 
      }) => {
        // Show authenticated app if session exists
        if (session) {
          return (
            <AuthenticatedApp
              session={session}
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              userData={userData}
              setUserData={setUserData}
              handleSignOut={handleSignOut}
            />
          );
        }

        // Show auth form if requested
        if (showAuth) {
          return (
            <LoginForm
              onEmailPasswordAuth={handleAuth}
              isSigningIn={isSigningIn}
              isSigningUp={isSigningUp}
            />
          );
        }

        // Show improved landing page by default
        return (
          <ImprovedLandingPage onShowAuth={handleShowAuth} />
        );
      }}
    </SessionManager>
  );
};

export default Index;


import React, { ReactNode, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useSessionSecurity, getSessionSecurityConfig } from "@/hooks/useSessionSecurity";
import { useSessionAuth, Screen, UserData } from "@/hooks/useSessionAuth";
import { useSessionInitialization } from "@/hooks/useSessionInitialization";
import { useSuspiciousActivity } from "@/hooks/useSuspiciousActivity";
import SessionLoadingScreen from "@/components/auth/SessionLoadingScreen";
import SecurityComponents from "@/components/auth/SecurityComponents";

interface SessionManagerProps {
  children: (props: {
    session: Session | null;
    currentScreen: Screen;
    setCurrentScreen: (screen: Screen) => void;
    userData: UserData;
    setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
    isLoading: boolean;
    handleSignOut: () => Promise<void>;
    sessionSecurity: {
      timeRemaining: number;
      isSensitiveMode: boolean;
      setSensitiveMode: (enabled: boolean) => void;
      extendSession: () => void;
    };
  }) => ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const { toast } = useToast();
  
  // Authentication state and user data
  const {
    session,
    currentScreen,
    setCurrentScreen,
    userData,
    setUserData,
    isLoading,
    handleSignOut: authHandleSignOut
  } = useSessionAuth();

  // Security timeout handler - memoized to prevent recreation
  const handleSecurityTimeout = useCallback(async () => {
    try {
      await authHandleSignOut();
    } catch (error) {
      console.error('Error handling security timeout:', error);
      // Force logout anyway by clearing session
      await authHandleSignOut();
    }
  }, [authHandleSignOut]);

  // Optimized security config - memoized to prevent recreation
  const optimizedSecurityConfig = useMemo(() => ({
    ...getSessionSecurityConfig(),
    checkIntervalSeconds: 180,
    activityEvents: ['mousedown', 'keypress'],
    inactivityWarningMinutes: 25,
    sessionTimeoutMinutes: 30,
  }), []);

  const sessionSecurity = useSessionSecurity(
    optimizedSecurityConfig,
    handleSecurityTimeout
  );

  // Session initialization - memoized callbacks to prevent dependency changes
  const onSessionCreated = useCallback((sessionResult: any) => {
    console.log('Session created successfully:', sessionResult);
  }, []);

  const onDeviceRegistered = useCallback((deviceResult: any) => {
    console.log('Device registered:', deviceResult);
  }, []);

  const { logAuthEvent } = useSessionInitialization({
    session,
    onSessionCreated,
    onDeviceRegistered
  });

  // Suspicious activity monitoring
  const {
    showSuspiciousActivity,
    checkSuspiciousActivity,
    dismissSuspiciousActivity
  } = useSuspiciousActivity();

  // Enhanced sign out with proper error handling
  const enhancedHandleSignOut = useCallback(async () => {
    try {
      // Log session termination with safe error handling
      try {
        await logAuthEvent('session_terminated', {
          reason: 'user_initiated',
          session_duration: sessionSecurity.timeRemaining,
          sensitive_mode: sessionSecurity.isSensitiveMode
        });
      } catch (logError) {
        console.warn('Failed to log session termination:', logError);
        // Continue with logout even if logging fails
      }
      
      await authHandleSignOut();
      dismissSuspiciousActivity();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out properly",
        variant: "destructive"
      });
    }
  }, [logAuthEvent, sessionSecurity.timeRemaining, sessionSecurity.isSensitiveMode, authHandleSignOut, dismissSuspiciousActivity, toast]);

  // Optimized auth state change handler - properly memoized
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (session?.user?.id && currentScreen === 'dashboard') {
      timeoutId = setTimeout(() => {
        sessionSecurity.resetActivityTimer();
        // Safe suspicious activity check with error handling
        checkSuspiciousActivity(session.user.id).catch(error => {
          console.warn('Failed to check suspicious activity:', error);
        });
      }, 2000);
    }
    
    // Set sensitive mode for onboarding screens
    if (currentScreen === 'onboarding-step1' || 
        currentScreen === 'onboarding-step2' || 
        currentScreen === 'onboarding-step3') {
      sessionSecurity.setSensitiveMode(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session?.user?.id, currentScreen, sessionSecurity, checkSuspiciousActivity]);

  // Memoize session security props to prevent recreation
  const sessionSecurityProps = useMemo(() => ({
    timeRemaining: sessionSecurity.timeRemaining,
    isSensitiveMode: sessionSecurity.isSensitiveMode,
    setSensitiveMode: sessionSecurity.setSensitiveMode,
    extendSession: sessionSecurity.extendSession
  }), [
    sessionSecurity.timeRemaining,
    sessionSecurity.isSensitiveMode,
    sessionSecurity.setSensitiveMode,
    sessionSecurity.extendSession
  ]);

  // Show loading screen while initializing
  if (isLoading) {
    return <SessionLoadingScreen />;
  }

  return (
    <>
      {children({
        session,
        currentScreen,
        setCurrentScreen,
        userData,
        setUserData,
        isLoading,
        handleSignOut: enhancedHandleSignOut,
        sessionSecurity: sessionSecurityProps
      })}
      
      {/* Security Components */}
      <SecurityComponents
        session={session}
        sessionSecurity={{
          showWarning: sessionSecurity.showWarning,
          showFinalWarning: sessionSecurity.showFinalWarning,
          timeRemaining: sessionSecurity.timeRemaining,
          isSensitiveMode: sessionSecurity.isSensitiveMode,
          extendSession: sessionSecurity.extendSession,
          forceLogout: sessionSecurity.forceLogout
        }}
        suspiciousActivity={{
          show: showSuspiciousActivity,
          onDismiss: dismissSuspiciousActivity
        }}
      />
    </>
  );
};

export default SessionManager;


import React, { ReactNode, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { useSessionSecurity, getSessionSecurityConfig } from "@/hooks/useSessionSecurity";
import { useSessionAuth, Screen, UserData } from "@/hooks/useSessionAuth";
import { useSessionInitialization } from "@/hooks/useSessionInitialization";
import { useSuspiciousActivity } from "@/hooks/useSuspiciousActivity";
import SessionLoadingScreen from "@/components/auth/SessionLoadingScreen";
import SecurityComponents from "@/components/auth/SecurityComponents";

interface OptimizedSessionManagerProps {
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

const OptimizedSessionManager: React.FC<OptimizedSessionManagerProps> = ({ children }) => {
  const { toast } = useToast();
  
  const {
    session,
    currentScreen,
    setCurrentScreen,
    userData,
    setUserData,
    isLoading,
    handleSignOut: authHandleSignOut
  } = useSessionAuth();

  const {
    showSuspiciousActivity,
    checkSuspiciousActivity,
    dismissSuspiciousActivity
  } = useSuspiciousActivity();

  // Memoize suspicious activity check with longer debounce
  const memoizedCheckSuspiciousActivity = useCallback((userId: string) => {
    const timeoutId = setTimeout(() => {
      checkSuspiciousActivity(userId);
    }, 2000); // Increased debounce to 2 seconds

    return () => clearTimeout(timeoutId);
  }, [checkSuspiciousActivity]);

  // Optimized security timeout handler
  const handleSecurityTimeout = useCallback(async () => {
    try {
      await logAuthEvent('session_timeout', {
        timeout_reason: 'inactivity',
        timestamp: new Date().toISOString()
      });
      await enhancedHandleSignOut();
    } catch (error) {
      console.error('Error handling security timeout:', error);
      await enhancedHandleSignOut();
    }
  }, []);

  // Highly optimized security config - reduced frequency
  const optimizedSecurityConfig = useMemo(() => ({
    ...getSessionSecurityConfig(),
    checkIntervalSeconds: 120, // Increased from 60 to 120 seconds
    activityEvents: ['mousedown', 'keypress'], // Reduced events for better performance
    inactivityWarningMinutes: 25, // Increased warning time
    sessionTimeoutMinutes: 30, // Increased timeout
  }), []);

  const sessionSecurity = useSessionSecurity(
    optimizedSecurityConfig,
    handleSecurityTimeout
  );

  // Optimized session initialization with longer delays
  const { logAuthEvent } = useSessionInitialization({
    session,
    onSessionCreated: useCallback((sessionResult) => {
      console.log('Session created successfully:', sessionResult);
    }, []),
    onDeviceRegistered: useCallback((deviceResult) => {
      console.log('Device registered:', deviceResult);
    }, [])
  });

  // Enhanced sign out with better error handling
  const enhancedHandleSignOut = useCallback(async () => {
    try {
      await logAuthEvent('session_terminated', {
        reason: 'user_initiated',
        session_duration: sessionSecurity.timeRemaining,
        sensitive_mode: sessionSecurity.isSensitiveMode
      });
      
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

  // Optimized auth state change handler with debouncing
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (session && currentScreen === 'dashboard') {
      timeoutId = setTimeout(() => {
        sessionSecurity.resetActivityTimer();
        memoizedCheckSuspiciousActivity(session.user.id);
      }, 1000); // Debounce for 1 second
    }
    
    if (currentScreen === 'onboarding-step1' || 
        currentScreen === 'onboarding-step2' || 
        currentScreen === 'onboarding-step3') {
      sessionSecurity.setSensitiveMode(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session?.user?.id, currentScreen]);

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

export default OptimizedSessionManager;

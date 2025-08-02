import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionSecurityConfig {
  timeoutMinutes?: number;
  sensitiveTimeoutMinutes?: number;
  warningMinutes?: number;
  finalWarningMinutes?: number;
  checkIntervalSeconds?: number;
  activityEvents?: string[];
}

interface SessionSecurityState {
  isActive: boolean;
  timeRemaining: number;
  showWarning: boolean;
  showFinalWarning: boolean;
  isSensitiveMode: boolean;
  lastActivity: Date;
}

interface UseSessionSecurityReturn extends SessionSecurityState {
  extendSession: () => void;
  setSensitiveMode: (enabled: boolean) => void;
  forceLogout: () => Promise<void>;
  resetActivityTimer: () => void;
}

const DEFAULT_CONFIG: Required<SessionSecurityConfig> = {
  timeoutMinutes: 15,
  sensitiveTimeoutMinutes: 5,
  warningMinutes: 5,
  finalWarningMinutes: 1,
  checkIntervalSeconds: 120,
  activityEvents: ['mousedown', 'keypress']
};

export const useSessionSecurity = (
  config: SessionSecurityConfig = {},
  onTimeout?: () => Promise<void>
): UseSessionSecurityReturn => {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const { toast } = useToast();
  
  const [state, setState] = useState<SessionSecurityState>({
    isActive: true,
    timeRemaining: finalConfig.timeoutMinutes * 60,
    showWarning: false,
    showFinalWarning: false,
    isSensitiveMode: false,
    lastActivity: new Date()
  });

  const lastActivityRef = useRef<Date>(new Date());
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const lastToastRef = useRef<{ warning: number; final: number }>({ warning: 0, final: 0 });
  const activityDebounceRef = useRef<NodeJS.Timeout>();

  const getCurrentTimeout = useCallback(() => {
    return state.isSensitiveMode 
      ? finalConfig.sensitiveTimeoutMinutes 
      : finalConfig.timeoutMinutes;
  }, [state.isSensitiveMode, finalConfig]);

  const logSecurityEvent = useCallback(async (eventType: string, metadata: any = {}) => {
    try {
      await supabase.functions.invoke('log-auth-event', {
        body: {
          event_type: eventType,
          additional_metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            sensitive_mode: state.isSensitiveMode
          }
        }
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }, [state.isSensitiveMode]);

  const resetActivityTimer = useCallback(() => {
    const now = new Date();
    lastActivityRef.current = now;
    
    setState(prev => ({
      ...prev,
      lastActivity: now,
      timeRemaining: getCurrentTimeout() * 60,
      showWarning: false,
      showFinalWarning: false
    }));
  }, [getCurrentTimeout]);

  const extendSession = useCallback(() => {
    resetActivityTimer();
    logSecurityEvent('session_extended', {
      extended_by_minutes: getCurrentTimeout(),
      was_warning_shown: state.showWarning || state.showFinalWarning
    }).catch(err => console.warn('Failed to log session extension:', err));
    
    toast({
      title: "Session Extended",
      description: `Your session has been extended by ${getCurrentTimeout()} minutes.`,
      duration: 3000
    });
  }, [getCurrentTimeout, resetActivityTimer, logSecurityEvent, state.showWarning, state.showFinalWarning, toast]);

  const forceLogout = useCallback(async () => {
    try {
      await logSecurityEvent('session_timeout', {
        timeout_type: state.isSensitiveMode ? 'sensitive' : 'normal',
        time_remaining: state.timeRemaining
      });
    } catch (err) {
      console.warn('Failed to log session timeout:', err);
    }
    
    setState(prev => ({ ...prev, isActive: false }));
    
    if (onTimeout) {
      await onTimeout();
    } else {
      // Default logout behavior
      try {
        await supabase.auth.signOut();
        toast({
          title: "Session Expired",
          description: "You have been automatically signed out due to inactivity.",
          variant: "destructive",
          duration: 5000
        });
      } catch (err) {
        console.error('Failed to sign out:', err);
      }
    }
  }, [state.isSensitiveMode, state.timeRemaining, logSecurityEvent, onTimeout, toast]);

  const setSensitiveMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      isSensitiveMode: enabled,
      timeRemaining: enabled 
        ? finalConfig.sensitiveTimeoutMinutes * 60 
        : finalConfig.timeoutMinutes * 60
    }));
    
    logSecurityEvent('sensitive_mode_changed', { enabled }).catch(err => {
      console.warn('Failed to log sensitive mode change:', err);
    });
    
    if (enabled) {
      toast({
        title: "Sensitive Mode Enabled",
        description: `Session timeout reduced to ${finalConfig.sensitiveTimeoutMinutes} minutes.`,
        duration: 4000
      });
    }
  }, [finalConfig, logSecurityEvent, toast]);

  // Optimized activity event handler with debouncing
  const handleActivity = useCallback(() => {
    if (activityDebounceRef.current) {
      clearTimeout(activityDebounceRef.current);
    }

    activityDebounceRef.current = setTimeout(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
      
      if (timeSinceLastActivity > 120000) {
        resetActivityTimer();
      }
    }, 2000);
  }, [resetActivityTimer]);

  // Session monitoring with proper error handling
  useEffect(() => {
    const checkSessionStatus = () => {
      try {
        const now = new Date();
        const timeElapsed = Math.floor((now.getTime() - lastActivityRef.current.getTime()) / 1000);
        const timeoutSeconds = getCurrentTimeout() * 60;
        const remaining = Math.max(0, timeoutSeconds - timeElapsed);
        
        const warningThreshold = finalConfig.warningMinutes * 60;
        const finalWarningThreshold = finalConfig.finalWarningMinutes * 60;
        
        setState(prev => ({
          ...prev,
          timeRemaining: remaining,
          showWarning: remaining <= warningThreshold && remaining > finalWarningThreshold,
          showFinalWarning: remaining <= finalWarningThreshold && remaining > 0
        }));
        
        // Auto-logout when time expires
        if (remaining <= 0) {
          forceLogout().catch(err => console.error('Failed to force logout:', err));
          return;
        }
        
        // Show warning notifications with debouncing
        const currentTime = Math.floor(now.getTime() / 1000);
        if (remaining === warningThreshold && currentTime > lastToastRef.current.warning + 120) {
          lastToastRef.current.warning = currentTime;
          logSecurityEvent('session_warning', { minutes_remaining: finalConfig.warningMinutes }).catch(err => {
            console.warn('Failed to log session warning:', err);
          });
          toast({
            title: "Session Warning",
            description: `Your session will expire in ${finalConfig.warningMinutes} minutes due to inactivity.`,
            duration: 8000
          });
        }
        
        if (remaining === finalWarningThreshold && currentTime > lastToastRef.current.final + 120) {
          lastToastRef.current.final = currentTime;
          logSecurityEvent('session_final_warning', { minutes_remaining: finalConfig.finalWarningMinutes }).catch(err => {
            console.warn('Failed to log final warning:', err);
          });
          toast({
            title: "Session Expiring Soon",
            description: `Your session will expire in ${finalConfig.finalWarningMinutes} minute. Click to extend.`,
            variant: "destructive",
            duration: 10000
          });
        }
      } catch (error) {
        console.error('Error in session status check:', error);
      }
    };
    
    checkIntervalRef.current = setInterval(checkSessionStatus, finalConfig.checkIntervalSeconds * 1000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [getCurrentTimeout, finalConfig, forceLogout, logSecurityEvent, toast]);

  // Activity listeners with proper cleanup
  useEffect(() => {
    const eventOptions = { passive: true, capture: false };

    finalConfig.activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, eventOptions);
    });
    
    return () => {
      finalConfig.activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
    };
  }, [handleActivity, finalConfig.activityEvents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
    };
  }, []);

  return useMemo(() => ({
    ...state,
    extendSession,
    setSensitiveMode,
    forceLogout,
    resetActivityTimer
  }), [state, extendSession, setSensitiveMode, forceLogout, resetActivityTimer]);
};

/**
 * Utility hook for components that need sensitive operation protection
 */
export const useSensitiveOperation = () => {
  const sessionSecurity = useSessionSecurity({
    sensitiveTimeoutMinutes: 5,
    warningMinutes: 2,
    finalWarningMinutes: 1
  });

  const enterSensitiveMode = useCallback(() => {
    sessionSecurity.setSensitiveMode(true);
  }, [sessionSecurity]);

  const exitSensitiveMode = useCallback(() => {
    sessionSecurity.setSensitiveMode(false);
  }, [sessionSecurity]);

  return {
    ...sessionSecurity,
    enterSensitiveMode,
    exitSensitiveMode
  };
};

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Expired";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Get session security configuration from environment or defaults
 */
export const getSessionSecurityConfig = (): SessionSecurityConfig => {
  return {
    timeoutMinutes: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '15'),
    sensitiveTimeoutMinutes: parseInt(import.meta.env.VITE_SENSITIVE_SESSION_TIMEOUT_MINUTES || '5'),
    warningMinutes: parseInt(import.meta.env.VITE_SESSION_WARNING_MINUTES || '5'),
    finalWarningMinutes: parseInt(import.meta.env.VITE_SESSION_FINAL_WARNING_MINUTES || '1'),
    checkIntervalSeconds: parseInt(import.meta.env.VITE_SESSION_CHECK_INTERVAL_SECONDS || '30')
  };
};

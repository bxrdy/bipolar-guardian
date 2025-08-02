
import { useEffect, useCallback, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { useDeviceRegistration } from '@/hooks/useDeviceRegistration';

interface UseSessionInitializationProps {
  session: Session | null;
  onSessionCreated?: (sessionResult: any) => void;
  onDeviceRegistered?: (deviceResult: any) => void;
}

/**
 * Hook for handling session initialization tasks
 * Manages parallel operations like device registration and session creation
 * Optimized to prevent performance issues
 */
export function useSessionInitialization({
  session,
  onSessionCreated,
  onDeviceRegistered
}: UseSessionInitializationProps) {
  const { createSession, updateSessionActivity } = useSessionManagement();
  const { registerCurrentDevice } = useDeviceRegistration();

  // Log authentication events - memoized to prevent recreation
  const logAuthEvent = useCallback(async (eventType: string, metadata: any = {}) => {
    try {
      await supabase.functions.invoke('log-auth-event', {
        body: {
          event_type: eventType,
          additional_metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        }
      });
    } catch (error) {
      console.warn('Failed to log auth event:', error);
    }
  }, []);

  // Memoize callbacks to prevent dependency changes
  const memoizedOnSessionCreated = useCallback((sessionResult: any) => {
    onSessionCreated?.(sessionResult);
  }, [onSessionCreated]);

  const memoizedOnDeviceRegistered = useCallback((deviceResult: any) => {
    onDeviceRegistered?.(deviceResult);
  }, [onDeviceRegistered]);

  // Initialize session when user logs in - optimized to run only when needed
  useEffect(() => {
    let isCancelled = false;

    const initializeSession = async () => {
      if (!session || isCancelled) return;

      try {
        // Run independent operations in parallel for faster startup
        const [deviceResult, sessionResult] = await Promise.all([
          registerCurrentDevice(), // Uses lightweight fingerprinting
          createSession(session.access_token, 60)
        ]);
        
        if (isCancelled) return;
        
        // Handle session creation result
        if (sessionResult.success) {
          await logAuthEvent('session_created', {
            user_id: session.user.id,
            session_expires: session.expires_at,
            managed_session_id: sessionResult.session?.id
          });
          
          memoizedOnSessionCreated(sessionResult);
        }
        
        // Handle device registration result
        if (deviceResult) {
          memoizedOnDeviceRegistered(deviceResult);
        }
      } catch (error) {
        if (isCancelled) return;
        
        console.error('Error during session initialization:', error);
        
        // Log initialization failure
        await logAuthEvent('session_init_failed', {
          user_id: session.user.id,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    initializeSession();

    return () => {
      isCancelled = true;
    };
  }, [session?.user?.id, registerCurrentDevice, createSession, logAuthEvent, memoizedOnSessionCreated, memoizedOnDeviceRegistered]);

  // Update session activity periodically - optimized frequency
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      updateSessionActivity(session.access_token);
    }, 10 * 60 * 1000); // Increased from 5 to 10 minutes

    return () => clearInterval(interval);
  }, [session?.access_token, updateSessionActivity]);

  // Memoize return object
  return useMemo(() => ({
    logAuthEvent
  }), [logAuthEvent]);
}

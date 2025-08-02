
import { useState, useCallback, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface UseSuspiciousActivityResult {
  showSuspiciousActivity: boolean;
  setShowSuspiciousActivity: (show: boolean) => void;
  checkSuspiciousActivity: (userId: string) => Promise<void>;
  dismissSuspiciousActivity: () => void;
}

/**
 * Hook for managing suspicious activity detection and alerts
 * Optimized to prevent performance issues
 */
export function useSuspiciousActivity(): UseSuspiciousActivityResult {
  const [showSuspiciousActivity, setShowSuspiciousActivity] = useState(false);

  /**
   * Check for suspicious activity in the last 24 hours
   * Memoized and optimized to prevent excessive calls
   */
  const checkSuspiciousActivity = useCallback(async (userId: string) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data: suspiciousEvents, error } = await supabase
        .from('auth_events')
        .select('*')
        .eq('user_id', userId)
        .in('event_type', ['suspicious_activity', 'login_failure', 'account_locked'])
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .limit(5);

      if (error) {
        console.error('Error checking suspicious activity:', error);
        return;
      }

      if (suspiciousEvents && suspiciousEvents.length > 0) {
        setShowSuspiciousActivity(true);
        
        // Log that we detected and are showing suspicious activity alert
        await logSuspiciousActivityDetection(userId, suspiciousEvents.length);
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
    }
  }, []);

  /**
   * Dismiss the suspicious activity alert
   */
  const dismissSuspiciousActivity = useCallback(() => {
    setShowSuspiciousActivity(false);
  }, []);

  /**
   * Log suspicious activity detection
   */
  const logSuspiciousActivityDetection = useCallback(async (userId: string, eventCount: number) => {
    try {
      await supabase.functions.invoke('log-auth-event', {
        body: {
          event_type: 'suspicious_activity_alert_shown',
          additional_metadata: {
            user_id: userId,
            suspicious_events_count: eventCount,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.warn('Failed to log suspicious activity detection:', error);
    }
  }, []);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    showSuspiciousActivity,
    setShowSuspiciousActivity,
    checkSuspiciousActivity,
    dismissSuspiciousActivity
  }), [showSuspiciousActivity, checkSuspiciousActivity, dismissSuspiciousActivity]);
}

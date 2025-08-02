
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';

export interface ActiveSession {
  id: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_activity: string;
  expires_at: string;
  location_data?: any;
}

export const useSessionManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createSession = useCallback(async (sessionToken: string, timeoutMinutes = 60) => {
    setIsLoading(true);
    try {
      const fingerprint = await generateDeviceFingerprint();
      const { data, error } = await supabase.functions.invoke('manage-session', {
        body: {
          action: 'create',
          session_token: sessionToken,
          device_fingerprint: fingerprint.id,
          metadata: {
            timeout_minutes: timeoutMinutes,
            device_name: fingerprint.components.userAgent?.substring(0, 50)
          }
        }
      });

      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Session Error",
        description: "Failed to create secure session",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSessionActivity = useCallback(async (sessionToken: string) => {
    try {
      await supabase.functions.invoke('manage-session', {
        body: {
          action: 'update',
          session_token: sessionToken
        }
      });
    } catch (error) {
      console.warn('Failed to update session activity:', error);
    }
  }, []);

  const terminateSession = useCallback(async (sessionToken?: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-session', {
        body: {
          action: 'terminate',
          session_token: sessionToken
        }
      });

      if (error) throw error;
      
      toast({
        title: "Session Terminated",
        description: sessionToken ? 'Session terminated successfully' : 'All sessions terminated successfully'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listActiveSessions = useCallback(async (): Promise<ActiveSession[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-session', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.sessions || [];
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }, []);

  const cleanupExpiredSessions = useCallback(async () => {
    try {
      await supabase.functions.invoke('manage-session', {
        body: { action: 'cleanup' }
      });
    } catch (error) {
      console.warn('Failed to cleanup expired sessions:', error);
    }
  }, []);

  return {
    createSession,
    updateSessionActivity,
    terminateSession,
    listActiveSessions,
    cleanupExpiredSessions,
    isLoading
  };
};

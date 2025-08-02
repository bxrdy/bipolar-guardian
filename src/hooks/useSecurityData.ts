
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for security data
export interface AuthEvent {
  id: string;
  user_id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  geolocation_data: any;
  failure_reason: string | null;
  session_id: string | null;
  additional_metadata: any;
  created_at: string;
}

export interface SecurityStatus {
  user_id: string;
  failed_login_attempts: number;
  last_failed_attempt: string | null;
  account_locked_until: string | null;
  consecutive_failures_from_ip: number;
  last_failure_ip: string | null;
  suspicious_activity_score: number;
  last_login_ip: string | null;
  last_login_at: string | null;
  last_login_user_agent: string | null;
  known_devices: any[];
  trusted_locations: any[];
  two_factor_enabled: boolean;
  two_factor_backup_codes: string[] | null;
  session_timeout_minutes: number;
  require_two_factor: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  location_data: any;
  created_at: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
}

export interface DeviceFingerprint {
  id: string;
  user_id: string;
  fingerprint_hash: string;
  device_name: string | null;
  browser_info: any;
  screen_info: any;
  timezone_info: string | null;
  is_trusted: boolean;
  first_seen: string;
  last_seen: string;
  use_count: number;
}

export interface SecurityConfig {
  id: string;
  config_key: string;
  config_value: any;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for authentication events with real-time updates
export const useAuthEvents = (limit: number = 50) => {
  const [events, setEvents] = useState<AuthEvent[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auth-events', limit],
    queryFn: async (): Promise<AuthEvent[]> => {
      const { data, error } = await supabase
        .from('auth_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching auth events:', error);
        throw error;
      }

      // Type-cast the database response to match our interface
      return (data || []).map(event => ({
        ...event,
        ip_address: event.ip_address as string | null,
        user_agent: event.user_agent as string | null,
        device_fingerprint: event.device_fingerprint as string | null,
        failure_reason: event.failure_reason as string | null,
        session_id: event.session_id as string | null
      }));
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('auth-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auth_events'
        },
        (payload) => {
          console.log('Auth event real-time update:', payload);
          
          // Invalidate and refetch the auth events query
          queryClient.invalidateQueries({ queryKey: ['auth-events'] });
          
          // Show toast notification for critical events
          if (payload.eventType === 'INSERT' && payload.new) {
            const event = payload.new as AuthEvent;
            if (['account_locked', 'suspicious_activity', 'login_failure'].includes(event.event_type)) {
              toast({
                title: "Security Alert",
                description: `New security event: ${event.event_type.replace(/_/g, ' ')}`,
                variant: event.event_type === 'account_locked' ? 'destructive' : 'default',
                duration: 5000
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, toast, queryClient]);

  // Update local state when query data changes
  useEffect(() => {
    if (data) {
      setEvents(data);
    }
  }, [data]);

  return {
    events,
    isLoading,
    error,
    refetch
  };
};

// Hook for account security status
export const useSecurityStatus = () => {
  return useQuery({
    queryKey: ['security-status'],
    queryFn: async (): Promise<SecurityStatus | null> => {
      const { data, error } = await supabase
        .from('account_security_status')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching security status:', error);
        throw error;
      }

      // Return null if no record exists (this is expected for new users)
      if (!data) {
        return null;
      }

      // Type-cast the database response to match our interface
      return {
        ...data,
        last_failure_ip: data.last_failure_ip as string | null,
        last_login_ip: data.last_login_ip as string | null,
        last_failed_attempt: data.last_failed_attempt as string | null,
        account_locked_until: data.account_locked_until as string | null,
        last_login_at: data.last_login_at as string | null,
        last_login_user_agent: data.last_login_user_agent as string | null,
        two_factor_backup_codes: data.two_factor_backup_codes as string[] | null,
        known_devices: Array.isArray(data.known_devices) ? data.known_devices : [],
        trusted_locations: Array.isArray(data.trusted_locations) ? data.trusted_locations : []
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
};

// Hook for active sessions
export const useActiveSessions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async (): Promise<ActiveSession[]> => {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching active sessions:', error);
        throw error;
      }

      // Type-cast the database response to match our interface
      return (data || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string | null,
        user_agent: session.user_agent as string | null,
        device_fingerprint: session.device_fingerprint as string | null
      }));
    }
  });

  // Function to terminate a session
  const terminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      
      toast({
        title: "Session Terminated",
        description: "The session has been successfully terminated.",
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    sessions: data || [],
    isLoading,
    error,
    refetch,
    terminateSession
  };
};

// Hook for device fingerprints
export const useDeviceFingerprints = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['device-fingerprints'],
    queryFn: async (): Promise<DeviceFingerprint[]> => {
      const { data, error } = await supabase
        .from('device_fingerprints')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching device fingerprints:', error);
        throw error;
      }

      // Type-cast the database response to match our interface
      return (data || []).map(device => ({
        ...device,
        device_name: device.device_name as string | null,
        timezone_info: device.timezone_info as string | null
      }));
    }
  });

  // Function to update device trust status
  const updateDeviceTrust = async (deviceId: string, isTrusted: boolean) => {
    try {
      const { error } = await supabase
        .from('device_fingerprints')
        .update({ is_trusted: isTrusted })
        .eq('id', deviceId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['device-fingerprints'] });
      
      toast({
        title: "Device Updated",
        description: `Device ${isTrusted ? 'trusted' : 'untrusted'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating device trust:', error);
      toast({
        title: "Error",
        description: "Failed to update device trust status.",
        variant: "destructive"
      });
    }
  };

  // Function to update device name
  const updateDeviceName = async (deviceId: string, deviceName: string) => {
    try {
      const { error } = await supabase
        .from('device_fingerprints')
        .update({ device_name: deviceName })
        .eq('id', deviceId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['device-fingerprints'] });
      
      toast({
        title: "Device Updated",
        description: "Device name updated successfully.",
      });
    } catch (error) {
      console.error('Error updating device name:', error);
      toast({
        title: "Error",
        description: "Failed to update device name.",
        variant: "destructive"
      });
    }
  };

  return {
    devices: data || [],
    isLoading,
    error,
    refetch,
    updateDeviceTrust,
    updateDeviceName
  };
};

// Hook for security configuration
export const useSecurityConfig = () => {
  return useQuery({
    queryKey: ['security-config'],
    queryFn: async (): Promise<SecurityConfig[]> => {
      const { data, error } = await supabase
        .from('security_configuration')
        .select('*')
        .eq('is_active', true)
        .order('config_key');

      if (error) {
        console.error('Error fetching security config:', error);
        throw error;
      }

      // Type-cast the database response to match our interface
      return (data || []).map(config => ({
        ...config,
        description: config.description as string | null
      }));
    },
    staleTime: 300000 // 5 minutes - config doesn't change often
  });
};

// Hook for security metrics and analytics
export const useSecurityMetrics = (timeRange: '24h' | '7d' | '30d' = '7d') => {
  return useQuery({
    queryKey: ['security-metrics', timeRange],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Fetch auth events for the time range
      const { data: events, error } = await supabase
        .from('auth_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching security metrics:', error);
        throw error;
      }

      // Process the events into metrics
      const totalEvents = events?.length || 0;
      const eventsByType: Record<string, number> = {};
      const eventsByDay: Record<string, number> = {};
      const uniqueIPs = new Set<string>();
      let failedLogins = 0;
      let successfulLogins = 0;

      events?.forEach(event => {
        // Count by type
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;

        // Count by day
        const day = new Date(event.created_at).toISOString().split('T')[0];
        eventsByDay[day] = (eventsByDay[day] || 0) + 1;

        // Track unique IPs
        if (event.ip_address) {
          uniqueIPs.add(event.ip_address as string);
        }

        // Count login attempts
        if (event.event_type === 'login_failure') {
          failedLogins++;
        } else if (event.event_type === 'login_success') {
          successfulLogins++;
        }
      });

      const totalLoginAttempts = failedLogins + successfulLogins;
      const loginSuccessRate = totalLoginAttempts > 0 
        ? (successfulLogins / totalLoginAttempts) * 100 
        : 100;

      return {
        totalEvents,
        eventsByType,
        eventsByDay,
        uniqueIPs: uniqueIPs.size,
        failedLogins,
        successfulLogins,
        loginSuccessRate
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });
};

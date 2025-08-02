
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import SuspiciousActivityAlert from '@/components/auth/SuspiciousActivityAlert';

interface SecurityEvent {
  id: string;
  event_type: string;
  ip_address?: string;
  created_at: string;
  additional_metadata?: Record<string, unknown>;
}

interface RealTimeSecurityMonitorProps {
  userId?: string;
  showAlerts?: boolean;
}

const RealTimeSecurityMonitor: React.FC<RealTimeSecurityMonitorProps> = ({
  userId,
  showAlerts = true
}) => {
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [showSuspiciousAlert, setShowSuspiciousAlert] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSecurityEvent = useCallback((event: SecurityEvent) => {
    const { event_type, ip_address, additional_metadata } = event;
    
    switch (event_type) {
      case 'account_locked':
        if (showAlerts) {
          toast({
            title: "Account Security Alert",
            description: `Account locked due to suspicious activity from ${ip_address}`,
            variant: "destructive"
          });
        }
        setShowSuspiciousAlert(true);
        break;
        
      case 'login_failure':
        // Safe type checking for consecutive_failures
        const consecutiveFailures = additional_metadata?.consecutive_failures;
        const failureCount = typeof consecutiveFailures === 'number' ? consecutiveFailures : 0;
        
        if (showAlerts && failureCount > 3) {
          toast({
            title: "Multiple Login Failures",
            description: `Multiple failed login attempts detected from ${ip_address}`,
            variant: "destructive"
          });
        }
        break;
        
      case 'suspicious_activity':
        if (showAlerts) {
          toast({
            title: "Suspicious Activity Detected",
            description: `Unusual activity detected from ${ip_address}`,
            variant: "destructive"
          });
        }
        setShowSuspiciousAlert(true);
        break;
        
      case 'session_created':
        // Silent for normal operations
        break;
        
      case 'two_factor_required':
        if (showAlerts) {
          toast({
            title: "Two-Factor Authentication Required",
            description: "Please complete two-factor authentication to continue",
            variant: "destructive"
          });
        }
        break;
        
      default:
        console.log('Unhandled security event:', event_type);
    }
  }, [showAlerts, toast]);

  useEffect(() => {
    if (!userId) return;

    // Set up real-time subscription for security events
    const channel = supabase
      .channel('security-events-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auth_events',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          console.log('New security event received:', newEvent);
          
          // Update local state
          setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
          
          // Invalidate security-related queries
          queryClient.invalidateQueries({ queryKey: ['auth-events'] });
          queryClient.invalidateQueries({ queryKey: ['security-status'] });
          queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
          
          // Handle different event types
          handleSecurityEvent(newEvent);
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, handleSecurityEvent]);


  return (
    <>
      {/* Suspicious Activity Alert */}
      {showSuspiciousAlert && (
        <SuspiciousActivityAlert 
          onDismiss={() => setShowSuspiciousAlert(false)}
          autoCheck={false}
        />
      )}
      
      {/* Optional: Debug view for recent events */}
      {process.env.NODE_ENV === 'development' && recentEvents.length > 0 && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white border rounded-lg shadow-lg p-3 z-50">
          <div className="text-sm font-medium mb-2">Recent Security Events:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {recentEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="text-xs text-gray-600">
                <span className="font-medium">{event.event_type}</span>
                {event.ip_address && (
                  <span className="ml-2">from {event.ip_address}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RealTimeSecurityMonitor;

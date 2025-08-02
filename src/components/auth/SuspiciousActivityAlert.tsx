import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, MapPin, Smartphone, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SuspiciousActivity {
  id: string;
  event_type: string;
  ip_address?: string | null;
  user_agent?: string | null;
  geolocation_data?: {
    country?: string;
    city?: string;
    region?: string;
  };
  created_at: string;
  additional_metadata?: {
    risk_score?: number;
    device_fingerprint?: string;
    failure_reason?: string;
  };
}

interface SuspiciousActivityAlertProps {
  onDismiss?: () => void;
  autoCheck?: boolean;
  checkInterval?: number;
}

const SuspiciousActivityAlert: React.FC<SuspiciousActivityAlertProps> = ({
  onDismiss,
  autoCheck = true,
  checkInterval = 30000 // 30 seconds
}) => {
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivity | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch suspicious activities
  const fetchSuspiciousActivities = useCallback(async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('auth_events')
        .select('*')
        .in('event_type', ['suspicious_activity', 'account_locked', 'login_failure'])
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching suspicious activities:', error);
        return;
      }

      // Transform database response to match our interface
      const transformedActivities: SuspiciousActivity[] = (data || [])
        .filter(activity => !dismissedAlerts.has(activity.id))
        .map(activity => ({
          id: activity.id,
          event_type: activity.event_type,
          ip_address: activity.ip_address as string | null,
          user_agent: activity.user_agent as string | null,
          geolocation_data: activity.geolocation_data as {
            country?: string;
            city?: string;
            region?: string;
          },
          created_at: activity.created_at,
          additional_metadata: activity.additional_metadata as {
            risk_score?: number;
            device_fingerprint?: string;
            failure_reason?: string;
          }
        }));

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching suspicious activities:', error);
    }
  }, [dismissedAlerts]);

  // Auto-check for new activities
  useEffect(() => {
    if (autoCheck) {
      fetchSuspiciousActivities();
      const interval = setInterval(fetchSuspiciousActivities, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval, dismissedAlerts, fetchSuspiciousActivities]);

  const handleDismiss = (activityId: string) => {
    setDismissedAlerts(prev => new Set([...prev, activityId]));
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
    
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleViewDetails = (activity: SuspiciousActivity) => {
    setSelectedActivity(activity);
    setShowDetails(true);
  };

  const handleSecureAccount = async () => {
    try {
      // Log security review action
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.functions.invoke('log-auth-event', {
          body: {
            event_type: 'security_review_initiated',
            additional_metadata: {
              timestamp: new Date().toISOString(),
              triggered_by_alert: true
            }
          }
        });
      }

      toast({
        title: "Security Review Initiated",
        description: "Your account security is being reviewed. You may be prompted for additional verification.",
        duration: 5000
      });

      // Could redirect to security settings or force re-authentication
      
    } catch (error) {
      console.error('Failed to initiate security review:', error);
      toast({
        title: "Error",
        description: "Failed to initiate security review. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatEventType = (eventType: string): string => {
    const eventMap: { [key: string]: string } = {
      'suspicious_activity': 'Suspicious Activity',
      'account_locked': 'Account Locked',
      'login_failure': 'Login Failure',
      'concurrent_session_limit': 'Too Many Sessions',
      'device_registered': 'New Device'
    };
    return eventMap[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventSeverity = (activity: SuspiciousActivity): 'low' | 'medium' | 'high' | 'critical' => {
    if (activity.event_type === 'account_locked') return 'critical';
    
    const riskScore = activity.additional_metadata?.risk_score || 0;
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string): string => {
    const colorMap: { [key: string]: string } = {
      'low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'medium': 'bg-orange-100 text-orange-800 border-orange-200',
      'high': 'bg-red-100 text-red-800 border-red-200',
      'critical': 'bg-red-200 text-red-900 border-red-300'
    };
    return colorMap[severity] || colorMap['low'];
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return eventTime.toLocaleDateString();
  };

  if (activities.length === 0) {
    return null;
  }

  const highPriorityActivities = activities.filter(activity => 
    ['high', 'critical'].includes(getEventSeverity(activity))
  );

  return (
    <>
      {/* Main Alert */}
      {highPriorityActivities.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Security Alert - Suspicious Activity Detected
          </AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="mt-2 space-y-2">
              <p>
                We've detected {highPriorityActivities.length} suspicious security event(s) on your account.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {highPriorityActivities.slice(0, 3).map((activity) => {
                  const severity = getEventSeverity(activity);
                  return (
                    <Badge 
                      key={activity.id}
                      variant="outline"
                      className={getSeverityColor(severity)}
                    >
                      {formatEventType(activity.event_type)}
                    </Badge>
                  );
                })}
                {highPriorityActivities.length > 3 && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600">
                    +{highPriorityActivities.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={() => handleViewDetails(highPriorityActivities[0])}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleSecureAccount}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Secure Account
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDismiss(highPriorityActivities[0].id)}
                  className="text-red-600 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Activity Details Modal */}
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-500" />
              <AlertDialogTitle>
                Security Event Details
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Detailed information about the detected security event.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              {/* Event Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Event Type</label>
                  <p className="text-sm text-gray-900">{formatEventType(selectedActivity.event_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Severity</label>
                  <Badge className={getSeverityColor(getEventSeverity(selectedActivity))}>
                    {getEventSeverity(selectedActivity).toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Time</label>
                  <div className="flex items-center gap-1 text-sm text-gray-900">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(selectedActivity.created_at)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Risk Score</label>
                  <p className="text-sm text-gray-900">
                    {selectedActivity.additional_metadata?.risk_score || 'N/A'}/100
                  </p>
                </div>
              </div>

              {/* Technical Details */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                <div className="space-y-2 text-sm">
                  {selectedActivity.ip_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-mono text-gray-900">{selectedActivity.ip_address}</span>
                    </div>
                  )}
                  
                  {selectedActivity.user_agent && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">Device:</span>
                      <span className="text-gray-900 text-xs break-all">
                        {selectedActivity.user_agent.substring(0, 100)}...
                      </span>
                    </div>
                  )}

                  {selectedActivity.additional_metadata?.failure_reason && (
                    <div className="mt-2">
                      <span className="text-gray-600">Reason:</span>
                      <span className="text-gray-900 ml-2">
                        {selectedActivity.additional_metadata.failure_reason}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              {selectedActivity.geolocation_data && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Location Information</h4>
                  <div className="text-sm text-gray-900">
                    {selectedActivity.geolocation_data.city && selectedActivity.geolocation_data.country ? (
                      `${selectedActivity.geolocation_data.city}, ${selectedActivity.geolocation_data.country}`
                    ) : (
                      'Location information not available'
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDetails(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSecureAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Secure Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SuspiciousActivityAlert;

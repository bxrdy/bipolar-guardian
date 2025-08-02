import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Monitor, 
  Smartphone, 
  MapPin, 
  Clock, 
  LogOut, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Calendar,
  Activity
} from 'lucide-react';
import { useActiveSessions, type ActiveSession } from '@/hooks/useSecurityData';
import { useToast } from '@/hooks/use-toast';

interface ActiveSessionsManagerProps {
  refreshKey?: number;
}

const ActiveSessionsManager: React.FC<ActiveSessionsManagerProps> = ({ refreshKey }) => {
  const { sessions, isLoading, error, refetch, terminateSession } = useActiveSessions();
  const { toast } = useToast();
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  const handleTerminateSession = async (sessionId: string, isCurrentSession: boolean) => {
    if (isCurrentSession) {
      const confirmed = window.confirm(
        'This will terminate your current session and log you out. Are you sure?'
      );
      if (!confirmed) return;
    }

    setTerminatingSession(sessionId);
    
    try {
      await terminateSession(sessionId);
      
      toast({
        title: "Session Terminated",
        description: isCurrentSession ? 
          "You will be logged out shortly." : 
          "Remote session has been terminated successfully.",
        duration: 3000
      });

      if (isCurrentSession) {
        // Give a moment for the toast to show, then reload
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Failed to Terminate Session",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getSessionDuration = (createdAt: string, lastActivity: string) => {
    const created = new Date(createdAt);
    const lastActive = new Date(lastActivity);
    const duration = lastActive.getTime() - created.getTime();
    
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const sanitizeIP = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip.slice(0, -4) + '****';
  };

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor;
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Browser';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other Browser';
  };

  const getLocationInfo = (locationData: any) => {
    if (!locationData) return 'Unknown Location';
    
    if (typeof locationData === 'string') {
      return locationData;
    }
    
    if (locationData.city && locationData.country) {
      return `${locationData.city}, ${locationData.country}`;
    }
    
    if (locationData.country) {
      return locationData.country;
    }
    
    return 'Unknown Location';
  };

  const isCurrentSession = (session: ActiveSession) => {
    // In a real implementation, you'd compare with the current session token
    // For now, we'll use last activity as a heuristic
    const lastActivity = new Date(session.last_activity);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActivity.getTime()) / 60000);
    return diffInMinutes < 2; // Active within last 2 minutes
  };

  const isSessionExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffInMinutes = Math.floor((expiry.getTime() - now.getTime()) / 60000);
    return diffInMinutes <= 15; // Expires within 15 minutes
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load active sessions</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active login sessions across all devices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {sessions.length} Active
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Security Warning */}
          {sessions.length > 3 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                You have {sessions.length} active sessions. Consider terminating unused sessions for better security.
              </AlertDescription>
            </Alert>
          )}

          {/* Sessions List */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading active sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.user_agent);
                const isCurrent = isCurrentSession(session);
                const isExpiring = isSessionExpiringSoon(session.expires_at);
                const browserInfo = getBrowserInfo(session.user_agent);
                const locationInfo = getLocationInfo(session.location_data);
                
                return (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DeviceIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <Badge variant="default" className="bg-green-100 text-green-700">
                                <Wifi className="h-3 w-3 mr-1" />
                                Current Session
                              </Badge>
                            )}
                            {isExpiring && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                <Clock className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Monitor className="h-3 w-3 text-gray-500" />
                                <span className="font-medium">{browserInfo}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span>{locationInfo}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                <span>Last active: {formatTimestamp(session.last_activity)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Duration: {getSessionDuration(session.created_at, session.last_activity)}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>IP: {sanitizeIP(session.ip_address)}</div>
                              <div>Created: {new Date(session.created_at).toLocaleString()}</div>
                              <div>Expires: {new Date(session.expires_at).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id, isCurrent)}
                        disabled={terminatingSession === session.id}
                        className={isCurrent ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}
                      >
                        {terminatingSession === session.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            {isCurrent ? 'Log Out' : 'Terminate'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Session Management Info */}
          {sessions.length > 0 && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">Session Security Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Always log out from public or shared devices</li>
                  <li>• Terminate unused sessions regularly</li>
                  <li>• Monitor for unexpected login locations</li>
                  <li>• Report suspicious sessions immediately</li>
                </ul>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {sessions.length > 1 && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
                  <div className="text-xs text-gray-500">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {sessions.filter(s => isCurrentSession(s)).length}
                  </div>
                  <div className="text-xs text-gray-500">Active Now</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {sessions.filter(s => isSessionExpiringSoon(s.expires_at)).length}
                  </div>
                  <div className="text-xs text-gray-500">Expiring Soon</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {new Set(sessions.map(s => sanitizeIP(s.ip_address))).size}
                  </div>
                  <div className="text-xs text-gray-500">Unique IPs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSessionsManager;
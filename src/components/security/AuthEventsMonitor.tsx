import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Filter, 
  Download, 
  Search, 
  Calendar,
  MapPin,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuthEvents, type AuthEvent } from '@/hooks/useSecurityData';
import { useToast } from '@/hooks/use-toast';

interface AuthEventsMonitorProps {
  refreshKey?: number;
}

const AuthEventsMonitor: React.FC<AuthEventsMonitorProps> = ({ refreshKey }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  
  const { events, isLoading, error, refetch } = useAuthEvents(100);
  const { toast } = useToast();

  const eventTypeConfig = {
    'login_success': { icon: CheckCircle, color: 'green', label: 'Login Success' },
    'login_failure': { icon: XCircle, color: 'red', label: 'Login Failed' },
    'password_reset_request': { icon: Shield, color: 'blue', label: 'Password Reset' },
    'password_reset_success': { icon: CheckCircle, color: 'green', label: 'Password Reset Success' },
    'session_timeout': { icon: Clock, color: 'orange', label: 'Session Timeout' },
    'suspicious_activity': { icon: AlertTriangle, color: 'red', label: 'Suspicious Activity' },
    'account_locked': { icon: XCircle, color: 'red', label: 'Account Locked' },
    'account_unlocked': { icon: CheckCircle, color: 'green', label: 'Account Unlocked' },
    'session_created': { icon: CheckCircle, color: 'blue', label: 'Session Created' },
    'session_terminated': { icon: XCircle, color: 'orange', label: 'Session Terminated' },
    'two_factor_enabled': { icon: Shield, color: 'green', label: '2FA Enabled' },
    'two_factor_disabled': { icon: Shield, color: 'orange', label: '2FA Disabled' },
    'device_registered': { icon: Smartphone, color: 'blue', label: 'Device Registered' },
    'concurrent_session_limit': { icon: AlertTriangle, color: 'orange', label: 'Session Limit' }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ip_address?.includes(searchTerm) ||
        event.user_agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.failure_reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.event_type === eventTypeFilter);
    }

    // Filter by time range
    if (timeRangeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeRangeFilter) {
        case '1h':
          cutoff.setHours(now.getHours() - 1);
          break;
        case '24h':
          cutoff.setHours(now.getHours() - 24);
          break;
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(event => new Date(event.created_at) >= cutoff);
    }

    return filtered;
  }, [events, searchTerm, eventTypeFilter, timeRangeFilter]);

  const exportEvents = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'IP Address', 'User Agent', 'Failure Reason', 'Additional Info'].join(','),
      ...filteredEvents.map(event => [
        new Date(event.created_at).toLocaleString(),
        event.event_type,
        event.ip_address || '',
        event.user_agent || '',
        event.failure_reason || '',
        JSON.stringify(event.additional_metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-events-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Events Exported",
      description: `${filteredEvents.length} events exported successfully.`,
      duration: 3000
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const sanitizeIP = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip.slice(0, -4) + '****'; // For IPv6
  };

  const getBrowserFromUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown Browser';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load authentication events</p>
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
              <Activity className="h-5 w-5 text-blue-600" />
              Authentication Events
            </CardTitle>
            <CardDescription>
              Real-time monitoring of authentication and security events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={exportEvents} disabled={filteredEvents.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="login_success">Login Success</SelectItem>
                <SelectItem value="login_failure">Login Failed</SelectItem>
                <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                <SelectItem value="account_locked">Account Locked</SelectItem>
                <SelectItem value="session_timeout">Session Timeout</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No events found matching your filters</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const config = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig];
                const IconComponent = config?.icon || Activity;
                const isExpanded = expandedEvent === event.id;
                
                return (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          config?.color === 'green' ? 'bg-green-100 text-green-600' :
                          config?.color === 'red' ? 'bg-red-100 text-red-600' :
                          config?.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              config?.color === 'red' ? 'destructive' :
                              config?.color === 'orange' ? 'secondary' :
                              'default'
                            }>
                              {config?.label || event.event_type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(event.created_at)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              {event.ip_address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {sanitizeIP(event.ip_address)}
                                </div>
                              )}
                              {event.user_agent && (
                                <div className="flex items-center gap-1">
                                  <Smartphone className="h-3 w-3" />
                                  {getBrowserFromUserAgent(event.user_agent)}
                                </div>
                              )}
                            </div>
                            {event.failure_reason && (
                              <div className="text-red-600 text-xs">
                                Reason: {event.failure_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t bg-gray-50 -m-4 p-4 rounded-b-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Event Details</h4>
                            <div className="space-y-1">
                              <div><span className="font-medium">Event ID:</span> {event.id}</div>
                              <div><span className="font-medium">Timestamp:</span> {new Date(event.created_at).toLocaleString()}</div>
                              <div><span className="font-medium">Session ID:</span> {event.session_id || 'N/A'}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Technical Info</h4>
                            <div className="space-y-1">
                              <div><span className="font-medium">IP Address:</span> {event.ip_address || 'N/A'}</div>
                              <div><span className="font-medium">User Agent:</span> {event.user_agent ? event.user_agent.substring(0, 50) + '...' : 'N/A'}</div>
                              <div><span className="font-medium">Device Fingerprint:</span> {event.device_fingerprint ? event.device_fingerprint.substring(0, 16) + '...' : 'N/A'}</div>
                            </div>
                          </div>
                          
                          {(event.additional_metadata && Object.keys(event.additional_metadata).length > 0) && (
                            <div className="md:col-span-2">
                              <h4 className="font-medium mb-2">Additional Data</h4>
                              <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                                {JSON.stringify(event.additional_metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {filteredEvents.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthEventsMonitor;
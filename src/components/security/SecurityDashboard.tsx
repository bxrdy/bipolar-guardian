import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Activity, 
  Monitor, 
  Smartphone, 
  BarChart3, 
  Settings, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Info
} from 'lucide-react';
import { useSecurityStatus, useSecurityMetrics } from '@/hooks/useSecurityData';
import AuthEventsMonitor from './AuthEventsMonitor';
import AccountSecurityStatusCard from './AccountSecurityStatusCard';
import ActiveSessionsManager from './ActiveSessionsManager';
import DeviceSecurityOverview from './DeviceSecurityOverview';
import SecurityMetricsCharts from './SecurityMetricsCharts';
import SecurityConfigViewer from './SecurityConfigViewer';

interface SecurityDashboardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  isOpen,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const { data: securityStatus, isLoading: statusLoading, error: statusError } = useSecurityStatus();
  const { data: metrics, isLoading: metricsLoading } = useSecurityMetrics('7d');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onOpenChange]);

  // Handle click outside modal
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getSecurityHealthStatus = () => {
    if (statusLoading) {
      return { status: 'loading', color: 'gray', text: 'Loading...', icon: Clock };
    }
    
    if (statusError) {
      return { status: 'error', color: 'red', text: 'Error Loading', icon: AlertTriangle };
    }
    
    if (!securityStatus) {
      return { status: 'not-initialized', color: 'blue', text: 'Not Initialized', icon: Info };
    }
    
    const isLocked = securityStatus.account_locked_until && 
      new Date(securityStatus.account_locked_until) > new Date();
    const hasRecentFailures = securityStatus.failed_login_attempts > 0;
    const highSuspiciousActivity = securityStatus.suspicious_activity_score > 20;
    
    if (isLocked) {
      return { status: 'critical', color: 'red', text: 'Account Locked', icon: AlertTriangle };
    } else if (highSuspiciousActivity) {
      return { status: 'warning', color: 'yellow', text: 'Suspicious Activity', icon: AlertTriangle };
    } else if (hasRecentFailures) {
      return { status: 'caution', color: 'orange', text: 'Recent Failures', icon: AlertTriangle };
    } else {
      return { status: 'good', color: 'green', text: 'Secure', icon: CheckCircle };
    }
  };

  const healthStatus = getSecurityHealthStatus();
  const IconComponent = healthStatus.icon;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Security Audit Dashboard</h2>
              <p className="text-sm text-gray-600">Monitor your account security and authentication events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium" 
                 style={{ backgroundColor: `${healthStatus.color === 'green' ? '#dcfce7' : 
                                            healthStatus.color === 'yellow' ? '#fef3c7' : 
                                            healthStatus.color === 'orange' ? '#fed7aa' : 
                                            healthStatus.color === 'blue' ? '#dbeafe' :
                                            healthStatus.color === 'gray' ? '#f3f4f6' : '#fecaca'}`,
                          color: `${healthStatus.color === 'green' ? '#166534' : 
                                   healthStatus.color === 'yellow' ? '#92400e' : 
                                   healthStatus.color === 'orange' ? '#9a3412' : 
                                   healthStatus.color === 'blue' ? '#1e40af' :
                                   healthStatus.color === 'gray' ? '#374151' : '#991b1b'}` }}>
              <IconComponent className="h-4 w-4" />
              {healthStatus.text}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 max-h-[60vh] overflow-y-auto">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AccountSecurityStatusCard refreshKey={refreshKey} />
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {metricsLoading ? (
                        <div className="text-center py-4 text-gray-500">Loading metrics...</div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Events (7 days)</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {metrics?.totalEvents || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Login Success Rate</span>
                            <span className="text-lg font-semibold text-green-600">
                              {metrics?.loginSuccessRate?.toFixed(1) || '100'}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Unique IP Addresses</span>
                            <span className="text-lg font-semibold">
                              {metrics?.uniqueIPs || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Failed Login Attempts</span>
                            <span className={`text-lg font-semibold ${
                              (metrics?.failedLogins || 0) > 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {metrics?.failedLogins || 0}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>
                      Common security management tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('events')}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Activity className="h-5 w-5" />
                        <span className="text-sm">View Events</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('sessions')}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Monitor className="h-5 w-5" />
                        <span className="text-sm">Manage Sessions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('devices')}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Smartphone className="h-5 w-5" />
                        <span className="text-sm">Trusted Devices</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('analytics')}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span className="text-sm">View Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events">
                <AuthEventsMonitor refreshKey={refreshKey} />
              </TabsContent>

              <TabsContent value="sessions">
                <ActiveSessionsManager refreshKey={refreshKey} />
              </TabsContent>

              <TabsContent value="devices">
                <DeviceSecurityOverview refreshKey={refreshKey} />
              </TabsContent>

              <TabsContent value="analytics">
                <SecurityMetricsCharts refreshKey={refreshKey} />
              </TabsContent>

              <TabsContent value="config">
                <SecurityConfigViewer refreshKey={refreshKey} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;

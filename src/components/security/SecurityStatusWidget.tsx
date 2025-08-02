
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock, Eye, Info } from 'lucide-react';
import { useSecurityStatus } from '@/hooks/useSecurityData';

interface SecurityStatusWidgetProps {
  onOpenDashboard?: () => void;
  compact?: boolean;
}

const SecurityStatusWidget: React.FC<SecurityStatusWidgetProps> = ({
  onOpenDashboard,
  compact = false
}) => {
  const { data: securityStatus, isLoading, error } = useSecurityStatus();

  const getSecurityHealthStatus = () => {
    if (isLoading) {
      return { status: 'loading', color: 'gray', text: 'Loading...', icon: Clock };
    }
    
    if (error) {
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

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline"
          className={`flex items-center gap-1 ${
            healthStatus.color === 'green' ? 'border-green-200 bg-green-50 text-green-700' :
            healthStatus.color === 'yellow' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
            healthStatus.color === 'orange' ? 'border-orange-200 bg-orange-50 text-orange-700' :
            healthStatus.color === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-700' :
            'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <IconComponent className="h-3 w-3" />
          {healthStatus.text}
        </Badge>
        {onOpenDashboard && (
          <Button variant="ghost" size="sm" onClick={onOpenDashboard}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-blue-600" />
          Security Status
        </CardTitle>
        <CardDescription>Current account security health</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${
              healthStatus.color === 'green' ? 'text-green-600' :
              healthStatus.color === 'yellow' ? 'text-yellow-600' :
              healthStatus.color === 'orange' ? 'text-orange-600' :
              healthStatus.color === 'blue' ? 'text-blue-600' :
              'text-red-600'
            }`} />
            <span className="font-medium">{healthStatus.text}</span>
          </div>
          <Badge 
            variant="outline"
            className={`${
              healthStatus.color === 'green' ? 'border-green-200 bg-green-50 text-green-700' :
              healthStatus.color === 'yellow' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
              healthStatus.color === 'orange' ? 'border-orange-200 bg-orange-50 text-orange-700' :
              healthStatus.color === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-700' :
              'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {healthStatus.status.toUpperCase()}
          </Badge>
        </div>

        {!isLoading && !error && securityStatus && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Failed Attempts:</span>
              <span className={`ml-2 font-medium ${
                securityStatus.failed_login_attempts > 0 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {securityStatus.failed_login_attempts}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Risk Score:</span>
              <span className={`ml-2 font-medium ${
                securityStatus.suspicious_activity_score > 20 ? 'text-red-600' :
                securityStatus.suspicious_activity_score > 10 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {securityStatus.suspicious_activity_score}
              </span>
            </div>
          </div>
        )}

        {!isLoading && !error && !securityStatus && (
          <div className="text-sm text-gray-600 text-center py-4">
            Security monitoring will be enabled after your first login activity.
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 text-center py-4">
            Unable to load security status. Please try again later.
          </div>
        )}

        {onOpenDashboard && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onOpenDashboard}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Security Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityStatusWidget;

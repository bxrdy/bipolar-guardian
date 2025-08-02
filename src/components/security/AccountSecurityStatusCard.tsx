
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Smartphone, 
  MapPin,
  RefreshCw,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { useSecurityStatus } from '@/hooks/useSecurityData';
import { useToast } from '@/hooks/use-toast';

interface AccountSecurityStatusCardProps {
  refreshKey?: number;
}

const AccountSecurityStatusCard: React.FC<AccountSecurityStatusCardProps> = ({ refreshKey }) => {
  const { data: securityStatus, isLoading, error, refetch } = useSecurityStatus();
  const { toast } = useToast();
  const [lockoutCountdown, setLockoutCountdown] = useState<string>('');

  // Update lockout countdown
  useEffect(() => {
    if (!securityStatus?.account_locked_until) {
      setLockoutCountdown('');
      return;
    }

    const updateCountdown = () => {
      const lockoutTime = new Date(securityStatus.account_locked_until!);
      const now = new Date();
      const timeRemaining = lockoutTime.getTime() - now.getTime();

      if (timeRemaining <= 0) {
        setLockoutCountdown('');
        refetch(); // Refresh to get updated status
        return;
      }

      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      setLockoutCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [securityStatus?.account_locked_until, refetch]);

  const isAccountLocked = securityStatus?.account_locked_until && 
    new Date(securityStatus.account_locked_until) > new Date();

  const getSecurityScore = () => {
    if (!securityStatus) return { score: 100, level: 'Not Initialized', color: 'blue' };

    let score = 100;
    
    // Deduct points for security issues
    if (securityStatus.failed_login_attempts > 0) {
      score -= securityStatus.failed_login_attempts * 5;
    }
    
    if (securityStatus.suspicious_activity_score > 0) {
      score -= securityStatus.suspicious_activity_score * 2;
    }
    
    if (isAccountLocked) {
      score -= 30;
    }
    
    // Add points for security features
    if (securityStatus.two_factor_enabled) {
      score += 10;
    }
    
    if (securityStatus.known_devices.length > 0) {
      score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    let level: string;
    let color: string;
    
    if (score >= 90) {
      level = 'Excellent';
      color = 'green';
    } else if (score >= 75) {
      level = 'Good';
      color = 'blue';
    } else if (score >= 50) {
      level = 'Fair';
      color = 'orange';
    } else {
      level = 'Poor';
      color = 'red';
    }

    return { score, level, color };
  };

  const securityScore = getSecurityScore();

  const formatLastLogin = () => {
    if (!securityStatus?.last_login_at) return 'Never';
    
    const date = new Date(securityStatus.last_login_at);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const sanitizeIP = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
    return ip.slice(0, -4) + '****';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load security status</p>
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Account Security Status
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Current security health and protection status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading security status...</div>
        ) : !securityStatus ? (
          <div className="text-center py-4">
            <Info className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600 mb-2">Security monitoring not yet initialized</p>
            <p className="text-sm text-gray-500">
              Security status will be created after your first authentication activity.
            </p>
          </div>
        ) : (
          <>
            {/* Security Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <Badge variant={securityScore.color === 'green' ? 'default' : 
                               securityScore.color === 'red' ? 'destructive' : 'secondary'}>
                  {securityScore.score}/100 - {securityScore.level}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    securityScore.color === 'green' ? 'bg-green-500' :
                    securityScore.color === 'red' ? 'bg-red-500' :
                    securityScore.color === 'orange' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${securityScore.score}%` }}
                />
              </div>
            </div>

            {/* Account Lock Status */}
            {isAccountLocked && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">Account Locked</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Your account is temporarily locked due to multiple failed login attempts.
                </p>
                {lockoutCountdown && (
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-mono text-red-600">
                      Unlocks in: {lockoutCountdown}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Security Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Failed Login Attempts */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Failed Logins</span>
                  {securityStatus.failed_login_attempts > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {securityStatus.failed_login_attempts}
                </div>
                <div className="text-xs text-gray-500">
                  {securityStatus.last_failed_attempt ? 
                    `Last: ${new Date(securityStatus.last_failed_attempt).toLocaleDateString()}` :
                    'No recent failures'
                  }
                </div>
              </div>

              {/* Suspicious Activity Score */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Risk Score</span>
                  {securityStatus.suspicious_activity_score > 20 ? (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {securityStatus.suspicious_activity_score}
                </div>
                <div className="text-xs text-gray-500">
                  {securityStatus.suspicious_activity_score > 20 ? 'Elevated' : 'Normal'}
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Two-Factor Auth</span>
                  {securityStatus.two_factor_enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {securityStatus.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className="text-xs text-gray-500">
                  {securityStatus.two_factor_enabled ? 'Protected' : 'Vulnerable'}
                </div>
              </div>

              {/* Known Devices */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Known Devices</span>
                  <Smartphone className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {securityStatus.known_devices.length}
                </div>
                <div className="text-xs text-gray-500">
                  Registered devices
                </div>
              </div>
            </div>

            {/* Last Login Information */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Last Login</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatLastLogin()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-mono text-sm">
                    {sanitizeIP(securityStatus.last_login_ip)}
                  </span>
                </div>
                {securityStatus.last_login_user_agent && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Device:</span>
                    <span className="text-sm">
                      {securityStatus.last_login_user_agent.includes('Chrome') ? 'Chrome' :
                       securityStatus.last_login_user_agent.includes('Firefox') ? 'Firefox' :
                       securityStatus.last_login_user_agent.includes('Safari') ? 'Safari' : 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Recommendations */}
            {(securityScore.score < 90) && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Security Recommendations</h4>
                <div className="space-y-1 text-sm">
                  {!securityStatus.two_factor_enabled && (
                    <div className="text-orange-600">• Enable two-factor authentication</div>
                  )}
                  {securityStatus.failed_login_attempts > 0 && (
                    <div className="text-red-600">• Check for unauthorized access attempts</div>
                  )}
                  {securityStatus.suspicious_activity_score > 20 && (
                    <div className="text-orange-600">• Review recent authentication events</div>
                  )}
                  {securityStatus.known_devices.length === 0 && (
                    <div className="text-blue-600">• Register your trusted devices</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSecurityStatusCard;

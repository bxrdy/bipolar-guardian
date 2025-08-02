
import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, MapPin, Activity } from 'lucide-react';
import type { SecurityInsight } from '../types';

export const useSecurityInsights = (metrics: any) => {
  return useMemo(() => {
    if (!metrics) return null;

    const insights: SecurityInsight[] = [];
    
    // Login success rate analysis
    if (Number(metrics.loginSuccessRate) < 80) {
      insights.push({
        type: 'warning',
        title: 'Low Login Success Rate',
        description: `${Number(metrics.loginSuccessRate).toFixed(1)}% success rate suggests potential issues`,
        icon: AlertTriangle,
        color: 'orange'
      });
    } else if (Number(metrics.loginSuccessRate) >= 95) {
      insights.push({
        type: 'positive',
        title: 'Excellent Login Success Rate',
        description: `${Number(metrics.loginSuccessRate).toFixed(1)}% success rate indicates good security`,
        icon: CheckCircle,
        color: 'green'
      });
    }

    // Failed login analysis
    if (Number(metrics.failedLogins) > 5) {
      insights.push({
        type: 'critical',
        title: 'High Failed Login Attempts',
        description: `${Number(metrics.failedLogins)} failed attempts detected`,
        icon: AlertTriangle,
        color: 'red'
      });
    }

    // Multiple IP analysis
    if (Number(metrics.uniqueIPs) > 3) {
      insights.push({
        type: 'info',
        title: 'Multiple Login Locations',
        description: `Logins from ${Number(metrics.uniqueIPs)} different IP addresses`,
        icon: MapPin,
        color: 'blue'
      });
    }

    // Activity level analysis
    if (Number(metrics.totalEvents) > 50) {
      insights.push({
        type: 'info',
        title: 'High Account Activity',
        description: `${Number(metrics.totalEvents)} security events recorded`,
        icon: Activity,
        color: 'blue'
      });
    }

    return insights;
  }, [metrics]);
};

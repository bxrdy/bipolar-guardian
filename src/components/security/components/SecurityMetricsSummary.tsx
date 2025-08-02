
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, MapPin, AlertTriangle } from 'lucide-react';
import { SecurityMetrics } from '../types';

interface SecurityMetricsSummaryProps {
  metrics: SecurityMetrics;
  timeRange: '24h' | '7d' | '30d';
}

const SecurityMetricsSummary: React.FC<SecurityMetricsSummaryProps> = ({ metrics, timeRange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Events</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{Number(metrics.totalEvents)}</div>
          <div className="text-xs text-gray-500">
            Last {timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Number(metrics.loginSuccessRate).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Login attempts</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Unique IPs</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{Number(metrics.uniqueIPs)}</div>
          <div className="text-xs text-gray-500">Login locations</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Failed Logins</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{Number(metrics.failedLogins)}</div>
          <div className="text-xs text-gray-500">Security incidents</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMetricsSummary;

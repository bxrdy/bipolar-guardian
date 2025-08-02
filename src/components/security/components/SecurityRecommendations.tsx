
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPin, CheckCircle } from 'lucide-react';
import { SecurityMetrics } from '../types';

interface SecurityRecommendationsProps {
  metrics: SecurityMetrics;
}

const SecurityRecommendations: React.FC<SecurityRecommendationsProps> = ({ metrics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Security Recommendations</CardTitle>
        <CardDescription>
          Actionable steps to improve your account security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Number(metrics.failedLogins) > 0 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Review Failed Login Attempts</h4>
                <p className="text-sm text-red-700">
                  You have {Number(metrics.failedLogins)} failed login attempts. Review your authentication events for suspicious activity.
                </p>
              </div>
            </div>
          )}
          
          {Number(metrics.uniqueIPs) > 3 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900">Multiple Login Locations</h4>
                <p className="text-sm text-orange-700">
                  Logins detected from {Number(metrics.uniqueIPs)} different locations. Ensure all access is authorized.
                </p>
              </div>
            </div>
          )}
          
          {Number(metrics.loginSuccessRate) >= 95 && Number(metrics.failedLogins) === 0 && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Excellent Security Posture</h4>
                <p className="text-sm text-green-700">
                  Your account shows strong security metrics with high login success rate and no recent failures.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityRecommendations;

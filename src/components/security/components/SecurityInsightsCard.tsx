
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from 'lucide-react';
import type { SecurityInsight } from '../types';

interface SecurityInsightsCardProps {
  insights: SecurityInsight[];
}

const SecurityInsightsCard: React.FC<SecurityInsightsCardProps> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Security Insights
        </CardTitle>
        <CardDescription>
          Automated analysis of your security patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <div className={`p-2 rounded-full ${
                  insight.color === 'green' ? 'bg-green-100 text-green-600' :
                  insight.color === 'red' ? 'bg-red-100 text-red-600' :
                  insight.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
                <Badge variant={
                  insight.type === 'critical' ? 'destructive' :
                  insight.type === 'warning' ? 'secondary' :
                  insight.type === 'positive' ? 'default' : 'outline'
                }>
                  {insight.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityInsightsCard;

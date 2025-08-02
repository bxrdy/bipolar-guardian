
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Calendar, RefreshCw } from 'lucide-react';

interface SecurityMetricsHeaderProps {
  timeRange: '24h' | '7d' | '30d';
  setTimeRange: (value: '24h' | '7d' | '30d') => void;
  isLoading: boolean;
  refetch: () => void;
}

const SecurityMetricsHeader: React.FC<SecurityMetricsHeaderProps> = ({
  timeRange,
  setTimeRange,
  isLoading,
  refetch
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Security Analytics
            </CardTitle>
            <CardDescription>
              Visual insights into your account security metrics and trends
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d') => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SecurityMetricsHeader;

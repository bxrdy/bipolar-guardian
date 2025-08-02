
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DataStats {
  totalRecords: number;
  dateRange: { start: string; end: string } | null;
  metricTypes: string[];
  lastBaselineCalculation: string | null;
  recentDailySummaries: number;
}

const DataOverviewSection = () => {
  const { data: dataStats, isLoading, refetch } = useQuery({
    queryKey: ['data-overview'],
    queryFn: async (): Promise<DataStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get sensor data stats
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_samples')
        .select('metric_type, timestamp')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (sensorError) throw sensorError;

      // Get baseline data
      const { data: baselineData } = await supabase
        .from('baseline_metrics')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get daily summaries count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: dailySummaries } = await supabase
        .from('daily_summary')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      const totalRecords = sensorData?.length || 0;
      const metricTypes = [...new Set(sensorData?.map(d => d.metric_type).filter(Boolean) || [])];
      
      let dateRange = null;
      if (sensorData && sensorData.length > 0) {
        const timestamps = sensorData.map(d => d.timestamp).filter(Boolean).sort();
        if (timestamps.length > 0) {
          dateRange = {
            start: timestamps[0],
            end: timestamps[timestamps.length - 1]
          };
        }
      }

      return {
        totalRecords,
        dateRange,
        metricTypes,
        lastBaselineCalculation: baselineData?.[0]?.created_at || null,
        recentDailySummaries: dailySummaries?.length || 0
      };
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysSpan = () => {
    if (!dataStats?.dateRange) return 0;
    const start = new Date(dataStats.dateRange.start);
    const end = new Date(dataStats.dateRange.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Overview
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading data overview...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Total Records</span>
              </div>
              <div className="text-2xl font-bold">{dataStats?.totalRecords || 0}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Date Range</span>
              </div>
              <div className="text-sm">
                {dataStats?.dateRange ? (
                  <>
                    <div>{formatDate(dataStats.dateRange.start)} - {formatDate(dataStats.dateRange.end)}</div>
                    <Badge variant="outline" className="mt-1">
                      {getDaysSpan()} days
                    </Badge>
                  </>
                ) : (
                  <span className="text-gray-500">No data</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Metric Types</span>
              <div className="flex flex-wrap gap-1">
                {dataStats?.metricTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {(!dataStats?.metricTypes || dataStats.metricTypes.length === 0) && (
                  <span className="text-gray-500 text-sm">None</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Pipeline Status</span>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Baseline:</span>
                  <Badge variant={dataStats?.lastBaselineCalculation ? "default" : "outline"}>
                    {dataStats?.lastBaselineCalculation ? "Ready" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Daily Summaries (7d):</span>
                  <Badge variant="secondary">
                    {dataStats?.recentDailySummaries || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataOverviewSection;

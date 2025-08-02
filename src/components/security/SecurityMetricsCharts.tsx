
import React, { useState, useMemo } from 'react';
import { useSecurityMetrics } from '@/hooks/useSecurityData';
import { useSecurityInsights } from './hooks/useSecurityInsights';
import { useDailyEventsChart, useEventTypesChart } from './hooks/useChartData';
import SecurityMetricsHeader from './components/SecurityMetricsHeader';
import SecurityMetricsSummary from './components/SecurityMetricsSummary';
import SecurityInsightsCard from './components/SecurityInsightsCard';
import DailyActivityChart from './components/DailyActivityChart';
import EventTypesChart from './components/EventTypesChart';
import SecurityRecommendations from './components/SecurityRecommendations';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import type { SecurityMetricsChartsProps, SecurityMetrics } from './types';

const SecurityMetricsCharts: React.FC<SecurityMetricsChartsProps> = ({ refreshKey }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const { data: rawMetrics, isLoading, error, refetch } = useSecurityMetrics(timeRange);

  // Transform raw metrics to full SecurityMetrics interface
  const metrics: SecurityMetrics | undefined = useMemo(() => {
    if (!rawMetrics) return undefined;
    
    return {
      ...rawMetrics,
      securityScore: 85, // Default security score
      threatCount: rawMetrics.failedLogins || 0,
      suspiciousActivity: Math.floor((rawMetrics.failedLogins || 0) / 2),
      deviceCount: 1, // Default device count
      lastActivity: new Date().toISOString(),
      twoFactorEnabled: false
    };
  }, [rawMetrics]);

  // Memoize computed values to prevent unnecessary recalculations
  const securityInsights = useMemo(() => useSecurityInsights(metrics), [metrics]);
  const dailyEventsChart = useMemo(() => useDailyEventsChart(metrics), [metrics]);
  const eventTypesChart = useMemo(() => useEventTypesChart(metrics), [metrics]);

  if (error) {
    return <ErrorState refetch={refetch} />;
  }

  return (
    <div className="space-y-6">
      <SecurityMetricsHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isLoading={isLoading}
        refetch={refetch}
      />

      {isLoading || !metrics ? (
        <LoadingState isLoading={isLoading} />
      ) : (
        <>
          <SecurityMetricsSummary metrics={metrics} timeRange={timeRange} />
          
          {securityInsights && (
            <SecurityInsightsCard insights={securityInsights} />
          )}

          <DailyActivityChart data={dailyEventsChart} />
          
          <EventTypesChart data={eventTypesChart} />
          
          <SecurityRecommendations metrics={metrics} />
        </>
      )}
    </div>
  );
};

export default SecurityMetricsCharts;

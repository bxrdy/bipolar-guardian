
import React, { useMemo } from 'react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import WeeklySummaryCards from './WeeklySummaryCards';
import SevenDayTrendChart from './SevenDayTrendChart';
import { LoadingSkeleton } from './ui/loading-skeleton';
import { FadeTransition } from './ui/fade-transition';

const RecentActivity = () => {
  const { data, isLoading, error } = useRecentActivity();

  // Memoize computed values to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="activity" />
      </div>
    );
  }

  if (error) {
    return (
      <FadeTransition isVisible={true}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center transition-all duration-300 hover:shadow-md">
            <p className="text-red-600">Unable to load recent activity data</p>
            <p className="text-sm text-red-500 mt-1">Please try again later</p>
          </div>
        </div>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition isVisible={true}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        
        {/* Today's Stats + Weekly Summary Cards */}
        <FadeTransition isVisible={!!memoizedData} duration="fast">
          <WeeklySummaryCards 
            todayStats={memoizedData?.todayStats || null} 
            weeklyStats={memoizedData?.weeklyStats || null} 
          />
        </FadeTransition>
        
        {/* 7-Day Trend Chart */}
        <FadeTransition isVisible={!!memoizedData} duration="normal">
          <SevenDayTrendChart 
            chartData={memoizedData?.chartData || []} 
            hasData={memoizedData?.hasData || false} 
          />
        </FadeTransition>
      </div>
    </FadeTransition>
  );
};

export default React.memo(RecentActivity);

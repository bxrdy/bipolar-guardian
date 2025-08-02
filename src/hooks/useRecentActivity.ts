
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      try {
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          return {
            todayStats: null,
            weeklyStats: null,
            chartData: [],
            hasData: false
          };
        }

        // Get today's date in UTC to match database format
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Get last 7 days including today for chart (complete dataset)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // -6 to include today = 7 days total
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        // Get last 7 complete days (excluding today) for weekly stats calculation
        const weeklyStatsEndDate = new Date();
        weeklyStatsEndDate.setDate(weeklyStatsEndDate.getDate() - 1); // Yesterday
        const weeklyStatsStartDate = new Date();
        weeklyStatsStartDate.setDate(weeklyStatsStartDate.getDate() - 7); // 7 days ago
        
        const weeklyStatsEndStr = weeklyStatsEndDate.toISOString().split('T')[0];
        const weeklyStatsStartStr = weeklyStatsStartDate.toISOString().split('T')[0];

        // Fetch data in parallel for better performance
        const [chartWeeklyResult, weeklyStatsResult, todayResult, baselineResult] = await Promise.all([
          supabase
            .from('daily_summary')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', sevenDaysAgoStr)
            .lte('date', today)
            .order('date', { ascending: true }),
          
          supabase
            .from('daily_summary')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', weeklyStatsStartStr)
            .lte('date', weeklyStatsEndStr)
            .order('date', { ascending: true }),
          
          supabase
            .from('daily_summary')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle(),
          
          supabase
            .from('baseline_metrics')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        const chartWeeklyData = chartWeeklyResult.data || [];
        const weeklyStatsData = weeklyStatsResult.data || [];
        const todayData = todayResult.data;
        const baseline = baselineResult.data;

        // Process chart data (include all available data from last 7 days including today)
        const chartData = chartWeeklyData.map(day => ({
          date: day.date,
          formattedDate: new Date(day.date + 'T00:00:00.000Z').toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          }),
          steps: day.steps || 0,
          sleepHours: day.sleep_hours || 0,
          riskLevel: day.risk_level,
          riskColor: day.risk_level === 'red' ? '#ef4444' : 
                    day.risk_level === 'amber' ? '#f59e0b' : '#10b981'
        }));

        // Calculate today's stats
        let todayStats = null;
        if (todayData) {
          todayStats = {
            steps: todayData.steps || 0,
            sleepHours: todayData.sleep_hours || 0,
            riskLevel: todayData.risk_level,
            baseline: baseline ? {
              sleepMean: baseline.sleep_mean,
              stepsMean: baseline.steps_mean
            } : null
          };
        }

        // Calculate weekly stats (last 7 complete days only, excluding today)
        let weeklyStats = null;
        if (weeklyStatsData && weeklyStatsData.length > 0) {
          const validSteps = weeklyStatsData.filter(d => d.steps !== null).map(d => d.steps);
          const validSleep = weeklyStatsData.filter(d => d.sleep_hours !== null).map(d => d.sleep_hours);
          const riskCounts = {
            green: weeklyStatsData.filter(d => d.risk_level === 'green').length,
            amber: weeklyStatsData.filter(d => d.risk_level === 'amber').length,
            red: weeklyStatsData.filter(d => d.risk_level === 'red').length,
            null: weeklyStatsData.filter(d => d.risk_level === null).length
          };

          const avgSteps = validSteps.length > 0 ? validSteps.reduce((a, b) => a + b, 0) / validSteps.length : 0;
          const totalSteps = validSteps.reduce((a, b) => a + b, 0);
          const avgSleep = validSleep.length > 0 ? validSleep.reduce((a, b) => a + b, 0) / validSleep.length : 0;

          weeklyStats = {
            avgSleep: avgSleep,
            totalSteps: totalSteps,
            avgSteps: avgSteps,
            riskPattern: riskCounts,
            daysWithData: weeklyStatsData.length,
            baseline: baseline ? {
              sleepMean: baseline.sleep_mean,
              stepsMean: baseline.steps_mean
            } : null
          };
        }

        return {
          todayStats,
          weeklyStats,
          chartData,
          hasData: (chartData && chartData.length > 0) || (todayData !== null)
        };
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        throw error;
      }
    },
    refetchInterval: 30 * 60 * 1000, // Reduced from 5 minutes to 30 minutes
    staleTime: 10 * 60 * 1000, // Cache data for 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

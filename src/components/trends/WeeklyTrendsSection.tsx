
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyMetric {
  icon: React.ReactNode;
  name: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface WeeklyTrendsSectionProps {
  isOpen: boolean;
}

const WeeklyTrendsSection = ({ isOpen }: WeeklyTrendsSectionProps) => {
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    const threshold = 0.05; // 5% threshold for stable
    const change = (current - previous) / previous;
    
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const formatChange = (current: number, previous: number, unit: string = ''): string => {
    if (previous === 0) return 'No previous data';
    
    const percentChange = ((current - previous) / previous) * 100;
    const sign = percentChange >= 0 ? '+' : '';
    return `${sign}${Math.round(percentChange)}% from last week${unit ? ` ${unit}` : ''}`;
  };

  useEffect(() => {
    const fetchWeeklyMetrics = async () => {
      if (!isOpen) return;
      
      setIsLoadingMetrics(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get current week and previous week date ranges
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - 6); // Last 7 days
        
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(currentWeekStart.getDate() - 7);
        const previousWeekEnd = new Date(currentWeekStart);
        previousWeekEnd.setDate(currentWeekStart.getDate() - 1);

        // Fetch current week data
        const { data: currentWeekData } = await supabase
          .from('daily_summary')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', currentWeekStart.toISOString().split('T')[0])
          .lte('date', now.toISOString().split('T')[0]);

        // Fetch previous week data
        const { data: previousWeekData } = await supabase
          .from('daily_summary')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', previousWeekStart.toISOString().split('T')[0])
          .lte('date', previousWeekEnd.toISOString().split('T')[0]);

        // Fetch mood data for current week
        const { data: currentMoodData } = await supabase
          .from('mood_entries')
          .select('mood, anxiety, stress, energy')
          .eq('user_id', user.id)
          .gte('created_at', currentWeekStart.toISOString())
          .lte('created_at', now.toISOString());

        // Fetch mood data for previous week
        const { data: previousMoodData } = await supabase
          .from('mood_entries')
          .select('mood, anxiety, stress, energy')
          .eq('user_id', user.id)
          .gte('created_at', previousWeekStart.toISOString())
          .lte('created_at', previousWeekEnd.toISOString());

        const metrics: WeeklyMetric[] = [];

        // Primary metrics: Typing Score, Risk Level Frequency, Mood Patterns
        
        // Typing Score
        const currentTypingScores = currentWeekData?.filter(d => d.typing_score !== null).map(d => d.typing_score) || [];
        const previousTypingScores = previousWeekData?.filter(d => d.typing_score !== null).map(d => d.typing_score) || [];
        
        if (currentTypingScores.length > 0) {
          const currentAvg = currentTypingScores.reduce((a, b) => a + b, 0) / currentTypingScores.length;
          const previousAvg = previousTypingScores.length > 0 
            ? previousTypingScores.reduce((a, b) => a + b, 0) / previousTypingScores.length 
            : currentAvg;
          
          metrics.push({
            icon: <Activity className="w-5 h-5 text-blue-500" />,
            name: 'Typing Score',
            value: `${currentAvg.toFixed(1)} avg`,
            trend: calculateTrend(currentAvg, previousAvg),
            change: formatChange(currentAvg, previousAvg)
          });
        }

        // Risk Level Frequency
        const currentRiskLevels = currentWeekData?.filter(d => d.risk_level) || [];
        const riskCount = currentRiskLevels.length;
        const highRiskCount = currentRiskLevels.filter(d => d.risk_level === 'red' || d.risk_level === 'amber').length;
        
        metrics.push({
          icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
          name: 'Risk Alerts',
          value: `${highRiskCount}/${riskCount} days`,
          trend: highRiskCount > riskCount / 2 ? 'down' : 'up',
          change: riskCount > 0 ? `${Math.round((highRiskCount / riskCount) * 100)}% of tracked days` : 'No risk data'
        });

        // Mood Patterns
        if (currentMoodData && currentMoodData.length > 0) {
          const currentMoodAvg = currentMoodData.reduce((a, b) => a + b.mood, 0) / currentMoodData.length;
          const previousMoodAvg = previousMoodData && previousMoodData.length > 0
            ? previousMoodData.reduce((a, b) => a + b.mood, 0) / previousMoodData.length
            : currentMoodAvg;
          
          metrics.push({
            icon: <BookOpen className="w-5 h-5 text-pink-500" />,
            name: 'Mood Average',
            value: `${currentMoodAvg.toFixed(1)}/10`,
            trend: calculateTrend(currentMoodAvg, previousMoodAvg),
            change: formatChange(currentMoodAvg, previousMoodAvg)
          });
        }

        setWeeklyMetrics(metrics);
      } catch (error) {
        console.error('Error fetching weekly metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchWeeklyMetrics();
  }, [isOpen]);

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Weekly Overview</h3>
      
      {isLoadingMetrics ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {weeklyMetrics.length > 0 ? (
            weeklyMetrics.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {item.icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-800">{item.name}</span>
                    <span className="text-sm font-medium text-gray-700">{item.value}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(item.trend)}
                    <span className="text-xs text-gray-600">{item.change}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No data available for this week
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeeklyTrendsSection;

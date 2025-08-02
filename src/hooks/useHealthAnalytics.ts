
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodAnalytics } from '@/types/mood';

// Shared types
interface MetricDelta {
  type: 'sleep' | 'steps' | 'screen' | 'mood';
  direction: 'up' | 'down';
  value: string;
  unit: string;
}

interface BaselineData {
  sleep_mean: number | null;
  sleep_sd: number | null;
  steps_mean: number | null;
  steps_sd: number | null;
  unlocks_mean: number | null;
  unlocks_sd: number | null;
}

interface DailySummary {
  date: string;
  sleep_hours: number | null;
  steps: number | null;
  typing_score: number | null;
}

interface SharedAnalyticsState {
  recentEntries: MoodEntry[];
  dailySummary: DailySummary | null;
  baseline: BaselineData | null;
  isLoading: boolean;
  lastFetch: Date | null;
}

/**
 * Shared health analytics hook that provides common data and utilities
 * for mood analytics and risk analysis
 */
export const useHealthAnalytics = () => {
  const [state, setState] = useState<SharedAnalyticsState>({
    recentEntries: [],
    dailySummary: null,
    baseline: null,
    isLoading: false,
    lastFetch: null
  });

  const updateState = useCallback((updates: Partial<SharedAnalyticsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Shared data fetching logic with optimized caching
  const fetchSharedData = useCallback(async () => {
    // Skip if data was fetched recently (within 5 minutes)
    if (state.lastFetch && Date.now() - state.lastFetch.getTime() < 5 * 60 * 1000) {
      return;
    }

    updateState({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch data in parallel for better performance
      const [moodEntriesResult, dailySummaryResult, baselineResult] = await Promise.all([
        // Mood entries (last 30 days)
        supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50), // Limit results for better performance
        
        // Most recent daily summary
        supabase
          .from('daily_summary')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // User baseline metrics
        supabase
          .from('baseline_metrics')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      // Process mood entries efficiently
      const moodEntries = moodEntriesResult.data || [];
      const parsedEntries: MoodEntry[] = moodEntries.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        mood: entry.mood,
        moodLabel: getMoodLabel(entry.mood),
        energy: entry.energy,
        stress: entry.stress,
        anxiety: entry.anxiety,
        context: {
          activities: entry.activities || undefined,
          location: entry.location || undefined,
          socialSituation: entry.social_situation || undefined,
          notes: entry.notes || undefined,
        },
        timestamp: entry.created_at,
      }));

      updateState({
        recentEntries: parsedEntries,
        dailySummary: dailySummaryResult.data || null,
        baseline: baselineResult.data || null,
        lastFetch: new Date()
      });

    } catch (error) {
      console.error('Error fetching shared analytics data:', error);
    } finally {
      updateState({ isLoading: false });
    }
  }, [state.lastFetch, updateState]);

  // Helper function for mood labels
  const getMoodLabel = useCallback((mood: number): string => {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 6) return 'Neutral';
    if (mood <= 8) return 'Good';
    return 'Excellent';
  }, []);

  // Calculate metric deltas with memoization
  const calculateMetricDeltas = useCallback(async (riskLevel?: 'amber' | 'red'): Promise<{ deltas: MetricDelta[], explanation: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { deltas: [], explanation: 'No user found.' };

      // Use cached data if available and recent
      let currentSummary = state.dailySummary;
      let currentBaseline = state.baseline;
      let currentEntries = state.recentEntries;

      if (!currentSummary || !currentBaseline || currentEntries.length === 0) {
        await fetchSharedData();
        currentSummary = state.dailySummary;
        currentBaseline = state.baseline;
        currentEntries = state.recentEntries;
      }

      if (!currentSummary) {
        return { deltas: [], explanation: 'Insufficient data for analysis.' };
      }

      const deltas: MetricDelta[] = [];

      // Calculate baseline deltas if baseline exists
      if (currentBaseline) {
        // Sleep delta
        if (currentSummary.sleep_hours !== null && currentBaseline.sleep_mean !== null) {
          const sleepDiff = currentBaseline.sleep_mean - currentSummary.sleep_hours;
          const sleepZScore = currentBaseline.sleep_sd && currentBaseline.sleep_sd > 0 ? Math.abs(sleepDiff / currentBaseline.sleep_sd) : 0;
          
          if (sleepZScore > 1) {
            deltas.push({
              type: 'sleep',
              direction: sleepDiff > 0 ? 'down' : 'up',
              value: Math.abs(sleepDiff).toFixed(1),
              unit: sleepDiff > 0 ? 'hours below normal' : 'hours above normal'
            });
          }
        }

        // Steps delta
        if (currentSummary.steps !== null && currentBaseline.steps_mean !== null) {
          const stepsDiff = currentBaseline.steps_mean - currentSummary.steps;
          const stepsZScore = currentBaseline.steps_sd && currentBaseline.steps_sd > 0 ? Math.abs(stepsDiff / currentBaseline.steps_sd) : 0;
          
          if (stepsZScore > 1) {
            deltas.push({
              type: 'steps',
              direction: stepsDiff > 0 ? 'down' : 'up',
              value: Math.abs(stepsDiff).toLocaleString(),
              unit: stepsDiff > 0 ? 'steps below average' : 'steps above average'
            });
          }
        }
      }

      // Generate explanation
      const significantDeviations = deltas.length;
      const dataDate = new Date(currentSummary.date).toLocaleDateString();
      const isToday = currentSummary.date === new Date().toISOString().split('T')[0];
      const dateContext = isToday ? 'today' : `on ${dataDate}`;
      
      let explanation = '';
      if (riskLevel === 'red') {
        explanation = `Your metrics ${dateContext} show ${significantDeviations} significant departure${significantDeviations !== 1 ? 's' : ''} from your personal baseline patterns. `;
      } else if (riskLevel === 'amber') {
        explanation = `Your data ${dateContext} shows ${significantDeviations} moderate deviation${significantDeviations !== 1 ? 's' : ''} from your established patterns. `;
      } else {
        explanation = `Analysis shows ${significantDeviations} notable change${significantDeviations !== 1 ? 's' : ''} in your health metrics. `;
      }

      return { deltas, explanation };

    } catch (error) {
      console.error('Error calculating metric deltas:', error);
      return { deltas: [], explanation: 'Unable to calculate metric changes from your data.' };
    }
  }, [state.dailySummary, state.baseline, state.recentEntries, fetchSharedData]);

  // Initialize data on mount
  useEffect(() => {
    fetchSharedData();
  }, [fetchSharedData]);

  // Memoize return values to prevent unnecessary re-renders
  const memoizedReturn = useMemo(() => ({
    ...state,
    fetchSharedData,
    calculateMetricDeltas,
    getMoodLabel,
    hasRecentData: () => state.recentEntries.length > 0,
    hasBaseline: () => state.baseline !== null,
    getDataAge: () => state.lastFetch ? Date.now() - state.lastFetch.getTime() : null
  }), [state, fetchSharedData, calculateMetricDeltas, getMoodLabel]);

  return memoizedReturn;
};

/**
 * Mood analytics hook - uses shared data with mood-specific calculations
 */
export const useMoodAnalytics = () => {
  const {
    recentEntries,
    isLoading,
    fetchSharedData,
    getMoodLabel,
    hasRecentData
  } = useHealthAnalytics();

  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);

  // Calculate mood-specific analytics with memoization
  const memoizedAnalytics = useMemo(() => {
    if (recentEntries.length === 0) return null;

    const moods = recentEntries.map(e => e.mood);
    const energies = recentEntries.map(e => e.energy);
    const stresses = recentEntries.map(e => e.stress);
    
    const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    // Calculate trend (comparing first half vs second half of entries)
    const halfPoint = Math.floor(recentEntries.length / 2);
    const recentMoods = moods.slice(0, halfPoint);
    const olderMoods = moods.slice(halfPoint);
    
    const recentAvg = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length 
      : averageMood;
    const olderAvg = olderMoods.length > 0 
      ? olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length 
      : averageMood;
    
    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    const trendThreshold = 0.5;
    if (recentAvg - olderAvg > trendThreshold) {
      moodTrend = 'improving';
    } else if (olderAvg - recentAvg > trendThreshold) {
      moodTrend = 'declining';
    }

    // Extract common activities
    const allActivities = recentEntries
      .flatMap(entry => entry.context?.activities || [])
      .filter(activity => activity);
    
    const activityCounts = allActivities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonActivities = Object.entries(activityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    return {
      averageMood,
      moodTrend,
      energyPattern: energies,
      stressPattern: stresses,
      commonActivities,
    };
  }, [recentEntries]);

  useEffect(() => {
    setAnalytics(memoizedAnalytics);
  }, [memoizedAnalytics]);

  return {
    analytics,
    recentEntries,
    isLoading,
    refetch: fetchSharedData,
    hasData: hasRecentData(),
    getMoodLabel
  };
};

/**
 * Risk analysis hook - uses shared data with risk-specific calculations
 */
export const useRiskAnalysis = () => {
  const {
    calculateMetricDeltas,
    isLoading: baseLoading
  } = useHealthAnalytics();

  const [isLoading, setIsLoading] = useState(false);

  const fetchRealMetricDeltas = useCallback(async (riskLevel: 'amber' | 'red') => {
    setIsLoading(true);
    try {
      const result = await calculateMetricDeltas(riskLevel);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [calculateMetricDeltas]);

  return {
    fetchRealMetricDeltas,
    isLoading: isLoading || baseLoading
  };
};

// Export types
export type { MetricDelta, BaselineData, DailySummary, SharedAnalyticsState };

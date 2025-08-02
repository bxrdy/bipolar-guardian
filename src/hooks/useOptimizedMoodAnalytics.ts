
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodAnalytics } from '@/types/mood';

export const useOptimizedMoodAnalytics = () => {
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const getMoodLabel = useCallback((mood: number): string => {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 6) return 'Neutral';
    if (mood <= 8) return 'Good';
    return 'Excellent';
  }, []);

  const fetchMoodData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check cache validity
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Optimized query with fewer days for better performance
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

      const { data: moodEntries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', twentyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50); // Limit results for better performance

      if (error) {
        console.error('Error fetching mood data:', error);
        return;
      }

      if (!moodEntries || moodEntries.length === 0) {
        setRecentEntries([]);
        setAnalytics(null);
        setLastFetch(now);
        return;
      }

      // Transform and memoize entries
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

      setRecentEntries(parsedEntries);

      // Optimized analytics calculation
      if (parsedEntries.length > 0) {
        const moods = parsedEntries.map(e => e.mood);
        const energies = parsedEntries.map(e => e.energy);
        const stresses = parsedEntries.map(e => e.stress);
        
        const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
        
        // Simplified trend calculation
        const recentCount = Math.min(5, Math.floor(parsedEntries.length / 2));
        const recentMoods = moods.slice(0, recentCount);
        const olderMoods = moods.slice(recentCount, recentCount * 2);
        
        const recentAvg = recentMoods.length > 0 
          ? recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length 
          : averageMood;
        const olderAvg = olderMoods.length > 0 
          ? olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length 
          : averageMood;
        
        let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
        const trendThreshold = 0.7;
        if (recentAvg - olderAvg > trendThreshold) {
          moodTrend = 'improving';
        } else if (olderAvg - recentAvg > trendThreshold) {
          moodTrend = 'declining';
        }

        // Optimized activity extraction
        const commonActivities = parsedEntries
          .slice(0, 20) // Only check recent 20 entries
          .flatMap(entry => entry.context?.activities || [])
          .filter(Boolean)
          .reduce((acc, activity) => {
            acc[activity] = (acc[activity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        const topActivities = Object.entries(commonActivities)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([activity]) => activity);

        const calculatedAnalytics: MoodAnalytics = {
          averageMood,
          moodTrend,
          energyPattern: energies.slice(0, 10), // Limit pattern data
          stressPattern: stresses.slice(0, 10),
          commonActivities: topActivities,
        };

        setAnalytics(calculatedAnalytics);
      }

      setLastFetch(now);
    } catch (error) {
      console.error('Error calculating mood analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getMoodLabel, lastFetch]);

  // Memoized return object
  const returnValue = useMemo(() => ({
    analytics,
    recentEntries,
    isLoading,
    refetch: () => fetchMoodData(true)
  }), [analytics, recentEntries, isLoading, fetchMoodData]);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  return returnValue;
};

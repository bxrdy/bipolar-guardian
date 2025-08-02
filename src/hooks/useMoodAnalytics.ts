
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MoodEntry, MoodAnalytics } from '@/types/mood';

export const useMoodAnalytics = () => {
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMoodData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent mood entries (last 30 days) from the mood_entries table
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: moodEntries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mood data:', error);
        return;
      }

      if (!moodEntries || moodEntries.length === 0) {
        setRecentEntries([]);
        setAnalytics(null);
        return;
      }

      // Transform database entries to MoodEntry format
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

      // Calculate analytics
      if (parsedEntries.length > 0) {
        const moods = parsedEntries.map(e => e.mood);
        const energies = parsedEntries.map(e => e.energy);
        const stresses = parsedEntries.map(e => e.stress);
        
        const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
        
        // Calculate trend (comparing first half vs second half of entries)
        const halfPoint = Math.floor(parsedEntries.length / 2);
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
        const allActivities = parsedEntries
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

        const calculatedAnalytics: MoodAnalytics = {
          averageMood,
          moodTrend,
          energyPattern: energies,
          stressPattern: stresses,
          commonActivities,
        };

        setAnalytics(calculatedAnalytics);
      }

    } catch (error) {
      console.error('Error calculating mood analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMoodLabel = (mood: number): string => {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 6) return 'Neutral';
    if (mood <= 8) return 'Good';
    return 'Excellent';
  };

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  return {
    analytics,
    recentEntries,
    isLoading,
    refetch: fetchMoodData
  };
};

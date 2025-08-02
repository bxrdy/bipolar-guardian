
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricDelta {
  type: 'sleep' | 'steps' | 'screen' | 'mood';
  direction: 'up' | 'down';
  value: string;
  unit: string;
}

export const useRiskAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchRealMetricDeltas = async (riskLevel: 'amber' | 'red') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { deltas: [], explanation: 'No user found.' };

      console.log('Fetching real metric deltas for risk level:', riskLevel);

      // Get the most recent daily summary
      const { data: recentSummary } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      console.log('Most recent daily summary found:', recentSummary);

      // Get user's baseline metrics
      const { data: baseline } = await supabase
        .from('baseline_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Baseline metrics found:', baseline);

      // Get recent mood data (last 7 days) from new mood_entries table
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentMoodData } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      console.log('Recent mood data found:', recentMoodData);

      if (!recentSummary) {
        console.log('Missing data for metric delta calculation');
        return { deltas: [], explanation: 'Insufficient data for analysis.' };
      }

      const deltas: MetricDelta[] = [];
      let explanation = '';

      // Calculate existing deltas (sleep, steps, screen)
      if (baseline) {
        // Sleep delta calculation
        if (recentSummary.sleep_hours !== null && baseline.sleep_mean !== null) {
          const sleepDiff = baseline.sleep_mean - recentSummary.sleep_hours;
          const sleepZScore = baseline.sleep_sd > 0 ? Math.abs(sleepDiff / baseline.sleep_sd) : 0;
          
          console.log('Sleep analysis:', { sleepDiff, sleepZScore, baseline: baseline.sleep_mean, actual: recentSummary.sleep_hours });
          
          if (sleepZScore > 1) {
            deltas.push({
              type: 'sleep',
              direction: sleepDiff > 0 ? 'down' : 'up',
              value: Math.abs(sleepDiff).toFixed(1),
              unit: sleepDiff > 0 ? 'hours below normal' : 'hours above normal'
            });
          }
        }

        // Steps delta calculation
        if (recentSummary.steps !== null && baseline.steps_mean !== null) {
          const stepsDiff = baseline.steps_mean - recentSummary.steps;
          const stepsZScore = baseline.steps_sd > 0 ? Math.abs(stepsDiff / baseline.steps_sd) : 0;
          
          console.log('Steps analysis:', { stepsDiff, stepsZScore, baseline: baseline.steps_mean, actual: recentSummary.steps });
          
          if (stepsZScore > 1) {
            deltas.push({
              type: 'steps',
              direction: stepsDiff > 0 ? 'down' : 'up',
              value: Math.abs(stepsDiff).toLocaleString(),
              unit: stepsDiff > 0 ? 'steps below average' : 'steps above average'
            });
          }
        }

        // Screen/typing score delta calculation
        if (recentSummary.typing_score !== null && baseline.unlocks_mean !== null) {
          const unlocksDiff = recentSummary.typing_score - baseline.unlocks_mean;
          const unlocksZScore = baseline.unlocks_sd > 0 ? Math.abs(unlocksDiff / baseline.unlocks_sd) : 0;
          
          console.log('Screen analysis:', { unlocksDiff, unlocksZScore, baseline: baseline.unlocks_mean, actual: recentSummary.typing_score });
          
          if (unlocksZScore > 1) {
            deltas.push({
              type: 'screen',
              direction: unlocksDiff > 0 ? 'up' : 'down',
              value: Math.abs(unlocksDiff).toFixed(1),
              unit: unlocksDiff > 0 ? 'above usual usage' : 'below usual usage'
            });
          }
        }
      }

      // Enhanced mood delta calculation using mood_entries data
      if (recentMoodData && recentMoodData.length > 0) {
        const recentMoods = recentMoodData.map(entry => entry.mood);
        const recentEnergy = recentMoodData.map(entry => entry.energy);
        const recentStress = recentMoodData.map(entry => entry.stress);
        const recentAnxiety = recentMoodData.map(entry => entry.anxiety);
        
        const averageRecentMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
        const averageRecentStress = recentStress.reduce((sum, stress) => sum + stress, 0) / recentStress.length;
        const averageRecentAnxiety = recentAnxiety.reduce((sum, anxiety) => sum + anxiety, 0) / recentAnxiety.length;
        
        // Get older mood data for baseline (2-4 weeks ago)
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const { data: baselineMoodData } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', fourWeeksAgo.toISOString())
          .lte('created_at', twoWeeksAgo.toISOString());

        if (baselineMoodData && baselineMoodData.length > 0) {
          const baselineMoods = baselineMoodData.map(entry => entry.mood);
          const averageBaselineMood = baselineMoods.reduce((sum, mood) => sum + mood, 0) / baselineMoods.length;
          
          const moodDiff = averageBaselineMood - averageRecentMood;
          
          console.log('Mood analysis:', { 
            averageRecentMood, 
            averageBaselineMood, 
            moodDiff,
            averageRecentStress,
            averageRecentAnxiety,
            recentCount: recentMoods.length,
            baselineCount: baselineMoods.length
          });
          
          // Consider mood significant if difference is > 1.5 points
          if (Math.abs(moodDiff) > 1.5) {
            deltas.push({
              type: 'mood',
              direction: moodDiff > 0 ? 'down' : 'up',
              value: Math.abs(moodDiff).toFixed(1),
              unit: moodDiff > 0 ? 'points below recent average' : 'points above recent average'
            });
          }
          
          // Add stress/anxiety if elevated
          if (averageRecentStress > 3.5) {
            deltas.push({
              type: 'mood',
              direction: 'up',
              value: averageRecentStress.toFixed(1),
              unit: 'average stress level (elevated)'
            });
          }
          
          if (averageRecentAnxiety > 3.5) {
            deltas.push({
              type: 'mood',
              direction: 'up',
              value: averageRecentAnxiety.toFixed(1),
              unit: 'average anxiety level (elevated)'
            });
          }
        }
      }

      console.log('Final deltas calculated:', deltas);

      // Generate explanation based on actual data including mood
      const significantDeviations = deltas.length;
      const dataDate = new Date(recentSummary.date).toLocaleDateString();
      const isToday = recentSummary.date === new Date().toISOString().split('T')[0];
      const dateContext = isToday ? 'today' : `on ${dataDate}`;
      
      if (riskLevel === 'red') {
        explanation = `Your metrics ${dateContext} show ${significantDeviations} significant departure${significantDeviations !== 1 ? 's' : ''} from your personal baseline patterns. `;
        
        if (deltas.some(d => d.type === 'sleep' && d.direction === 'down')) {
          explanation += `Sleep was notably reduced from your typical range. `;
        }
        if (deltas.some(d => d.type === 'steps' && d.direction === 'down')) {
          explanation += `Physical activity dropped significantly below your normal levels. `;
        }
        if (deltas.some(d => d.type === 'screen' && d.direction === 'up')) {
          explanation += `Screen usage increased substantially above your usual patterns. `;
        }
        if (deltas.some(d => d.type === 'mood' && d.direction === 'down')) {
          explanation += `Mood levels have declined compared to your recent patterns. `;
        }
        if (deltas.some(d => d.type === 'mood' && d.unit.includes('stress'))) {
          explanation += `Stress levels are elevated above normal ranges. `;
        }
        if (deltas.some(d => d.type === 'mood' && d.unit.includes('anxiety'))) {
          explanation += `Anxiety levels are higher than usual. `;
        }
        
        explanation += `These combined changes may indicate early shifts in routine or mood patterns worth monitoring.`;
      } else {
        explanation = `Your data ${dateContext} shows ${significantDeviations} moderate deviation${significantDeviations !== 1 ? 's' : ''} from your established patterns. `;
        
        if (deltas.some(d => d.type === 'sleep')) {
          explanation += `Sleep patterns varied from your personal baseline. `;
        }
        if (deltas.some(d => d.type === 'steps')) {
          explanation += `Activity levels differed from your typical range. `;
        }
        if (deltas.some(d => d.type === 'mood')) {
          explanation += `Mood patterns show some variation from recent trends. `;
        }
        
        explanation += `While not immediately concerning, these changes represent a departure from your normal routine.`;
      }

      return { deltas, explanation };
    } catch (error) {
      console.error('Error fetching real metric deltas:', error);
      return { deltas: [], explanation: 'Unable to calculate metric changes from your data.' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchRealMetricDeltas,
    isLoading
  };
};

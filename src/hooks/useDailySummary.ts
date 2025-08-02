
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDailySummary = () => {
  return useQuery({
    queryKey: ['daily-summary'],
    queryFn: async () => {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No authenticated user found');
        return {
          riskLevel: null,
          baselineReady: false,
          daysCollected: 0
        };
      }

      console.log('Fetching daily summary for user:', user.id);
      
      // Get today's date for checking today's data
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we have any data for today (sensor_samples or mood_entries)
      const [sensorDataResponse, moodDataResponse] = await Promise.all([
        supabase
          .from('sensor_samples')
          .select('id')
          .eq('user_id', user.id)
          .gte('timestamp', `${today}T00:00:00.000Z`)
          .lt('timestamp', `${today}T23:59:59.999Z`)
          .limit(1),
        supabase
          .from('mood_entries')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)
          .limit(1)
      ]);

      const todayHasSensorData = sensorDataResponse.data && sensorDataResponse.data.length > 0;
      const todayHasMoodData = moodDataResponse.data && moodDataResponse.data.length > 0;
      const todayHasData = todayHasSensorData || todayHasMoodData;

      console.log('Today has sensor data:', todayHasSensorData);
      console.log('Today has mood data:', todayHasMoodData);

      // Fetch the most recent daily summary
      const { data: dailySummary, error: summaryError } = await supabase
        .from('daily_summary')
        .select('risk_level, date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (summaryError) {
        console.error('Error fetching daily summary:', summaryError);
      } else {
        console.log('Most recent daily summary data:', dailySummary);
      }

      // Fetch user profile to check baseline status
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profile')
        .select('baseline_ready')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else {
        console.log('User profile data:', userProfile);
      }

      // Calculate days of data collected from both sensor_samples and mood_entries
      const [sensorDaysResponse, moodDaysResponse] = await Promise.all([
        supabase
          .from('sensor_samples')
          .select('timestamp')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false }),
        supabase
          .from('mood_entries')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      let daysCollected = 0;
      const uniqueDates = new Set();

      // Count unique dates from sensor data
      if (sensorDaysResponse.data && !sensorDaysResponse.error) {
        sensorDaysResponse.data.forEach(sample => {
          const date = new Date(sample.timestamp).toDateString();
          uniqueDates.add(date);
        });
      }

      // Count unique dates from mood data
      if (moodDaysResponse.data && !moodDaysResponse.error) {
        moodDaysResponse.data.forEach(entry => {
          const date = new Date(entry.created_at).toDateString();
          uniqueDates.add(date);
        });
      }

      daysCollected = uniqueDates.size;
      console.log('Total days of data collected:', daysCollected);

      // If we have today's data but no daily summary for today, we might need to trigger the pipeline
      if (todayHasData && (!dailySummary || dailySummary.date !== today)) {
        console.log('We have today\'s data but no daily summary - this might need pipeline processing');
      }

      return {
        riskLevel: dailySummary?.risk_level || null,
        baselineReady: userProfile?.baseline_ready || false,
        daysCollected,
        todayHasData
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

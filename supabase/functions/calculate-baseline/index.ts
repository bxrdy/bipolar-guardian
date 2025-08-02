
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting baseline calculation process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users who have sensor data but don't have baseline metrics calculated yet
    const { data: usersWithData, error: usersError } = await supabase
      .from('sensor_samples')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users with sensor data:', usersError);
      throw usersError;
    }

    if (!usersWithData || usersWithData.length === 0) {
      console.log('No users with sensor data found');
      return new Response(
        JSON.stringify({ message: 'No users with sensor data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique user IDs
    const uniqueUserIds = [...new Set(usersWithData.map(u => u.user_id))];
    console.log(`Found ${uniqueUserIds.length} users with sensor data`);

    // Check which users already have baseline metrics
    const { data: existingBaselines, error: baselineError } = await supabase
      .from('baseline_metrics')
      .select('user_id');

    if (baselineError) {
      console.error('Error fetching existing baselines:', baselineError);
      throw baselineError;
    }

    const existingUserIds = new Set(existingBaselines?.map(b => b.user_id) || []);
    const usersNeedingBaseline = uniqueUserIds.filter(userId => !existingUserIds.has(userId));

    console.log(`${usersNeedingBaseline.length} users need baseline calculation`);

    if (usersNeedingBaseline.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All users already have baseline metrics calculated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedUsers = 0;

    for (const userId of usersNeedingBaseline) {
      console.log(`Processing user ${userId}...`);

      // Check if user has ≥14 days of data for all metric types
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Get all sensor data for this user in the last 14 days
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_samples')
        .select('timestamp, metric_type, metric_value')
        .eq('user_id', userId)
        .gte('timestamp', fourteenDaysAgo.toISOString())
        .not('metric_type', 'is', null)
        .not('metric_value', 'is', null)
        .order('timestamp');

      if (sensorError) {
        console.error(`Error fetching sensor data for user ${userId}:`, sensorError);
        continue;
      }

      if (!sensorData || sensorData.length === 0) {
        console.log(`User ${userId} has no sensor data in the last 14 days`);
        continue;
      }

      // Group data by metric type and date
      const metricsByTypeAndDate: { [metricType: string]: { [date: string]: number[] } } = {};
      
      for (const sample of sensorData) {
        const metricType = sample.metric_type;
        const date = new Date(sample.timestamp).toDateString();
        
        if (!metricsByTypeAndDate[metricType]) {
          metricsByTypeAndDate[metricType] = {};
        }
        if (!metricsByTypeAndDate[metricType][date]) {
          metricsByTypeAndDate[metricType][date] = [];
        }
        metricsByTypeAndDate[metricType][date].push(sample.metric_value);
      }

      const availableMetricTypes = Object.keys(metricsByTypeAndDate);
      console.log(`User ${userId} has metric types:`, availableMetricTypes);

      // Check if we have enough data for baseline calculation
      let hasEnoughData = false;
      const baselineMetrics: any = {
        user_id: userId,
        sleep_mean: null,
        sleep_sd: null,
        steps_mean: null,
        steps_sd: null,
        unlocks_mean: null,
        unlocks_sd: null
      };

      // Process each available metric type
      for (const metricType of availableMetricTypes) {
        const dailyAverages = Object.keys(metricsByTypeAndDate[metricType]).map(date => {
          const values = metricsByTypeAndDate[metricType][date];
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        });

        console.log(`User ${userId}, metric ${metricType}: ${dailyAverages.length} days of data`);

        if (dailyAverages.length >= 7) { // Require at least 7 days instead of 14 for initial testing
          hasEnoughData = true;
          
          // Calculate mean and standard deviation
          const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / dailyAverages.length;
          const variance = dailyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyAverages.length;
          const standardDeviation = Math.sqrt(variance);

          console.log(`Metric ${metricType} for user ${userId}: mean=${mean}, sd=${standardDeviation}, days=${dailyAverages.length}`);

          // Map metric types to baseline_metrics columns
          switch (metricType) {
            case 'sleep_hours':
            case 'sleep_quality':
              baselineMetrics.sleep_mean = mean;
              baselineMetrics.sleep_sd = standardDeviation;
              break;
            case 'steps':
            case 'activity_level':
              baselineMetrics.steps_mean = mean;
              baselineMetrics.steps_sd = standardDeviation;
              break;
            case 'screen_time':
            case 'app_usage':
            case 'unlocks':
              baselineMetrics.unlocks_mean = mean;
              baselineMetrics.unlocks_sd = standardDeviation;
              break;
          }
        }
      }

      if (!hasEnoughData) {
        console.log(`User ${userId} does not have enough data for baseline calculation`);
        continue;
      }

      // Insert baseline metrics
      const { error: insertError } = await supabase
        .from('baseline_metrics')
        .upsert(baselineMetrics);

      if (insertError) {
        console.error(`Error inserting baseline metrics for user ${userId}:`, insertError);
        continue;
      }

      // Update user profile to mark baseline as ready
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ baseline_ready: true })
        .eq('id', userId);

      if (updateError) {
        console.error(`Error updating user profile for user ${userId}:`, updateError);
        continue;
      }

      console.log(`Successfully calculated baseline for user ${userId}`);
      processedUsers++;
    }

    console.log(`Baseline calculation complete. Processed ${processedUsers} users.`);

    return new Response(
      JSON.stringify({ 
        message: `Baseline calculation complete. Processed ${processedUsers} users.`,
        processedUsers 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in baseline calculation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

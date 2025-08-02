
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { date } = body;

    console.log(`Processing daily summary for date: ${date}`);

    // Get all users to process
    const { data: users, error: usersError } = await supabase
      .from('user_profile')
      .select('id');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const results = [];

    for (const user of users || []) {
      console.log(`Processing user: ${user.id}`);

      const startTime = `${date}T00:00:00.000Z`;
      const endTime = `${date}T23:59:59.999Z`;

      // Fetch sensor data for the day
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_samples')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startTime)
        .lte('timestamp', endTime);

      if (sensorError) {
        console.error(`Error fetching sensor data for user ${user.id}:`, sensorError);
        continue;
      }

      // Fetch mood data for the day from mood_entries table
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startTime)
        .lte('created_at', endTime);

      if (moodError) {
        console.error(`Error fetching mood data for user ${user.id}:`, moodError);
        continue;
      }

      console.log(`Found ${sensorData?.length || 0} sensor samples and ${moodData?.length || 0} mood entries for user ${user.id}`);

      // Process sensor data by metric type
      const sleepData = sensorData?.filter(s => s.metric_type === 'sleep_hours') || [];
      const stepsData = sensorData?.filter(s => s.metric_type === 'steps') || [];
      const unlocksData = sensorData?.filter(s => s.metric_type === 'unlocks') || [];
      const activityData = sensorData?.filter(s => s.metric_type === 'activity_level') || [];

      // Calculate aggregated values
      const sleepHours = sleepData.length > 0 
        ? sleepData.reduce((sum, s) => sum + (s.metric_value || 0), 0) / sleepData.length
        : null;

      const totalSteps = stepsData.length > 0
        ? stepsData.reduce((sum, s) => sum + (s.metric_value || 0), 0)
        : null;

      const avgUnlocks = unlocksData.length > 0
        ? unlocksData.reduce((sum, s) => sum + (s.metric_value || 0), 0) / unlocksData.length
        : null;

      const avgActivity = activityData.length > 0
        ? activityData.reduce((sum, s) => sum + (s.metric_value || 0), 0) / activityData.length
        : null;

      // Calculate mood averages from mood_entries
      let avgMood = null;
      let avgEnergy = null;
      let avgStress = null;
      let avgAnxiety = null;

      if (moodData && moodData.length > 0) {
        avgMood = moodData.reduce((sum, m) => sum + m.mood, 0) / moodData.length;
        avgEnergy = moodData.reduce((sum, m) => sum + m.energy, 0) / moodData.length;
        avgStress = moodData.reduce((sum, m) => sum + m.stress, 0) / moodData.length;
        avgAnxiety = moodData.reduce((sum, m) => sum + m.anxiety, 0) / moodData.length;
      }

      // Determine risk level based on available data
      let riskLevel = null;

      // Get user's baseline for comparison
      const { data: baseline } = await supabase
        .from('baseline_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (baseline && (sleepHours !== null || totalSteps !== null || avgMood !== null)) {
        let riskFactors = 0;
        
        // Sleep risk assessment
        if (sleepHours !== null && baseline.sleep_mean !== null && baseline.sleep_sd !== null) {
          const sleepZScore = Math.abs((sleepHours - baseline.sleep_mean) / baseline.sleep_sd);
          if (sleepZScore > 2) riskFactors += 2;
          else if (sleepZScore > 1) riskFactors += 1;
        }

        // Steps risk assessment
        if (totalSteps !== null && baseline.steps_mean !== null && baseline.steps_sd !== null) {
          const stepsZScore = Math.abs((totalSteps - baseline.steps_mean) / baseline.steps_sd);
          if (stepsZScore > 2) riskFactors += 2;
          else if (stepsZScore > 1) riskFactors += 1;
        }

        // Screen usage risk assessment
        if (avgUnlocks !== null && baseline.unlocks_mean !== null && baseline.unlocks_sd !== null) {
          const unlocksZScore = Math.abs((avgUnlocks - baseline.unlocks_mean) / baseline.unlocks_sd);
          if (unlocksZScore > 2) riskFactors += 2;
          else if (unlocksZScore > 1) riskFactors += 1;
        }

        // Mood risk assessment (if mood data available)
        if (avgMood !== null) {
          // Low mood (1-4) or very high mood (8-10) increases risk
          if (avgMood <= 4 || avgMood >= 8) riskFactors += 2;
          else if (avgMood <= 5 || avgMood >= 7) riskFactors += 1;
          
          // High stress/anxiety increases risk
          if (avgStress !== null && avgStress >= 4) riskFactors += 1;
          if (avgAnxiety !== null && avgAnxiety >= 4) riskFactors += 1;
        }

        // Determine overall risk level
        if (riskFactors >= 4) {
          riskLevel = 'red';
        } else if (riskFactors >= 2) {
          riskLevel = 'amber';
        } else {
          riskLevel = 'green';
        }

        console.log(`Risk assessment for user ${user.id}: ${riskFactors} factors = ${riskLevel} risk`);
      }

      // Upsert daily summary with proper column names
      const summaryData = {
        user_id: user.id,
        date,
        sleep_hours: sleepHours,
        steps: totalSteps,
        typing_score: avgActivity, // Using activity level as typing score approximation
        risk_level: riskLevel
      };

      const { error: upsertError } = await supabase
        .from('daily_summary')
        .upsert(summaryData, {
          onConflict: 'user_id,date'
        });

      if (upsertError) {
        console.error(`Error upserting daily summary for user ${user.id}:`, upsertError);
        continue;
      }

      results.push({
        user_id: user.id,
        date,
        risk_level: riskLevel,
        has_mood_data: moodData && moodData.length > 0,
        has_sensor_data: sensorData && sensorData.length > 0,
        mood_entries_count: moodData?.length || 0,
        sensor_samples_count: sensorData?.length || 0
      });

      console.log(`Successfully processed daily summary for user ${user.id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_users: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in aggregate-daily-summary:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

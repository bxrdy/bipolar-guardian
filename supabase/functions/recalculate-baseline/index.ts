import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeightedDataPoint {
  value: number;
  date: string;
  weight: number;
}

interface BaselineCalculationResult {
  mean: number;
  sd: number;
  dataPoints: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Calculate weighted mean and standard deviation
 * Recent data gets higher weight (exponential decay)
 */
function calculateWeightedStats(dataPoints: WeightedDataPoint[]): BaselineCalculationResult {
  if (dataPoints.length === 0) {
    throw new Error('No data points provided');
  }

  // Sort by date (oldest first)
  const sortedData = dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate weighted mean
  const totalWeight = sortedData.reduce((sum, point) => sum + point.weight, 0);
  const weightedSum = sortedData.reduce((sum, point) => sum + (point.value * point.weight), 0);
  const mean = weightedSum / totalWeight;
  
  // Calculate weighted standard deviation
  const weightedVarianceSum = sortedData.reduce((sum, point) => {
    return sum + (point.weight * Math.pow(point.value - mean, 2));
  }, 0);
  const sd = Math.sqrt(weightedVarianceSum / totalWeight);
  
  return {
    mean,
    sd,
    dataPoints: sortedData.length,
    dateRange: {
      start: sortedData[0].date,
      end: sortedData[sortedData.length - 1].date
    }
  };
}

/**
 * Calculate weight for data point based on age (exponential decay)
 * More recent data gets higher weight
 */
function calculateWeight(dataDate: Date, today: Date, halfLifeDays: number = 15): number {
  const daysDiff = Math.abs((today.getTime() - dataDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.exp(-daysDiff * Math.log(2) / halfLifeDays);
}

/**
 * Check if baseline should be updated based on criteria
 */
function shouldUpdateBaseline(lastUpdate: Date, today: Date): boolean {
  const daysSinceUpdate = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate >= 30; // Update monthly
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting dynamic baseline recalculation...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();

    // Get request body to check if it's for a specific user
    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch {
      // No body provided, process all users
    }

    const specificUserId = requestBody.user_id;

    // Get users who need baseline updates
    let baselineQuery = supabase
      .from('baseline_metrics')
      .select('user_id, updated_at');

    if (specificUserId) {
      baselineQuery = baselineQuery.eq('user_id', specificUserId);
    }

    const { data: existingBaselines, error: baselineError } = await baselineQuery;

    if (baselineError) {
      console.error('Error fetching existing baselines:', baselineError);
      throw baselineError;
    }

    const usersToUpdate: string[] = [];

    if (specificUserId) {
      // Force update for specific user
      usersToUpdate.push(specificUserId);
    } else {
      // Check which users need updates based on time criteria
      for (const baseline of existingBaselines || []) {
        const lastUpdate = new Date(baseline.updated_at);
        if (shouldUpdateBaseline(lastUpdate, today)) {
          usersToUpdate.push(baseline.user_id);
        }
      }
    }

    console.log(`Found ${usersToUpdate.length} users needing baseline updates`);

    if (usersToUpdate.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users need baseline updates at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedUsers = 0;

    for (const userId of usersToUpdate) {
      console.log(`Recalculating baseline for user ${userId}...`);

      try {
        // Get last 60 days of sensor data for rolling window calculation
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: sensorData, error: sensorError } = await supabase
          .from('sensor_samples')
          .select('timestamp, metric_type, metric_value')
          .eq('user_id', userId)
          .gte('timestamp', sixtyDaysAgo.toISOString())
          .not('metric_type', 'is', null)
          .not('metric_value', 'is', null)
          .order('timestamp');

        if (sensorError) {
          console.error(`Error fetching sensor data for user ${userId}:`, sensorError);
          continue;
        }

        if (!sensorData || sensorData.length === 0) {
          console.log(`User ${userId} has no recent sensor data`);
          continue;
        }

        // Check for medication changes that might affect baseline
        const { data: recentMedChanges } = await supabase
          .from('medications')
          .select('created_at, updated_at')
          .eq('user_id', userId)
          .gte('created_at', sixtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        const hasMedicationChanges = recentMedChanges && recentMedChanges.length > 0;
        
        // If medication changes detected, use shorter window (30 days) to avoid contamination
        const windowDays = hasMedicationChanges ? 30 : 60;
        const windowStart = new Date();
        windowStart.setDate(windowStart.getDate() - windowDays);

        console.log(`Using ${windowDays}-day window for user ${userId} (med changes: ${hasMedicationChanges})`);

        // Group data by metric type and date, calculate daily averages
        const metricsByTypeAndDate: { [metricType: string]: { [date: string]: number[] } } = {};
        
        for (const sample of sensorData) {
          const sampleDate = new Date(sample.timestamp);
          if (sampleDate < windowStart) continue; // Skip data outside window
          
          const metricType = sample.metric_type;
          const date = sampleDate.toDateString();
          
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

        // Archive current baseline as historical version
        const { data: currentBaseline } = await supabase
          .from('baseline_metrics')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (currentBaseline) {
          await supabase
            .from('baseline_history')
            .insert({
              user_id: userId,
              baseline_data: currentBaseline,
              replaced_at: today.toISOString(),
              version_notes: `Replaced by rolling ${windowDays}-day update${hasMedicationChanges ? ' (medication changes detected)' : ''}`
            });
        }

        // Calculate new baseline metrics with weighted approach
        let hasEnoughData = false;
        const newBaselineMetrics: any = {
          user_id: userId,
          sleep_mean: null,
          sleep_sd: null,
          steps_mean: null,
          steps_sd: null,
          unlocks_mean: null,
          unlocks_sd: null,
          calculation_method: 'weighted_rolling_window',
          window_days: windowDays,
          medication_changes_detected: hasMedicationChanges
        };

        // Process each available metric type with weighted calculation
        for (const metricType of availableMetricTypes) {
          const dailyAverages: WeightedDataPoint[] = [];
          
          // Calculate daily averages and assign weights
          for (const [date, values] of Object.entries(metricsByTypeAndDate[metricType])) {
            const dailyAvg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const weight = calculateWeight(new Date(date), today);
            
            dailyAverages.push({
              value: dailyAvg,
              date,
              weight
            });
          }

          console.log(`User ${userId}, metric ${metricType}: ${dailyAverages.length} days of data`);

          if (dailyAverages.length >= 14) { // Require at least 14 days for stable baseline
            hasEnoughData = true;
            
            try {
              const stats = calculateWeightedStats(dailyAverages);
              
              console.log(`Weighted stats for ${metricType}: mean=${stats.mean}, sd=${stats.sd}, points=${stats.dataPoints}`);

              // Map metric types to baseline_metrics columns
              switch (metricType) {
                case 'sleep_hours':
                case 'sleep_quality':
                  newBaselineMetrics.sleep_mean = stats.mean;
                  newBaselineMetrics.sleep_sd = stats.sd;
                  break;
                case 'steps':
                case 'activity_level':
                  newBaselineMetrics.steps_mean = stats.mean;
                  newBaselineMetrics.steps_sd = stats.sd;
                  break;
                case 'screen_time':
                case 'app_usage':
                case 'unlocks':
                  newBaselineMetrics.unlocks_mean = stats.mean;
                  newBaselineMetrics.unlocks_sd = stats.sd;
                  break;
              }
            } catch (error) {
              console.error(`Error calculating weighted stats for ${metricType}:`, error);
            }
          }
        }

        if (!hasEnoughData) {
          console.log(`User ${userId} does not have enough data for baseline recalculation`);
          continue;
        }

        // Update baseline metrics
        const { error: upsertError } = await supabase
          .from('baseline_metrics')
          .upsert({
            ...newBaselineMetrics,
            updated_at: today.toISOString()
          });

        if (upsertError) {
          console.error(`Error updating baseline metrics for user ${userId}:`, upsertError);
          continue;
        }

        console.log(`Successfully recalculated baseline for user ${userId}`);
        processedUsers++;

      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        continue;
      }
    }

    console.log(`Baseline recalculation complete. Updated ${processedUsers} users.`);

    return new Response(
      JSON.stringify({ 
        message: `Baseline recalculation complete. Updated ${processedUsers} users.`,
        processedUsers,
        method: 'weighted_rolling_window'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in baseline recalculation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
}

const getAuthenticatedUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    toast.error('Please sign in to use testing features');
    return null;
  }
  return user;
};

export const checkExistingData = async (userId: string, metricType: string, date: string) => {
  const { data, error } = await supabase
    .from('sensor_samples')
    .select('id')
    .eq('user_id', userId)
    .eq('metric_type', metricType)
    .gte('timestamp', `${date}T00:00:00.000Z`)
    .lt('timestamp', `${date}T23:59:59.999Z`)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw error;
  }

  return data !== null;
};

export const generateSensorData = async (
  metricType: string, 
  value: number,
  setIsLoading: (loading: boolean) => void,
  processBasicDataPipeline: () => Promise<void>
) => {
  try {
    setIsLoading(true);
    console.log(`=== Starting data generation for ${metricType} with value ${value} ===`);
    
    const user = await getAuthenticatedUser();
    if (!user) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check if data already exists for today
    const exists = await checkExistingData(user.id, metricType, today);
    if (exists) {
      toast.info(`${metricType} data already exists for today. Use "Generate 30 Days" to replace existing data.`);
      return;
    }

    const sensorData = {
      user_id: user.id,
      metric_type: metricType,
      metric_value: value,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('sensor_samples')
      .insert(sensorData);

    if (error) {
      console.error('Database insertion error:', error);
      toast.error(`Failed to generate test data: ${error.message}`);
    } else {
      toast.success(`Generated ${metricType} data: ${value}`);
      
      // Auto-process pipeline
      await processBasicDataPipeline();
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to generate test data');
  } finally {
    setIsLoading(false);
  }
};

export const generateHistoricalData = async (
  setIsLoading: (loading: boolean) => void,
  setShowProgress: (show: boolean) => void,
  setProgressSteps: (steps: ProgressStep[]) => void,
  updateProgress: (stepId: string, status: ProgressStep['status'], message?: string) => void,
  processHistoricalDataPipeline: () => Promise<void>
) => {
  try {
    setIsLoading(true);
    setShowProgress(true);
    setProgressSteps([
      { id: 'check-existing', label: 'Checking existing data', status: 'running' },
      { id: 'generate-data', label: 'Generating historical records', status: 'pending' },
      { id: 'process-pipeline', label: 'Processing baseline calculation', status: 'pending' }
    ]);

    updateProgress('check-existing', 'running', 'Scanning database...');
    
    const user = await getAuthenticatedUser();
    if (!user) {
      updateProgress('check-existing', 'error', 'Authentication required');
      return;
    }

    const { data: existingData } = await supabase
      .from('sensor_samples')
      .select('timestamp')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    updateProgress('check-existing', 'completed', 'Found existing data');
    updateProgress('generate-data', 'running', 'Creating new records...');

    const existingDates = new Set();
    if (existingData) {
      existingData.forEach(sample => {
        const date = new Date(sample.timestamp).toDateString();
        existingDates.add(date);
      });
    }

    const dataToInsert = [];
    let daysAdded = 0;
    let daysAgo = 1;
    
    while (daysAdded < 10 && daysAgo <= 30) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dateString = date.toDateString();
      
      if (!existingDates.has(dateString)) {
        const sleepHours = 7.5 + (Math.random() - 0.5) * 1;
        const steps = 8000 + Math.floor((Math.random() - 0.5) * 2000);
        const screenUnlocks = 50 + Math.floor((Math.random() - 0.5) * 20);
        const activityLevel = 0.6 + (Math.random() - 0.5) * 0.2;
        
        dataToInsert.push(
          {
            user_id: user.id,
            metric_type: 'sleep_hours',
            metric_value: sleepHours,
            timestamp: date.toISOString()
          },
          {
            user_id: user.id,
            metric_type: 'steps',
            metric_value: steps,
            timestamp: date.toISOString()
          },
          {
            user_id: user.id,
            metric_type: 'unlocks',
            metric_value: screenUnlocks,
            timestamp: date.toISOString()
          },
          {
            user_id: user.id,
            metric_type: 'activity_level',
            metric_value: activityLevel,
            timestamp: date.toISOString()
          }
        );
        daysAdded++;
      }
      daysAgo++;
    }

    if (dataToInsert.length === 0) {
      updateProgress('generate-data', 'completed', 'No new days needed');
      toast.info('No new days to generate');
      return;
    }

    const { error } = await supabase
      .from('sensor_samples')
      .insert(dataToInsert);

    if (error) {
      updateProgress('generate-data', 'error', `Database error: ${error.message}`);
      toast.error('Failed to generate historical data');
      return;
    }

    updateProgress('generate-data', 'completed', `Generated ${daysAdded} days`);
    updateProgress('process-pipeline', 'running', 'Calculating baseline metrics...');

    await processHistoricalDataPipeline();
    updateProgress('process-pipeline', 'completed', 'Baseline calculation complete');

    toast.success(`Generated ${daysAdded} days of historical data`);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to generate historical data');
  } finally {
    setIsLoading(false);
    setTimeout(() => setShowProgress(false), 3000);
  }
};

export const generate30DaysRealisticData = async (
  setIsLoading: (loading: boolean) => void,
  setShowProgress: (show: boolean) => void,
  setProgressSteps: (steps: ProgressStep[]) => void,
  updateProgress: (stepId: string, status: ProgressStep['status'], message?: string) => void,
  processFullPipeline: () => Promise<void>
) => {
  try {
    setIsLoading(true);
    setShowProgress(true);
    setProgressSteps([
      { id: 'clear-data', label: 'Clearing existing data', status: 'running' },
      { id: 'generate-30days', label: 'Generating 30 days of data', status: 'pending' },
      { id: 'calculate-baseline', label: 'Calculating baseline metrics', status: 'pending' },
      { id: 'process-summaries', label: 'Processing daily summaries', status: 'pending' }
    ]);

    updateProgress('clear-data', 'running', 'Removing old records...');
    
    const user = await getAuthenticatedUser();
    if (!user) {
      updateProgress('clear-data', 'error', 'Authentication required');
      return;
    }

    // Clear existing data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from('sensor_samples')
      .delete()
      .eq('user_id', user.id)
      .gte('timestamp', thirtyDaysAgo.toISOString());

    updateProgress('clear-data', 'completed', 'Old data cleared');
    updateProgress('generate-30days', 'running', 'Creating realistic patterns...');

    const dataToInsert = [];
    
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const baseSleep = isWeekend ? 8.2 : 7.6;
      const sleepHours = Math.max(5, Math.min(10, baseSleep + (Math.random() - 0.5) * 1.5));
      
      const baseSteps = isWeekend ? 6500 + Math.random() * 4000 : 8500 + Math.random() * 3000;
      const steps = Math.floor(Math.max(2000, baseSteps));
      
      const baseUnlocks = isWeekend ? 65 : 55;
      const unlocks = Math.floor(Math.max(20, baseUnlocks + (Math.random() - 0.5) * 25));
      
      const activityLevel = Math.max(0.2, Math.min(1.0, (steps / 10000) * 0.7 + (Math.random() * 0.3)));
      
      const morning = new Date(date);
      morning.setHours(8, Math.floor(Math.random() * 60), 0, 0);
      
      const afternoon = new Date(date);
      afternoon.setHours(14, Math.floor(Math.random() * 60), 0, 0);
      
      const evening = new Date(date);
      evening.setHours(20, Math.floor(Math.random() * 60), 0, 0);
      
      dataToInsert.push(
        {
          user_id: user.id,
          metric_type: 'sleep_hours',
          metric_value: Math.round(sleepHours * 100) / 100,
          timestamp: morning.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'steps',
          metric_value: steps,
          timestamp: afternoon.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'unlocks',
          metric_value: unlocks,
          timestamp: evening.toISOString()
        },
        {
          user_id: user.id,
          metric_type: 'activity_level',
          metric_value: Math.round(activityLevel * 100) / 100,
          timestamp: afternoon.toISOString()
        }
      );
    }

    const { error: insertError } = await supabase
      .from('sensor_samples')
      .insert(dataToInsert);

    if (insertError) {
      updateProgress('generate-30days', 'error', `Insert failed: ${insertError.message}`);
      toast.error('Failed to generate 30-day data');
      return;
    }

    updateProgress('generate-30days', 'completed', `${dataToInsert.length} records created`);
    
    // Auto-process full pipeline
    await processFullPipeline();

  } catch (error) {
    console.error('Error in generate30DaysRealisticData:', error);
    toast.error('An unexpected error occurred');
  } finally {
    setIsLoading(false);
    setTimeout(() => setShowProgress(false), 3000);
  }
};

export const generateOutlierData = async (
  setIsLoading: (loading: boolean) => void,
  processOutlierDataPipeline: () => Promise<void>
) => {
  setIsLoading(true);
  toast.info("Generating outlier data...");
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Check for existing data today before generating outliers
    const existingMetrics = ['sleep_hours', 'steps', 'unlocks'];
    for (const metric of existingMetrics) {
      const exists = await checkExistingData(user.id, metric, today);
      if (exists) {
        // Delete existing data for today to replace with outlier data
        await supabase
          .from('sensor_samples')
          .delete()
          .eq('user_id', user.id)
          .eq('metric_type', metric)
          .gte('timestamp', `${today}T00:00:00.000Z`)
          .lt('timestamp', `${today}T23:59:59.999Z`);
      }
    }
    
    const todayTimestamp = new Date();
    const sensorData = [
      {
        user_id: user.id,
        metric_type: 'sleep_hours',
        metric_value: 3,
        timestamp: todayTimestamp.toISOString()
      },
      {
        user_id: user.id,
        metric_type: 'steps',
        metric_value: 8500,
        timestamp: todayTimestamp.toISOString()
      },
      {
        user_id: user.id,
        metric_type: 'unlocks',
        metric_value: 45,
        timestamp: todayTimestamp.toISOString()
      }
    ];

    const { error } = await supabase.from('sensor_samples').insert(sensorData);

    if (error) {
      toast.error(`Failed to generate test data: ${error.message}`);
      return;
    }
    
    toast.success("Generated outlier data");
    
    // Auto-process pipeline
    await processOutlierDataPipeline();

  } catch (error) {
    console.error('Error in generateOutlierData:', error);
    toast.error('An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};

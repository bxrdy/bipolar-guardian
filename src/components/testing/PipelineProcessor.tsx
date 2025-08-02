
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { ProgressStep } from './DataGenerationLogic';

export const processBasicDataPipeline = async () => {
  toast.info("Processing pipeline for basic data...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const todayStr = new Date().toISOString().split('T')[0];
  const { error } = await supabase.functions.invoke('aggregate-daily-summary', {
    body: { date: todayStr }
  });

  if (error) {
    toast.error(`Pipeline processing failed: ${error.message}`);
  } else {
    toast.success('Pipeline processing completed');
  }
};

export const processHistoricalDataPipeline = async () => {
  toast.info("Processing pipeline for historical data...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Process baseline calculation
  const { error: baselineError } = await supabase.functions.invoke('calculate-baseline');
  if (baselineError) {
    toast.error(`Baseline calculation failed: ${baselineError.message}`);
    return;
  }
  
  toast.success('Historical data pipeline completed');
};

export const processFullPipeline = async (
  updateProgress: (stepId: string, status: ProgressStep['status'], message?: string) => void
) => {
  updateProgress('calculate-baseline', 'running', 'Computing user baseline...');

  // Calculate baseline
  const { error: baselineError } = await supabase.functions.invoke('calculate-baseline');
  if (baselineError) {
    updateProgress('calculate-baseline', 'error', `Baseline failed: ${baselineError.message}`);
    return;
  }

  updateProgress('calculate-baseline', 'completed', 'Baseline metrics ready');
  updateProgress('process-summaries', 'running', 'Processing 31 daily summaries...');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Process daily summaries for the last 30 days
  const dailySummaryPromises = [];
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    dailySummaryPromises.push(
      supabase.functions.invoke('aggregate-daily-summary', {
        body: { date: dateStr }
      })
    );
  }

  const results = await Promise.allSettled(dailySummaryPromises);
  const successCount = results.filter(r => r.status === 'fulfilled' && !r.value.error).length;
  const errorCount = results.length - successCount;

  if (errorCount > 0) {
    updateProgress('process-summaries', 'error', `${errorCount} summaries failed`);
    toast.error(`Pipeline completed with ${errorCount} errors and ${successCount} successes`);
  } else {
    updateProgress('process-summaries', 'completed', `${successCount} summaries processed`);
    toast.success(`Full pipeline completed successfully - ${successCount} daily summaries processed`);
  }
};

export const processOutlierDataPipeline = async () => {
  toast.info("Processing pipeline for outlier data...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  const todayStr = new Date().toISOString().split('T')[0];
  const { error } = await supabase.functions.invoke('aggregate-daily-summary', {
    body: { date: todayStr }
  });

  if (error) {
    toast.error(`Pipeline processing failed: ${error.message}`);
  } else {
    toast.success('Outlier data pipeline completed');
  }
};

-- PHASE 1: Critical RLS DELETE Policy Implementation
-- Add missing DELETE policies to ensure proper data access control

-- 1. Add DELETE policy for user_profile table
CREATE POLICY "Users can delete their own profile" 
  ON public.user_profile 
  FOR DELETE 
  USING (auth.uid() = id);

-- 2. Add DELETE policy for sensor_samples table  
CREATE POLICY "Users can delete their own sensor samples" 
  ON public.sensor_samples 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Add DELETE policy for daily_summary table
CREATE POLICY "Users can delete their own daily summaries" 
  ON public.daily_summary 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Add DELETE policy for alert_settings table
CREATE POLICY "Users can delete their own alert settings" 
  ON public.alert_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Add DELETE policy for bug_reports table
CREATE POLICY "Users can delete their own bug reports" 
  ON public.bug_reports 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Add DELETE policy for feature_flags table
CREATE POLICY "Users can delete their own feature flags" 
  ON public.feature_flags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 7. Clean up duplicate policies in medical_docs table
-- Drop the duplicate policies from the later migration
DROP POLICY IF EXISTS "Users can view their own medical documents" ON public.medical_docs;
DROP POLICY IF EXISTS "Users can insert their own medical documents" ON public.medical_docs;
DROP POLICY IF EXISTS "Users can delete their own medical documents" ON public.medical_docs;
DROP POLICY IF EXISTS "Users can update their own medical documents" ON public.medical_docs;

-- The original policies from migration 20250615155058 remain:
-- - "Users can view their own medical docs"
-- - "Users can create their own medical docs" 
-- - "Users can update their own medical docs"
-- - "Users can delete their own medical docs"

-- Create baseline_metrics table
CREATE TABLE public.baseline_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE UNIQUE,
  sleep_mean numeric,
  sleep_sd numeric,
  steps_mean numeric,
  steps_sd numeric,
  unlocks_mean numeric,
  unlocks_sd numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.baseline_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policy for SELECT - users can view their own baseline metrics
CREATE POLICY "Users can view their own baseline metrics" 
  ON public.baseline_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS policy for UPDATE - users can update their own baseline metrics
CREATE POLICY "Users can update their own baseline metrics" 
  ON public.baseline_metrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policy for INSERT - users can insert their own baseline metrics
CREATE POLICY "Users can insert their own baseline metrics" 
  ON public.baseline_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policy for DELETE - users can delete their own baseline metrics
CREATE POLICY "Users can delete their own baseline metrics" 
  ON public.baseline_metrics 
  FOR DELETE 
  USING (auth.uid() = user_id);

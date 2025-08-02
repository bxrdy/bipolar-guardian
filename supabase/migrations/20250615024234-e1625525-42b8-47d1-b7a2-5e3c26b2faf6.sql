
-- Create bug_reports table for error tracking
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  os TEXT,
  app_version TEXT,
  user_agent TEXT,
  url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert their own bug reports
CREATE POLICY "Users can insert their own bug reports" 
  ON public.bug_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Create policy for authenticated users to view their own bug reports
CREATE POLICY "Users can view their own bug reports" 
  ON public.bug_reports 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Add index for better performance
CREATE INDEX idx_bug_reports_user_id ON public.bug_reports(user_id);
CREATE INDEX idx_bug_reports_timestamp ON public.bug_reports(timestamp);

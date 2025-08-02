
-- 1. Create user_profile table
-- This table will store user profile information.
-- The 'id' column is linked to the 'auth.users' table to associate profiles with authenticated users.
CREATE TABLE public.user_profile (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  email text UNIQUE,
  baseline_ready boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for user_profile
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profile
-- Users can only view their own profile.
CREATE POLICY "Users can view their own profile" ON public.user_profile
FOR SELECT USING (auth.uid() = id);

-- Users can only insert their own profile.
CREATE POLICY "Users can insert their own profile" ON public.user_profile
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile.
CREATE POLICY "Users can update their own profile" ON public.user_profile
FOR UPDATE USING (auth.uid() = id);


-- 2. Create sensor_samples table
-- This table stores raw sensor data collected for each user.
CREATE TABLE public.sensor_samples (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  "timestamp" timestamp with time zone,
  metric_type text,
  metric_value numeric
);

-- Enable RLS for sensor_samples
ALTER TABLE public.sensor_samples ENABLE ROW LEVEL SECURITY;

-- RLS policies for sensor_samples
-- Users can only view their own sensor samples.
CREATE POLICY "Users can view their own sensor samples" ON public.sensor_samples
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own sensor samples.
CREATE POLICY "Users can insert their own sensor samples" ON public.sensor_samples
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own sensor samples.
CREATE POLICY "Users can update their own sensor samples" ON public.sensor_samples
FOR UPDATE USING (auth.uid() = user_id);


-- 3. Create daily_summary table
-- Create an ENUM type for the risk level to ensure data integrity.
CREATE TYPE public.risk_level_enum AS ENUM ('green', 'amber', 'red');

-- This table will store aggregated daily data for each user.
CREATE TABLE public.daily_summary (
  "date" date NOT NULL,
  user_id uuid NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  sleep_hours numeric,
  steps integer,
  typing_score numeric,
  risk_level public.risk_level_enum,
  PRIMARY KEY ("date", user_id)
);

-- Enable RLS for daily_summary
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_summary
-- Users can only view their own daily summaries.
CREATE POLICY "Users can view their own daily summaries" ON public.daily_summary
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own daily summaries.
CREATE POLICY "Users can insert their own daily summaries" ON public.daily_summary
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own daily summaries.
CREATE POLICY "Users can update their own daily summaries" ON public.daily_summary
FOR UPDATE USING (auth.uid() = user_id);


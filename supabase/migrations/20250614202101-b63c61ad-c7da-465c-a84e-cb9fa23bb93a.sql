
-- Add new boolean columns to user_profile for data collection preferences
ALTER TABLE public.user_profile 
ADD COLUMN collect_sleep boolean DEFAULT true,
ADD COLUMN collect_activity boolean DEFAULT true,
ADD COLUMN collect_screen boolean DEFAULT true;

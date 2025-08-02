
-- Add a new column to store journal text content
ALTER TABLE public.sensor_samples 
ADD COLUMN content TEXT;


-- Migrate existing journal entries from sensor_samples to mood_entries
INSERT INTO public.mood_entries (
  user_id,
  mood,
  energy,
  stress,
  anxiety,
  notes,
  created_at
)
SELECT 
  user_id,
  5 as mood,        -- Default neutral mood
  3 as energy,      -- Default moderate energy
  3 as stress,      -- Default moderate stress
  3 as anxiety,     -- Default moderate anxiety
  content as notes, -- Move journal content to notes field
  timestamp as created_at
FROM public.sensor_samples 
WHERE metric_type = 'journal' 
AND content IS NOT NULL;

-- Remove the content column from sensor_samples table
ALTER TABLE public.sensor_samples DROP COLUMN content;

-- Clean up any journal entries from sensor_samples
DELETE FROM public.sensor_samples WHERE metric_type = 'journal';

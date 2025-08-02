
-- Create a dedicated mood_entries table with proper column structure
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 5),
  stress INTEGER NOT NULL CHECK (stress >= 1 AND stress <= 5),
  anxiety INTEGER NOT NULL CHECK (anxiety >= 1 AND anxiety <= 5),
  activities TEXT[], -- Array of activity strings
  location TEXT,
  social_situation TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mood_entries
CREATE POLICY "Users can view their own mood entries" 
  ON public.mood_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries" 
  ON public.mood_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" 
  ON public.mood_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" 
  ON public.mood_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for better query performance
CREATE INDEX idx_mood_entries_user_created ON public.mood_entries(user_id, created_at DESC);

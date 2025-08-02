
-- Create a table for storing user passcodes
CREATE TABLE public.user_passcodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  passcode_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_passcodes ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own passcode" 
  ON public.user_passcodes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passcode" 
  ON public.user_passcodes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passcode" 
  ON public.user_passcodes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passcode" 
  ON public.user_passcodes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add a column to user_profile to track if passcode login is enabled
ALTER TABLE public.user_profile 
ADD COLUMN passcode_login_enabled BOOLEAN DEFAULT false;

-- Add a column to track last unlock time for auto-lock functionality
ALTER TABLE public.user_profile 
ADD COLUMN last_unlock_time TIMESTAMP WITH TIME ZONE;

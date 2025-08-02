
-- Add AI medical summary field to user_profile table
ALTER TABLE public.user_profile 
ADD COLUMN ai_medical_summary JSONB,
ADD COLUMN ai_insights_generated_at TIMESTAMP WITH TIME ZONE;

-- Create feature_flags table for AI context toggle
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  ai_context_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on feature_flags table
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feature_flags
CREATE POLICY "Users can view their own feature flags" 
  ON public.feature_flags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature flags" 
  ON public.feature_flags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature flags" 
  ON public.feature_flags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to auto-insert feature flags for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_feature_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.feature_flags (user_id, ai_context_enabled)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create feature flags for new users
CREATE TRIGGER on_user_profile_created_feature_flags
  AFTER INSERT ON public.user_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_feature_flags();

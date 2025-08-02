
-- Create a table to track alert snooze settings
CREATE TABLE public.alert_settings (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  alert_snooze_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for alert_settings
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for alert_settings
CREATE POLICY "Users can view their own alert settings" ON public.alert_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert settings" ON public.alert_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings" ON public.alert_settings
FOR UPDATE USING (auth.uid() = user_id);

-- Create a unique constraint to ensure one record per user
CREATE UNIQUE INDEX alert_settings_user_id_idx ON public.alert_settings(user_id);

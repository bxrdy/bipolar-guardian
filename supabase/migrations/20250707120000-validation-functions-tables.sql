-- Create validation_results table for storing validation metrics
CREATE TABLE IF NOT EXISTS public.validation_results (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.medical_docs(id) ON DELETE SET NULL,
  validation_type text NOT NULL CHECK (validation_type IN (
    'document_accuracy', 'medical_terminology', 'chat_context', 
    'therapeutic_response', 'safety_validation'
  )),
  accuracy_score numeric CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_time integer, -- milliseconds
  metrics jsonb, -- detailed metrics specific to validation type
  issues text[], -- array of detected issues
  recommendations text[], -- array of recommendations
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for validation_results
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for validation_results
CREATE POLICY "Users can view their own validation results" ON public.validation_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own validation results" ON public.validation_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own validation results" ON public.validation_results
FOR UPDATE USING (auth.uid() = user_id);

-- Create critical_safety_events table for emergency situations
CREATE TABLE IF NOT EXISTS public.critical_safety_events (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  immediate_action boolean DEFAULT false,
  emergency_response boolean DEFAULT false,
  detected_issues jsonb,
  action_items text[],
  content_type text,
  resolved boolean DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for critical_safety_events
ALTER TABLE public.critical_safety_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for critical_safety_events (restricted access)
CREATE POLICY "Users can view their own safety events" ON public.critical_safety_events
FOR SELECT USING (auth.uid() = user_id);

-- Only allow service role to insert critical safety events
CREATE POLICY "Service role can insert safety events" ON public.critical_safety_events
FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_validation_results_user_id ON public.validation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_type ON public.validation_results(validation_type);
CREATE INDEX IF NOT EXISTS idx_validation_results_created_at ON public.validation_results(created_at);
CREATE INDEX IF NOT EXISTS idx_validation_results_document_id ON public.validation_results(document_id);

CREATE INDEX IF NOT EXISTS idx_critical_safety_events_user_id ON public.critical_safety_events(user_id);
CREATE INDEX IF NOT EXISTS idx_critical_safety_events_risk_level ON public.critical_safety_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_critical_safety_events_created_at ON public.critical_safety_events(created_at);
CREATE INDEX IF NOT EXISTS idx_critical_safety_events_resolved ON public.critical_safety_events(resolved);

-- Add trigger for updated_at on validation_results
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_validation_results_updated_at 
  BEFORE UPDATE ON public.validation_results 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.validation_results TO authenticated;
GRANT SELECT, INSERT ON public.critical_safety_events TO authenticated;
GRANT ALL ON public.validation_results TO service_role;
GRANT ALL ON public.critical_safety_events TO service_role;
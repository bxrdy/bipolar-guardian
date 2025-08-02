
-- Create trusted contacts table
CREATE TABLE public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profile(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'declined')),
  notification_preferences JSONB DEFAULT '{"crisis": true, "check_in": true, "updates": false}'::jsonb,
  crisis_priority_level INTEGER DEFAULT 2 CHECK (crisis_priority_level BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact verification tokens table
CREATE TABLE public.contact_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.trusted_contacts(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for trusted_contacts
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trusted contacts" 
  ON public.trusted_contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trusted contacts" 
  ON public.trusted_contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trusted contacts" 
  ON public.trusted_contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trusted contacts" 
  ON public.trusted_contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for contact_verification_tokens
ALTER TABLE public.contact_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verification tokens for their contacts" 
  ON public.contact_verification_tokens 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.trusted_contacts tc 
    WHERE tc.id = contact_verification_tokens.contact_id 
    AND tc.user_id = auth.uid()
  ));

CREATE POLICY "Service role can manage verification tokens" 
  ON public.contact_verification_tokens 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Add updated_at trigger for trusted_contacts
CREATE TRIGGER update_trusted_contacts_updated_at
  BEFORE UPDATE ON public.trusted_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  med_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create med_intake_logs table
CREATE TABLE public.med_intake_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  med_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  was_missed BOOLEAN NOT NULL DEFAULT false
);

-- Create medical_docs table
CREATE TABLE public.medical_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profile(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  extracted_text TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications table
CREATE POLICY "Users can view their own medications" 
  ON public.medications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications" 
  ON public.medications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" 
  ON public.medications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" 
  ON public.medications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for med_intake_logs table
CREATE POLICY "Users can view their own intake logs" 
  ON public.med_intake_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own intake logs" 
  ON public.med_intake_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intake logs" 
  ON public.med_intake_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intake logs" 
  ON public.med_intake_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for medical_docs table
CREATE POLICY "Users can view their own medical docs" 
  ON public.medical_docs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medical docs" 
  ON public.medical_docs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical docs" 
  ON public.medical_docs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical docs" 
  ON public.medical_docs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_medications_user_id ON public.medications(user_id);
CREATE INDEX idx_med_intake_logs_user_id ON public.med_intake_logs(user_id);
CREATE INDEX idx_med_intake_logs_med_id ON public.med_intake_logs(med_id);
CREATE INDEX idx_medical_docs_user_id ON public.medical_docs(user_id);
CREATE INDEX idx_medical_docs_doc_type ON public.medical_docs(doc_type);

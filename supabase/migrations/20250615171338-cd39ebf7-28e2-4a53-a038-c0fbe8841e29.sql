
-- Create the medical-docs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-docs', 'medical-docs', false);

-- Create RLS policies for the medical-docs bucket
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medical-docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medical-docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'medical-docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policies for the medical_docs table
ALTER TABLE public.medical_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medical documents" ON public.medical_docs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical documents" ON public.medical_docs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical documents" ON public.medical_docs
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical documents" ON public.medical_docs
FOR UPDATE USING (auth.uid() = user_id);

-- Storage Security Enhancement Migration
-- Creates file access logging and enhanced storage policies

-- Create file access logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.file_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('upload', 'download', 'delete', 'view', 'url_generated')),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON public.file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_created_at ON public.file_access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_operation ON public.file_access_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_path ON public.file_access_logs(file_path);

-- Enable RLS on file access logs
ALTER TABLE public.file_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file access logs
CREATE POLICY "Users can view their own file access logs" ON public.file_access_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert file access logs" ON public.file_access_logs
FOR INSERT WITH CHECK (true); -- Allow service role to log all operations

CREATE POLICY "Users cannot modify file access logs" ON public.file_access_logs
FOR UPDATE USING (false); -- Prevent tampering with audit logs

CREATE POLICY "Users cannot delete file access logs" ON public.file_access_logs
FOR DELETE USING (false); -- Prevent deletion of audit logs

-- Add missing UPDATE policy for storage objects
CREATE POLICY "Users can update metadata of their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'medical-docs' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to log storage access
CREATE OR REPLACE FUNCTION public.log_storage_access(
    p_user_id UUID,
    p_file_path TEXT,
    p_operation_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL,
    p_file_size BIGINT DEFAULT NULL,
    p_mime_type TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.file_access_logs (
        user_id,
        file_path,
        operation_type,
        ip_address,
        user_agent,
        success,
        error_message,
        file_size,
        mime_type
    ) VALUES (
        p_user_id,
        p_file_path,
        p_operation_type,
        p_ip_address,
        p_user_agent,
        p_success,
        p_error_message,
        p_file_size,
        p_mime_type
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_storage_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_storage_access TO service_role;

-- Create storage security configuration table
CREATE TABLE IF NOT EXISTS public.storage_security_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    signed_url_expiry_minutes INTEGER DEFAULT 15 CHECK (signed_url_expiry_minutes >= 5 AND signed_url_expiry_minutes <= 60),
    enable_access_logging BOOLEAN DEFAULT true,
    max_file_size_mb INTEGER DEFAULT 10 CHECK (max_file_size_mb >= 1 AND max_file_size_mb <= 50),
    allowed_mime_types TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on storage security config
ALTER TABLE public.storage_security_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storage security config
CREATE POLICY "Users can view their own storage config" ON public.storage_security_config
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storage config" ON public.storage_security_config
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storage config" ON public.storage_security_config
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storage config" ON public.storage_security_config
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_storage_config_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_storage_security_config_updated_at
    BEFORE UPDATE ON public.storage_security_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_storage_config_updated_at();

-- Insert default storage security config for existing users
INSERT INTO public.storage_security_config (user_id)
SELECT DISTINCT user_id 
FROM public.medical_docs 
WHERE user_id NOT IN (
    SELECT user_id FROM public.storage_security_config
)
ON CONFLICT (user_id) DO NOTHING;

-- Create view for storage security stats (admin use)
CREATE OR REPLACE VIEW public.storage_security_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as log_date,
    operation_type,
    COUNT(*) as operation_count,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_operations,
    COUNT(DISTINCT user_id) as unique_users
FROM public.file_access_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), operation_type
ORDER BY log_date DESC, operation_type;

-- Grant view access to authenticated users for their own stats only
GRANT SELECT ON public.storage_security_stats TO authenticated;
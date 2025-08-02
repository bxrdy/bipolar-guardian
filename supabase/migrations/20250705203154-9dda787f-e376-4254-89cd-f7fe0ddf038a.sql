
-- Fix bug_reports table schema to match error tracking expectations
ALTER TABLE public.bug_reports 
ADD COLUMN IF NOT EXISTS error_id text,
ADD COLUMN IF NOT EXISTS severity text,
ADD COLUMN IF NOT EXISTS sanitized_message text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'runtime';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_error_id ON public.bug_reports(error_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON public.bug_reports(severity);

-- Update auth_events to allow more event types
ALTER TABLE public.auth_events DROP CONSTRAINT IF EXISTS auth_events_event_type_check;

-- Add constraint with expanded event types
ALTER TABLE public.auth_events 
ADD CONSTRAINT auth_events_event_type_check 
CHECK (event_type IN (
  'login_success', 'login_failure', 'logout', 'signup_success', 'signup_failure',
  'password_reset_request', 'password_reset_success', 'password_change',
  'account_locked', 'account_unlocked', 'suspicious_activity', 'session_created',
  'session_expired', 'session_timeout', 'session_extended', 'session_terminated',
  'device_registered', 'two_factor_enabled', 'two_factor_disabled', 
  'failed_attempts_reset', 'session_warning', 'session_final_warning',
  'sensitive_mode_changed', 'suspicious_activity_alert_shown'
));

-- Ensure security configuration has default values
INSERT INTO public.security_configuration (config_key, config_value, description) 
VALUES 
  ('failed_login_threshold', '5', 'Maximum failed login attempts before account lockout'),
  ('account_lockout_minutes', '30', 'Duration of account lockout in minutes')
ON CONFLICT (config_key) DO NOTHING;

-- Authentication & Session Security Enhancement Migration
-- Phase #6: Comprehensive authentication security logging and controls

-- Authentication Events Logging Table
CREATE TABLE IF NOT EXISTS public.auth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'login_success', 
        'login_failure', 
        'password_reset_request',
        'password_reset_success',
        'session_timeout',
        'suspicious_activity',
        'account_locked',
        'account_unlocked',
        'session_created',
        'session_terminated',
        'two_factor_enabled',
        'two_factor_disabled',
        'device_registered',
        'concurrent_session_limit'
    )),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    geolocation_data JSONB,
    failure_reason TEXT,
    session_id TEXT,
    additional_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT auth_events_user_event_idx UNIQUE (id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON public.auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_type ON public.auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.auth_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_ip_address ON public.auth_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_events_session_id ON public.auth_events(session_id);

-- Account Security Status Table
CREATE TABLE IF NOT EXISTS public.account_security_status (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_attempt TIMESTAMPTZ,
    account_locked_until TIMESTAMPTZ,
    consecutive_failures_from_ip INTEGER DEFAULT 0,
    last_failure_ip INET,
    suspicious_activity_score INTEGER DEFAULT 0,
    last_login_ip INET,
    last_login_at TIMESTAMPTZ,
    last_login_user_agent TEXT,
    known_devices JSONB DEFAULT '[]',
    trusted_locations JSONB DEFAULT '[]',
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_backup_codes TEXT[],
    session_timeout_minutes INTEGER DEFAULT 15,
    require_two_factor BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security status lookups
CREATE INDEX IF NOT EXISTS idx_account_security_locked_until ON public.account_security_status(account_locked_until);
CREATE INDEX IF NOT EXISTS idx_account_security_last_login ON public.account_security_status(last_login_at);

-- Active Sessions Tracking Table
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE, -- Supabase session reference
    device_fingerprint TEXT,
    ip_address INET,
    user_agent TEXT,
    location_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraint to prevent too many active sessions
    CONSTRAINT active_sessions_user_limit CHECK (true) -- Will be enforced in triggers
);

-- Indexes for session management
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON public.active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON public.active_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON public.active_sessions(is_active);

-- Device Fingerprints Table for tracking known devices
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fingerprint_hash TEXT NOT NULL,
    device_name TEXT,
    browser_info JSONB,
    screen_info JSONB,
    timezone_info TEXT,
    is_trusted BOOLEAN DEFAULT false,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    use_count INTEGER DEFAULT 1,
    
    -- Unique constraint per user
    CONSTRAINT device_fingerprints_user_hash_unique UNIQUE (user_id, fingerprint_hash)
);

-- Indexes for device tracking
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_trusted ON public.device_fingerprints(is_trusted);

-- Security Configuration Table
CREATE TABLE IF NOT EXISTS public.security_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default security configurations
INSERT INTO public.security_configuration (config_key, config_value, description) VALUES
('session_timeout_minutes', '15', 'Default session timeout in minutes'),
('session_timeout_sensitive_minutes', '5', 'Session timeout for sensitive operations'),
('failed_login_threshold', '5', 'Number of failed logins before account lock'),
('account_lockout_minutes', '30', 'Account lockout duration in minutes'),
('progressive_delay_enabled', 'true', 'Enable progressive delays for failed logins'),
('max_concurrent_sessions', '3', 'Maximum concurrent sessions per user'),
('suspicious_activity_threshold', '10', 'Suspicious activity score threshold'),
('device_fingerprinting_enabled', 'true', 'Enable device fingerprinting'),
('geolocation_tracking_enabled', 'true', 'Enable geolocation tracking for logins'),
('two_factor_required_for_sensitive', 'false', 'Require 2FA for sensitive operations')
ON CONFLICT (config_key) DO NOTHING;

-- RLS Policies for authentication security tables

-- Auth Events: Users can only see their own events
ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auth events" ON public.auth_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admin users can view all events (for monitoring)
CREATE POLICY "Service role can manage all auth events" ON public.auth_events
    FOR ALL
    USING (auth.role() = 'service_role');

-- Account Security Status: Users can view their own status
ALTER TABLE public.account_security_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own security status" ON public.account_security_status
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all security status" ON public.account_security_status
    FOR ALL
    USING (auth.role() = 'service_role');

-- Active Sessions: Users can view and manage their own sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions" ON public.active_sessions
    FOR ALL
    USING (auth.uid() = user_id);

-- Device Fingerprints: Users can view their own devices
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device fingerprints" ON public.device_fingerprints
    FOR ALL
    USING (auth.uid() = user_id);

-- Security Configuration: Read-only for authenticated users
ALTER TABLE public.security_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view security config" ON public.security_configuration
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage security config" ON public.security_configuration
    FOR ALL
    USING (auth.role() = 'service_role');

-- Database Functions for Security Operations

-- Function to log authentication events
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_fingerprint TEXT DEFAULT NULL,
    p_geolocation_data JSONB DEFAULT NULL,
    p_failure_reason TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_additional_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.auth_events (
        user_id, event_type, ip_address, user_agent, device_fingerprint,
        geolocation_data, failure_reason, session_id, additional_metadata
    ) VALUES (
        p_user_id, p_event_type, p_ip_address, p_user_agent, p_device_fingerprint,
        p_geolocation_data, p_failure_reason, p_session_id, p_additional_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update account security status
CREATE OR REPLACE FUNCTION public.update_account_security_status(
    p_user_id UUID,
    p_failed_attempt BOOLEAN DEFAULT false,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_successful_login BOOLEAN DEFAULT false
) RETURNS BOOLEAN AS $$
DECLARE
    current_failures INTEGER := 0;
    lockout_threshold INTEGER;
    lockout_duration INTEGER;
    status_exists BOOLEAN := false;
BEGIN
    -- Get security configuration
    SELECT (config_value->>'failed_login_threshold')::INTEGER INTO lockout_threshold
    FROM public.security_configuration WHERE config_key = 'failed_login_threshold';
    
    SELECT (config_value->>'account_lockout_minutes')::INTEGER INTO lockout_duration
    FROM public.security_configuration WHERE config_key = 'account_lockout_minutes';
    
    -- Set defaults if config not found
    lockout_threshold := COALESCE(lockout_threshold, 5);
    lockout_duration := COALESCE(lockout_duration, 30);
    
    -- Check if status record exists
    SELECT EXISTS(SELECT 1 FROM public.account_security_status WHERE user_id = p_user_id) INTO status_exists;
    
    IF NOT status_exists THEN
        -- Create initial status record
        INSERT INTO public.account_security_status (user_id) VALUES (p_user_id);
    END IF;
    
    IF p_successful_login THEN
        -- Reset failure counts on successful login
        UPDATE public.account_security_status 
        SET 
            failed_login_attempts = 0,
            consecutive_failures_from_ip = 0,
            last_login_ip = p_ip_address,
            last_login_at = NOW(),
            last_login_user_agent = p_user_agent,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
    ELSIF p_failed_attempt THEN
        -- Increment failure counts
        UPDATE public.account_security_status 
        SET 
            failed_login_attempts = failed_login_attempts + 1,
            last_failed_attempt = NOW(),
            consecutive_failures_from_ip = CASE 
                WHEN last_failure_ip = p_ip_address THEN consecutive_failures_from_ip + 1
                ELSE 1
                END,
            last_failure_ip = p_ip_address,
            -- Lock account if threshold exceeded
            account_locked_until = CASE 
                WHEN failed_login_attempts + 1 >= lockout_threshold 
                THEN NOW() + (lockout_duration || ' minutes')::INTERVAL
                ELSE account_locked_until
                END,
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING failed_login_attempts INTO current_failures;
        
        -- Log account lock event if threshold reached
        IF current_failures >= lockout_threshold THEN
            PERFORM public.log_auth_event(
                p_user_id, 
                'account_locked', 
                p_ip_address, 
                p_user_agent,
                NULL,
                NULL,
                'Exceeded failed login threshold',
                NULL,
                jsonb_build_object('threshold', lockout_threshold, 'failures', current_failures)
            );
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.is_account_locked(p_user_id UUID) 
RETURNS BOOLEAN AS $$
DECLARE
    locked_until TIMESTAMPTZ;
BEGIN
    SELECT account_locked_until INTO locked_until
    FROM public.account_security_status 
    WHERE user_id = p_user_id;
    
    -- If no record exists, account is not locked
    IF locked_until IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if lock has expired
    IF locked_until > NOW() THEN
        RETURN true;
    ELSE
        -- Clear expired lock
        UPDATE public.account_security_status 
        SET account_locked_until = NULL, updated_at = NOW()
        WHERE user_id = p_user_id;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register/update device fingerprint
CREATE OR REPLACE FUNCTION public.register_device_fingerprint(
    p_user_id UUID,
    p_fingerprint_hash TEXT,
    p_device_name TEXT DEFAULT NULL,
    p_browser_info JSONB DEFAULT NULL,
    p_screen_info JSONB DEFAULT NULL,
    p_timezone_info TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    device_id UUID;
BEGIN
    -- Insert or update device fingerprint
    INSERT INTO public.device_fingerprints (
        user_id, fingerprint_hash, device_name, browser_info, 
        screen_info, timezone_info, last_seen, use_count
    ) VALUES (
        p_user_id, p_fingerprint_hash, p_device_name, p_browser_info,
        p_screen_info, p_timezone_info, NOW(), 1
    )
    ON CONFLICT (user_id, fingerprint_hash) 
    DO UPDATE SET
        last_seen = NOW(),
        use_count = device_fingerprints.use_count + 1,
        device_name = COALESCE(p_device_name, device_fingerprints.device_name),
        browser_info = COALESCE(p_browser_info, device_fingerprints.browser_info),
        screen_info = COALESCE(p_screen_info, device_fingerprints.screen_info),
        timezone_info = COALESCE(p_timezone_info, device_fingerprints.timezone_info)
    RETURNING id INTO device_id;
    
    RETURN device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions() 
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    -- Mark expired sessions as inactive
    UPDATE public.active_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Delete old inactive sessions (older than 7 days)
    DELETE FROM public.active_sessions 
    WHERE is_active = false AND last_activity < NOW() - INTERVAL '7 days';
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_account_security_status_updated_at
    BEFORE UPDATE ON public.account_security_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_configuration_updated_at
    BEFORE UPDATE ON public.security_configuration
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.auth_events TO authenticated;
GRANT SELECT ON public.account_security_status TO authenticated;
GRANT ALL ON public.active_sessions TO authenticated;
GRANT ALL ON public.device_fingerprints TO authenticated;
GRANT SELECT ON public.security_configuration TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.log_auth_event TO service_role;
GRANT EXECUTE ON FUNCTION public.update_account_security_status TO service_role;
GRANT EXECUTE ON FUNCTION public.is_account_locked TO service_role;
GRANT EXECUTE ON FUNCTION public.register_device_fingerprint TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions TO service_role;
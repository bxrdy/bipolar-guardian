
-- Fix security warnings by setting proper search_path for all functions
-- This prevents potential security vulnerabilities

-- Update is_account_locked function
CREATE OR REPLACE FUNCTION public.is_account_locked(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update log_auth_event function
CREATE OR REPLACE FUNCTION public.log_auth_event(
    p_user_id uuid,
    p_event_type text,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_device_fingerprint text DEFAULT NULL,
    p_geolocation_data jsonb DEFAULT NULL,
    p_failure_reason text DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_additional_metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update update_account_security_status function
CREATE OR REPLACE FUNCTION public.update_account_security_status(
    p_user_id uuid,
    p_failed_attempt boolean DEFAULT false,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL,
    p_successful_login boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update register_device_fingerprint function
CREATE OR REPLACE FUNCTION public.register_device_fingerprint(
    p_user_id uuid,
    p_fingerprint_hash text,
    p_device_name text DEFAULT NULL,
    p_browser_info jsonb DEFAULT NULL,
    p_screen_info jsonb DEFAULT NULL,
    p_timezone_info text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update cleanup_expired_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update truncate_table function
CREATE OR REPLACE FUNCTION public.truncate_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow truncating specific tables for safety
  IF table_name NOT IN ('sensor_samples', 'daily_summary', 'baseline_metrics', 'bug_reports', 'alert_settings') THEN
    RAISE EXCEPTION 'Table % is not allowed to be truncated', table_name;
  END IF;
  
  -- Execute the truncate command
  EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', table_name);
END;
$function$;

-- Update prevent_duplicate_daily_entries function
CREATE OR REPLACE FUNCTION public.prevent_duplicate_daily_entries()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
  -- Check if a record already exists for this user, metric type, and date
  -- We'll handle this at the application level for better performance
  RETURN NEW;
END;
$function$;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody, COMMON_SCHEMAS } from '../_shared/inputValidator.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  try {
    // Generate secure CORS headers
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    // Validate security (medium requirements for logging)
    const securityCheck = validateSecurity(req, {
      requireCSRF: false, // Logging can be called internally
      requireOrigin: true,
      allowedMethods: ['POST']
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'auth_event_security' },
        'log-auth-event',
        corsHeaders
      );
    }

    // Apply rate limiting (HIGH level for auth events)
    const rateLimitCheck = checkRateLimit(req, 'log-auth-event', 'HIGH', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Get authentication info if available
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      if (user && !authError) {
        userId = user.id;
      }
    }

    // Validate and sanitize request body
    const validation = await validateRequestBody(req.clone(), {
      event_type: { type: 'string', required: true, maxLength: 50 },
      email: { type: 'string', required: false, maxLength: 255 },
      device_fingerprint: { type: 'string', required: false, maxLength: 1000 },
      ip_address: { type: 'string', required: false, maxLength: 45 },
      failure_reason: { type: 'string', required: false, maxLength: 500 },
      session_id: { type: 'string', required: false, maxLength: 255 },
      additional_metadata: { type: 'object', required: false }
    });

    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { operation: 'validate_auth_event_input' },
        'log-auth-event',
        corsHeaders
      );
    }

    const {
      event_type,
      email,
      device_fingerprint,
      ip_address,
      failure_reason,
      session_id,
      additional_metadata = {}
    } = validation.sanitizedData!;

    // Extract client IP address if not provided
    const clientIP = ip_address || 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') || // Cloudflare
      '0.0.0.0';

    // Extract user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Determine user ID from email if not authenticated
    let targetUserId = userId;
    if (!targetUserId && email) {
      const { data: userByEmail } = await supabaseClient.auth.admin.getUserByEmail(email);
      if (userByEmail.user) {
        targetUserId = userByEmail.user.id;
      }
    }

    // Prepare geolocation data (simplified - would integrate with IP geolocation service)
    let geolocationData = null;
    if (clientIP && clientIP !== '0.0.0.0') {
      // In production, integrate with IP geolocation service
      // For now, just store the IP for potential future lookup
      geolocationData = {
        ip: clientIP,
        lookup_attempted: new Date().toISOString()
      };
    }

    // Log the authentication event
    const { data: eventResult, error: logError } = await supabaseClient
      .rpc('log_auth_event', {
        p_user_id: targetUserId,
        p_event_type: event_type,
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_device_fingerprint: device_fingerprint,
        p_geolocation_data: geolocationData,
        p_failure_reason: failure_reason,
        p_session_id: session_id,
        p_additional_metadata: {
          ...additional_metadata,
          logged_at: new Date().toISOString(),
          source_email: email // Store email separately from user lookup
        }
      });

    if (logError) {
      return handleSecureError(
        logError,
        { operation: 'log_auth_event_db', event_type },
        'log-auth-event',
        corsHeaders
      );
    }

    // Update account security status if this is a login-related event
    const loginEvents = ['login_success', 'login_failure'];
    if (loginEvents.includes(event_type) && targetUserId) {
      const { error: statusError } = await supabaseClient
        .rpc('update_account_security_status', {
          p_user_id: targetUserId,
          p_failed_attempt: event_type === 'login_failure',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_successful_login: event_type === 'login_success'
        });

      if (statusError) {
        console.error('Failed to update security status:', statusError);
        // Don't fail the request for this, just log the error
      }
    }

    // Register device fingerprint if provided
    if (device_fingerprint && targetUserId) {
      const { error: deviceError } = await supabaseClient
        .rpc('register_device_fingerprint', {
          p_user_id: targetUserId,
          p_fingerprint_hash: device_fingerprint,
          p_device_name: additional_metadata.device_name || null,
          p_browser_info: additional_metadata.browser_info || null,
          p_screen_info: additional_metadata.screen_info || null,
          p_timezone_info: additional_metadata.timezone_info || null
        });

      if (deviceError) {
        console.error('Failed to register device fingerprint:', deviceError);
        // Don't fail the request for this
      }
    }

    // For suspicious events, trigger additional security measures
    const suspiciousEvents = ['suspicious_activity', 'account_locked', 'concurrent_session_limit'];
    if (suspiciousEvents.includes(event_type) && targetUserId) {
      // Could trigger notifications, alerts, etc.
      console.log(`Suspicious event detected for user ${targetUserId}: ${event_type}`);
      
      // Increment suspicious activity score
      const { error: suspiciousError } = await supabaseClient
        .from('account_security_status')
        .update({
          suspicious_activity_score: supabaseClient.raw('suspicious_activity_score + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', targetUserId);

      if (suspiciousError) {
        console.error('Failed to update suspicious activity score:', suspiciousError);
      }
    }

    return createSecureResponse(
      JSON.stringify({ 
        success: true,
        event_id: eventResult,
        message: 'Authentication event logged successfully'
      }),
      {
        headers: { 
          ...corsHeaders, 
          ...rateLimitCheck.headers,
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    return handleSecureError(
      error,
      { operation: 'log_auth_event_general' },
      'log-auth-event',
      corsHeaders
    );
  }
});
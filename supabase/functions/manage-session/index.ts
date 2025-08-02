
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getSecureCORSHeaders } from '../_shared/cors.ts';
import { handleSecureError } from '../_shared/errorHandler.ts';
import { validateSecurity, createSecureResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { validateRequestBody } from '../_shared/inputValidator.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SessionRequest {
  action: 'create' | 'update' | 'terminate' | 'cleanup' | 'list';
  session_token?: string;
  device_fingerprint?: string;
  metadata?: {
    device_name?: string;
    location?: string;
    timeout_minutes?: number;
  };
}

serve(async (req) => {
  try {
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    const securityCheck = validateSecurity(req, {
      requireCSRF: false,
      requireOrigin: true,
      allowedMethods: ['POST']
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'session_management_security' },
        'manage-session',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'manage-session', 'HIGH', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Get authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return handleSecureError(
        new Error('Missing authorization header'),
        { operation: 'session_auth_check' },
        'manage-session',
        corsHeaders
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return handleSecureError(
        authError || new Error('Invalid user token'),
        { operation: 'session_user_validation' },
        'manage-session',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), {
      action: { type: 'string', required: true, maxLength: 20 },
      session_token: { type: 'string', required: false, maxLength: 255 },
      device_fingerprint: { type: 'string', required: false, maxLength: 1000 },
      metadata: { type: 'object', required: false }
    });

    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { operation: 'session_input_validation' },
        'manage-session',
        corsHeaders
      );
    }

    const { action, session_token, device_fingerprint, metadata = {} } = validation.sanitizedData!;

    // Extract client information
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    switch (action) {
      case 'create': {
        if (!session_token) {
          return handleSecureError(
            new Error('Session token required for create action'),
            { operation: 'session_create_validation' },
            'manage-session',
            corsHeaders
          );
        }

        // Check concurrent session limit
        const { data: activeSessions } = await supabaseClient
          .from('active_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        const maxSessions = 5; // Default limit
        if (activeSessions && activeSessions.length >= maxSessions) {
          // Terminate oldest session
          const { data: oldestSession } = await supabaseClient
            .from('active_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (oldestSession) {
            await supabaseClient
              .from('active_sessions')
              .update({ is_active: false })
              .eq('id', oldestSession.id);

            // Log session termination
            await supabaseClient.rpc('log_auth_event', {
              p_user_id: user.id,
              p_event_type: 'session_terminated',
              p_ip_address: clientIP,
              p_user_agent: userAgent,
              p_additional_metadata: {
                reason: 'concurrent_session_limit',
                terminated_session_id: oldestSession.id
              }
            });
          }
        }

        // Create new session
        const sessionTimeout = metadata.timeout_minutes || 60; // Default 1 hour
        const expiresAt = new Date(Date.now() + sessionTimeout * 60 * 1000);

        const { data: newSession, error: sessionError } = await supabaseClient
          .from('active_sessions')
          .insert({
            user_id: user.id,
            session_token,
            device_fingerprint,
            ip_address: clientIP,
            user_agent: userAgent,
            location_data: metadata.location ? { location: metadata.location } : null,
            expires_at: expiresAt.toISOString(),
            is_active: true
          })
          .select()
          .single();

        if (sessionError) {
          return handleSecureError(
            sessionError,
            { operation: 'session_create_db' },
            'manage-session',
            corsHeaders
          );
        }

        // Log session creation
        await supabaseClient.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event_type: 'session_created',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_session_id: newSession.id,
          p_device_fingerprint: device_fingerprint,
          p_additional_metadata: {
            expires_at: expiresAt.toISOString(),
            timeout_minutes: sessionTimeout
          }
        });

        return createSecureResponse(
          JSON.stringify({
            success: true,
            session: newSession,
            message: 'Session created successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!session_token) {
          return handleSecureError(
            new Error('Session token required for update action'),
            { operation: 'session_update_validation' },
            'manage-session',
            corsHeaders
          );
        }

        // Update session activity
        const { error: updateError } = await supabaseClient
          .from('active_sessions')
          .update({
            last_activity: new Date().toISOString(),
            ip_address: clientIP,
            user_agent: userAgent
          })
          .eq('session_token', session_token)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (updateError) {
          return handleSecureError(
            updateError,
            { operation: 'session_update_db' },
            'manage-session',
            corsHeaders
          );
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            message: 'Session updated successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'terminate': {
        let whereClause = { user_id: user.id, is_active: true };
        
        if (session_token) {
          whereClause = { ...whereClause, session_token };
        }

        const { error: terminateError } = await supabaseClient
          .from('active_sessions')
          .update({ is_active: false })
          .match(whereClause);

        if (terminateError) {
          return handleSecureError(
            terminateError,
            { operation: 'session_terminate_db' },
            'manage-session',
            corsHeaders
          );
        }

        // Log session termination
        await supabaseClient.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event_type: 'session_terminated',
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_session_id: session_token,
          p_additional_metadata: {
            reason: 'user_initiated',
            terminated_all: !session_token
          }
        });

        return createSecureResponse(
          JSON.stringify({
            success: true,
            message: session_token ? 'Session terminated successfully' : 'All sessions terminated successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'cleanup': {
        // Clean up expired sessions
        const { error: cleanupError } = await supabaseClient
          .from('active_sessions')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .lt('expires_at', new Date().toISOString());

        if (cleanupError) {
          return handleSecureError(
            cleanupError,
            { operation: 'session_cleanup_db' },
            'manage-session',
            corsHeaders
          );
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            message: 'Expired sessions cleaned up successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const { data: sessions, error: listError } = await supabaseClient
          .from('active_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('last_activity', { ascending: false });

        if (listError) {
          return handleSecureError(
            listError,
            { operation: 'session_list_db' },
            'manage-session',
            corsHeaders
          );
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            sessions: sessions || [],
            count: sessions?.length || 0
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return handleSecureError(
          new Error('Invalid action specified'),
          { operation: 'session_invalid_action' },
          'manage-session',
          corsHeaders
        );
    }

  } catch (error) {
    return handleSecureError(
      error,
      { operation: 'session_management_general' },
      'manage-session',
      corsHeaders
    );
  }
});

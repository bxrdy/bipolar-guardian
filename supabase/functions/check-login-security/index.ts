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

interface SecurityCheckResult {
  success: boolean;
  isLocked: boolean;
  lockoutRemaining?: number;
  attemptsRemaining?: number;
  requiresCaptcha: boolean;
  suspiciousActivity: boolean;
  message: string;
  riskScore: number;
}

serve(async (req) => {
  try {
    // Generate secure CORS headers
    const corsHeaders = getSecureCORSHeaders(req);
    
    if (req.method === 'OPTIONS') {
      return createSecureResponse(null, { headers: corsHeaders });
    }

    // Validate security (medium requirements for security check)
    const securityCheck = validateSecurity(req, {
      requireCSRF: false, // Pre-login check doesn't have CSRF token yet
      requireOrigin: true,
      allowedMethods: ['POST']
    });
    
    if (!securityCheck.valid) {
      return handleSecureError(
        new Error(securityCheck.error || 'Security validation failed'),
        { operation: 'login_security_check_security' },
        'check-login-security',
        corsHeaders
      );
    }

    // Apply rate limiting (HIGH level for security checks)
    const rateLimitCheck = checkRateLimit(req, 'check-login-security', 'HIGH', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Validate and sanitize request body
    const validation = await validateRequestBody(req.clone(), {
      email: { type: 'string', required: true, maxLength: 255 },
      device_fingerprint: { type: 'string', required: false, maxLength: 1000 },
      client_info: { type: 'object', required: false }
    });

    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { operation: 'validate_security_check_input' },
        'check-login-security',
        corsHeaders
      );
    }

    const { email, device_fingerprint, client_info = {} } = validation.sanitizedData!;

    // Extract client information
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      '0.0.0.0';
    
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Get user by email to check security status
    const { data: userByEmail } = await supabaseClient.auth.admin.getUserByEmail(email);
    
    if (!userByEmail.user) {
      // User doesn't exist - still perform some checks to avoid enumeration
      return createSecureResponse(
        JSON.stringify({
          success: true,
          isLocked: false,
          requiresCaptcha: false,
          suspiciousActivity: false,
          message: 'Security check passed',
          riskScore: 0
        } as SecurityCheckResult),
        {
          headers: { 
            ...corsHeaders, 
            ...rateLimitCheck.headers,
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    const userId = userByEmail.user.id;

    // Check account security status
    const { data: securityStatus } = await supabaseClient
      .from('account_security_status')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Check if account is locked
    const { data: isLockedResult } = await supabaseClient
      .rpc('is_account_locked', { p_user_id: userId });

    const isLocked = isLockedResult || false;
    let lockoutRemaining = 0;

    if (isLocked && securityStatus?.account_locked_until) {
      const lockoutTime = new Date(securityStatus.account_locked_until);
      const now = new Date();
      lockoutRemaining = Math.max(0, Math.floor((lockoutTime.getTime() - now.getTime()) / 1000));
    }

    // Determine if CAPTCHA is required
    const failedAttempts = securityStatus?.failed_login_attempts || 0;
    const requiresCaptcha = failedAttempts >= 3;

    // Calculate risk score based on various factors
    let riskScore = 0;

    // Recent failed attempts increase risk
    riskScore += Math.min(failedAttempts * 10, 50);

    // Suspicious activity score
    const suspiciousActivityScore = securityStatus?.suspicious_activity_score || 0;
    riskScore += Math.min(suspiciousActivityScore * 5, 30);

    // IP address analysis
    if (securityStatus?.last_login_ip && securityStatus.last_login_ip !== clientIP) {
      riskScore += 15; // Different IP than last successful login
    }

    // Device fingerprint analysis
    if (device_fingerprint && securityStatus) {
      const { data: knownDevices } = await supabaseClient
        .from('device_fingerprints')
        .select('fingerprint_hash, is_trusted, use_count')
        .eq('user_id', userId);

      const isKnownDevice = knownDevices?.some(device => 
        device.fingerprint_hash === device_fingerprint
      );

      if (!isKnownDevice) {
        riskScore += 20; // Unknown device
      } else {
        const deviceInfo = knownDevices.find(d => d.fingerprint_hash === device_fingerprint);
        if (deviceInfo && deviceInfo.is_trusted) {
          riskScore -= 10; // Trusted device reduces risk
        }
      }
    }

    // Time-based analysis
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if this is an unusual time based on past login patterns
    if (securityStatus?.last_login_at) {
      const lastLoginHour = new Date(securityStatus.last_login_at).getHours();
      const hourDifference = Math.abs(currentHour - lastLoginHour);
      
      if (hourDifference > 8) {
        riskScore += 10; // Unusual time pattern
      }
    }

    // Check for rapid repeated attempts
    if (securityStatus?.last_failed_attempt) {
      const timeSinceLastAttempt = now.getTime() - new Date(securityStatus.last_failed_attempt).getTime();
      if (timeSinceLastAttempt < 60000) { // Less than 1 minute
        riskScore += 25; // Rapid attempts
      }
    }

    // Geolocation analysis (simplified - would integrate with actual geolocation service)
    // For now, just check if it's a suspicious IP range or known VPN/proxy
    const suspiciousIPs = ['127.0.0.1', '0.0.0.0']; // Simplified list
    if (suspiciousIPs.includes(clientIP)) {
      riskScore += 15;
    }

    // Cap the risk score
    riskScore = Math.min(riskScore, 100);

    const suspiciousActivity = riskScore >= 40;

    // Log the security check
    await supabaseClient.rpc('log_auth_event', {
      p_user_id: userId,
      p_event_type: 'login_security_check',
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_device_fingerprint: device_fingerprint,
      p_additional_metadata: {
        risk_score: riskScore,
        failed_attempts: failedAttempts,
        is_locked: isLocked,
        requires_captcha: requiresCaptcha,
        suspicious_activity: suspiciousActivity,
        lockout_remaining: lockoutRemaining
      }
    });

    // Determine response message
    let message = 'Security check passed';
    if (isLocked) {
      message = `Account is locked. Try again in ${Math.ceil(lockoutRemaining / 60)} minutes.`;
    } else if (suspiciousActivity) {
      message = 'Suspicious activity detected. Additional verification may be required.';
    } else if (requiresCaptcha) {
      message = 'Please complete the security verification.';
    }

    const result: SecurityCheckResult = {
      success: !isLocked,
      isLocked,
      lockoutRemaining: isLocked ? lockoutRemaining : undefined,
      attemptsRemaining: isLocked ? 0 : Math.max(0, 5 - failedAttempts),
      requiresCaptcha,
      suspiciousActivity,
      message,
      riskScore
    };

    return createSecureResponse(
      JSON.stringify(result),
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
      { operation: 'check_login_security_general' },
      'check-login-security',
      corsHeaders
    );
  }
});
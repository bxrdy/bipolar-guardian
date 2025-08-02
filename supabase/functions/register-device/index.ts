
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

interface DeviceRequest {
  action: 'register' | 'update_trust' | 'update_name' | 'analyze_risk' | 'list';
  fingerprint_hash?: string;
  device_name?: string;
  is_trusted?: boolean;
  browser_info?: any;
  screen_info?: any;
  timezone_info?: string;
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
        { operation: 'device_security_validation' },
        'register-device',
        corsHeaders
      );
    }

    const rateLimitCheck = checkRateLimit(req, 'register-device', 'MEDIUM', corsHeaders);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!;
    }

    // Get authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return handleSecureError(
        new Error('Missing authorization header'),
        { operation: 'device_auth_check' },
        'register-device',
        corsHeaders
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return handleSecureError(
        authError || new Error('Invalid user token'),
        { operation: 'device_user_validation' },
        'register-device',
        corsHeaders
      );
    }

    const validation = await validateRequestBody(req.clone(), {
      action: { type: 'string', required: true, maxLength: 20 },
      fingerprint_hash: { type: 'string', required: false, maxLength: 1000 },
      device_name: { type: 'string', required: false, maxLength: 100 },
      is_trusted: { type: 'boolean', required: false },
      browser_info: { type: 'object', required: false },
      screen_info: { type: 'object', required: false },
      timezone_info: { type: 'string', required: false, maxLength: 100 }
    });

    if (!validation.valid) {
      return handleSecureError(
        new Error(`Invalid request: ${validation.errors.join(', ')}`),
        { operation: 'device_input_validation' },
        'register-device',
        corsHeaders
      );
    }

    const { 
      action, 
      fingerprint_hash, 
      device_name, 
      is_trusted, 
      browser_info, 
      screen_info, 
      timezone_info 
    } = validation.sanitizedData!;

    switch (action) {
      case 'register': {
        if (!fingerprint_hash) {
          return handleSecureError(
            new Error('Fingerprint hash required for register action'),
            { operation: 'device_register_validation' },
            'register-device',
            corsHeaders
          );
        }

        // Calculate risk score for new device
        let riskScore = 0;
        
        // Check if user has any existing devices
        const { data: existingDevices } = await supabaseClient
          .from('device_fingerprints')
          .select('fingerprint_hash, is_trusted, use_count')
          .eq('user_id', user.id);

        const isFirstDevice = !existingDevices || existingDevices.length === 0;
        
        if (!isFirstDevice) {
          riskScore += 20; // New device from existing user
        }

        // Analyze browser and screen info for suspicion
        if (browser_info) {
          // Check for headless browsers or automation tools
          const suspiciousBrowsers = ['phantomjs', 'headless', 'selenium', 'webdriver'];
          const browserString = JSON.stringify(browser_info).toLowerCase();
          
          if (suspiciousBrowsers.some(sus => browserString.includes(sus))) {
            riskScore += 30;
          }
        }

        // Register or update device using the database function
        const { data: deviceId, error: registerError } = await supabaseClient
          .rpc('register_device_fingerprint', {
            p_user_id: user.id,
            p_fingerprint_hash: fingerprint_hash,
            p_device_name: device_name || null,
            p_browser_info: browser_info || null,
            p_screen_info: screen_info || null,
            p_timezone_info: timezone_info || null
          });

        if (registerError) {
          return handleSecureError(
            registerError,
            { operation: 'device_register_db' },
            'register-device',
            corsHeaders
          );
        }

        // Log device registration
        await supabaseClient.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event_type: 'device_registered',
          p_device_fingerprint: fingerprint_hash,
          p_additional_metadata: {
            device_id: deviceId,
            device_name: device_name || 'Unknown Device',
            risk_score: riskScore,
            is_first_device: isFirstDevice,
            browser_info: browser_info || null,
            timezone: timezone_info || null
          }
        });

        // If risk score is high, log suspicious activity
        if (riskScore >= 30) {
          await supabaseClient.rpc('log_auth_event', {
            p_user_id: user.id,
            p_event_type: 'suspicious_activity',
            p_device_fingerprint: fingerprint_hash,
            p_additional_metadata: {
              reason: 'high_risk_device_registration',
              risk_score: riskScore,
              device_analysis: {
                suspicious_browser: browser_info ? 'detected' : 'not_analyzed',
                new_device: !isFirstDevice
              }
            }
          });
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            device_id: deviceId,
            risk_score: riskScore,
            is_trusted: isFirstDevice, // First device is automatically trusted
            message: 'Device registered successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_trust': {
        if (!fingerprint_hash || is_trusted === undefined) {
          return handleSecureError(
            new Error('Fingerprint hash and trust status required'),
            { operation: 'device_trust_validation' },
            'register-device',
            corsHeaders
          );
        }

        const { error: trustError } = await supabaseClient
          .from('device_fingerprints')
          .update({ is_trusted })
          .eq('user_id', user.id)
          .eq('fingerprint_hash', fingerprint_hash);

        if (trustError) {
          return handleSecureError(
            trustError,
            { operation: 'device_trust_update_db' },
            'register-device',
            corsHeaders
          );
        }

        // Log trust status change
        await supabaseClient.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event_type: 'device_trust_updated',
          p_device_fingerprint: fingerprint_hash,
          p_additional_metadata: {
            new_trust_status: is_trusted,
            action: is_trusted ? 'trusted' : 'untrusted'
          }
        });

        return createSecureResponse(
          JSON.stringify({
            success: true,
            message: `Device ${is_trusted ? 'trusted' : 'untrusted'} successfully`
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_name': {
        if (!fingerprint_hash || !device_name) {
          return handleSecureError(
            new Error('Fingerprint hash and device name required'),
            { operation: 'device_name_validation' },
            'register-device',
            corsHeaders
          );
        }

        const { error: nameError } = await supabaseClient
          .from('device_fingerprints')
          .update({ device_name })
          .eq('user_id', user.id)
          .eq('fingerprint_hash', fingerprint_hash);

        if (nameError) {
          return handleSecureError(
            nameError,
            { operation: 'device_name_update_db' },
            'register-device',
            corsHeaders
          );
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            message: 'Device name updated successfully'
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'analyze_risk': {
        if (!fingerprint_hash) {
          return handleSecureError(
            new Error('Fingerprint hash required for risk analysis'),
            { operation: 'device_risk_validation' },
            'register-device',
            corsHeaders
          );
        }

        // Get device information
        const { data: device, error: deviceError } = await supabaseClient
          .from('device_fingerprints')
          .select('*')
          .eq('user_id', user.id)
          .eq('fingerprint_hash', fingerprint_hash)
          .single();

        if (deviceError) {
          return handleSecureError(
            deviceError,
            { operation: 'device_risk_fetch_db' },
            'register-device',
            corsHeaders
          );
        }

        // Calculate detailed risk analysis
        let riskScore = 0;
        const riskFactors = [];

        // Age-based risk (newer devices are riskier)
        const deviceAge = Date.now() - new Date(device.first_seen).getTime();
        const ageInDays = deviceAge / (1000 * 60 * 60 * 24);
        
        if (ageInDays < 1) {
          riskScore += 15;
          riskFactors.push('Very new device (less than 1 day old)');
        } else if (ageInDays < 7) {
          riskScore += 10;
          riskFactors.push('New device (less than 1 week old)');
        }

        // Usage-based risk (low usage = higher risk)
        if (device.use_count < 5) {
          riskScore += 10;
          riskFactors.push('Low usage count');
        }

        // Trust status
        if (!device.is_trusted) {
          riskScore += 20;
          riskFactors.push('Device not marked as trusted');
        }

        // Browser analysis
        if (device.browser_info) {
          const browserString = JSON.stringify(device.browser_info).toLowerCase();
          if (browserString.includes('headless') || browserString.includes('automation')) {
            riskScore += 25;
            riskFactors.push('Automated/headless browser detected');
          }
        }

        const riskLevel = riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'LOW';

        return createSecureResponse(
          JSON.stringify({
            success: true,
            risk_analysis: {
              risk_score: riskScore,
              risk_level: riskLevel,
              risk_factors: riskFactors,
              device_age_days: Math.floor(ageInDays),
              use_count: device.use_count,
              is_trusted: device.is_trusted,
              last_seen: device.last_seen
            }
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const { data: devices, error: listError } = await supabaseClient
          .from('device_fingerprints')
          .select('*')
          .eq('user_id', user.id)
          .order('last_seen', { ascending: false });

        if (listError) {
          return handleSecureError(
            listError,
            { operation: 'device_list_db' },
            'register-device',
            corsHeaders
          );
        }

        return createSecureResponse(
          JSON.stringify({
            success: true,
            devices: devices || [],
            count: devices?.length || 0
          }),
          { headers: { ...corsHeaders, ...rateLimitCheck.headers, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return handleSecureError(
          new Error('Invalid action specified'),
          { operation: 'device_invalid_action' },
          'register-device',
          corsHeaders
        );
    }

  } catch (error) {
    return handleSecureError(
      error,
      { operation: 'device_management_general' },
      'register-device',
      corsHeaders
    );
  }
});

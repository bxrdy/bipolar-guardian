import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Rate limiting configuration
const RATE_LIMITS = {
  'security-audit-data': { requests: 30, windowMs: 60000 }, // 30 requests per minute
};

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

const checkRateLimit = (req: Request, functionName: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM', headers: Record<string, string>) => {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const key = `${functionName}:${clientIP}`;
  const limit = RATE_LIMITS[functionName as keyof typeof RATE_LIMITS];
  
  if (!limit) return null;
  
  const now = Date.now();
  const windowStart = now - limit.windowMs;
  
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < windowStart) {
    rateLimitStore[key] = { count: 1, resetTime: now };
    return null;
  }
  
  rateLimitStore[key].count++;
  
  if (rateLimitStore[key].count > limit.requests) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: Math.ceil((rateLimitStore[key].resetTime + limit.windowMs - now) / 1000) 
      }),
      { 
        status: 429, 
        headers: { 
          ...headers, 
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitStore[key].resetTime + limit.windowMs - now) / 1000).toString()
        } 
      }
    );
  }
  
  return null;
};

interface SecurityAuditRequest {
  operation: 'get_comprehensive_metrics' | 'get_risk_assessment' | 'get_security_trends';
  timeRange?: '24h' | '7d' | '30d' | '90d';
  includeDetails?: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByDay: Record<string, number>;
  uniqueIPs: number;
  failedLogins: number;
  successfulLogins: number;
  loginSuccessRate: number;
  suspiciousActivityScore: number;
  accountLockEvents: number;
  deviceRegistrations: number;
  sessionTimeouts: number;
}

interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: Array<{
    factor: string;
    score: number;
    description: string;
    recommendation: string;
  }>;
  securityPosture: {
    twoFactorEnabled: boolean;
    trustedDevicesCount: number;
    recentFailedLogins: number;
    accountLocked: boolean;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting check
  const rateLimitResponse = checkRateLimit(req, 'security-audit-data', 'MEDIUM', corsHeaders);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header and create client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json() as SecurityAuditRequest;
    const { operation, timeRange = '7d', includeDetails = false } = body;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
    }

    switch (operation) {
      case 'get_comprehensive_metrics': {
        // Get auth events
        const { data: authEvents, error: eventsError } = await supabaseClient
          .from('auth_events')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (eventsError) {
          console.error('Error fetching auth events:', eventsError);
          throw new Error('Failed to fetch authentication events');
        }

        // Get security status
        const { data: securityStatus, error: statusError } = await supabaseClient
          .from('account_security_status')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statusError && statusError.code !== 'PGRST116') {
          console.error('Error fetching security status:', statusError);
          throw new Error('Failed to fetch security status');
        }

        // Process metrics
        const events = authEvents || [];
        const eventsByType = events.reduce((acc, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const eventsByDay = events.reduce((acc, event) => {
          const day = new Date(event.created_at).toISOString().split('T')[0];
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const uniqueIPs = new Set(events.map(e => e.ip_address).filter(Boolean)).size;
        const failedLogins = eventsByType['login_failure'] || 0;
        const successfulLogins = eventsByType['login_success'] || 0;
        const totalLogins = failedLogins + successfulLogins;

        const metrics: SecurityMetrics = {
          totalEvents: events.length,
          eventsByType,
          eventsByDay,
          uniqueIPs,
          failedLogins,
          successfulLogins,
          loginSuccessRate: totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 100,
          suspiciousActivityScore: securityStatus?.suspicious_activity_score || 0,
          accountLockEvents: eventsByType['account_locked'] || 0,
          deviceRegistrations: eventsByType['device_registered'] || 0,
          sessionTimeouts: eventsByType['session_timeout'] || 0
        };

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              metrics,
              timeRange,
              generatedAt: new Date().toISOString(),
              ...(includeDetails && {
                events: events.slice(0, 50), // Limit to recent 50 events for details
                securityStatus
              })
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_risk_assessment': {
        // Get current security status
        const { data: securityStatus, error: statusError } = await supabaseClient
          .from('account_security_status')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statusError && statusError.code !== 'PGRST116') {
          console.error('Error fetching security status:', statusError);
          throw new Error('Failed to fetch security status');
        }

        // Get recent auth events for risk calculation
        const { data: recentEvents, error: eventsError } = await supabaseClient
          .from('auth_events')
          .select('event_type, created_at, ip_address')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (eventsError) {
          console.error('Error fetching recent events:', eventsError);
          throw new Error('Failed to fetch recent events');
        }

        // Get device fingerprints
        const { data: devices, error: devicesError } = await supabaseClient
          .from('device_fingerprints')
          .select('is_trusted, use_count, first_seen')
          .eq('user_id', user.id);

        if (devicesError) {
          console.error('Error fetching devices:', devicesError);
          throw new Error('Failed to fetch device information');
        }

        // Calculate risk factors
        const riskFactors = [];
        let totalRiskScore = 0;

        // Factor 1: Failed login attempts
        const failedLogins = securityStatus?.failed_login_attempts || 0;
        if (failedLogins > 0) {
          const score = Math.min(failedLogins * 10, 40);
          totalRiskScore += score;
          riskFactors.push({
            factor: 'Failed Login Attempts',
            score,
            description: `${failedLogins} failed login attempts detected`,
            recommendation: failedLogins > 3 ? 'Review authentication events and consider changing password' : 'Monitor for additional failed attempts'
          });
        }

        // Factor 2: Account lock status
        const isLocked = securityStatus?.account_locked_until && 
          new Date(securityStatus.account_locked_until) > new Date();
        if (isLocked) {
          totalRiskScore += 30;
          riskFactors.push({
            factor: 'Account Locked',
            score: 30,
            description: 'Account is currently locked due to security policy',
            recommendation: 'Wait for lockout period to expire and review recent activity'
          });
        }

        // Factor 3: Suspicious activity score
        const suspiciousScore = securityStatus?.suspicious_activity_score || 0;
        if (suspiciousScore > 0) {
          const score = Math.min(suspiciousScore, 25);
          totalRiskScore += score;
          riskFactors.push({
            factor: 'Suspicious Activity',
            score,
            description: `Suspicious activity score: ${suspiciousScore}`,
            recommendation: suspiciousScore > 20 ? 'Review recent authentication events immediately' : 'Monitor for unusual patterns'
          });
        }

        // Factor 4: Two-factor authentication
        if (!securityStatus?.two_factor_enabled) {
          totalRiskScore += 20;
          riskFactors.push({
            factor: 'No Two-Factor Authentication',
            score: 20,
            description: 'Two-factor authentication is not enabled',
            recommendation: 'Enable two-factor authentication for enhanced security'
          });
        }

        // Factor 5: Untrusted devices
        const untrustedDevices = devices?.filter(d => !d.is_trusted).length || 0;
        if (untrustedDevices > 0) {
          const score = Math.min(untrustedDevices * 5, 15);
          totalRiskScore += score;
          riskFactors.push({
            factor: 'Untrusted Devices',
            score,
            description: `${untrustedDevices} untrusted devices detected`,
            recommendation: 'Review device list and mark trusted devices'
          });
        }

        // Factor 6: Multiple recent login locations
        const recentIPs = new Set(recentEvents?.map(e => e.ip_address).filter(Boolean)).size;
        if (recentIPs > 2) {
          const score = Math.min((recentIPs - 2) * 5, 15);
          totalRiskScore += score;
          riskFactors.push({
            factor: 'Multiple Login Locations',
            score,
            description: `Logins from ${recentIPs} different IP addresses`,
            recommendation: 'Verify all login locations are authorized'
          });
        }

        // Determine risk level
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        if (totalRiskScore >= 80) riskLevel = 'CRITICAL';
        else if (totalRiskScore >= 50) riskLevel = 'HIGH';
        else if (totalRiskScore >= 25) riskLevel = 'MEDIUM';
        else riskLevel = 'LOW';

        const riskAssessment: RiskAssessment = {
          overallRiskScore: Math.min(totalRiskScore, 100),
          riskLevel,
          riskFactors,
          securityPosture: {
            twoFactorEnabled: securityStatus?.two_factor_enabled || false,
            trustedDevicesCount: devices?.filter(d => d.is_trusted).length || 0,
            recentFailedLogins: failedLogins,
            accountLocked: isLocked
          }
        };

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              riskAssessment,
              timeRange,
              generatedAt: new Date().toISOString()
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_security_trends': {
        // Get extended time range for trend analysis
        const extendedStartDate = new Date();
        extendedStartDate.setDate(now.getDate() - 60); // 60 days for trend analysis

        const { data: trendEvents, error: trendError } = await supabaseClient
          .from('auth_events')
          .select('event_type, created_at, ip_address')
          .eq('user_id', user.id)
          .gte('created_at', extendedStartDate.toISOString())
          .order('created_at', { ascending: true });

        if (trendError) {
          console.error('Error fetching trend events:', trendError);
          throw new Error('Failed to fetch trend data');
        }

        // Process trends by week
        const weeklyData: Record<string, { 
          events: number; 
          failedLogins: number; 
          uniqueIPs: number; 
          week: string 
        }> = {};

        trendEvents?.forEach(event => {
          const eventDate = new Date(event.created_at);
          const weekStart = new Date(eventDate);
          weekStart.setDate(eventDate.getDate() - eventDate.getDay()); // Start of week
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              events: 0,
              failedLogins: 0,
              uniqueIPs: 0,
              week: weekKey
            };
          }

          weeklyData[weekKey].events++;
          if (event.event_type === 'login_failure') {
            weeklyData[weekKey].failedLogins++;
          }
        });

        // Calculate unique IPs per week
        const ipsByWeek: Record<string, Set<string>> = {};
        trendEvents?.forEach(event => {
          if (!event.ip_address) return;
          
          const eventDate = new Date(event.created_at);
          const weekStart = new Date(eventDate);
          weekStart.setDate(eventDate.getDate() - eventDate.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!ipsByWeek[weekKey]) {
            ipsByWeek[weekKey] = new Set();
          }
          ipsByWeek[weekKey].add(event.ip_address);
        });

        Object.keys(weeklyData).forEach(week => {
          weeklyData[week].uniqueIPs = ipsByWeek[week]?.size || 0;
        });

        const trends = Object.values(weeklyData).sort((a, b) => 
          new Date(a.week).getTime() - new Date(b.week).getTime()
        );

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              trends,
              timeRange,
              generatedAt: new Date().toISOString(),
              summary: {
                totalWeeks: trends.length,
                avgEventsPerWeek: trends.length > 0 ? 
                  trends.reduce((sum, week) => sum + week.events, 0) / trends.length : 0,
                avgFailedLoginsPerWeek: trends.length > 0 ? 
                  trends.reduce((sum, week) => sum + week.failedLogins, 0) / trends.length : 0
              }
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Security audit data error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
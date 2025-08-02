// Comprehensive Security Headers for Edge Functions
// Provides defense-in-depth protection against various attacks

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableFrameProtection?: boolean;
  allowedOrigins?: string[];
  customHeaders?: Record<string, string>;
}

// Default security configuration
const DEFAULT_CONFIG: SecurityHeadersConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableFrameProtection: true,
  allowedOrigins: [],
  customHeaders: {}
};

/**
 * Content Security Policy for edge functions
 */
function generateCSP(config: SecurityHeadersConfig): string {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Allow inline scripts for edge functions
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'", // Prevent framing
    "base-uri 'self'",
    "form-action 'self'"
  ];
  
  return policies.join('; ');
}

/**
 * Gets allowed origins from environment or config
 */
function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get('VITE_ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default to Lovable project domains and common development origins
  return [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:5173',
    'https://localhost:8080',
    // Lovable project domains
    'https://9bb52d12-4e61-4a8f-ab49-923e9277d6d8.lovableproject.com',
    'https://id-preview--9bb52d12-4e61-4a8f-ab49-923e9277d6d8.lovable.app',
    'https://bipolar-guardian.lovable.app' // Production domain
  ];
}

/**
 * Validates request origin against allowlist
 */
export function validateOrigin(request: Request): { valid: boolean; origin?: string } {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  const allowedOrigins = getAllowedOrigins();
  console.log('Origin validation check:', { 
    origin, 
    referer, 
    allowedOrigins,
    nodeEnv: Deno.env.get('NODE_ENV')
  });
  
  // Check Origin header
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin) || 
                     allowedOrigins.includes('*') ||
                     (Deno.env.get('NODE_ENV') === 'development' && origin.includes('localhost'));
    
    console.log(`Origin validation result for "${origin}":`, { 
      isAllowed, 
      inAllowedList: allowedOrigins.includes(origin),
      isWildcard: allowedOrigins.includes('*'),
      isDevelopmentLocalhost: Deno.env.get('NODE_ENV') === 'development' && origin.includes('localhost')
    });
    
    return { valid: isAllowed, origin };
  }
  
  // Fallback to Referer header
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      const isAllowed = allowedOrigins.includes(refererOrigin) ||
                       allowedOrigins.includes('*') ||
                       (Deno.env.get('NODE_ENV') === 'development' && refererOrigin.includes('localhost'));
      
      console.log(`Referer validation result for "${refererOrigin}":`, { 
        isAllowed, 
        inAllowedList: allowedOrigins.includes(refererOrigin),
        isWildcard: allowedOrigins.includes('*'),
        isDevelopmentLocalhost: Deno.env.get('NODE_ENV') === 'development' && refererOrigin.includes('localhost')
      });
      
      return { valid: isAllowed, origin: refererOrigin };
    } catch (error) {
      console.log('Error parsing referer URL:', error);
      return { valid: false };
    }
  }
  
  // No origin information - allow for server-to-server calls
  console.log('No origin or referer found - allowing request');
  return { valid: true };
}

/**
 * Generates comprehensive security headers
 */
export function generateSecurityHeaders(
  config: SecurityHeadersConfig = {},
  corsHeaders: Record<string, string> = {}
): Record<string, string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const headers: Record<string, string> = { ...corsHeaders };
  
  // Content Security Policy
  if (finalConfig.enableCSP) {
    headers['Content-Security-Policy'] = generateCSP(finalConfig);
  }
  
  // Strict Transport Security
  if (finalConfig.enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  // Frame protection
  if (finalConfig.enableFrameProtection) {
    headers['X-Frame-Options'] = 'DENY';
  }
  
  // Content type protection
  headers['X-Content-Type-Options'] = 'nosniff';
  
  // XSS protection
  headers['X-XSS-Protection'] = '1; mode=block';
  
  // Referrer policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  
  // Download options (IE)
  headers['X-Download-Options'] = 'noopen';
  
  // Content type sniffing protection
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';
  
  // Cache control for sensitive responses
  headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, private';
  headers['Pragma'] = 'no-cache';
  headers['Expires'] = '0';
  
  // Custom headers
  if (finalConfig.customHeaders) {
    Object.assign(headers, finalConfig.customHeaders);
  }
  
  return headers;
}

/**
 * Enhanced CORS headers with origin validation
 */
export function generateCORSHeaders(request: Request): Record<string, string> {
  const { valid, origin } = validateOrigin(request);
  const allowedOrigins = getAllowedOrigins();
  
  // Base CORS headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin' // Important for caching
  };
  
  // Set origin based on validation
  if (valid && origin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else if (allowedOrigins.includes('*') || Deno.env.get('NODE_ENV') === 'development') {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  } else {
    // No valid origin - set to first allowed origin as fallback
    corsHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'https://localhost:3000';
  }
  
  return corsHeaders;
}

/**
 * Validates CSRF token or origin for state-changing operations
 */
export function validateCSRF(request: Request, requireToken: boolean = false): boolean {
  // Skip CSRF for read-only operations
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }
  
  // Skip CSRF if disabled in environment
  if (Deno.env.get('ENABLE_CSRF_PROTECTION') === 'false') {
    return true;
  }
  
  // Check for CSRF token header
  const csrfToken = request.headers.get('x-csrf-token');
  if (requireToken && !csrfToken) {
    return false;
  }
  
  // Validate origin for state-changing operations
  const { valid } = validateOrigin(request);
  if (!valid) {
    return false;
  }
  
  // Additional check: ensure request has proper content type for POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a secure response with all security headers
 */
export function createSecureResponse(
  body: string | null,
  options: {
    status?: number;
    headers?: Record<string, string>;
    securityConfig?: SecurityHeadersConfig;
    corsHeaders?: Record<string, string>;
  } = {}
): Response {
  const {
    status = 200,
    headers = {},
    securityConfig = {},
    corsHeaders = {}
  } = options;
  
  const securityHeaders = generateSecurityHeaders(securityConfig, corsHeaders);
  const finalHeaders = { ...securityHeaders, ...headers };
  
  // Ensure Content-Type is set
  if (!finalHeaders['Content-Type'] && body) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  
  return new Response(body, { status, headers: finalHeaders });
}

/**
 * Middleware-style security validator
 */
export function validateSecurity(
  request: Request,
  options: {
    requireCSRF?: boolean;
    requireOrigin?: boolean;
    allowedMethods?: string[];
  } = {}
): { valid: boolean; error?: string; headers?: Record<string, string> } {
  const {
    requireCSRF = false,
    requireOrigin = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  } = options;
  
  // Generate CORS headers for this request
  const corsHeaders = generateCORSHeaders(request);
  
  // Check allowed methods
  if (!allowedMethods.includes(request.method)) {
    return {
      valid: false,
      error: 'Method not allowed',
      headers: corsHeaders
    };
  }
  
  // Validate origin if required
  if (requireOrigin) {
    const { valid } = validateOrigin(request);
    if (!valid) {
      return {
        valid: false,
        error: 'Invalid origin',
        headers: corsHeaders
      };
    }
  }
  
  // Validate CSRF if required
  if (requireCSRF && !validateCSRF(request, true)) {
    return {
      valid: false,
      error: 'CSRF validation failed',
      headers: corsHeaders
    };
  }
  
  return {
    valid: true,
    headers: corsHeaders
  };
}
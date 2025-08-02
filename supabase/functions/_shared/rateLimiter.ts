
// Enhanced Rate Limiter with Security Focus
// Provides configurable rate limiting for different security levels

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RateLimitResult {
  allowed: boolean;
  response?: Response;
  headers: Record<string, string>;
}

// Rate limiting configuration by function and priority
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'log-auth-event': { requests: 100, windowMs: 60000, priority: 'HIGH' },
  'check-login-security': { requests: 30, windowMs: 60000, priority: 'HIGH' },
  'manage-session': { requests: 50, windowMs: 60000, priority: 'HIGH' },
  'register-device': { requests: 20, windowMs: 60000, priority: 'MEDIUM' },
  'security-audit-data': { requests: 30, windowMs: 60000, priority: 'MEDIUM' },
  'two-factor-auth': { requests: 10, windowMs: 60000, priority: 'CRITICAL' },
  'send-security-notification': { requests: 5, windowMs: 60000, priority: 'LOW' },
  'update-security-config': { requests: 10, windowMs: 300000, priority: 'MEDIUM' }, // 5 minute window
};

interface RateLimitStore {
  [key: string]: { 
    count: number; 
    resetTime: number; 
    firstRequest: number;
    blocked?: boolean;
  };
}

// In-memory store (in production, consider Redis)
const rateLimitStore: RateLimitStore = {};

/**
 * Gets client identifier for rate limiting
 */
function getClientIdentifier(req: Request): string {
  // Try to get authenticated user first
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user info from JWT (simplified)
      const token = authHeader.replace('Bearer ', '');
      // In a real implementation, you'd decode the JWT
      return `user:${token.slice(-8)}`; // Use last 8 chars as identifier
    } catch {
      // Fall back to IP
    }
  }

  // Fall back to IP address
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown';
  
  return `ip:${clientIP}`;
}

/**
 * Applies priority-based rate limiting adjustments
 */
function applyPriorityAdjustments(
  config: RateLimitConfig, 
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): RateLimitConfig {
  const adjustments = {
    'LOW': { requestMultiplier: 0.5, windowMultiplier: 1.5 },
    'MEDIUM': { requestMultiplier: 0.75, windowMultiplier: 1.2 },
    'HIGH': { requestMultiplier: 1.0, windowMultiplier: 1.0 },
    'CRITICAL': { requestMultiplier: 0.3, windowMultiplier: 2.0 }
  };

  const adjustment = adjustments[priority];
  return {
    ...config,
    requests: Math.floor(config.requests * adjustment.requestMultiplier),
    windowMs: Math.floor(config.windowMs * adjustment.windowMultiplier)
  };
}

/**
 * Checks and enforces rate limits
 */
export function checkRateLimit(
  req: Request,
  functionName: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
  corsHeaders: Record<string, string> = {}
): RateLimitResult {
  const config = RATE_LIMITS[functionName];
  if (!config) {
    // No rate limiting configured - allow
    return { allowed: true, headers: {} };
  }

  const adjustedConfig = applyPriorityAdjustments(config, priority);
  const clientId = getClientIdentifier(req);
  const key = `${functionName}:${clientId}`;
  
  const now = Date.now();
  const windowStart = now - adjustedConfig.windowMs;
  
  // Clean up expired entries
  if (rateLimitStore[key] && rateLimitStore[key].resetTime < windowStart) {
    delete rateLimitStore[key];
  }
  
  // Initialize or update counter
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { 
      count: 1, 
      resetTime: now,
      firstRequest: now
    };
  } else {
    rateLimitStore[key].count++;
  }
  
  const store = rateLimitStore[key];
  const remaining = Math.max(0, adjustedConfig.requests - store.count);
  const resetTime = Math.ceil((store.resetTime +adjustedConfig.windowMs - now) / 1000);
  
  // Rate limit headers
  const headers = {
    'X-RateLimit-Limit': adjustedConfig.requests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
    'X-RateLimit-Window': Math.floor(adjustedConfig.windowMs / 1000).toString()
  };
  
  // Check if limit exceeded
  if (store.count > adjustedConfig.requests) {
    // Mark as blocked for additional security logging
    store.blocked = true;
    
    const errorResponse = {
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${resetTime} seconds.`,
      retryAfter: resetTime,
      limit: adjustedConfig.requests,
      window: Math.floor(adjustedConfig.windowMs / 1000)
    };
    
    return {
      allowed: false,
      response: new Response(
        JSON.stringify(errorResponse),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            ...headers,
            'Content-Type': 'application/json',
            'Retry-After': resetTime.toString()
          }
        }
      ),
      headers
    };
  }
  
  return { allowed: true, headers };
}

/**
 * Gets current rate limit status for a client
 */
export function getRateLimitStatus(
  req: Request,
  functionName: string
): {
  limit: number;
  remaining: number;
  resetTime: number;
  blocked: boolean;
} | null {
  const config = RATE_LIMITS[functionName];
  if (!config) return null;
  
  const clientId = getClientIdentifier(req);
  const key = `${functionName}:${clientId}`;
  const store = rateLimitStore[key];
  
  if (!store) {
    return {
      limit: config.requests,
      remaining: config.requests,
      resetTime: 0,
      blocked: false
    };
  }
  
  const now = Date.now();
  const remaining = Math.max(0, config.requests - store.count);
  const resetTime = Math.ceil((store.resetTime + config.windowMs - now) / 1000);
  
  return {
    limit: config.requests,
    remaining,
    resetTime,
    blocked: store.blocked || false
  };
}

/**
 * Clears rate limit for a specific client (admin function)
 */
export function clearRateLimit(
  clientIdentifier: string,
  functionName?: string
): boolean {
  try {
    if (functionName) {
      const key = `${functionName}:${clientIdentifier}`;
      delete rateLimitStore[key];
    } else {
      // Clear all rate limits for client
      Object.keys(rateLimitStore).forEach(key => {
        if (key.endsWith(`:${clientIdentifier}`)) {
          delete rateLimitStore[key];
        }
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Cleanup old rate limit entries (should be called periodically)
 */
export function cleanupRateLimitStore(): number {
  const now = Date.now();
  let cleaned = 0;
  
  Object.keys(rateLimitStore).forEach(key => {
    const store = rateLimitStore[key];
    const functionName = key.split(':')[0];
    const config = RATE_LIMITS[functionName];
    
    if (config && store.resetTime < now - config.windowMs) {
      delete rateLimitStore[key];
      cleaned++;
    }
  });
  
  return cleaned;
}

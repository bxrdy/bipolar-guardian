
// Enhanced CORS Configuration with Security Controls
// Import the new security utilities
import { generateCORSHeaders, validateOrigin } from './securityHeaders.ts';

// Legacy export for backward compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

/**
 * Get secure CORS headers based on request origin
 */
export function getSecureCORSHeaders(request: Request): Record<string, string> {
  return generateCORSHeaders(request);
}

/**
 * Validate request origin
 */
export function isValidOrigin(request: Request): boolean {
  const { valid } = validateOrigin(request);
  return valid;
}

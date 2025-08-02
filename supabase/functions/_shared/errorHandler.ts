// Secure Error Handler for Edge Functions
// Provides sanitized error responses while preserving debugging information

export interface ErrorContext {
  userId?: string;
  operation?: string;
  filePath?: string;
  additionalInfo?: Record<string, any>;
}

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization', 
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_API = 'external_api',
  DATABASE = 'database',
  STORAGE = 'storage',
  SYSTEM = 'system'
}

export interface SecureErrorResponse {
  error: string;
  code?: string;
  hint?: string;
}

// User-friendly error messages that don't expose system details
const ERROR_MESSAGES: Record<ErrorType, SecureErrorResponse> = {
  [ErrorType.AUTHENTICATION]: {
    error: 'Authentication required. Please sign in and try again.',
    code: 'AUTH_REQUIRED'
  },
  [ErrorType.AUTHORIZATION]: {
    error: 'You do not have permission to perform this action.',
    code: 'INSUFFICIENT_PERMISSIONS'
  },
  [ErrorType.VALIDATION]: {
    error: 'The provided information is invalid. Please check your input and try again.',
    code: 'INVALID_INPUT'
  },
  [ErrorType.NOT_FOUND]: {
    error: 'The requested resource was not found.',
    code: 'RESOURCE_NOT_FOUND'
  },
  [ErrorType.RATE_LIMIT]: {
    error: 'Too many requests. Please wait a moment before trying again.',
    code: 'RATE_LIMITED'
  },
  [ErrorType.EXTERNAL_API]: {
    error: 'External service is temporarily unavailable. Please try again later.',
    code: 'SERVICE_UNAVAILABLE'
  },
  [ErrorType.DATABASE]: {
    error: 'Unable to process your request. Please try again.',
    code: 'DATABASE_ERROR'
  },
  [ErrorType.STORAGE]: {
    error: 'File operation failed. Please try again.',
    code: 'STORAGE_ERROR'
  },
  [ErrorType.SYSTEM]: {
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR'
  }
};

// Security headers for error responses
const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

/**
 * Sanitizes error messages by removing sensitive information
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  const message = typeof error === 'string' ? error : error.message || error.toString();
  
  // Remove common sensitive patterns
  const sanitized = message
    // Remove file paths
    .replace(/\/[a-zA-Z0-9._/-]+/g, '[PATH_REDACTED]')
    // Remove stack trace references
    .replace(/at\s+[a-zA-Z0-9._/-]+:\d+:\d+/g, '[LOCATION_REDACTED]')
    // Remove database connection strings
    .replace(/postgres:\/\/[^@]+@[^/]+\/[^\s]+/g, '[DB_CONNECTION_REDACTED]')
    // Remove API keys
    .replace(/[a-zA-Z0-9]{20,}/g, '[KEY_REDACTED]')
    // Remove IP addresses
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]')
    // Remove email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  
  return sanitized;
}

/**
 * Classifies errors based on their content and context
 */
export function classifyError(error: any, context?: ErrorContext): ErrorType {
  if (!error) return ErrorType.SYSTEM;
  
  const message = typeof error === 'string' ? error : error.message || error.toString();
  const lowerMessage = message.toLowerCase();
  
  // Authentication errors
  if (lowerMessage.includes('unauthorized') || 
      lowerMessage.includes('invalid token') || 
      lowerMessage.includes('authentication') ||
      lowerMessage.includes('no authorization header')) {
    return ErrorType.AUTHENTICATION;
  }
  
  // Authorization errors
  if (lowerMessage.includes('permission') || 
      lowerMessage.includes('access denied') || 
      lowerMessage.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  // Validation errors
  if (lowerMessage.includes('validation') || 
      lowerMessage.includes('invalid') || 
      lowerMessage.includes('required') ||
      lowerMessage.includes('constraint')) {
    return ErrorType.VALIDATION;
  }
  
  // Not found errors
  if (lowerMessage.includes('not found') || 
      lowerMessage.includes('does not exist') || 
      error.status === 404) {
    return ErrorType.NOT_FOUND;
  }
  
  // Rate limiting
  if (lowerMessage.includes('rate limit') || 
      lowerMessage.includes('too many requests') || 
      error.status === 429) {
    return ErrorType.RATE_LIMIT;
  }
  
  // External API errors
  if (lowerMessage.includes('openrouter') || 
      lowerMessage.includes('api key') || 
      lowerMessage.includes('external service')) {
    return ErrorType.EXTERNAL_API;
  }
  
  // Storage errors
  if (lowerMessage.includes('storage') || 
      lowerMessage.includes('bucket') || 
      lowerMessage.includes('file')) {
    return ErrorType.STORAGE;
  }
  
  // Database errors
  if (lowerMessage.includes('database') || 
      lowerMessage.includes('postgres') || 
      lowerMessage.includes('supabase') ||
      lowerMessage.includes('connection')) {
    return ErrorType.DATABASE;
  }
  
  return ErrorType.SYSTEM;
}

/**
 * Creates a secure error response for clients
 */
export function createSecureErrorResponse(
  error: any, 
  context?: ErrorContext, 
  customMessage?: string
): SecureErrorResponse {
  const errorType = classifyError(error, context);
  const baseResponse = ERROR_MESSAGES[errorType];
  
  if (customMessage) {
    return {
      error: customMessage,
      code: baseResponse.code
    };
  }
  
  return baseResponse;
}

/**
 * Logs detailed error information securely (for debugging)
 */
export function logDetailedError(
  error: any, 
  context?: ErrorContext, 
  functionName?: string
): void {
  const timestamp = new Date().toISOString();
  const errorType = classifyError(error, context);
  
  // Create detailed log entry (only for server-side logging)
  const detailedLog = {
    timestamp,
    functionName,
    errorType,
    originalError: {
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      name: error?.name || 'Error',
      code: error?.code || undefined
    },
    context: context || {},
    sanitizedMessage: sanitizeErrorMessage(error)
  };
  
  // Log based on environment
  const isDevelopment = Deno.env.get('NODE_ENV') === 'development' || 
                       Deno.env.get('VITE_APP_ENV') === 'development';
  
  if (isDevelopment) {
    console.error('🔒 Detailed Error Log:', JSON.stringify(detailedLog, null, 2));
  } else {
    // In production, log only essential information
    console.error('Error occurred:', {
      timestamp,
      functionName,
      errorType,
      sanitizedMessage: detailedLog.sanitizedMessage,
      userId: context?.userId || 'anonymous'
    });
  }
}

/**
 * Creates a standardized HTTP error response
 */
export function createErrorResponse(
  error: any,
  status: number = 500,
  context?: ErrorContext,
  functionName?: string,
  corsHeaders: Record<string, string> = {}
): Response {
  // Log detailed error for debugging
  logDetailedError(error, context, functionName);
  
  // Create secure response for client
  const secureResponse = createSecureErrorResponse(error, context);
  
  // Combine CORS headers with security headers
  const headers = {
    ...corsHeaders,
    ...SECURITY_HEADERS
  };
  
  return new Response(
    JSON.stringify(secureResponse),
    { 
      status, 
      headers 
    }
  );
}

/**
 * Determines appropriate HTTP status code based on error type
 */
export function getStatusCodeForError(error: any, context?: ErrorContext): number {
  const errorType = classifyError(error, context);
  
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.RATE_LIMIT:
      return 429;
    case ErrorType.EXTERNAL_API:
      return 502;
    case ErrorType.STORAGE:
    case ErrorType.DATABASE:
    case ErrorType.SYSTEM:
    default:
      return 500;
  }
}

/**
 * Comprehensive error handler that combines all security measures
 */
export function handleSecureError(
  error: any,
  context?: ErrorContext,
  functionName?: string,
  corsHeaders: Record<string, string> = {}
): Response {
  const status = getStatusCodeForError(error, context);
  return createErrorResponse(error, status, context, functionName, corsHeaders);
}
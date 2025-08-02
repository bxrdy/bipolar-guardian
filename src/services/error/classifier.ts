
import { ErrorCategory, ErrorSeverity, ErrorClassification, ErrorPattern } from './types';

// Error classification patterns
export const ERROR_PATTERNS: ErrorPattern[] = [
  // Authentication patterns
  {
    pattern: /unauthorized|401|invalid.*token|session.*expired/i,
    category: 'authentication',
    severity: 'medium',
    friendlyMessage: 'Please sign in to continue',
    userAction: 'Sign in to your account',
    reportable: false
  },
  {
    pattern: /forbidden|403|permission.*denied|access.*denied/i,
    category: 'authorization',
    severity: 'medium',
    friendlyMessage: 'You don\'t have permission for this action',
    userAction: 'Contact support if you believe this is an error',
    reportable: true
  },
  
  // Network patterns
  {
    pattern: /network.*error|connection.*failed|timeout|offline/i,
    category: 'network',
    severity: 'low',
    friendlyMessage: 'Connection problem detected',
    userAction: 'Check your internet connection and try again',
    reportable: false
  },
  {
    pattern: /5\d{2}|server.*error|internal.*error|service.*unavailable/i,
    category: 'network',
    severity: 'high',
    friendlyMessage: 'Server error occurred',
    userAction: 'Please try again later',
    reportable: true
  },
  
  // Database patterns
  {
    pattern: /constraint.*violation|unique.*constraint|duplicate.*key/i,
    category: 'database',
    severity: 'low',
    friendlyMessage: 'This information already exists',
    userAction: 'Please check your input and try again',
    reportable: false
  },
  {
    pattern: /database.*error|sql.*error|connection.*pool/i,
    category: 'database',
    severity: 'critical',
    friendlyMessage: 'Unable to save your data',
    userAction: 'Please try again in a moment',
    reportable: true
  },
  
  // Storage patterns
  {
    pattern: /file.*too.*large|size.*exceeded|payload.*too.*large/i,
    category: 'storage',
    severity: 'low',
    friendlyMessage: 'File is too large to upload',
    userAction: 'Please select a smaller file',
    reportable: false
  },
  {
    pattern: /unsupported.*file|invalid.*mime|file.*type/i,
    category: 'storage',
    severity: 'low',
    friendlyMessage: 'File type not supported',
    userAction: 'Please select a different file type',
    reportable: false
  },
  {
    pattern: /storage.*error|upload.*failed|download.*failed/i,
    category: 'storage',
    severity: 'medium',
    friendlyMessage: 'File operation failed',
    userAction: 'Please try again',
    reportable: true
  },
  
  // API patterns
  {
    pattern: /api.*key|invalid.*key|missing.*key/i,
    category: 'api',
    severity: 'critical',
    friendlyMessage: 'Service configuration issue',
    userAction: 'Please contact support',
    reportable: true
  },
  {
    pattern: /rate.*limit|too.*many.*requests|quota.*exceeded/i,
    category: 'api',
    severity: 'medium',
    friendlyMessage: 'Too many requests',
    userAction: 'Please wait a moment before trying again',
    reportable: false
  },
  
  // Validation patterns
  {
    pattern: /validation.*error|invalid.*input|required.*field/i,
    category: 'validation',
    severity: 'low',
    friendlyMessage: 'Please check your input',
    userAction: 'Correct the highlighted fields and try again',
    reportable: false
  },
  {
    pattern: /format.*error|invalid.*format|malformed/i,
    category: 'validation',
    severity: 'low',
    friendlyMessage: 'Invalid format',
    userAction: 'Please check the format and try again',
    reportable: false
  },
  
  // Runtime patterns
  {
    pattern: /reference.*error|undefined.*property|cannot.*read/i,
    category: 'runtime',
    severity: 'high',
    friendlyMessage: 'An application error occurred',
    userAction: 'Please refresh the page and try again',
    reportable: true
  },
  {
    pattern: /type.*error|null.*pointer|undefined.*function/i,
    category: 'runtime',
    severity: 'high',
    friendlyMessage: 'An application error occurred',
    userAction: 'Please refresh the page and try again',
    reportable: true
  }
];

/**
 * Classify an error based on its message and properties
 */
export function classifyError(error: unknown): ErrorClassification {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  
  // Try to match against known patterns
  for (const pattern of ERROR_PATTERNS) {
    if (matchesPattern(errorMessage, pattern.pattern) || 
        (errorCode && matchesPattern(errorCode, pattern.pattern))) {
      return {
        category: pattern.category,
        severity: pattern.severity,
        reportable: pattern.reportable,
        userFacing: true
      };
    }
  }
  
  // Check for specific error codes
  const codeClassification = classifyByCode(errorCode);
  if (codeClassification) {
    return codeClassification;
  }
  
  // Check for HTTP status codes
  const statusClassification = classifyByHttpStatus(error);
  if (statusClassification) {
    return statusClassification;
  }
  
  // Default classification for unknown errors
  return {
    category: 'runtime',
    severity: 'medium',
    reportable: true,
    userFacing: true
  };
}

/**
 * Extract error message from various error formats
 */
const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') return errorObj.message;
    if (typeof errorObj.msg === 'string') return errorObj.msg;
    if (typeof errorObj.error === 'string') return errorObj.error;
    if (typeof errorObj.description === 'string') return errorObj.description;
    if (typeof errorObj.detail === 'string') return errorObj.detail;
  }
  return 'Unknown error';
};

/**
 * Extract error code from error object
 */
const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.code === 'string') return errorObj.code;
    if (typeof errorObj.status === 'string') return errorObj.status;
    if (typeof errorObj.statusCode === 'string') return errorObj.statusCode;
    if (typeof errorObj.errorCode === 'string') return errorObj.errorCode;
  }
  return undefined;
};

/**
 * Check if error message matches a pattern
 */
function matchesPattern(text: string, pattern: RegExp | string): boolean {
  if (pattern instanceof RegExp) {
    return pattern.test(text);
  }
  
  return text.toLowerCase().includes(pattern.toLowerCase());
}

/**
 * Classify error by specific error codes
 */
function classifyByCode(code: string | undefined): ErrorClassification | null {
  if (!code) return null;
  
  const codeStr = String(code).toLowerCase();
  
  // Authentication codes
  if (['auth_required', 'invalid_token', 'session_expired'].includes(codeStr)) {
    return {
      category: 'authentication',
      severity: 'medium',
      reportable: false,
      userFacing: true
    };
  }
  
  // Permission codes
  if (['permission_denied', 'forbidden', 'access_denied'].includes(codeStr)) {
    return {
      category: 'authorization',
      severity: 'medium',
      reportable: true,
      userFacing: true
    };
  }
  
  // Validation codes
  if (['validation_failed', 'invalid_input', 'required_field'].includes(codeStr)) {
    return {
      category: 'validation',
      severity: 'low',
      reportable: false,
      userFacing: true
    };
  }
  
  return null;
}

/**
 * Classify error by HTTP status code
 */
function classifyByHttpStatus(error: any): ErrorClassification | null {
  const status = error?.status || error?.statusCode;
  if (!status) return null;
  
  const statusNum = Number(status);
  
  if (statusNum >= 400 && statusNum < 500) {
    if (statusNum === 401) {
      return {
        category: 'authentication' as ErrorCategory,
        severity: 'medium',
        reportable: false,
        userFacing: true
      };
    }
    
    if (statusNum === 403) {
      return {
        category: 'authorization' as ErrorCategory,
        severity: 'medium',
        reportable: true,
        userFacing: true
      };
    }
    
    if (statusNum === 404) {
      return {
        category: 'api' as ErrorCategory,
        severity: 'low',
        reportable: false,
        userFacing: true
      };
    }
    
    if (statusNum === 429) {
      return {
        category: 'api' as ErrorCategory,
        severity: 'medium',
        reportable: false,
        userFacing: true
      };
    }
    
    return {
      category: 'api' as ErrorCategory,
      severity: 'low',
      reportable: false,
      userFacing: true
    };
  }
  
  if (statusNum >= 500) {
    return {
      category: 'network' as ErrorCategory,
      severity: 'high',
      reportable: true,
      userFacing: true
    };
  }
  
  return null;
}

/**
 * Determine error category from error object
 */
export const getErrorCategory = (error: unknown): ErrorCategory => {
  const message = getErrorMessage(error).toLowerCase();
  const code = getErrorCode(error)?.toLowerCase();

  // Try to match against known patterns
  for (const pattern of ERROR_PATTERNS) {
    if (matchesPattern(message, pattern.pattern) || 
        (code && matchesPattern(code, pattern.pattern))) {
      return pattern.category;
    }
  }
  
  // Check for specific error codes
  const codeClassification = classifyByCode(code);
  if (codeClassification) {
    return codeClassification.category;
  }
  
  // Check for HTTP status codes
  const statusClassification = classifyByHttpStatus(error);
  if (statusClassification) {
    return statusClassification.category;
  }
  
  // Default classification for unknown errors - properly cast to ErrorCategory
  return 'runtime' as ErrorCategory;
};

/**
 * Determine error severity from error object
 */
export function getErrorSeverity(error: any): ErrorSeverity {
  const classification = classifyError(error);
  return classification.severity;
}

/**
 * Check if error should be reported to external services
 */
export function shouldReportError(error: any): boolean {
  const classification = classifyError(error);
  return classification.reportable;
}

/**
 * Check if error should be shown to user
 */
export function isUserFacingError(error: any): boolean {
  const classification = classifyError(error);
  return classification.userFacing;
}


import { supabase } from "@/integrations/supabase/client";
import { sanitizeError, sanitizeStackTrace, generateErrorId } from "@/services/error/sanitizer";
import { shouldReportError } from "@/services/error/classifier";
import { ErrorSeverity, ERROR_SEVERITY_MAP } from "@/constants/errorMessages";

interface ErrorReport {
  error_message: string;
  stack_trace?: string;
  os?: string;
  app_version?: string;
  user_agent?: string;
  url?: string;
  user_id?: string;
  error_id?: string;
  severity?: string;
  sanitized_message?: string;
  category?: string;
}

// Circuit breaker for error reporting to prevent infinite loops
const errorReportingCircuitBreaker = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
  threshold: 5,
  timeout: 60000 // 1 minute
};

// Check if circuit breaker allows error reporting
const canReportError = (): boolean => {
  const now = Date.now();
  
  if (errorReportingCircuitBreaker.isOpen) {
    // Check if timeout has passed
    if (now - errorReportingCircuitBreaker.lastFailure > errorReportingCircuitBreaker.timeout) {
      errorReportingCircuitBreaker.isOpen = false;
      errorReportingCircuitBreaker.failures = 0;
    } else {
      return false;
    }
  }
  
  return true;
};

// Record error reporting failure
const recordErrorReportingFailure = () => {
  errorReportingCircuitBreaker.failures++;
  errorReportingCircuitBreaker.lastFailure = Date.now();
  
  if (errorReportingCircuitBreaker.failures >= errorReportingCircuitBreaker.threshold) {
    errorReportingCircuitBreaker.isOpen = true;
    console.warn('Error reporting circuit breaker opened due to repeated failures');
  }
};

// Get OS information from user agent
const getOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
};

// Get app version from package.json or set a default
const getAppVersion = (): string => {
  return '1.0.0';
};

// Check if error reporting is enabled
const isErrorReportingEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false';
};

// Determine error severity based on context
const determineErrorSeverity = (error: Error, additionalInfo?: Record<string, any>): ErrorSeverity => {
  const errorType = additionalInfo?.type || additionalInfo?.category || 'unknown';
  return ERROR_SEVERITY_MAP[errorType] || ErrorSeverity.MEDIUM;
};

export const reportError = async (error: Error, additionalInfo?: Record<string, any>) => {
  try {
    // Check circuit breaker first
    if (!canReportError()) {
      console.warn('Error reporting blocked by circuit breaker');
      return;
    }

    // Check if we should report this error
    if (!isErrorReportingEnabled() || !shouldReportError(error)) {
      console.warn('Error not reported:', error.message);
      return;
    }

    const userAgent = navigator.userAgent;
    const os = getOS(userAgent);
    const appVersion = getAppVersion();
    const url = window.location.href;
    
    // Get current user if authenticated
    let userId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (authError) {
      console.warn('Failed to get user for error reporting:', authError);
      // Continue without user ID
    }
    
    // Sanitize the error for safe reporting
    const sanitizedError = sanitizeError(error);
    const errorId = generateErrorId(error);
    const severity = determineErrorSeverity(error, additionalInfo);
    
    // Create sanitized error report with all required fields
    const errorReport: ErrorReport = {
      error_message: error.message || 'Unknown error',
      sanitized_message: sanitizedError.message,
      stack_trace: sanitizeStackTrace(error),
      os,
      app_version: appVersion,
      user_agent: userAgent,
      url,
      user_id: userId,
      error_id: errorId,
      severity: severity,
      category: additionalInfo?.category || 'runtime',
      ...additionalInfo
    };

    // Log error details in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.group('🔒 Secure Error Report');
      console.log('Original Error:', error);
      console.log('Sanitized Report:', errorReport);
      console.log('Severity:', severity);
      console.groupEnd();
    }

    // Only try to insert if bug_reports table exists (graceful degradation)
    try {
      const { error: insertError } = await supabase
        .from('bug_reports')
        .insert([errorReport]);

      if (insertError) {
        console.error('Failed to report error to Supabase:', insertError);
        recordErrorReportingFailure();
      } else {
        console.log('Error successfully reported with ID:', errorId);
        // Reset circuit breaker on success
        errorReportingCircuitBreaker.failures = 0;
      }
    } catch (dbError) {
      console.warn('Database not available for error reporting:', dbError);
      // Don't treat DB unavailability as a failure
    }
  } catch (reportingError) {
    console.error('Error while reporting error:', reportingError);
    recordErrorReportingFailure();
  }
};

// Global error handler for uncaught exceptions
export const setupGlobalErrorHandling = () => {
  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const error = new Error(event.message);
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`;
    reportError(error, {
      type: 'uncaught_exception',
      category: 'system',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new Error(event.reason?.message || 'Unhandled promise rejection');
    error.stack = event.reason?.stack || '';
    reportError(error, {
      type: 'unhandled_promise_rejection',
      category: 'system',
      reason: sanitizeStackTrace(event.reason)
    });
  });

  // Enhanced React error detection (more secure)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    try {
      // Only report actual React errors, not all console.error calls
      const errorMessage = args.join(' ');
      if ((errorMessage.includes('React') && errorMessage.includes('Error')) ||
          errorMessage.includes('Warning: Failed prop type')) {
        const error = new Error('React error detected');
        reportError(error, {
          type: 'react_error',
          category: 'system',
          has_react_error: true
        });
      }
    } catch (err) {
      // Don't let error reporting break console.error
      console.warn('Failed to process console.error for reporting:', err);
    }
    originalConsoleError(...args);
  };
};

// Enhanced error reporting for specific contexts with better error handling
export const reportUserActionError = (error: Error, action: string, context?: Record<string, any>) => {
  reportError(error, {
    type: 'user_action',
    category: 'medium',
    action,
    ...context
  }).catch(err => {
    console.warn('Failed to report user action error:', err);
  });
};

export const reportNetworkError = (error: Error, endpoint: string, method: string = 'GET') => {
  reportError(error, {
    type: 'network_error',
    category: 'network',
    endpoint,
    method
  }).catch(err => {
    console.warn('Failed to report network error:', err);
  });
};

export const reportSecurityError = (error: Error, securityContext: string) => {
  reportError(error, {
    type: 'security_error',
    category: 'security',
    security_context: securityContext
  }).catch(err => {
    console.warn('Failed to report security error:', err);
  });
};

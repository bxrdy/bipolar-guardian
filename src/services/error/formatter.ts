import { SanitizedError, ErrorFormatting } from './types';
import { classifyError } from './classifier';

// Default error formatting
const DEFAULT_ERROR_TITLE = 'An error occurred';
const DEFAULT_ERROR_DESCRIPTION = 'Please try again later';

// Helper function to get error title based on category
const getErrorTitle = (category: string): string => {
  switch (category) {
    case 'auth':
      return 'Authentication Error';
    case 'validation':
      return 'Validation Error';
    case 'network':
      return 'Network Error';
    case 'database':
      return 'Database Error';
    case 'security':
      return 'Security Error';
    case 'ai':
      return 'AI Service Error';
    case 'storage':
      return 'Storage Error';
    case 'runtime':
      return 'Runtime Error';
    default:
      return DEFAULT_ERROR_TITLE;
  }
};

// Helper function to get error description from error object
const getErrorDescription = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  } else {
    return DEFAULT_ERROR_DESCRIPTION;
  }
};

// Helper function to get severity variant
const getSeverityVariant = (severity: string): 'default' | 'destructive' => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'destructive';
    default:
      return 'default';
  }
};

// Helper function to get notification type
const getNotificationType = (severity: string): 'success' | 'info' | 'warning' | 'error' => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
};

// Helper function to get duration by severity
const getDurationBySeverity = (severity: string): number => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 10000; // 10 seconds
    case 'medium':
      return 5000;  // 5 seconds
    default:
      return 3000;  // 3 seconds
  }
};

// Helper function to get error code from error object
const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string') {
    return (error as any).code;
  }
  return undefined;
};

// Helper function to get health-specific message
const getHealthSpecificMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  } else {
    return 'Unable to retrieve health data. Please try again later.';
  }
};

export const formatErrorForToast = (error: unknown): ErrorFormatting => {
  const classification = classifyError(error);
  
  return {
    title: getErrorTitle(classification.category),
    description: getErrorDescription(error),
    variant: getSeverityVariant(classification.severity),
    duration: getDurationBySeverity(classification.severity)
  };
};

export const formatErrorForBoundary = (error: unknown): ErrorFormatting => {
  const classification = classifyError(error);
  
  return {
    title: 'Application Error',
    description: 'An unexpected error occurred. Please refresh the page and try again.',
    variant: 'destructive',
    showRetry: true,
    showReport: classification.reportable
  };
};

export const formatErrorForConsole = (error: unknown, context?: string): string => {
  const errorMessage = typeof error === 'string' ? error : 
    (error && typeof error === 'object' && 'message' in error ? 
      String((error as any).message) : 'Unknown error');
  
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';
  
  return `${timestamp} ${contextStr}${errorMessage}`;
};

export const formatErrorForNotification = (error: unknown): ErrorFormatting => {
  const classification = classifyError(error);
  
  return {
    title: getErrorTitle(classification.category),
    description: getErrorDescription(error),
    type: getNotificationType(classification.severity),
    persistent: classification.severity === 'critical'
  };
};

export const formatErrorForAPI = (error: unknown): ErrorFormatting => {
  const classification = classifyError(error);
  
  return {
    message: getErrorDescription(error),
    code: getErrorCode(error),
    severity: classification.severity,
    timestamp: Date.now()
  };
};

export const formatHealthDataError = (error: unknown): ErrorFormatting => {
  const classification = classifyError(error);
  
  return {
    title: 'Health Data Error',
    description: getHealthSpecificMessage(error),
    variant: getSeverityVariant(classification.severity),
    showSupport: true
  };
};

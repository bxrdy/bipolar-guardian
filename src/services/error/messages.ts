import { SanitizedError } from './types';

// User-friendly error messages for common scenarios
export const FRIENDLY_ERROR_MESSAGES: Record<string, SanitizedError> = {
  // Authentication errors
  'unauthorized': {
    message: 'Please sign in to continue',
    code: 'AUTH_REQUIRED',
    userAction: 'Sign in to your account'
  },
  'invalid_token': {
    message: 'Your session has expired',
    code: 'SESSION_EXPIRED',
    userAction: 'Please sign in again'
  },
  'authentication_failed': {
    message: 'Invalid email or password',
    code: 'AUTH_FAILED',
    userAction: 'Check your credentials and try again'
  },
  'account_locked': {
    message: 'Account temporarily locked for security',
    code: 'ACCOUNT_LOCKED',
    userAction: 'Please try again later or contact support'
  },
  
  // Network errors
  'network_error': {
    message: 'Connection problem detected',
    code: 'NETWORK_ERROR',
    userAction: 'Check your internet connection and try again'
  },
  'timeout': {
    message: 'Request timed out',
    code: 'TIMEOUT',
    userAction: 'Please try again'
  },
  'offline': {
    message: 'You appear to be offline',
    code: 'OFFLINE',
    userAction: 'Check your internet connection'
  },
  
  // Database errors
  'database_error': {
    message: 'Unable to save your data',
    code: 'SAVE_FAILED',
    userAction: 'Please try again in a moment'
  },
  'constraint_violation': {
    message: 'This information conflicts with existing data',
    code: 'DUPLICATE_DATA',
    userAction: 'Please check your input and try again'
  },
  'data_not_found': {
    message: 'The requested information was not found',
    code: 'NOT_FOUND',
    userAction: 'Please refresh the page or check your selection'
  },
  
  // File/Storage errors
  'file_too_large': {
    message: 'File is too large to upload',
    code: 'FILE_SIZE_ERROR',
    userAction: 'Please select a smaller file'
  },
  'unsupported_file': {
    message: 'File type not supported',
    code: 'FILE_TYPE_ERROR',
    userAction: 'Please select a different file type'
  },
  'storage_error': {
    message: 'File operation failed',
    code: 'STORAGE_ERROR',
    userAction: 'Please try again'
  },
  'quota_exceeded': {
    message: 'Storage quota exceeded',
    code: 'STORAGE_FULL',
    userAction: 'Please delete some files or contact support'
  },
  
  // API errors
  'api_key_error': {
    message: 'Service configuration issue',
    code: 'CONFIG_ERROR',
    userAction: 'Please contact support'
  },
  'rate_limited': {
    message: 'Too many requests',
    code: 'RATE_LIMITED',
    userAction: 'Please wait a moment before trying again'
  },
  'service_unavailable': {
    message: 'Service temporarily unavailable',
    code: 'SERVICE_DOWN',
    userAction: 'Please try again later'
  },
  
  // Validation errors
  'validation_error': {
    message: 'Please check your input',
    code: 'VALIDATION_FAILED',
    userAction: 'Correct the highlighted fields and try again'
  },
  'required_field': {
    message: 'Required field is missing',
    code: 'FIELD_REQUIRED',
    userAction: 'Please fill in all required fields'
  },
  'invalid_format': {
    message: 'Invalid format',
    code: 'FORMAT_ERROR',
    userAction: 'Please check the format and try again'
  },
  
  // Health data specific errors
  'baseline_insufficient_data': {
    message: 'Not enough data to calculate baseline',
    code: 'INSUFFICIENT_DATA',
    userAction: 'Continue tracking for a few more days'
  },
  'mood_entry_duplicate': {
    message: 'You\'ve already logged your mood today',
    code: 'DUPLICATE_ENTRY',
    userAction: 'You can edit your existing entry instead'
  },
  'medication_schedule_conflict': {
    message: 'Medication schedule conflict detected',
    code: 'SCHEDULE_CONFLICT',
    userAction: 'Please adjust the timing or contact your healthcare provider'
  },
  
  // Security errors
  'suspicious_activity': {
    message: 'Unusual activity detected',
    code: 'SECURITY_ALERT',
    userAction: 'Please verify your identity'
  },
  'device_not_recognized': {
    message: 'Unrecognized device',
    code: 'DEVICE_UNKNOWN',
    userAction: 'Please verify this is your device'
  },
  'permissions_error': {
    message: 'You don\'t have permission for this action',
    code: 'PERMISSION_DENIED',
    userAction: 'Contact your administrator if you believe this is an error'
  },
  
  // Generic fallbacks
  'unknown_error': {
    message: 'Something went wrong',
    code: 'UNKNOWN_ERROR',
    userAction: 'Please try again or contact support if the problem persists'
  },
  'server_error': {
    message: 'Server error occurred',
    code: 'SERVER_ERROR',
    userAction: 'Please try again later'
  },
  'client_error': {
    message: 'An error occurred in the application',
    code: 'CLIENT_ERROR',
    userAction: 'Please refresh the page and try again'
  }
};

// Error message templates for dynamic content
export const ERROR_TEMPLATES = {
  FIELD_VALIDATION: (fieldName: string) => ({
    message: `Invalid ${fieldName}`,
    code: 'FIELD_INVALID',
    userAction: `Please enter a valid ${fieldName}`
  }),
  
  RESOURCE_NOT_FOUND: (resourceType: string) => ({
    message: `${resourceType} not found`,
    code: 'RESOURCE_NOT_FOUND',
    userAction: `The ${resourceType} you're looking for doesn't exist`
  }),
  
  OPERATION_FAILED: (operation: string) => ({
    message: `Failed to ${operation}`,
    code: 'OPERATION_FAILED',
    userAction: `Unable to ${operation}. Please try again`
  }),
  
  QUOTA_EXCEEDED: (resourceType: string, limit: string) => ({
    message: `${resourceType} limit exceeded`,
    code: 'QUOTA_EXCEEDED',
    userAction: `You've reached the ${limit} limit for ${resourceType}`
  })
};

// Contextual error messages based on user state
export const CONTEXTUAL_MESSAGES = {
  NEW_USER: {
    'database_error': {
      message: 'Trouble setting up your account',
      code: 'SETUP_ERROR',
      userAction: 'Please try creating your account again'
    }
  },
  
  ONBOARDING: {
    'validation_error': {
      message: 'Let\'s complete your profile',
      code: 'PROFILE_INCOMPLETE',
      userAction: 'Please fill in the required information'
    }
  },
  
  PREMIUM_USER: {
    'quota_exceeded': {
      message: 'Premium storage limit reached',
      code: 'PREMIUM_QUOTA_EXCEEDED',
      userAction: 'Please manage your files or upgrade your plan'
    }
  }
};

// Error messages that should never be shown to users (security-sensitive)
export const SENSITIVE_ERROR_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /hash/i,
  /salt/i,
  /sql/i,
  /database/i,
  /connection string/i,
  /api key/i,
  /internal server/i,
  /stack trace/i,
  /file path/i,
  /directory/i
];

// Default error message for when we can't classify an error
export const DEFAULT_ERROR: SanitizedError = {
  message: 'An unexpected error occurred',
  code: 'UNEXPECTED_ERROR',
  userAction: 'Please try again or contact support if the problem continues'
};
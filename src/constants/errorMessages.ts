
// Error Message Constants
// Centralized, user-friendly error messages for consistent UX

export const ERROR_MESSAGES = {
  // Authentication & Authorization
  AUTH: {
    REQUIRED: 'Please sign in to continue',
    INVALID_CREDENTIALS: 'Invalid email or password',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again',
    ACCESS_DENIED: 'You do not have permission to perform this action',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked for security'
  },

  // Data Operations
  DATA: {
    SAVE_FAILED: 'Unable to save your data. Please try again',
    LOAD_FAILED: 'Unable to load data. Please refresh the page',
    DELETE_FAILED: 'Unable to delete this item. Please try again',
    DUPLICATE_ENTRY: 'This entry already exists',
    VALIDATION_ERROR: 'Please check your input and try again'
  },

  // File Operations
  FILE: {
    UPLOAD_FAILED: 'File upload failed. Please try again',
    DOWNLOAD_FAILED: 'Unable to download file. Please try again',
    TOO_LARGE: 'File is too large. Please select a smaller file',
    UNSUPPORTED_TYPE: 'File type not supported. Please select a different file',
    NOT_FOUND: 'File not found. It may have been deleted'
  },

  // Network & Connectivity
  NETWORK: {
    CONNECTION_ERROR: 'Connection problem. Please check your internet and try again',
    TIMEOUT: 'Request timed out. Please try again',
    SERVER_ERROR: 'Server error. Please try again later',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later'
  },

  // AI & External Services
  AI: {
    SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable',
    RATE_LIMITED: 'Too many requests. Please wait a moment before trying again',
    CONFIG_ERROR: 'AI service configuration issue. Please contact support',
    PROCESSING_FAILED: 'AI processing failed. Please try again'
  },

  // Medications
  MEDICATIONS: {
    ADD_FAILED: 'Unable to add medication. Please try again',
    UPDATE_FAILED: 'Unable to update medication. Please try again',
    DELETE_FAILED: 'Unable to remove medication. Please try again',
    INVALID_SCHEDULE: 'Invalid medication schedule. Please check your input',
    DUPLICATE_MEDICATION: 'This medication is already in your list'
  },

  // Documents
  DOCUMENTS: {
    UPLOAD_FAILED: 'Document upload failed. Please try again',
    DELETE_FAILED: 'Unable to delete document. Please try again',
    TEXT_EXTRACTION_FAILED: 'Text extraction failed. Please try again',
    PREVIEW_FAILED: 'Unable to preview document. Please try again'
  },

  // Mood Tracking
  MOOD: {
    SAVE_FAILED: 'Unable to save mood entry. Please try again',
    LOAD_FAILED: 'Unable to load mood data. Please refresh the page',
    INVALID_ENTRY: 'Invalid mood data. Please check your input'
  },

  // Settings
  SETTINGS: {
    SAVE_FAILED: 'Unable to save settings. Please try again',
    LOAD_FAILED: 'Unable to load settings. Please refresh the page',
    INVALID_CONFIG: 'Invalid configuration. Please check your settings'
  },

  // Guardian Chat
  GUARDIAN: {
    MESSAGE_FAILED: 'Unable to send message. Please try again',
    LOAD_FAILED: 'Unable to load conversation. Please refresh the page',
    MODEL_UNAVAILABLE: 'AI model temporarily unavailable. Using backup model'
  },

  // Generic Messages
  GENERIC: {
    UNKNOWN_ERROR: 'Something went wrong. Please try again',
    MAINTENANCE: 'System maintenance in progress. Please try again later',
    FEATURE_UNAVAILABLE: 'This feature is temporarily unavailable',
    PERMISSIONS_ERROR: 'Insufficient permissions for this action'
  }
} as const;

// Action suggestions for different error types
export const ERROR_ACTIONS = {
  RETRY: 'Please try again',
  REFRESH: 'Please refresh the page and try again',
  SIGN_IN: 'Please sign in and try again',
  CONTACT_SUPPORT: 'Please contact support if this problem persists',
  CHECK_CONNECTION: 'Please check your internet connection',
  WAIT_AND_RETRY: 'Please wait a moment and try again',
  CHECK_INPUT: 'Please check your input and try again',
  RELOAD_APP: 'Please reload the application'
} as const;

// Error severity levels for logging and display
export enum ErrorSeverity {
  LOW = 'low',        // User errors, validation issues
  MEDIUM = 'medium',  // Network issues, temporary failures
  HIGH = 'high',      // System errors, data corruption
  CRITICAL = 'critical' // Security issues, major system failures
}

// Maps error types to their severity
export const ERROR_SEVERITY_MAP: Record<string, ErrorSeverity> = {
  'auth': ErrorSeverity.MEDIUM,
  'validation': ErrorSeverity.LOW,
  'network': ErrorSeverity.MEDIUM,
  'database': ErrorSeverity.HIGH,
  'system': ErrorSeverity.HIGH,
  'security': ErrorSeverity.CRITICAL,
  'ai': ErrorSeverity.MEDIUM,
  'storage': ErrorSeverity.MEDIUM
};

// Fix the empty object type issue
export const ERROR_TEMPLATES: Record<string, Record<string, string>> = {
  network: {
    title: 'Connection Problem',
    description: 'Unable to connect to our servers',
    action: 'Check your internet connection and try again'
  },
  auth: {
    title: 'Authentication Error',
    description: 'Please sign in to continue',
    action: 'Sign in to your account'
  },
  validation: {
    title: 'Invalid Input',
    description: 'Please check your information',
    action: 'Correct the errors and try again'
  }
};

// Helper function to get error message by path
export function getErrorMessage(path: string): string {
  const keys = path.split('.');
  let current: Record<string, unknown> = ERROR_MESSAGES;
  
  for (const key of keys) {
    if (current[key.toUpperCase()]) {
      current = current[key.toUpperCase()] as Record<string, unknown>;
    } else {
      return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
    }
  }
  
  return typeof current === 'string' ? current : ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
}

// Helper function to get appropriate action for error type
export function getErrorAction(errorType: string): string {
  switch (errorType.toLowerCase()) {
    case 'auth':
    case 'authentication':
      return ERROR_ACTIONS.SIGN_IN;
    case 'network':
    case 'timeout':
      return ERROR_ACTIONS.CHECK_CONNECTION;
    case 'validation':
      return ERROR_ACTIONS.CHECK_INPUT;
    case 'rate_limit':
      return ERROR_ACTIONS.WAIT_AND_RETRY;
    case 'system':
    case 'critical':
      return ERROR_ACTIONS.CONTACT_SUPPORT;
    default:
      return ERROR_ACTIONS.RETRY;
  }
}

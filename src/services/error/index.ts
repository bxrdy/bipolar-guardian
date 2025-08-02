// Main error service exports

// Types
export * from './types';

// Messages and configuration
export * from './messages';

// Classification
export * from './classifier';

// Sanitization
export * from './sanitizer';

// Formatting
export * from './formatter';

// Main API re-exports for easy access
export {
  sanitizeErrorMessage,
  createFriendlyError,
  sanitizeError,
  sanitizeStackTrace,
  generateErrorId
} from './sanitizer';

export {
  classifyError,
  getErrorCategory,
  getErrorSeverity,
  shouldReportError,
  isUserFacingError
} from './classifier';

export {
  formatErrorForToast,
  formatErrorForBoundary,
  formatErrorForConsole,
  formatErrorForNotification,
  formatErrorForAPI,
  formatHealthDataError
} from './formatter';

// Configuration and messages
export {
  FRIENDLY_ERROR_MESSAGES,
  ERROR_TEMPLATES,
  CONTEXTUAL_MESSAGES,
  DEFAULT_ERROR
} from './messages';

// Common types for importing
export type {
  SanitizedError,
  ErrorClassification,
  ErrorSanitizationOptions,
  ErrorFormatting,
  ErrorMetadata,
  ErrorCategory,
  ErrorSeverity,
  ErrorPattern
} from './types';
// Re-export the error service for backwards compatibility
// This file maintains the existing API while using the new modular structure

export * from '../services/error';

// Legacy exports for backwards compatibility
export type { SanitizedError } from '../services/error/types';

export {
  sanitizeErrorMessage,
  createFriendlyError,
  sanitizeError,
  sanitizeStackTrace,
  generateErrorId
} from '../services/error/sanitizer';

export {
  classifyError,
  shouldReportError
} from '../services/error/classifier';

export {
  formatErrorForToast,
  formatErrorForBoundary
} from '../services/error/formatter';

// Legacy function aliases
export { classifyError as classifyErrorMessage } from '../services/error/classifier';
export { FRIENDLY_ERROR_MESSAGES } from '../services/error/messages';
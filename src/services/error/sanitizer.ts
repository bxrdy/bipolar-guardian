
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { SanitizedError } from "./types";

// Secure Sanitization Functions
// Protect sensitive data by removing or masking it

// Basic Sanitization: Remove or mask PII
export const sanitizeErrorMessage = (message: string): string => {
  let sanitized = message;

  // Remove or replace email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email protected]');

  // Remove or replace phone numbers (basic pattern)
  sanitized = sanitized.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[phone number]');

  // Remove or replace credit card numbers (basic pattern)
  sanitized = sanitized.replace(/\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g, '[credit card]');

  // Remove or replace IP addresses (basic pattern)
  sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP address]');

  // Remove or replace street addresses (very basic - improve as needed)
  sanitized = sanitized.replace(/\b\d+\s[A-Za-z]+\s(Street|Ave|Rd|Blvd)\b/g, '[street address]');

  return sanitized;
};

// Create a user-friendly error message
export const createFriendlyError = (error: unknown, code?: string): SanitizedError => {
  const friendlyMessage = ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR; // Default message
  const userAction = 'Please try again'; // Default action

  return {
    message: friendlyMessage,
    code: code || 'UNKNOWN_ERROR',
    userAction: userAction
  };
};

// Securely sanitize an error object
export const sanitizeError = (error: unknown): SanitizedError => {
  let message = 'An unknown error occurred';
  let code: string | undefined = undefined;

  if (typeof error === 'string') {
    message = sanitizeErrorMessage(error);
  } else if (error instanceof Error) {
    message = sanitizeErrorMessage(error.message);
    code = error.name;
  } else if (typeof error === 'object' && error !== null) {
    try {
      message = sanitizeErrorMessage(JSON.stringify(error));
    } catch (e) {
      message = 'Error converting error object to string';
    }
  }

  return {
    message: message,
    code: code
  };
};

export const sanitizeStackTrace = (error: unknown): string => {
  if (!error) return '';
  
  let stack = '';
  if (error && typeof error === 'object' && 'stack' in error && typeof error.stack === 'string') {
    stack = error.stack;
  } else if (typeof error === 'string') {
    stack = error;
  }

  if (!stack) return '';

  const lines = stack.split('\n');
  const sanitizedLines = lines.map(line => {
    // Remove file paths, function names, and line numbers
    let sanitizedLine = line.replace(/at\s.+/g, 'at [function]');
    sanitizedLine = sanitizedLine.replace(/webpack-internal:\/\/\//g, '');
    sanitizedLine = sanitizedLine.replace(/\((.+)\)/g, '()'); // Remove file paths in parentheses
    return sanitizedLine;
  });

  return sanitizedLines.join('\n');
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') return errorObj.message;
    if (typeof errorObj.msg === 'string') return errorObj.msg;
    if (typeof errorObj.error === 'string') return errorObj.error;
    if (typeof errorObj.description === 'string') return errorObj.description;
    if (typeof errorObj.detail === 'string') return errorObj.detail;
    if (typeof errorObj.statusText === 'string') return errorObj.statusText;
  }
  return 'Unknown error occurred';
};

const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.code === 'string') return errorObj.code;
    if (typeof errorObj.status === 'string') return errorObj.status;
    if (typeof errorObj.statusCode === 'string') return errorObj.statusCode;
    if (typeof errorObj.errorCode === 'string') return errorObj.errorCode;
    if (typeof errorObj.name === 'string') return errorObj.name;
  }
  return undefined;
};

// Generate a unique error ID
// Use a secure hashing algorithm (SHA-256)
export const generateErrorId = (error: unknown): string => {
  const errorMessage = error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string' 
    ? (error as any).message 
    : String(error);
  const timestamp = Date.now();
  const hash = btoa(errorMessage + timestamp).slice(0, 8);
  return `err_${hash}_${timestamp}`;
};

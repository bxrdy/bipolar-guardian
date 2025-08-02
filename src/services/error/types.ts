
// Error handling types

export interface SanitizedError {
  message: string;
  code?: string;
  userAction?: string;
}

export interface ErrorClassification {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportable: boolean;
  userFacing: boolean;
}

export interface ErrorSanitizationOptions {
  includeStackTrace?: boolean;
  includeUserAction?: boolean;
  customMessage?: string;
  context?: string;
  reportToService?: boolean;
}

// Error formatting interface for different UI contexts
export interface ErrorFormatting {
  title?: string;
  description?: string;
  message?: string;
  variant?: 'default' | 'destructive';
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  persistent?: boolean;
  showRetry?: boolean;
  showReport?: boolean;
  showSupport?: boolean;
  code?: string;
  severity?: string;
  timestamp?: number;
}

export interface ErrorMetadata {
  errorId: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

export interface ErrorReportingConfig {
  enableReporting: boolean;
  endpoints: {
    internal?: string;
    external?: string;
  };
  filters: {
    excludeMessages?: string[];
    excludeCodes?: string[];
    minimumSeverity?: 'low' | 'medium' | 'high' | 'critical';
  };
  rateLimiting: {
    maxErrorsPerMinute: number;
    maxDuplicateErrors: number;
  };
}

export type ErrorCategory = 
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'database'
  | 'storage'
  | 'api'
  | 'validation'
  | 'runtime'
  | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorPattern {
  pattern: RegExp | string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  friendlyMessage: string;
  userAction?: string;
  reportable: boolean;
}

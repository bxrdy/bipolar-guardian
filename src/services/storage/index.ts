
// Main storage service exports

// Types
export * from './types';

// Configuration
export * from './config';
export * from './configManager';

// Logging
export * from './logger';

// Security
export * from './security';

// Main API re-exports for easy access
export {
  getStorageSecurityConfig,
  updateStorageSecurityConfig,
  getStorageConfig,
  getEnvironmentConfig,
  validateStorageConfig
} from './configManager';

export {
  logStorageAccess,
  logFileAccess,
  getUserFileAccessLogs,
  getFileAccessMetrics,
  cleanupOldAccessLogs
} from './logger';

export {
  validateFileAccess,
  getPresignedURL,
  validateFileUpload,
  generateSecureSignedUrl,
  secureFileUpload,
  cleanupExpiredSignedUrls,
  sanitizeFileName,
  generateSecureFilePath
} from './security';

// Configuration presets
export {
  DEFAULT_STORAGE_CONFIG,
  STRICT_STORAGE_CONFIG,
  DEV_STORAGE_CONFIG,
  STORAGE_BUCKETS,
  FILE_SIZE_LIMITS,
  LOG_RETENTION
} from './config';

// Common types for importing
export type {
  StorageSecurityConfig,
  FileAccessLog,
  FileUploadParams,
  FileUploadResult,
  FileValidationResult,
  SignedUrlParams,
  SignedUrlResult,
  AccessMetrics,
  StorageError
} from './types';

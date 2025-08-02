
// Re-export the storage service for backwards compatibility
// This file maintains the existing API while using the new modular structure

export * from '../services/storage';

// Legacy exports for backwards compatibility
export type { 
  StorageSecurityConfig, 
  FileAccessLog 
} from '../services/storage/types';

export {
  getStorageSecurityConfig,
  updateStorageSecurityConfig,
  getStorageConfig
} from '../services/storage/configManager';

export {
  logStorageAccess,
  logFileAccess,
  getUserFileAccessLogs,
  getFileAccessMetrics
} from '../services/storage/logger';

export {
  validateFileAccess,
  getPresignedURL,
  validateFileUpload,
  generateSecureSignedUrl,
  secureFileUpload,
  cleanupExpiredSignedUrls
} from '../services/storage/security';

// Backwards compatibility aliases
export { DEFAULT_STORAGE_CONFIG as DEFAULT_CONFIG } from '../services/storage/config';

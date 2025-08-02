import { StorageSecurityConfig } from './types';

// Default storage security configuration
export const DEFAULT_STORAGE_CONFIG: StorageSecurityConfig = {
  signed_url_expiry_minutes: 15,
  enable_access_logging: true,
  max_file_size_mb: 50,
  allowed_mime_types: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Strict security configuration (smaller files, shorter expiry)
export const STRICT_STORAGE_CONFIG: StorageSecurityConfig = {
  signed_url_expiry_minutes: 5,
  enable_access_logging: true,
  max_file_size_mb: 10,
  allowed_mime_types: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]
};

// Relaxed configuration for development
export const DEV_STORAGE_CONFIG: StorageSecurityConfig = {
  signed_url_expiry_minutes: 60,
  enable_access_logging: false,
  max_file_size_mb: 100,
  allowed_mime_types: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// Common MIME type mappings
export const MIME_TYPE_EXTENSIONS = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
} as const;

// File size limits by type
export const FILE_SIZE_LIMITS = {
  'image/jpeg': 10, // 10MB
  'image/png': 10,
  'image/gif': 5,
  'image/webp': 10,
  'application/pdf': 25, // 25MB
  'text/plain': 1, // 1MB
  'text/csv': 5,
  'application/json': 1,
  'application/msword': 15,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 15,
  'application/vnd.ms-excel': 10,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 10
} as const;

// Storage bucket configurations
export const STORAGE_BUCKETS = {
  MEDICAL_DOCUMENTS: 'medical-documents',
  PROFILE_IMAGES: 'profile-images',
  TEMP_UPLOADS: 'temp-uploads',
  SYSTEM_BACKUPS: 'system-backups'
} as const;

// Access log retention periods
export const LOG_RETENTION = {
  ACCESS_LOGS: 90, // days
  ERROR_LOGS: 180,
  AUDIT_LOGS: 365
} as const;
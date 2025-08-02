// Storage service types

export interface StorageSecurityConfig {
  signed_url_expiry_minutes: number;
  enable_access_logging: boolean;
  max_file_size_mb: number;
  allowed_mime_types: string[];
}

export interface FileAccessLog {
  id: string;
  user_id: string;
  file_path: string;
  bucket_name: string;
  access_type: 'download' | 'upload' | 'delete' | 'view';
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  file_size?: number;
  mime_type?: string;
  signed_url_used: boolean;
  accessed_at: string;
}

export interface FileUploadParams {
  file: File;
  bucket: string;
  path: string;
  user_id: string;
  validate?: boolean;
  generate_signed_url?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  file_path?: string;
  signed_url?: string;
  error_message?: string;
  file_size?: number;
  mime_type?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error_message?: string;
  file_info: {
    name: string;
    size: number;
    type: string;
    last_modified: number;
  };
}

export interface SignedUrlParams {
  bucket: string;
  path: string;
  expiry_seconds?: number;
  operation?: 'read' | 'write';
  user_id?: string;
}

export interface SignedUrlResult {
  url: string;
  expires_at: string;
  signed_url_id?: string;
}

export interface AccessMetrics {
  total_accesses: number;
  successful_accesses: number;
  failed_accesses: number;
  unique_users: number;
  top_file_types: Array<{
    mime_type: string;
    count: number;
  }>;
  access_by_type: Array<{
    access_type: string;
    count: number;
  }>;
  time_range: string;
}

export interface StorageError {
  code: string;
  message: string;
  details?: any;
}
import { supabase } from '@/integrations/supabase/client';
import { StorageSecurityConfig } from './types';
import { DEFAULT_STORAGE_CONFIG } from './config';

/**
 * Get current storage security configuration
 */
export async function getStorageSecurityConfig(): Promise<StorageSecurityConfig> {
  try {
    // Storage security configuration disabled until tables are created
    console.warn('Storage security config disabled - storage_security_config table not created');
    return DEFAULT_STORAGE_CONFIG;
    
    // TODO: Uncomment when storage_security_config table is created
    /*
    const { data, error } = await supabase
      .from('storage_security_config')
      .select('*')
      .single();
    
    if (error) {
      console.warn('Failed to get storage security config:', error);
      return DEFAULT_STORAGE_CONFIG;
    }
    
    return {
      signed_url_expiry_minutes: data.signed_url_expiry_minutes || DEFAULT_STORAGE_CONFIG.signed_url_expiry_minutes,
      enable_access_logging: data.enable_access_logging ?? DEFAULT_STORAGE_CONFIG.enable_access_logging,
      max_file_size_mb: data.max_file_size_mb || DEFAULT_STORAGE_CONFIG.max_file_size_mb,
      allowed_mime_types: data.allowed_mime_types || DEFAULT_STORAGE_CONFIG.allowed_mime_types
    };
    */
  } catch (error) {
    console.warn('Failed to get storage security config, using defaults:', error);
    return DEFAULT_STORAGE_CONFIG;
  }
}

/**
 * Update storage security configuration
 */
export async function updateStorageSecurityConfig(config: Partial<StorageSecurityConfig>): Promise<void> {
  try {
    // Storage security configuration disabled until tables are created
    console.warn('Storage security config update disabled - storage_security_config table not created');
    
    // TODO: Uncomment when storage_security_config table is created
    /*
    const { error } = await supabase
      .from('storage_security_config')
      .upsert({
        ...config,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Failed to update storage security config: ${error.message}`);
    }
    */
  } catch (error) {
    console.warn('Failed to update storage security config:', error);
    throw error;
  }
}

/**
 * Alias for getStorageSecurityConfig for backwards compatibility
 */
export async function getStorageConfig(): Promise<StorageSecurityConfig> {
  return getStorageSecurityConfig();
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(config: Partial<StorageSecurityConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.signed_url_expiry_minutes !== undefined) {
    if (config.signed_url_expiry_minutes < 1 || config.signed_url_expiry_minutes > 1440) {
      errors.push('Signed URL expiry must be between 1 and 1440 minutes');
    }
  }
  
  if (config.max_file_size_mb !== undefined) {
    if (config.max_file_size_mb < 1 || config.max_file_size_mb > 1000) {
      errors.push('Max file size must be between 1 and 1000 MB');
    }
  }
  
  if (config.allowed_mime_types !== undefined) {
    if (!Array.isArray(config.allowed_mime_types) || config.allowed_mime_types.length === 0) {
      errors.push('Allowed MIME types must be a non-empty array');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get configuration with environment-specific overrides
 */
export async function getEnvironmentConfig(): Promise<StorageSecurityConfig> {
  const baseConfig = await getStorageSecurityConfig();
  
  // Apply environment-specific overrides
  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      signed_url_expiry_minutes: 60, // Longer expiry for dev
      enable_access_logging: false // Disable logging in dev
    };
  }
  
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      signed_url_expiry_minutes: Math.min(baseConfig.signed_url_expiry_minutes, 15), // Max 15 minutes in prod
      enable_access_logging: true // Always enable in prod
    };
  }
  
  return baseConfig;
}
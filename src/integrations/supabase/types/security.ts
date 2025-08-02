import { Database, Tables, TablesInsert, TablesUpdate } from './database';

// Security-related table types
export type DeviceFingerprint = Tables<'device_fingerprints'>;
export type SecurityConfiguration = Tables<'security_configuration'>;
export type AuthEvent = Tables<'auth_events'>;
export type ActiveSession = Tables<'active_sessions'>;

export type DeviceFingerprintInsert = TablesInsert<'device_fingerprints'>;
export type SecurityConfigurationInsert = TablesInsert<'security_configuration'>;
export type AuthEventInsert = TablesInsert<'auth_events'>;
export type ActiveSessionInsert = TablesInsert<'active_sessions'>;

export type DeviceFingerprintUpdate = TablesUpdate<'device_fingerprints'>;
export type SecurityConfigurationUpdate = TablesUpdate<'security_configuration'>;
export type AuthEventUpdate = TablesUpdate<'auth_events'>;
export type ActiveSessionUpdate = TablesUpdate<'active_sessions'>;

// Device fingerprinting types
export interface DeviceFingerprintData {
  userAgent: string;
  language: string;
  platform: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  timezone: {
    offset: number;
    name: string;
  };
  canvas: string;
  webgl: string;
  audio: string;
  plugins: string[];
  fonts: string[];
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
  };
  features: {
    touchSupport: boolean;
    cookieEnabled: boolean;
    doNotTrack: string | null;
  };
  hardware: {
    cores: number;
    memory?: number;
    battery?: {
      level: number;
      charging: boolean;
    };
  };
  network: {
    connection?: string;
    effectiveType?: string;
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface DeviceFingerprintResult {
  id: string;
  hash: string;
  components: DeviceFingerprintData;
  timestamp: number;
  confidence: number;
  isUnique: boolean;
}

// Security event types
export type SecurityEventType = 
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_created'
  | 'session_expired'
  | 'session_timeout'
  | 'password_change'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'device_registered'
  | 'device_trust_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'security_settings_changed';

export interface SecurityEventMetadata {
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  risk_score?: number;
  detection_method?: string;
  additional_data?: Record<string, any>;
}

// Security configuration types
export interface SecurityConfig {
  session_timeout_minutes: number;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  require_device_verification: boolean;
  enable_geolocation_tracking: boolean;
  suspicious_activity_threshold: number;
  enable_real_time_monitoring: boolean;
  two_factor_required: boolean;
}

export interface SecurityAlert {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  user_id?: string;
  resolved: boolean;
  metadata?: SecurityEventMetadata;
}

// Session security types
export interface SessionSecurityConfig {
  timeout_minutes: number;
  warning_threshold_minutes: number;
  extend_on_activity: boolean;
  force_logout_on_suspicious: boolean;
  require_reauth_for_sensitive: boolean;
}

export interface SessionSecurityState {
  timeRemaining: number;
  isActive: boolean;
  showWarning: boolean;
  showFinalWarning: boolean;
  isSensitiveMode: boolean;
  lastActivity: number;
}

// Two-factor authentication types
export interface TwoFactorSetup {
  enabled: boolean;
  method: 'app' | 'sms' | 'email';
  backup_codes?: string[];
  secret_key?: string;
  qr_code?: string;
}

// Device trust levels
export type DeviceTrustLevel = 'unknown' | 'untrusted' | 'trusted' | 'verified';

export interface TrustedDevice {
  id: string;
  name: string;
  fingerprint_hash: string;
  trust_level: DeviceTrustLevel;
  first_seen: string;
  last_seen: string;
  location?: string;
  user_agent: string;
}

// Security metrics types
export interface SecurityMetrics {
  total_events: number;
  failed_logins: number;
  successful_logins: number;
  suspicious_activities: number;
  active_sessions: number;
  trusted_devices: number;
  security_score: number;
  time_period: {
    start: string;
    end: string;
  };
}

// Real-time security monitoring
export interface SecurityMonitorConfig {
  enable_real_time_alerts: boolean;
  alert_thresholds: {
    failed_login_attempts: number;
    suspicious_activity_score: number;
    concurrent_sessions: number;
  };
  notification_channels: string[];
  auto_lock_on_threat: boolean;
}
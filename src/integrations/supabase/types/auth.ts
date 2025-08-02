import { Database, Tables, TablesInsert, TablesUpdate } from './database';

// Auth-related table types
export type AccountSecurityStatus = Tables<'account_security_status'>;
export type ActiveSession = Tables<'active_sessions'>;
export type AuthEvent = Tables<'auth_events'>;
export type UserProfile = Tables<'user_profile'>;

export type AccountSecurityStatusInsert = TablesInsert<'account_security_status'>;
export type ActiveSessionInsert = TablesInsert<'active_sessions'>;
export type AuthEventInsert = TablesInsert<'auth_events'>;
export type UserProfileInsert = TablesInsert<'user_profile'>;

export type AccountSecurityStatusUpdate = TablesUpdate<'account_security_status'>;
export type ActiveSessionUpdate = TablesUpdate<'active_sessions'>;
export type AuthEventUpdate = TablesUpdate<'auth_events'>;
export type UserProfileUpdate = TablesUpdate<'user_profile'>;

// Auth-related function types
export type AuthFunctions = Database['public']['Functions'];

// Session management types
export interface SessionData {
  session_token: string;
  user_id: string;
  expires_at: string;
  device_fingerprint?: string;
  ip_address?: unknown;
  user_agent?: string;
  location_data?: any;
}

export interface AuthEventData {
  event_type: string;
  user_id?: string;
  ip_address?: unknown;
  user_agent?: string;
  device_fingerprint?: string;
  metadata?: any;
}

export interface SecurityStatus {
  failed_login_attempts: number;
  account_locked_until?: string;
  suspicious_activity_score: number;
  two_factor_enabled: boolean;
  require_two_factor: boolean;
  session_timeout_minutes: number;
  known_devices: any[];
  trusted_locations: any[];
}

// Biometric and consent types
export interface BiometricConsent {
  biometric_consent: boolean;
  granted_at?: string;
  revoked_at?: string;
}

// Data collection preferences
export interface DataCollectionPreferences {
  collect_sleep: boolean;
  collect_activity: boolean;
  collect_screen: boolean;
}

// User profile with extended data
export interface ExtendedUserProfile extends UserProfile {
  security_status?: AccountSecurityStatus;
  active_sessions?: ActiveSession[];
  data_preferences?: DataCollectionPreferences;
}
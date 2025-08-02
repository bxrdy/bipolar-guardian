import { Database } from './database';
import { RiskLevel } from './health';
import { SecurityEventType } from './security';

// API response wrapper types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
  success: boolean;
  timestamp: string;
}

// Edge Function request/response types
export interface GuardianChatRequest {
  message: string;
  context?: {
    include_health_data: boolean;
    days_of_context: number;
    include_medications: boolean;
    include_mood_patterns: boolean;
  };
  model_preference?: string;
}

export interface GuardianChatResponse {
  response: string;
  model_used: string;
  context_included: boolean;
  confidence_score?: number;
  suggestions?: string[];
  follow_up_questions?: string[];
}

export interface BaselineCalculationRequest {
  user_id: string;
  force_recalculate?: boolean;
  include_mood_metrics?: boolean;
  window_days?: number;
}

export interface BaselineCalculationResponse {
  baseline_id: string;
  metrics: {
    sleep_mean?: number;
    sleep_sd?: number;
    steps_mean?: number;
    steps_sd?: number;
    unlocks_mean?: number;
    unlocks_sd?: number;
  };
  data_quality: {
    days_analyzed: number;
    completeness_score: number;
    reliability_score: number;
  };
  calculation_method: string;
  created_at: string;
}

export interface RiskAssessmentRequest {
  user_id: string;
  assessment_date?: string;
  include_predictions?: boolean;
}

export interface RiskAssessmentResponse {
  risk_level: RiskLevel;
  risk_score: number;
  contributing_factors: Array<{
    factor: string;
    weight: number;
    current_value: number;
    baseline_deviation: number;
  }>;
  recommendations: string[];
  confidence: number;
  assessment_date: string;
}

export interface PersonalInsightsRequest {
  user_id: string;
  analysis_period?: 'week' | 'month' | 'quarter';
  include_correlations?: boolean;
  include_trends?: boolean;
}

export interface PersonalInsightsResponse {
  insights: {
    key_patterns: string[];
    mood_trends: Array<{
      metric: string;
      trend: 'improving' | 'stable' | 'declining';
      confidence: number;
    }>;
    correlations: Array<{
      factor_1: string;
      factor_2: string;
      correlation: number;
      significance: string;
    }>;
    recommendations: string[];
  };
  analysis_period: {
    start_date: string;
    end_date: string;
    days_analyzed: number;
  };
  generated_at: string;
}

export interface DataExportRequest {
  user_id: string;
  export_type: 'full' | 'health_only' | 'security_only';
  format: 'json' | 'csv' | 'pdf';
  date_range?: {
    start: string;
    end: string;
  };
  include_sensitive_data: boolean;
}

export interface DataExportResponse {
  export_id: string;
  download_url: string;
  expires_at: string;
  file_size: number;
  format: string;
  created_at: string;
}

export interface SecurityAuditRequest {
  user_id?: string;
  event_types?: SecurityEventType[];
  date_range?: {
    start: string;
    end: string;
  };
  include_device_data?: boolean;
}

export interface SecurityAuditResponse {
  events: Array<{
    event_type: SecurityEventType;
    timestamp: string;
    ip_address?: string;
    device_fingerprint?: string;
    risk_score?: number;
    metadata?: any;
  }>;
  summary: {
    total_events: number;
    high_risk_events: number;
    unique_devices: number;
    security_score: number;
  };
  recommendations: string[];
}

export interface ModelStatusRequest {
  models?: string[];
  check_availability?: boolean;
}

export interface ModelStatusResponse {
  models: Array<{
    model_id: string;
    name: string;
    provider: string;
    status: 'available' | 'unavailable' | 'rate_limited' | 'error';
    response_time_ms?: number;
    queue_length?: number;
    last_checked: string;
  }>;
  recommended_model: string;
  fallback_model: string;
}

export interface NotificationRequest {
  user_id: string;
  type: 'risk_alert' | 'medication_reminder' | 'insight_ready' | 'security_alert';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_for?: string;
  data?: any;
}

export interface NotificationResponse {
  notification_id: string;
  status: 'sent' | 'scheduled' | 'failed';
  delivery_method: 'push' | 'email' | 'sms';
  sent_at?: string;
  error_message?: string;
}

// Database function call types
export interface FunctionCallRequest<T = any> {
  function_name: keyof Database['public']['Functions'];
  args: T;
}

export interface FunctionCallResponse<T = any> {
  result: T;
  execution_time_ms: number;
  success: boolean;
  error?: string;
}

// Authentication API types
export interface LoginRequest {
  email: string;
  password: string;
  device_fingerprint?: string;
  remember_device?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
  };
  requires_2fa: boolean;
  device_trusted: boolean;
}

export interface SessionRequest {
  access_token: string;
  duration_minutes?: number;
  sensitive_mode?: boolean;
}

export interface SessionResponse {
  session_id: string;
  expires_at: string;
  warnings_enabled: boolean;
  timeout_settings: {
    warning_threshold: number;
    final_warning_threshold: number;
  };
}

// Error response types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}

export interface ValidationError extends ApiError {
  field_errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Health check and system status
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  services: {
    database: 'up' | 'down';
    auth: 'up' | 'down';
    storage: 'up' | 'down';
    ai_models: 'up' | 'degraded' | 'down';
  };
  response_time_ms: number;
}
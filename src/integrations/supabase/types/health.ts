import { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database';

// Health-related table types
export type MoodEntry = Tables<'mood_entries'>;
export type DailySummary = Tables<'daily_summary'>;
export type BaselineMetrics = Tables<'baseline_metrics'>;
export type BaselineHistory = Tables<'baseline_history'>;
export type Medication = Tables<'medications'>;
export type MedIntakeLog = Tables<'med_intake_logs'>;
export type MedicalDoc = Tables<'medical_docs'>;
export type SensorSample = Tables<'sensor_samples'>;
export type AlertSettings = Tables<'alert_settings'>;

export type MoodEntryInsert = TablesInsert<'mood_entries'>;
export type DailySummaryInsert = TablesInsert<'daily_summary'>;
export type BaselineMetricsInsert = TablesInsert<'baseline_metrics'>;
export type BaselineHistoryInsert = TablesInsert<'baseline_history'>;
export type MedicationInsert = TablesInsert<'medications'>;
export type MedIntakeLogInsert = TablesInsert<'med_intake_logs'>;
export type MedicalDocInsert = TablesInsert<'medical_docs'>;
export type SensorSampleInsert = TablesInsert<'sensor_samples'>;
export type AlertSettingsInsert = TablesInsert<'alert_settings'>;

export type MoodEntryUpdate = TablesUpdate<'mood_entries'>;
export type DailySummaryUpdate = TablesUpdate<'daily_summary'>;
export type BaselineMetricsUpdate = TablesUpdate<'baseline_metrics'>;
export type BaselineHistoryUpdate = TablesUpdate<'baseline_history'>;
export type MedicationUpdate = TablesUpdate<'medications'>;
export type MedIntakeLogUpdate = TablesUpdate<'med_intake_logs'>;
export type MedicalDocUpdate = TablesUpdate<'medical_docs'>;
export type SensorSampleUpdate = TablesUpdate<'sensor_samples'>;
export type AlertSettingsUpdate = TablesUpdate<'alert_settings'>;

// Risk level enum
export type RiskLevel = Enums<'risk_level_enum'>;

// Mood and mental health types
export interface MoodMetrics {
  mood: number;      // 1-10 scale
  energy: number;    // 1-10 scale
  stress: number;    // 1-10 scale
  anxiety: number;   // 1-10 scale
}

export interface MoodContext {
  activities?: string[];
  location?: string;
  social_situation?: string;
  notes?: string;
}

export interface CompleteMoodEntry extends MoodMetrics, MoodContext {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Medication management types
export interface MedicationSchedule {
  med_name: string;
  dosage: string;
  schedule: string;  // JSON string with timing data
  start_date: string;
  end_date?: string;
}

export interface MedicationIntake {
  medication_id: string;
  intake_time: string;
  dosage_taken?: string;
  notes?: string;
}

export interface MedicationWithIntakes extends Medication {
  recent_intakes?: MedIntakeLog[];
  adherence_rate?: number;
}

// Baseline and analytics types
export interface BaselineData {
  sleep_mean?: number;
  sleep_sd?: number;
  steps_mean?: number;
  steps_sd?: number;
  unlocks_mean?: number;
  unlocks_sd?: number;
  mood_mean?: number;
  mood_sd?: number;
  energy_mean?: number;
  energy_sd?: number;
  stress_mean?: number;
  stress_sd?: number;
  anxiety_mean?: number;
  anxiety_sd?: number;
}

export interface BaselineComparison {
  metric: string;
  current_value: number;
  baseline_mean: number;
  baseline_sd: number;
  z_score: number;
  deviation_category: 'normal' | 'mild' | 'moderate' | 'severe';
  trend: 'improving' | 'stable' | 'declining';
}

export interface PersonalBaseline extends BaselineMetrics {
  comparisons?: BaselineComparison[];
  last_calculated: string;
  data_quality_score: number;
  days_of_data: number;
}

// Daily summary and risk assessment
export interface DailySummaryWithRisk extends DailySummary {
  risk_factors?: string[];
  protective_factors?: string[];
  recommendations?: string[];
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  factors: Array<{
    factor: string;
    impact: 'high' | 'medium' | 'low';
    description: string;
  }>;
  recommendations: string[];
  confidence: number;
}

// Sensor and activity data types
export type SensorType = 
  | 'sleep_duration'
  | 'sleep_quality'
  | 'step_count'
  | 'heart_rate'
  | 'screen_time'
  | 'app_usage'
  | 'notification_count'
  | 'call_duration'
  | 'location_variance'
  | 'device_pickup_frequency';

export interface SensorDataPoint {
  sensor_type: SensorType;
  data_value: number;
  sample_time: string;
  metadata?: Record<string, any>;
}

export interface HealthDataSummary {
  date: string;
  mood_entries: MoodEntry[];
  sensor_data: SensorSample[];
  medication_intakes: MedIntakeLog[];
  daily_summary?: DailySummary;
  risk_assessment?: RiskAssessment;
}

// Analytics and insights types
export interface TrendAnalysis {
  metric: string;
  period: 'week' | 'month' | 'quarter';
  trend: 'improving' | 'stable' | 'declining';
  slope: number;
  confidence: number;
  significant_changes: Array<{
    date: string;
    change: string;
    magnitude: number;
  }>;
}

export interface CorrelationAnalysis {
  metric_1: string;
  metric_2: string;
  correlation: number;
  p_value: number;
  significance: 'strong' | 'moderate' | 'weak' | 'none';
  description: string;
}

export interface PersonalInsights {
  trends: TrendAnalysis[];
  correlations: CorrelationAnalysis[];
  patterns: Array<{
    pattern: string;
    frequency: string;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation?: string;
  }>;
  generated_at: string;
}

// Alert and notification types
export interface HealthAlert {
  id: string;
  type: 'risk_spike' | 'medication_reminder' | 'mood_pattern' | 'data_gap';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action_required: boolean;
  suggested_actions?: string[];
  triggered_at: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface AlertPreferences {
  enable_risk_alerts: boolean;
  enable_medication_reminders: boolean;
  enable_pattern_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  notification_channels: ('push' | 'email' | 'sms')[];
}

// Document management types
export interface MedicalDocument {
  id: string;
  doc_name: string;
  doc_url: string;
  doc_type?: 'prescription' | 'lab_result' | 'medical_record' | 'insurance' | 'other';
  upload_date: string;
  file_size?: number;
  mime_type?: string;
  tags?: string[];
}

// Data export types
export interface HealthDataExport {
  user_id: string;
  export_date: string;
  date_range: {
    start: string;
    end: string;
  };
  included_data: {
    mood_entries: boolean;
    medications: boolean;
    sensor_data: boolean;
    baselines: boolean;
    summaries: boolean;
    documents: boolean;
  };
  format: 'json' | 'csv' | 'pdf';
  file_url?: string;
  expires_at?: string;
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // Auth & Session Tables
      account_security_status: {
        Row: {
          account_locked_until: string | null
          consecutive_failures_from_ip: number | null
          created_at: string | null
          failed_login_attempts: number | null
          known_devices: Json | null
          last_failed_attempt: string | null
          last_failure_ip: unknown | null
          last_login_at: string | null
          last_login_ip: unknown | null
          last_login_user_agent: string | null
          require_two_factor: boolean | null
          session_timeout_minutes: number | null
          suspicious_activity_score: number | null
          trusted_locations: Json | null
          two_factor_backup_codes: string[] | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          consecutive_failures_from_ip?: number | null
          created_at?: string | null
          failed_login_attempts?: number | null
          known_devices?: Json | null
          last_failed_attempt?: string | null
          last_failure_ip?: unknown | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          last_login_user_agent?: string | null
          require_two_factor?: boolean | null
          session_timeout_minutes?: number | null
          suspicious_activity_score?: number | null
          trusted_locations?: Json | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          consecutive_failures_from_ip?: number | null
          created_at?: string | null
          failed_login_attempts?: number | null
          known_devices?: Json | null
          last_failed_attempt?: string | null
          last_failure_ip?: unknown | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          last_login_user_agent?: string | null
          require_two_factor?: boolean | null
          session_timeout_minutes?: number | null
          suspicious_activity_score?: number | null
          trusted_locations?: Json | null
          two_factor_backup_codes?: string[] | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          location_data: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      device_fingerprints: {
        Row: {
          created_at: string | null
          fingerprint_data: Json
          fingerprint_hash: string
          id: string
          is_trusted: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fingerprint_data: Json
          fingerprint_hash: string
          id?: string
          is_trusted?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fingerprint_data?: Json
          fingerprint_hash?: string
          id?: string
          is_trusted?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      // User Profile
      user_profile: {
        Row: {
          biometric_consent: boolean | null
          collect_activity: boolean | null
          collect_screen: boolean | null
          collect_sleep: boolean | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          biometric_consent?: boolean | null
          collect_activity?: boolean | null
          collect_screen?: boolean | null
          collect_sleep?: boolean | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          biometric_consent?: boolean | null
          collect_activity?: boolean | null
          collect_screen?: boolean | null
          collect_sleep?: boolean | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      // Health Data Tables
      baseline_history: {
        Row: {
          baseline_data: Json
          created_at: string
          id: string
          replaced_at: string
          user_id: string
          version_notes: string | null
        }
        Insert: {
          baseline_data: Json
          created_at?: string
          id?: string
          replaced_at?: string
          user_id: string
          version_notes?: string | null
        }
        Update: {
          baseline_data?: Json
          created_at?: string
          id?: string
          replaced_at?: string
          user_id?: string
          version_notes?: string | null
        }
        Relationships: []
      }
      baseline_metrics: {
        Row: {
          calculation_method: string | null
          created_at: string
          id: string
          medication_changes_detected: boolean | null
          sleep_mean: number | null
          sleep_sd: number | null
          steps_mean: number | null
          steps_sd: number | null
          unlocks_mean: number | null
          unlocks_sd: number | null
          updated_at: string
          user_id: string
          window_days: number | null
        }
        Insert: {
          calculation_method?: string | null
          created_at?: string
          id?: string
          medication_changes_detected?: boolean | null
          sleep_mean?: number | null
          sleep_sd?: number | null
          steps_mean?: number | null
          steps_sd?: number | null
          unlocks_mean?: number | null
          unlocks_sd?: number | null
          updated_at?: string
          user_id: string
          window_days?: number | null
        }
        Update: {
          calculation_method?: string | null
          created_at?: string
          id?: string
          medication_changes_detected?: boolean | null
          sleep_mean?: number | null
          sleep_sd?: number | null
          steps_mean?: number | null
          steps_sd?: number | null
          unlocks_mean?: number | null
          unlocks_sd?: number | null
          updated_at?: string
          user_id?: string
          window_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "baseline_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summary: {
        Row: {
          anxiety_avg: number | null
          created_at: string
          energy_avg: number | null
          id: string
          mood_avg: number | null
          notes: string | null
          risk_level: Database["public"]["Enums"]["risk_level_enum"] | null
          stress_avg: number | null
          summary_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anxiety_avg?: number | null
          created_at?: string
          energy_avg?: number | null
          id?: string
          mood_avg?: number | null
          notes?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          stress_avg?: number | null
          summary_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anxiety_avg?: number | null
          created_at?: string
          energy_avg?: number | null
          id?: string
          mood_avg?: number | null
          notes?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          stress_avg?: number | null
          summary_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          activities: string[] | null
          anxiety: number
          created_at: string
          energy: number
          id: string
          location: string | null
          mood: number
          notes: string | null
          social_situation: string | null
          stress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          anxiety: number
          created_at?: string
          energy: number
          id?: string
          location?: string | null
          mood: number
          notes?: string | null
          social_situation?: string | null
          stress: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activities?: string[] | null
          anxiety?: number
          created_at?: string
          energy?: number
          id?: string
          location?: string | null
          mood?: number
          notes?: string | null
          social_situation?: string | null
          stress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          id: string
          med_name: string
          schedule: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          id?: string
          med_name: string
          schedule: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          id?: string
          med_name?: string
          schedule?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      med_intake_logs: {
        Row: {
          created_at: string | null
          dosage_taken: string | null
          id: string
          intake_time: string
          medication_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage_taken?: string | null
          id?: string
          intake_time: string
          medication_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage_taken?: string | null
          id?: string
          intake_time?: string
          medication_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "med_intake_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_intake_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_docs: {
        Row: {
          created_at: string | null
          doc_name: string
          doc_url: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doc_name: string
          doc_url: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          doc_name?: string
          doc_url?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sensor_samples: {
        Row: {
          created_at: string | null
          data_value: number
          id: string
          sample_time: string
          sensor_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_value: number
          id?: string
          sample_time: string
          sensor_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_value?: number
          id?: string
          sample_time?: string
          sensor_type?: string
          user_id?: string
        }
        Relationships: []
      }
      // System Tables
      alert_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bug_reports: {
        Row: {
          app_version: string | null
          created_at: string
          error_message: string
          id: string
          os: string | null
          stack_trace: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          error_message: string
          id?: string
          os?: string | null
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string
          error_message?: string
          id?: string
          os?: string | null
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          flag_key: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_account_locked: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      log_auth_event: {
        Args: {
          p_user_id?: string
          p_event_type: string
          p_ip_address?: string
          p_user_agent?: string
          p_device_fingerprint?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      register_device_fingerprint: {
        Args: {
          p_user_id?: string
          p_fingerprint_hash: string
          p_fingerprint_data: Json
          p_is_trusted?: boolean
        }
        Returns: string
      }
      truncate_table: {
        Args: {
          table_name: string
        }
        Returns: undefined
      }
      update_account_security_status: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      risk_level_enum: "green" | "amber" | "red"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      risk_level_enum: ["green", "amber", "red"],
    },
  },
} as const
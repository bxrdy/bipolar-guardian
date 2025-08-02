export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
      alert_settings: {
        Row: {
          alert_snooze_until: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_snooze_until?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_snooze_until?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_events: {
        Row: {
          additional_metadata: Json | null
          created_at: string | null
          device_fingerprint: string | null
          event_type: string
          failure_reason: string | null
          geolocation_data: Json | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_metadata?: Json | null
          created_at?: string | null
          device_fingerprint?: string | null
          event_type: string
          failure_reason?: string | null
          geolocation_data?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_metadata?: Json | null
          created_at?: string | null
          device_fingerprint?: string | null
          event_type?: string
          failure_reason?: string | null
          geolocation_data?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      baseline_metrics: {
        Row: {
          created_at: string
          id: string
          sleep_mean: number | null
          sleep_sd: number | null
          steps_mean: number | null
          steps_sd: number | null
          unlocks_mean: number | null
          unlocks_sd: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sleep_mean?: number | null
          sleep_sd?: number | null
          steps_mean?: number | null
          steps_sd?: number | null
          unlocks_mean?: number | null
          unlocks_sd?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sleep_mean?: number | null
          sleep_sd?: number | null
          steps_mean?: number | null
          steps_sd?: number | null
          unlocks_mean?: number | null
          unlocks_sd?: number | null
          updated_at?: string
          user_id?: string
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
      bug_reports: {
        Row: {
          app_version: string | null
          category: string | null
          created_at: string
          error_id: string | null
          error_message: string
          id: string
          os: string | null
          sanitized_message: string | null
          severity: string | null
          stack_trace: string | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          category?: string | null
          created_at?: string
          error_id?: string | null
          error_message: string
          id?: string
          os?: string | null
          sanitized_message?: string | null
          severity?: string | null
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          category?: string | null
          created_at?: string
          error_id?: string | null
          error_message?: string
          id?: string
          os?: string | null
          sanitized_message?: string | null
          severity?: string | null
          stack_trace?: string | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_verification_tokens: {
        Row: {
          contact_id: string
          created_at: string
          expires_at: string
          id: string
          token: string
          verified_at: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          expires_at: string
          id?: string
          token: string
          verified_at?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_verification_tokens_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "trusted_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summary: {
        Row: {
          date: string
          risk_level: Database["public"]["Enums"]["risk_level_enum"] | null
          sleep_hours: number | null
          steps: number | null
          typing_score: number | null
          user_id: string
        }
        Insert: {
          date: string
          risk_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          sleep_hours?: number | null
          steps?: number | null
          typing_score?: number | null
          user_id: string
        }
        Update: {
          date?: string
          risk_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          sleep_hours?: number | null
          steps?: number | null
          typing_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      device_fingerprints: {
        Row: {
          browser_info: Json | null
          device_name: string | null
          fingerprint_hash: string
          first_seen: string | null
          id: string
          is_trusted: boolean | null
          last_seen: string | null
          screen_info: Json | null
          timezone_info: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          browser_info?: Json | null
          device_name?: string | null
          fingerprint_hash: string
          first_seen?: string | null
          id?: string
          is_trusted?: boolean | null
          last_seen?: string | null
          screen_info?: Json | null
          timezone_info?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          browser_info?: Json | null
          device_name?: string | null
          fingerprint_hash?: string
          first_seen?: string | null
          id?: string
          is_trusted?: boolean | null
          last_seen?: string | null
          screen_info?: Json | null
          timezone_info?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          ai_context_enabled: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_context_enabled?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_context_enabled?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      med_intake_logs: {
        Row: {
          id: string
          med_id: string
          taken_at: string
          user_id: string
          was_missed: boolean
        }
        Insert: {
          id?: string
          med_id: string
          taken_at: string
          user_id: string
          was_missed?: boolean
        }
        Update: {
          id?: string
          med_id?: string
          taken_at?: string
          user_id?: string
          was_missed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "med_intake_logs_med_id_fkey"
            columns: ["med_id"]
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
          doc_type: string
          extracted_text: string | null
          file_path: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          doc_type: string
          extracted_text?: string | null
          file_path: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          doc_type?: string
          extracted_text?: string | null
          file_path?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_docs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
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
      sensor_samples: {
        Row: {
          id: string
          metric_type: string | null
          metric_value: number | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          metric_type?: string | null
          metric_value?: number | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          metric_type?: string | null
          metric_value?: number | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_samples_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      support_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      support_groups: {
        Row: {
          created_at: string
          id: string
          is_private: boolean
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_contacts: {
        Row: {
          created_at: string
          crisis_priority_level: number | null
          email: string | null
          id: string
          name: string
          notification_preferences: Json | null
          phone: string | null
          relationship: string
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string
          crisis_priority_level?: number | null
          email?: string | null
          id?: string
          name: string
          notification_preferences?: Json | null
          phone?: string | null
          relationship: string
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string
          crisis_priority_level?: number | null
          email?: string | null
          id?: string
          name?: string
          notification_preferences?: Json | null
          phone?: string | null
          relationship?: string
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trusted_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          ai_insights_generated_at: string | null
          ai_medical_summary: Json | null
          baseline_ready: boolean | null
          chat_model: string | null
          collect_activity: boolean | null
          collect_screen: boolean | null
          collect_sleep: boolean | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          vision_model: string | null
        }
        Insert: {
          ai_insights_generated_at?: string | null
          ai_medical_summary?: Json | null
          baseline_ready?: boolean | null
          chat_model?: string | null
          collect_activity?: boolean | null
          collect_screen?: boolean | null
          collect_sleep?: boolean | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          vision_model?: string | null
        }
        Update: {
          ai_insights_generated_at?: string | null
          ai_medical_summary?: Json | null
          baseline_ready?: boolean | null
          chat_model?: string | null
          collect_activity?: boolean | null
          collect_screen?: boolean | null
          collect_sleep?: boolean | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          vision_model?: string | null
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
        Returns: number
      }
      is_account_locked: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      log_auth_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_device_fingerprint?: string
          p_geolocation_data?: Json
          p_failure_reason?: string
          p_session_id?: string
          p_additional_metadata?: Json
        }
        Returns: string
      }
      register_device_fingerprint: {
        Args: {
          p_user_id: string
          p_fingerprint_hash: string
          p_device_name?: string
          p_browser_info?: Json
          p_screen_info?: Json
          p_timezone_info?: string
        }
        Returns: string
      }
      truncate_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      update_account_security_status: {
        Args: {
          p_user_id: string
          p_failed_attempt?: boolean
          p_ip_address?: unknown
          p_user_agent?: string
          p_successful_login?: boolean
        }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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

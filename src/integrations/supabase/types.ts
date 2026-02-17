export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          brain: string
          config: Json | null
          created_at: string
          events_count: number | null
          id: string
          last_heartbeat: string | null
          name: string
          role: string
          status: string
          tenant_id: string
        }
        Insert: {
          brain?: string
          config?: Json | null
          created_at?: string
          events_count?: number | null
          id?: string
          last_heartbeat?: string | null
          name: string
          role: string
          status?: string
          tenant_id: string
        }
        Update: {
          brain?: string
          config?: Json | null
          created_at?: string
          events_count?: number | null
          id?: string
          last_heartbeat?: string | null
          name?: string
          role?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agents_logs: {
        Row: {
          agent_id: string | null
          agent_name: string
          created_at: string
          event_type: string
          id: string
          payload: Json | null
          request_id: string | null
          severity: string
          tenant_id: string
        }
        Insert: {
          agent_id?: string | null
          agent_name: string
          created_at?: string
          event_type: string
          id?: string
          payload?: Json | null
          request_id?: string | null
          severity?: string
          tenant_id: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json | null
          request_id?: string | null
          severity?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          brain: string
          created_at: string
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit: number | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          brain?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          tenant_id: string
          user_id: string
        }
        Update: {
          brain?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_inputs: {
        Row: {
          bulk_job_id: string
          created_at: string | null
          email: string
          id: string
          processed: boolean | null
          tenant_id: string
        }
        Insert: {
          bulk_job_id: string
          created_at?: string | null
          email: string
          id?: string
          processed?: boolean | null
          tenant_id: string
        }
        Update: {
          bulk_job_id?: string
          created_at?: string | null
          email?: string
          id?: string
          processed?: boolean | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_inputs_bulk_job_id_fkey"
            columns: ["bulk_job_id"]
            isOneToOne: false
            referencedRelation: "bulk_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_jobs: {
        Row: {
          catch_all_count: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_format: string
          file_name: string
          id: string
          invalid_count: number
          last_error: string | null
          locked_at: string | null
          processed: number
          processing_completed_at: string | null
          processing_started_at: string | null
          risky_count: number
          started_at: string | null
          status: string
          tenant_id: string
          total_emails: number
          updated_at: string
          user_id: string
          valid_count: number
          webhook_url: string | null
          worker_id: string | null
        }
        Insert: {
          catch_all_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_format: string
          file_name: string
          id?: string
          invalid_count?: number
          last_error?: string | null
          locked_at?: string | null
          processed?: number
          processing_completed_at?: string | null
          processing_started_at?: string | null
          risky_count?: number
          started_at?: string | null
          status?: string
          tenant_id: string
          total_emails?: number
          updated_at?: string
          user_id: string
          valid_count?: number
          webhook_url?: string | null
          worker_id?: string | null
        }
        Update: {
          catch_all_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_format?: string
          file_name?: string
          id?: string
          invalid_count?: number
          last_error?: string | null
          locked_at?: string | null
          processed?: number
          processing_completed_at?: string | null
          processing_started_at?: string | null
          risky_count?: number
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_emails?: number
          updated_at?: string
          user_id?: string
          valid_count?: number
          webhook_url?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_refill_at: string | null
          tenant_id: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_refill_at?: string | null
          tenant_id: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_refill_at?: string | null
          tenant_id?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          actor_user_id: string | null
          correlation_id: string | null
          created_at: string
          error_message: string | null
          event_type: string
          function_name: string | null
          id: string
          idempotency_key: string | null
          payload: Json
          request_id: string
          source: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type: string
          function_name?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json
          request_id: string
          source: string
          status?: string | null
          tenant_id: string
        }
        Update: {
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          error_message?: string | null
          event_type?: string
          function_name?: string | null
          id?: string
          idempotency_key?: string | null
          payload?: Json
          request_id?: string
          source?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          plan: string
          settings: Json | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          plan?: string
          settings?: Json | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          plan?: string
          settings?: Json | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          api_key_id: string | null
          brain: string
          created_at: string
          endpoint: string
          id: string
          request_id: string | null
          response_time_ms: number | null
          status_code: number | null
          tenant_id: string
        }
        Insert: {
          api_key_id?: string | null
          brain: string
          created_at?: string
          endpoint: string
          id?: string
          request_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          tenant_id: string
        }
        Update: {
          api_key_id?: string | null
          brain?: string
          created_at?: string
          endpoint?: string
          id?: string
          request_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_results: {
        Row: {
          api_key_id: string | null
          bulk_job_id: string | null
          checks: Json | null
          created_at: string
          disposable: boolean | null
          domain_reputation: string | null
          email: string
          free_provider: boolean | null
          id: string
          mx_check: boolean | null
          role_based: boolean | null
          score: number
          smtp_check: boolean | null
          status: string
          tenant_id: string
        }
        Insert: {
          api_key_id?: string | null
          bulk_job_id?: string | null
          checks?: Json | null
          created_at?: string
          disposable?: boolean | null
          domain_reputation?: string | null
          email: string
          free_provider?: boolean | null
          id?: string
          mx_check?: boolean | null
          role_based?: boolean | null
          score?: number
          smtp_check?: boolean | null
          status?: string
          tenant_id: string
        }
        Update: {
          api_key_id?: string | null
          bulk_job_id?: string | null
          checks?: Json | null
          created_at?: string
          disposable?: boolean | null
          domain_reputation?: string | null
          email?: string
          free_provider?: boolean | null
          id?: string
          mx_check?: boolean | null
          role_based?: boolean | null
          score?: number
          smtp_check?: boolean | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_results_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_results_bulk_job_id_fkey"
            columns: ["bulk_job_id"]
            isOneToOne: false
            referencedRelation: "bulk_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

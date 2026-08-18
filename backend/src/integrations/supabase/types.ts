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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          active_contributors: number
          activity_recency_score: number
          analyzed_at: string
          bus_factor_score: number
          bus_factor_value: number
          commit_freq_score: number
          contributor_growth_score: number
          delta_bus_factor: number
          delta_commits: number
          delta_health_score: number
          delta_issues: number
          delta_pr_merge_hours: number
          health_grade: string
          health_score: number
          id: string
          issue_staleness_score: number
          last_push_days: number
          median_pr_hours: number
          open_issues: number
          pr_merge_score: number
          repo_id: string
          report_json: Json
        }
        Insert: {
          active_contributors?: number
          activity_recency_score?: number
          analyzed_at?: string
          bus_factor_score?: number
          bus_factor_value?: number
          commit_freq_score?: number
          contributor_growth_score?: number
          delta_bus_factor?: number
          delta_commits?: number
          delta_health_score?: number
          delta_issues?: number
          delta_pr_merge_hours?: number
          health_grade: string
          health_score: number
          id?: string
          issue_staleness_score?: number
          last_push_days?: number
          median_pr_hours?: number
          open_issues?: number
          pr_merge_score?: number
          repo_id: string
          report_json: Json
        }
        Update: {
          active_contributors?: number
          activity_recency_score?: number
          analyzed_at?: string
          bus_factor_score?: number
          bus_factor_value?: number
          commit_freq_score?: number
          contributor_growth_score?: number
          delta_bus_factor?: number
          delta_commits?: number
          delta_health_score?: number
          delta_issues?: number
          delta_pr_merge_hours?: number
          health_grade?: string
          health_score?: number
          id?: string
          issue_staleness_score?: number
          last_push_days?: number
          median_pr_hours?: number
          open_issues?: number
          pr_merge_score?: number
          repo_id?: string
          report_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analyses_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      contributors: {
        Row: {
          analysis_id: string
          avatar: string
          commits: number
          id: string
          login: string
          rank: number
          share: number
        }
        Insert: {
          analysis_id: string
          avatar?: string
          commits?: number
          id?: string
          login: string
          rank?: number
          share?: number
        }
        Update: {
          analysis_id?: string
          avatar?: string
          commits?: number
          id?: string
          login?: string
          rank?: number
          share?: number
        }
        Relationships: [
          {
            foreignKeyName: "contributors_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      repos: {
        Row: {
          analyzed_count: number
          created_at: string
          description: string
          forks: number
          full_name: string
          id: string
          language: string | null
          name: string
          owner: string
          stars: number
          updated_at: string
        }
        Insert: {
          analyzed_count?: number
          created_at?: string
          description?: string
          forks?: number
          full_name: string
          id?: string
          language?: string | null
          name: string
          owner: string
          stars?: number
          updated_at?: string
        }
        Update: {
          analyzed_count?: number
          created_at?: string
          description?: string
          forks?: number
          full_name?: string
          id?: string
          language?: string | null
          name?: string
          owner?: string
          stars?: number
          updated_at?: string
        }
        Relationships: []
      }
      saved_repos: {
        Row: {
          created_at: string
          id: string
          repo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          repo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          repo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_repos_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_analyzed_count: {
        Args: { p_repo_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

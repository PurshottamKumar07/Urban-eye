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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      civic_issues: {
        Row: {
          address: string | null
          assigned_to: string | null
          category: Database["public"]["Enums"]["issue_category"]
          created_at: string
          department: string | null
          description: string
          id: string
          image_urls: string[] | null
          latitude: number | null
          longitude: number | null
          priority: Database["public"]["Enums"]["issue_priority"]
          reporter_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at: string
          votes_count: number | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          category: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          department?: string | null
          description: string
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          reporter_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title: string
          updated_at?: string
          votes_count?: number | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["issue_category"]
          created_at?: string
          department?: string | null
          description?: string
          id?: string
          image_urls?: string[] | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          reporter_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          title?: string
          updated_at?: string
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_issues_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "civic_issues_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          comment: string
          commenter_id: string
          created_at: string
          id: string
          is_official: boolean | null
          issue_id: string
        }
        Insert: {
          comment: string
          commenter_id: string
          created_at?: string
          id?: string
          is_official?: boolean | null
          issue_id: string
        }
        Update: {
          comment?: string
          commenter_id?: string
          created_at?: string
          id?: string
          is_official?: boolean | null
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_commenter_id_fkey"
            columns: ["commenter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "civic_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          issue_id: string
          new_status: Database["public"]["Enums"]["issue_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["issue_status"] | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          issue_id: string
          new_status: Database["public"]["Enums"]["issue_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          issue_id?: string
          new_status?: Database["public"]["Enums"]["issue_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "issue_status_history_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "civic_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_votes: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          vote_type: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          vote_type: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          vote_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "civic_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      issue_category:
        | "infrastructure"
        | "sanitation"
        | "traffic"
        | "environment"
        | "utilities"
        | "safety"
        | "other"
      issue_priority: "low" | "medium" | "high" | "critical"
      issue_status:
        | "pending"
        | "in_progress"
        | "resolved"
        | "rejected"
        | "escalated"
      user_role: "citizen" | "admin" | "employee"
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
      issue_category: [
        "infrastructure",
        "sanitation",
        "traffic",
        "environment",
        "utilities",
        "safety",
        "other",
      ],
      issue_priority: ["low", "medium", "high", "critical"],
      issue_status: [
        "pending",
        "in_progress",
        "resolved",
        "rejected",
        "escalated",
      ],
      user_role: ["citizen", "admin", "employee"],
    },
  },
} as const

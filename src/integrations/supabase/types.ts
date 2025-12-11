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
      accounts: {
        Row: {
          account_no: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance: number
          closed_date: string | null
          created_at: string
          id: string
          is_active: boolean
          member_id: string
          opened_date: string
          updated_at: string
        }
        Insert: {
          account_no: string
          account_type: Database["public"]["Enums"]["account_type"]
          balance?: number
          closed_date?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          member_id: string
          opened_date?: string
          updated_at?: string
        }
        Update: {
          account_no?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          balance?: number
          closed_date?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          member_id?: string
          opened_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          joined_date: string
          last_name: string
          loan_balance: number
          member_no: string
          phone: string
          savings_balance: number
          shares_balance: number
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          joined_date?: string
          last_name: string
          loan_balance?: number
          member_no: string
          phone: string
          savings_balance?: number
          shares_balance?: number
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          joined_date?: string
          last_name?: string
          loan_balance?: number
          member_no?: string
          phone?: string
          savings_balance?: number
          shares_balance?: number
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id: string
          member_id: string
          narration: string | null
          reference_no: string | null
          txn_date: string
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          member_id: string
          narration?: string | null
          reference_no?: string | null
          txn_date?: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          direction?: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          member_id?: string
          narration?: string | null
          reference_no?: string | null
          txn_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type:
        | "shares"
        | "savings"
        | "fixed_deposit"
        | "loan"
        | "mm"
        | "development_fund"
      member_status: "active" | "inactive" | "suspended"
      transaction_direction: "debit" | "credit"
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
      account_type: [
        "shares",
        "savings",
        "fixed_deposit",
        "loan",
        "mm",
        "development_fund",
      ],
      member_status: ["active", "inactive", "suspended"],
      transaction_direction: ["debit", "credit"],
    },
  },
} as const

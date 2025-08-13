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
      account_hierarchy: {
        Row: {
          analytical_account: string
          company_id: string
          created_at: string
          id: string
          level_1: string
          level_2: string
        }
        Insert: {
          analytical_account: string
          company_id: string
          created_at?: string
          id?: string
          level_1: string
          level_2: string
        }
        Update: {
          analytical_account?: string
          company_id?: string
          created_at?: string
          id?: string
          level_1?: string
          level_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_account_hierarchy_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: string
          approval_item_id: string
          comment: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          approval_item_id: string
          comment?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          approval_item_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_approval_item_id_fkey"
            columns: ["approval_item_id"]
            isOneToOne: false
            referencedRelation: "approval_items"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_items: {
        Row: {
          amount: number
          analytical_account: string
          approval_level: number
          company_id: string
          created_at: string
          id: string
          level_1_group: string
          level_2_group: string
          period: string
          requester: string
          status: string
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          analytical_account: string
          approval_level?: number
          company_id: string
          created_at?: string
          id?: string
          level_1_group: string
          level_2_group: string
          period: string
          requester: string
          status?: string
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          analytical_account?: string
          approval_level?: number
          company_id?: string
          created_at?: string
          id?: string
          level_1_group?: string
          level_2_group?: string
          period?: string
          requester?: string
          status?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          actual_amount: number | null
          company_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          period_end: string
          period_start: string
          planned_amount: number
          progress: number
          realized_amount: number
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          company_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          period_end: string
          period_start: string
          planned_amount?: number
          progress?: number
          realized_amount?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          company_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          period_end?: string
          period_start?: string
          planned_amount?: number
          progress?: number
          realized_amount?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          code: string
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_estado: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          grupo: string | null
          id: string
          name: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          grupo?: string | null
          id?: string
          name: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_estado?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          grupo?: string | null
          id?: string
          name?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          code: string
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          amount: number
          budget_id: string
          category_id: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          budget_id: string
          category_id: string
          created_at?: string
          description?: string | null
          entry_date: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          budget_id?: string
          category_id?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aprovador: boolean | null
          cargo: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          pacoteiro: boolean | null
          role: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aprovador?: boolean | null
          cargo?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          pacoteiro?: boolean | null
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aprovador?: boolean | null
          cargo?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          pacoteiro?: boolean | null
          role?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          company_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_suppliers_company_id"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          analytical_account: string
          company_id: string
          competency_months: string[]
          created_at: string
          description: string | null
          id: string
          level_1_group: string
          level_2_group: string
          observations: string | null
          transaction_date: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          analytical_account: string
          company_id: string
          competency_months?: string[]
          created_at?: string
          description?: string | null
          id?: string
          level_1_group: string
          level_2_group: string
          observations?: string | null
          transaction_date: string
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          analytical_account?: string
          company_id?: string
          competency_months?: string[]
          created_at?: string
          description?: string | null
          id?: string
          level_1_group?: string
          level_2_group?: string
          observations?: string | null
          transaction_date?: string
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_access: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { uid: string }
        Returns: boolean
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

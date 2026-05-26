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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string
          actor_id: string
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      blocked_devices: {
        Row: {
          blocked_at: string
          fingerprint: string
          id: string
          ip_address: string | null
          reason: string | null
        }
        Insert: {
          blocked_at?: string
          fingerprint: string
          id?: string
          ip_address?: string | null
          reason?: string | null
        }
        Update: {
          blocked_at?: string
          fingerprint?: string
          id?: string
          ip_address?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          accent: string
          accent_dark: string
          accent_light: string
          created_at: string
          id: string
          intro_text: string
          intro_title: string
          key: string
          label: string
          prompts_extra: Json | null
          sort_order: number
          stats: Json
          updated_at: string
          when_tags: Json
        }
        Insert: {
          accent?: string
          accent_dark?: string
          accent_light?: string
          created_at?: string
          id?: string
          intro_text?: string
          intro_title?: string
          key: string
          label: string
          prompts_extra?: Json | null
          sort_order?: number
          stats?: Json
          updated_at?: string
          when_tags?: Json
        }
        Update: {
          accent?: string
          accent_dark?: string
          accent_light?: string
          created_at?: string
          id?: string
          intro_text?: string
          intro_title?: string
          key?: string
          label?: string
          prompts_extra?: Json | null
          sort_order?: number
          stats?: Json
          updated_at?: string
          when_tags?: Json
        }
        Relationships: []
      }
      content_items: {
        Row: {
          body: string | null
          buy_url: string | null
          created_at: string
          description: string
          example_url: string | null
          id: string
          image_url: string | null
          kind: string
          pdf_path: string | null
          section_slug: string
          sort_order: number
          title: string
          topic: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          body?: string | null
          buy_url?: string | null
          created_at?: string
          description?: string
          example_url?: string | null
          id?: string
          image_url?: string | null
          kind: string
          pdf_path?: string | null
          section_slug: string
          sort_order?: number
          title: string
          topic?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          body?: string | null
          buy_url?: string | null
          created_at?: string
          description?: string
          example_url?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          pdf_path?: string | null
          section_slug?: string
          sort_order?: number
          title?: string
          topic?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_section_slug_fkey"
            columns: ["section_slug"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["slug"]
          },
        ]
      }
      content_sections: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          id: string
          intro: string
          min_plan: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          intro?: string
          min_plan?: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          intro?: string
          min_plan?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_logs: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_used: boolean | null
          owner_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          owner_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_used?: boolean | null
          owner_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string
          description: string
          duration_min: number | null
          id: string
          kind: string
          module_id: string
          pdf_path: string | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          duration_min?: number | null
          id?: string
          kind?: string
          module_id: string
          pdf_path?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          duration_min?: number | null
          id?: string
          kind?: string
          module_id?: string
          pdf_path?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      niche_lessons: {
        Row: {
          created_at: string
          description: string
          duration_min: number | null
          id: string
          kind: string
          module_id: string
          pdf_path: string | null
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          duration_min?: number | null
          id?: string
          kind?: string
          module_id: string
          pdf_path?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          duration_min?: number | null
          id?: string
          kind?: string
          module_id?: string
          pdf_path?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "niche_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "niche_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      niche_modules: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abuse_blocked: boolean | null
          avatar_url: string | null
          created_at: string
          email: string
          empresa: string | null
          id: string
          invite_validated: boolean | null
          nome: string
          plano: string
          sobre: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abuse_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          invite_validated?: boolean | null
          nome?: string
          plano?: string
          sobre?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abuse_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          invite_validated?: boolean | null
          nome?: string
          plano?: string
          sobre?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_ebooks: {
        Row: {
          category_key: string
          id: string
          saved_at: string
          tool_key: string
          tool_name: string
          user_id: string
        }
        Insert: {
          category_key: string
          id?: string
          saved_at?: string
          tool_key: string
          tool_name: string
          user_id: string
        }
        Update: {
          category_key?: string
          id?: string
          saved_at?: string
          tool_key?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
      site_orders: {
        Row: {
          created_at: string
          description: string
          id: string
          product_slug: string
          read_at: string | null
          ref_link_1: string
          ref_link_2: string
          status: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          product_slug: string
          read_at?: string | null
          ref_link_1: string
          ref_link_2: string
          status?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          product_slug?: string
          read_at?: string | null
          ref_link_1?: string
          ref_link_2?: string
          status?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      site_products: {
        Row: {
          active: boolean
          buy_url: string | null
          col: string
          created_at: string
          example_url: string | null
          id: string
          kind: string
          name: string
          price: string
          row_key: string | null
          short_desc: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          buy_url?: string | null
          col: string
          created_at?: string
          example_url?: string | null
          id?: string
          kind?: string
          name: string
          price: string
          row_key?: string | null
          short_desc?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          buy_url?: string | null
          col?: string
          created_at?: string
          example_url?: string | null
          id?: string
          kind?: string
          name?: string
          price?: string
          row_key?: string | null
          short_desc?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tools: {
        Row: {
          badge: string
          category_key: string
          created_at: string
          data: Json
          description: string
          id: string
          key: string
          name: string
          sort_order: number
          updated_at: string
          url: string
          url_label: string
        }
        Insert: {
          badge?: string
          category_key: string
          created_at?: string
          data?: Json
          description?: string
          id?: string
          key: string
          name: string
          sort_order?: number
          updated_at?: string
          url?: string
          url_label?: string
        }
        Update: {
          badge?: string
          category_key?: string
          created_at?: string
          data?: Json
          description?: string
          id?: string
          key?: string
          name?: string
          sort_order?: number
          updated_at?: string
          url?: string
          url_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["key"]
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_invite_code: { Args: never; Returns: string }
      get_tool_premium: { Args: { _tool_key: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_admin_invites: { Args: never; Returns: Json }
      list_abuse_blocks: {
        Args: never
        Returns: {
          blocked_at: string
          email: string
          fingerprint: string
          ip_address: string
          nome: string
          user_id: string
        }[]
      }
      list_categories_public: {
        Args: never
        Returns: {
          accent: string
          accent_dark: string
          accent_light: string
          created_at: string
          id: string
          intro_text: string
          intro_title: string
          key: string
          label: string
          sort_order: number
          stats: Json
          updated_at: string
          when_tags: Json
        }[]
      }
      list_tools_public: {
        Args: never
        Returns: {
          badge: string
          category_key: string
          created_at: string
          data: Json
          description: string
          id: string
          key: string
          name: string
          sort_order: number
          updated_at: string
          url: string
          url_label: string
        }[]
      }
      remove_abuse_block: {
        Args: { target_fingerprint: string; target_user_id: string }
        Returns: Json
      }
      validate_invite_code:
        | { Args: { invite_code_text: string }; Returns: Json }
        | {
            Args: {
              invite_code_text: string
              p_fingerprint: string
              p_ip_address: string
            }
            Returns: Json
          }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

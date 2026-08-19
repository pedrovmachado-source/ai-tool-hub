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
      cash_packages: {
        Row: {
          active: boolean | null
          base_cash: number
          created_at: string | null
          id: string
          is_popular: boolean | null
          name: string
          price_brl_cents: number
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          base_cash: number
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          price_brl_cents: number
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          base_cash?: number
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          price_brl_cents?: number
          sort_order?: number | null
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
          examples: Json
          id: string
          image_url: string | null
          kind: string
          pdf_path: string | null
          price_cash: number | null
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
          examples?: Json
          id?: string
          image_url?: string | null
          kind: string
          pdf_path?: string | null
          price_cash?: number | null
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
          examples?: Json
          id?: string
          image_url?: string | null
          kind?: string
          pdf_path?: string | null
          price_cash?: number | null
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
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
      offer_analyses: {
        Row: {
          ad_library_url: string
          created_at: string
          id: string
          observations: string | null
          status: string
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          ad_library_url: string
          created_at?: string
          id?: string
          observations?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          ad_library_url?: string
          created_at?: string
          id?: string
          observations?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_analyses_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pix_deposits: {
        Row: {
          admin_note: string | null
          amount_cents: number
          created_at: string
          id: string
          payer_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_cents: number
          created_at?: string
          id?: string
          payer_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_cents?: number
          created_at?: string
          id?: string
          payer_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abuse_blocked: boolean | null
          avatar_url: string | null
          cash_balance: number | null
          created_at: string
          email: string
          empresa: string | null
          id: string
          invite_validated: boolean | null
          lgpd_accepted: boolean | null
          lgpd_accepted_at: string | null
          nome: string
          plano: string
          sobre: string
          sobrenome: string | null
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abuse_blocked?: boolean | null
          avatar_url?: string | null
          cash_balance?: number | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          invite_validated?: boolean | null
          lgpd_accepted?: boolean | null
          lgpd_accepted_at?: string | null
          nome?: string
          plano?: string
          sobre?: string
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abuse_blocked?: boolean | null
          avatar_url?: string | null
          cash_balance?: number | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          invite_validated?: boolean | null
          lgpd_accepted?: boolean | null
          lgpd_accepted_at?: string | null
          nome?: string
          plano?: string
          sobre?: string
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchased_accounts: {
        Row: {
          account_data: Json | null
          account_type: string
          created_at: string
          credentials: Json | null
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_data?: Json | null
          account_type: string
          created_at?: string
          credentials?: Json | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_data?: Json | null
          account_type?: string
          created_at?: string
          credentials?: Json | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string | null
          id: string
          product_id: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          created_at: string
          endpoint: string
          id: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          endpoint: string
          id?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          created_at?: string
          endpoint?: string
          id?: string
          key?: string
          window_start?: string
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
          price_cash: number | null
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
          price_cash?: number | null
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
          price_cash?: number | null
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
      student_areas: {
        Row: {
          content: Json
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          access_source: string | null
          access_until: string | null
          charge_frequency: string | null
          created_at: string
          email: string
          id: string
          kirvano_checkout_id: string | null
          kirvano_customer_email: string | null
          kirvano_last_sale_id: string | null
          next_charge_date: string | null
          plan_name: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_source?: string | null
          access_until?: string | null
          charge_frequency?: string | null
          created_at?: string
          email: string
          id?: string
          kirvano_checkout_id?: string | null
          kirvano_customer_email?: string | null
          kirvano_last_sale_id?: string | null
          next_charge_date?: string | null
          plan_name?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_source?: string | null
          access_until?: string | null
          charge_frequency?: string | null
          created_at?: string
          email?: string
          id?: string
          kirvano_checkout_id?: string | null
          kirvano_customer_email?: string | null
          kirvano_last_sale_id?: string | null
          next_charge_date?: string | null
          plan_name?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          product_id: string | null
          reason: string
          status: string
          stripe_event_id: string | null
          stripe_session_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason: string
          status: string
          stripe_event_id?: string | null
          stripe_session_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          product_id?: string | null
          reason?: string
          status?: string
          stripe_event_id?: string | null
          stripe_session_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_offers: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          copy_texto: string
          created_at: string
          id: string
          is_definitive: boolean
          link_bib: string
          link_checkout: string
          link_drive: string
          link_site: string
          nome: string
          tags: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          copy_texto?: string
          created_at?: string
          id?: string
          is_definitive?: boolean
          link_bib?: string
          link_checkout?: string
          link_drive?: string
          link_site?: string
          nome: string
          tags?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          copy_texto?: string
          created_at?: string
          id?: string
          is_definitive?: boolean
          link_bib?: string
          link_checkout?: string
          link_drive?: string
          link_site?: string
          nome?: string
          tags?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      validated_offers: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link: string
          price: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link: string
          price?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string
          price?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_endpoint: string; p_key: string; p_max?: number }
        Returns: Json
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_unique_invite_code: { Args: never; Returns: string }
      get_monthly_offer_ranking: {
        Args: never
        Returns: {
          avatar_url: string
          count: number
          nome: string
          rank_position: number
        }[]
      }
      get_tool_premium: { Args: { _tool_key: string }; Returns: Json }
      get_user_emails: { Args: { user_ids: string[] }; Returns: Json }
      has_active_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_cash_balance: {
        Args: { p_amount: number; p_user: string }
        Returns: undefined
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
      list_pix_deposits_admin: {
        Args: { p_status?: string }
        Returns: {
          admin_note: string
          amount_cents: number
          created_at: string
          id: string
          payer_note: string
          reviewed_at: string
          status: string
          user_email: string
          user_id: string
          user_nome: string
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
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      regenerate_invite_code: {
        Args: { target_invite_id: string }
        Returns: Json
      }
      remove_abuse_block: {
        Args: { target_fingerprint: string; target_user_id: string }
        Returns: Json
      }
      review_pix_deposit: {
        Args: { p_approve: boolean; p_deposit_id: string; p_note?: string }
        Returns: Json
      }
      spend_cash: {
        Args: { p_amount: number; p_product: string; p_user: string }
        Returns: Json
      }
      validate_invite_code: {
        Args: {
          invite_code_text: string
          p_fingerprint?: string
          p_ip_address?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "mentorado" | "member"
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
      app_role: ["admin", "user", "mentorado", "member"],
    },
  },
} as const

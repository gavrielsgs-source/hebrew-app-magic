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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cars: {
        Row: {
          agency_id: string | null
          chassis_number: string | null
          created_at: string | null
          description: string | null
          engine_size: string | null
          entry_date: string | null
          exterior_color: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          interior_color: string | null
          kilometers: number
          last_test_date: string | null
          license_number: string | null
          make: string
          model: string
          next_test_date: string | null
          ownership_history: string | null
          price: number
          registration_year: number | null
          status: string | null
          transmission: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          agency_id?: string | null
          chassis_number?: string | null
          created_at?: string | null
          description?: string | null
          engine_size?: string | null
          entry_date?: string | null
          exterior_color?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          interior_color?: string | null
          kilometers: number
          last_test_date?: string | null
          license_number?: string | null
          make: string
          model: string
          next_test_date?: string | null
          ownership_history?: string | null
          price: number
          registration_year?: number | null
          status?: string | null
          transmission?: string | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          agency_id?: string | null
          chassis_number?: string | null
          created_at?: string | null
          description?: string | null
          engine_size?: string | null
          entry_date?: string | null
          exterior_color?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          interior_color?: string | null
          kilometers?: number
          last_test_date?: string | null
          license_number?: string | null
          make?: string
          model?: string
          next_test_date?: string | null
          ownership_history?: string | null
          price?: number
          registration_year?: number | null
          status?: string | null
          transmission?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_document_returns: {
        Row: {
          created_at: string
          customer_document_id: string
          file_path: string
          id: string
          uploaded_at: string
        }
        Insert: {
          created_at?: string
          customer_document_id: string
          file_path: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          created_at?: string
          customer_document_id?: string
          file_path?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_document_returns_customer_document_id_fkey"
            columns: ["customer_document_id"]
            isOneToOne: false
            referencedRelation: "customer_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          amount: number | null
          created_at: string
          customer_id: string
          date: string | null
          document_number: string
          file_path: string | null
          id: string
          status: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_id: string
          date?: string | null
          document_number: string
          file_path?: string | null
          id?: string
          status?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_id?: string
          date?: string | null
          document_number?: string
          file_path?: string | null
          id?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicle_purchases: {
        Row: {
          car_id: string
          created_at: string
          customer_id: string
          id: string
          purchase_date: string | null
          purchase_price: number | null
        }
        Insert: {
          car_id: string
          created_at?: string
          customer_id: string
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
        }
        Update: {
          car_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          purchase_date?: string | null
          purchase_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicle_purchases_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicle_purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicle_sales: {
        Row: {
          car_id: string
          created_at: string
          customer_id: string
          id: string
          sale_date: string | null
          sale_price: number | null
        }
        Insert: {
          car_id: string
          created_at?: string
          customer_id: string
          id?: string
          sale_date?: string | null
          sale_price?: number | null
        }
        Update: {
          car_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          sale_date?: string | null
          sale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicle_sales_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicle_sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          credit_amount: number | null
          customer_number: number
          customer_type: string | null
          email: string | null
          fax: string | null
          full_name: string
          id: string
          id_number: string | null
          join_date: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credit_amount?: number | null
          customer_number?: number
          customer_type?: string | null
          email?: string | null
          fax?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          join_date?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credit_amount?: number | null
          customer_number?: number
          customer_type?: string | null
          email?: string | null
          fax?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          join_date?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_sequences: {
        Row: {
          created_at: string
          current_number: number
          document_type: string
          id: string
          prefix: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_number?: number
          document_type: string
          id?: string
          prefix?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_number?: number
          document_type?: string
          id?: string
          prefix?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          file_path: string | null
          file_type: string | null
          id: string
          is_template: boolean | null
          name: string
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          type: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      facebook_leads: {
        Row: {
          created_at: string | null
          id: string
          lead_data: Json
          lead_id: string
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_data: Json
          lead_id: string
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_data?: Json
          lead_id?: string
          page_id?: string
          user_id?: string
        }
        Relationships: []
      }
      facebook_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          page_id: string
          page_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          page_id: string
          page_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          page_id?: string
          page_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          agency_id: string | null
          assigned_to: string | null
          car_id: string | null
          created_at: string | null
          email: string | null
          follow_up_notes: string[] | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          assigned_to?: string | null
          car_id?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_notes?: string[] | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          assigned_to?: string | null
          car_id?: string | null
          created_at?: string | null
          email?: string | null
          follow_up_notes?: string[] | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          notification_preferences: Json | null
          phone: string | null
          position: string | null
          push_subscription: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          push_subscription?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          notification_preferences?: Json | null
          phone?: string | null
          position?: string | null
          push_subscription?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean
          active_users_count: number | null
          company_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          max_users: number | null
          subscription_tier: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          active_users_count?: number | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          max_users?: number | null
          subscription_tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          active_users_count?: number | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          max_users?: number | null
          subscription_tier?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          agency_id: string | null
          assigned_to: string | null
          car_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          priority: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          assigned_to?: string | null
          car_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          assigned_to?: string | null
          car_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_invoices: {
        Row: {
          car_id: string | null
          company_address: string | null
          company_authorized_dealer: boolean | null
          company_hp: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          currency: string
          customer_address: string | null
          customer_hp: string | null
          customer_name: string
          customer_phone: string | null
          date: string
          id: string
          invoice_number: string
          items: Json
          lead_id: string | null
          notes: string | null
          subtotal: number
          title: string
          total_amount: number
          updated_at: string
          user_id: string
          vat_amount: number
        }
        Insert: {
          car_id?: string | null
          company_address?: string | null
          company_authorized_dealer?: boolean | null
          company_hp?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_hp?: string | null
          customer_name: string
          customer_phone?: string | null
          date: string
          id?: string
          invoice_number: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          subtotal?: number
          title: string
          total_amount?: number
          updated_at?: string
          user_id: string
          vat_amount?: number
        }
        Update: {
          car_id?: string | null
          company_address?: string | null
          company_authorized_dealer?: boolean | null
          company_hp?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          currency?: string
          customer_address?: string | null
          customer_hp?: string | null
          customer_name?: string
          customer_phone?: string | null
          date?: string
          id?: string
          invoice_number?: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          subtotal?: number
          title?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          vat_amount?: number
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          agency_id: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          agency_id?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          agency_id?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          agency_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agency_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          name: string
          template_content: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name: string
          template_content: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          name?: string
          template_content?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_company_id_fkey"
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
      gdpr_delete_user: { Args: { user_id_param: string }; Returns: undefined }
      get_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          id: string
          last_sign_in_at: string
        }[]
      }
      get_facebook_tokens: {
        Args: { p_user_id: string }
        Returns: {
          access_token: string
          created_at: string
          id: string
          page_id: string
          page_name: string
          user_id: string
        }[]
      }
      get_user_agencies: { Args: never; Returns: string[] }
      get_user_companies: { Args: never; Returns: string[] }
      has_role: {
        Args: {
          agency_id_param?: string
          role_name: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_agency_manager_or_admin: {
        Args: { agency_id_param: string }
        Returns: boolean
      }
      is_company_owner: { Args: { company_id_param: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_action_type: string
          p_error_message?: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type: string
          p_success?: boolean
          p_user_id: string
        }
        Returns: undefined
      }
      save_facebook_lead: {
        Args: {
          p_created_at: string
          p_lead_data: Json
          p_lead_id: string
          p_page_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      save_facebook_token: {
        Args: {
          p_access_token: string
          p_page_id: string
          p_page_name: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "agency_manager"
        | "sales_agent"
        | "viewer"
        | "company_owner"
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
      user_role: [
        "admin",
        "agency_manager",
        "sales_agent",
        "viewer",
        "company_owner",
      ],
    },
  },
} as const

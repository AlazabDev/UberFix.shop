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
      annual_grand_winners: {
        Row: {
          award_year: number
          certificate_url: string | null
          created_at: string | null
          id: string
          story: string | null
          technician_id: string | null
          video_url: string | null
        }
        Insert: {
          award_year: number
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          story?: string | null
          technician_id?: string | null
          video_url?: string | null
        }
        Update: {
          award_year?: number
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          story?: string | null
          technician_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "annual_grand_winners_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      app_control: {
        Row: {
          id: string
          is_locked: boolean
          message: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          is_locked?: boolean
          message?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          is_locked?: boolean
          message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          allow_edit_after_start: boolean | null
          allow_self_registration: boolean | null
          allow_technician_quotes: boolean | null
          app_logo_url: string | null
          app_name: string
          auto_backup_enabled: boolean | null
          background_color: string | null
          backup_frequency: string | null
          company_address: string | null
          company_email: string | null
          company_phone: string | null
          created_at: string
          custom_css: string | null
          default_currency: string | null
          default_language: string | null
          enable_2fa: boolean | null
          enable_email_notifications: boolean | null
          enable_in_app_notifications: boolean | null
          enable_reminders: boolean | null
          enable_sms_notifications: boolean | null
          enable_technician_rating: boolean | null
          erpnext_enabled: boolean | null
          erpnext_url: string | null
          google_maps_enabled: boolean | null
          id: string
          lock_sensitive_settings: boolean | null
          map_style: string | null
          max_execution_time: number | null
          notification_templates: Json | null
          notification_types: Json | null
          order_stages: Json | null
          primary_color: string | null
          require_manager_approval: boolean | null
          secondary_color: string | null
          session_timeout: number | null
          show_footer: boolean | null
          show_technicians_on_map: boolean | null
          smtp_from_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          technician_statuses: Json | null
          theme_mode: string | null
          timezone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          allow_edit_after_start?: boolean | null
          allow_self_registration?: boolean | null
          allow_technician_quotes?: boolean | null
          app_logo_url?: string | null
          app_name?: string
          auto_backup_enabled?: boolean | null
          background_color?: string | null
          backup_frequency?: string | null
          company_address?: string | null
          company_email?: string | null
          company_phone?: string | null
          created_at?: string
          custom_css?: string | null
          default_currency?: string | null
          default_language?: string | null
          enable_2fa?: boolean | null
          enable_email_notifications?: boolean | null
          enable_in_app_notifications?: boolean | null
          enable_reminders?: boolean | null
          enable_sms_notifications?: boolean | null
          enable_technician_rating?: boolean | null
          erpnext_enabled?: boolean | null
          erpnext_url?: string | null
          google_maps_enabled?: boolean | null
          id?: string
          lock_sensitive_settings?: boolean | null
          map_style?: string | null
          max_execution_time?: number | null
          notification_templates?: Json | null
          notification_types?: Json | null
          order_stages?: Json | null
          primary_color?: string | null
          require_manager_approval?: boolean | null
          secondary_color?: string | null
          session_timeout?: number | null
          show_footer?: boolean | null
          show_technicians_on_map?: boolean | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          technician_statuses?: Json | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          allow_edit_after_start?: boolean | null
          allow_self_registration?: boolean | null
          allow_technician_quotes?: boolean | null
          app_logo_url?: string | null
          app_name?: string
          auto_backup_enabled?: boolean | null
          background_color?: string | null
          backup_frequency?: string | null
          company_address?: string | null
          company_email?: string | null
          company_phone?: string | null
          created_at?: string
          custom_css?: string | null
          default_currency?: string | null
          default_language?: string | null
          enable_2fa?: boolean | null
          enable_email_notifications?: boolean | null
          enable_in_app_notifications?: boolean | null
          enable_reminders?: boolean | null
          enable_sms_notifications?: boolean | null
          enable_technician_rating?: boolean | null
          erpnext_enabled?: boolean | null
          erpnext_url?: string | null
          google_maps_enabled?: boolean | null
          id?: string
          lock_sensitive_settings?: boolean | null
          map_style?: string | null
          max_execution_time?: number | null
          notification_templates?: Json | null
          notification_types?: Json | null
          order_stages?: Json | null
          primary_color?: string | null
          require_manager_approval?: boolean | null
          secondary_color?: string | null
          session_timeout?: number | null
          show_footer?: boolean | null
          show_technicians_on_map?: boolean | null
          smtp_from_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          technician_statuses?: Json | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          maintenance_request_id: string | null
          notes: string | null
          property_id: string | null
          reminder_sent: boolean
          status: string
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          maintenance_request_id?: string | null
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean
          status?: string
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          maintenance_request_id?: string | null
          notes?: string | null
          property_id?: string | null
          reminder_sent?: boolean
          status?: string
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      branch_locations: {
        Row: {
          address: string | null
          branch: string
          branch_type: string | null
          icon: string | null
          id: string
          latitude: string | null
          link: string | null
          longitude: string | null
        }
        Insert: {
          address?: string | null
          branch: string
          branch_type?: string | null
          icon?: string | null
          id: string
          latitude?: string | null
          link?: string | null
          longitude?: string | null
        }
        Update: {
          address?: string | null
          branch?: string
          branch_type?: string | null
          icon?: string | null
          id?: string
          latitude?: string | null
          link?: string | null
          longitude?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string | null
          company_id: string
          created_at: string
          created_by: string | null
          geo: Json | null
          id: string
          name: string
          opening_hours: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          geo?: Json | null
          id?: string
          name: string
          opening_hours?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          geo?: Json | null
          id?: string
          name?: string
          opening_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: number
          name_ar: string
        }
        Insert: {
          id?: number
          name_ar: string
        }
        Update: {
          id?: number
          name_ar?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          billing_cycle: string | null
          created_at: string
          created_by: string | null
          eta_tax_profile_id: string | null
          id: string
          name: string
          pricing_model: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          created_by?: string | null
          eta_tax_profile_id?: string | null
          id?: string
          name: string
          pricing_model?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          created_by?: string | null
          eta_tax_profile_id?: string | null
          id?: string
          name?: string
          pricing_model?: string | null
        }
        Relationships: []
      }
      districts: {
        Row: {
          city_id: number
          id: number
          name_ar: string
        }
        Insert: {
          city_id: number
          id?: number
          name_ar: string
        }
        Update: {
          city_id?: number
          id?: number
          name_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          count: number | null
          created_at: string | null
          error_hash: string | null
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          level: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          stack: string | null
          updated_at: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          error_hash?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          level?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          stack?: string | null
          updated_at?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          error_hash?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          level?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          stack?: string | null
          updated_at?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          maintenance_request_id: string | null
          request_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          maintenance_request_id?: string | null
          request_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          maintenance_request_id?: string | null
          request_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          folder: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          folder?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          folder?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hall_of_excellence: {
        Row: {
          achievement_date: string
          achievement_description: string | null
          achievement_title: string
          achievement_type: string
          created_at: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          media_urls: string[] | null
          story: string | null
          technician_id: string | null
        }
        Insert: {
          achievement_date: string
          achievement_description?: string | null
          achievement_title: string
          achievement_type: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          media_urls?: string[] | null
          story?: string | null
          technician_id?: string | null
        }
        Update: {
          achievement_date?: string
          achievement_description?: string | null
          achievement_title?: string
          achievement_type?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          media_urls?: string[] | null
          story?: string | null
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hall_of_excellence_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          invoice_id: string
          quantity: number
          service_name: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id: string
          quantity?: number
          service_name: string
          total_price?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string
          quantity?: number
          service_name?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          due_date: string | null
          id: string
          invoice_number: string
          is_locked: boolean
          issue_date: string
          last_modified_by: string | null
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          is_locked?: boolean
          issue_date?: string
          last_modified_by?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_locked?: boolean
          issue_date?: string
          last_modified_by?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          archived_at: string | null
          asset_id: string | null
          assigned_vendor_id: string | null
          branch_id: string
          category_id: string | null
          channel: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          company_id: string
          created_at: string
          created_by: string | null
          customer_notes: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          last_modified_by: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          opened_by_role: string | null
          priority: string | null
          property_id: string | null
          rating: number | null
          service_type: string | null
          sla_accept_due: string | null
          sla_arrive_due: string | null
          sla_complete_due: string | null
          sla_deadline: string | null
          sla_due_date: string | null
          status: Database["public"]["Enums"]["mr_status"]
          subcategory_id: string | null
          title: string
          updated_at: string | null
          vendor_notes: string | null
          version: number
          workflow_stage: string | null
        }
        Insert: {
          actual_cost?: number | null
          archived_at?: string | null
          asset_id?: string | null
          assigned_vendor_id?: string | null
          branch_id: string
          category_id?: string | null
          channel?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          last_modified_by?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          opened_by_role?: string | null
          priority?: string | null
          property_id?: string | null
          rating?: number | null
          service_type?: string | null
          sla_accept_due?: string | null
          sla_arrive_due?: string | null
          sla_complete_due?: string | null
          sla_deadline?: string | null
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["mr_status"]
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          vendor_notes?: string | null
          version?: number
          workflow_stage?: string | null
        }
        Update: {
          actual_cost?: number | null
          archived_at?: string | null
          asset_id?: string | null
          assigned_vendor_id?: string | null
          branch_id?: string
          category_id?: string | null
          channel?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_notes?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          last_modified_by?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          opened_by_role?: string | null
          priority?: string | null
          property_id?: string | null
          rating?: number | null
          service_type?: string | null
          sla_accept_due?: string | null
          sla_arrive_due?: string | null
          sla_complete_due?: string | null
          sla_deadline?: string | null
          sla_due_date?: string | null
          status?: Database["public"]["Enums"]["mr_status"]
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          vendor_notes?: string | null
          version?: number
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_requests_assigned_vendor"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests_audit: {
        Row: {
          change_summary: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          request_id: string
          version: number
          workflow_transition: string | null
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          request_id: string
          version: number
          workflow_transition?: string | null
        }
        Update: {
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          request_id?: string
          version?: number
          workflow_transition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_audit_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      message_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message_content: string
          message_type: string
          metadata: Json | null
          provider: string
          recipient: string
          request_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_content: string
          message_type: string
          metadata?: Json | null
          provider?: string
          recipient: string
          request_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_content?: string
          message_type?: string
          metadata?: Json | null
          provider?: string
          recipient?: string
          request_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          parent_message_id: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          parent_message_id?: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          parent_message_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_excellence_awards: {
        Row: {
          announcement_url: string | null
          award_month: string
          award_type: string
          certificate_url: string | null
          created_at: string | null
          id: string
          reward_description: string | null
          reward_value: number | null
          technician_id: string | null
        }
        Insert: {
          announcement_url?: string | null
          award_month: string
          award_type: string
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          reward_description?: string | null
          reward_value?: number | null
          technician_id?: string | null
        }
        Update: {
          announcement_url?: string | null
          award_month?: string
          award_type?: string
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          reward_description?: string | null
          reward_value?: number | null
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_excellence_awards_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
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
          message_log_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string | null
          sms_sent: boolean | null
          title: string
          type: string
          updated_at: string
          whatsapp_sent: boolean | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          message_log_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id?: string | null
          sms_sent?: boolean | null
          title: string
          type?: string
          updated_at?: string
          whatsapp_sent?: boolean | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          message_log_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string | null
          sms_sent?: boolean | null
          title?: string
          type?: string
          updated_at?: string
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_message_log_id_fkey"
            columns: ["message_log_id"]
            isOneToOne: false
            referencedRelation: "message_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          iframe_key: string | null
          is_deleted: boolean | null
          last_modified_by: string | null
          last_name: string | null
          link_3d: string | null
          name: string
          phone: string | null
          photo_link: string | null
          plan_link: string | null
          position: string | null
          reports_to: string | null
          role: string
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          iframe_key?: string | null
          is_deleted?: boolean | null
          last_modified_by?: string | null
          last_name?: string | null
          link_3d?: string | null
          name: string
          phone?: string | null
          photo_link?: string | null
          plan_link?: string | null
          position?: string | null
          reports_to?: string | null
          role: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          iframe_key?: string | null
          is_deleted?: boolean | null
          last_modified_by?: string | null
          last_name?: string | null
          link_3d?: string | null
          name?: string
          phone?: string | null
          photo_link?: string | null
          plan_link?: string | null
          position?: string | null
          reports_to?: string | null
          role?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          budget: number | null
          company_name: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          gallery_url: string | null
          id: string
          last_modified_by: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          magicplan_iframe_url: string | null
          manager_id: string | null
          name: string
          progress: number | null
          project_type: string | null
          sketch_url: string | null
          start_date: string | null
          status: string
          updated_at: string | null
          version: number
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          budget?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          gallery_url?: string | null
          id: string
          last_modified_by?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          magicplan_iframe_url?: string | null
          manager_id?: string | null
          name: string
          progress?: number | null
          project_type?: string | null
          sketch_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          budget?: number | null
          company_name?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          gallery_url?: string | null
          id?: string
          last_modified_by?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          magicplan_iframe_url?: string | null
          manager_id?: string | null
          name?: string
          progress?: number | null
          project_type?: string | null
          sketch_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          area: number | null
          bathrooms: number | null
          city_id: number | null
          code: string | null
          created_at: string
          created_by: string
          description: string | null
          district_id: number | null
          floors: number | null
          icon_url: string | null
          id: string
          images: string[] | null
          last_inspection_date: string | null
          last_modified_by: string | null
          latitude: number | null
          longitude: number | null
          maintenance_schedule: string | null
          manager_id: string | null
          name: string
          next_inspection_date: string | null
          parking_spaces: number | null
          qr_code_data: string | null
          qr_code_generated_at: string | null
          region_id: string | null
          rooms: number | null
          status: string
          type: string
          updated_at: string
          value: number | null
          version: number
        }
        Insert: {
          address: string
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          city_id?: number | null
          code?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          district_id?: number | null
          floors?: number | null
          icon_url?: string | null
          id?: string
          images?: string[] | null
          last_inspection_date?: string | null
          last_modified_by?: string | null
          latitude?: number | null
          longitude?: number | null
          maintenance_schedule?: string | null
          manager_id?: string | null
          name: string
          next_inspection_date?: string | null
          parking_spaces?: number | null
          qr_code_data?: string | null
          qr_code_generated_at?: string | null
          region_id?: string | null
          rooms?: number | null
          status?: string
          type: string
          updated_at?: string
          value?: number | null
          version?: number
        }
        Update: {
          address?: string
          amenities?: string[] | null
          area?: number | null
          bathrooms?: number | null
          city_id?: number | null
          code?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          district_id?: number | null
          floors?: number | null
          icon_url?: string | null
          id?: string
          images?: string[] | null
          last_inspection_date?: string | null
          last_modified_by?: string | null
          latitude?: number | null
          longitude?: number | null
          maintenance_schedule?: string | null
          manager_id?: string | null
          name?: string
          next_inspection_date?: string | null
          parking_spaces?: number | null
          qr_code_data?: string | null
          qr_code_generated_at?: string | null
          region_id?: string | null
          rooms?: number | null
          status?: string
          type?: string
          updated_at?: string
          value?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      properties_audit: {
        Row: {
          change_summary: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          property_id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          property_id: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          property_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "properties_audit_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          code: string | null
          coordinates: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          level: number
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          level: number
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      request_approvals: {
        Row: {
          approval_type: string
          approved_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          request_id: string
          status: string
        }
        Insert: {
          approval_type: string
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id: string
          status: string
        }
        Update: {
          approval_type?: string
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          request_id?: string
          status?: string
        }
        Relationships: []
      }
      request_lifecycle: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          request_id: string
          status: Database["public"]["Enums"]["maintenance_status"]
          update_notes: string | null
          update_type: Database["public"]["Enums"]["update_type"]
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          request_id: string
          status: Database["public"]["Enums"]["maintenance_status"]
          update_notes?: string | null
          update_type: Database["public"]["Enums"]["update_type"]
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          request_id?: string
          status?: Database["public"]["Enums"]["maintenance_status"]
          update_notes?: string | null
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          images: string[] | null
          rating: number
          request_id: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          images?: string[] | null
          rating: number
          request_id?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          images?: string[] | null
          rating?: number
          request_id?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          resource: string
          role: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          resource: string
          role: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          resource?: string
          role?: string
        }
        Relationships: []
      }
      service_addons: {
        Row: {
          additional_price: number
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: number
          name: string
          service_item_id: number | null
        }
        Insert: {
          additional_price: number
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: number
          name: string
          service_item_id?: number | null
        }
        Update: {
          additional_price?: number
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: number
          name?: string
          service_item_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_addons_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      service_items: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          subcategory_id: number | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name: string
          subcategory_id?: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          subcategory_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_items_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          created_at: string | null
          customer_id: number
          description: string | null
          id: number
          location: string | null
          package_id: number | null
          service_item_id: number | null
          status: string | null
          technician_id: number | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          customer_id: number
          description?: string | null
          id?: number
          location?: string | null
          package_id?: number | null
          service_item_id?: number | null
          status?: string | null
          technician_id?: number | null
          total_price: number
        }
        Update: {
          created_at?: string | null
          customer_id?: number
          description?: string | null
          id?: number
          location?: string | null
          package_id?: number | null
          service_item_id?: number | null
          status?: string | null
          technician_id?: number | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: number
          package_name: string
          price: number
          service_item_id: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          package_name: string
          price: number
          service_item_id?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: number
          package_name?: string
          price?: number
          service_item_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          branch_id: string | null
          id: string
          price: number
          service_id: string
          vat_rate: number | null
          vendor_id: string | null
        }
        Insert: {
          branch_id?: string | null
          id?: string
          price: number
          service_id: string
          vat_rate?: number | null
          vendor_id?: string | null
        }
        Update: {
          branch_id?: string | null
          id?: string
          price?: number
          service_id?: string
          vat_rate?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      service_subcategories: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          max_qty: number | null
          min_qty: number | null
          name: string | null
          name_ar: string
          name_en: string | null
          pricing_type: string
          sort_order: number | null
          subcategory_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          max_qty?: number | null
          min_qty?: number | null
          name?: string | null
          name_ar: string
          name_en?: string | null
          pricing_type?: string
          sort_order?: number | null
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          max_qty?: number | null
          min_qty?: number | null
          name?: string | null
          name_ar?: string
          name_en?: string | null
          pricing_type?: string
          sort_order?: number | null
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_policies: {
        Row: {
          accept_within_min: number
          arrive_within_min: number
          category_id: string | null
          complete_within_min: number
          created_at: string | null
          id: string
          priority: string
        }
        Insert: {
          accept_within_min: number
          arrive_within_min: number
          category_id?: string | null
          complete_within_min: number
          created_at?: string | null
          id?: string
          priority: string
        }
        Update: {
          accept_within_min?: number
          arrive_within_min?: number
          category_id?: string | null
          complete_within_min?: number
          created_at?: string | null
          id?: string
          priority?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_policies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      specialization_icons: {
        Row: {
          color: string | null
          icon_path: string
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          icon_path: string
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          icon_path?: string
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          area: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_deleted: boolean | null
          location: string | null
          map_url: string | null
          name: string
          opening_date: string | null
          phone: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          area?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          location?: string | null
          map_url?: string | null
          name: string
          opening_date?: string | null
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          area?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean | null
          location?: string | null
          map_url?: string | null
          name?: string
          opening_date?: string | null
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      technician_agreements: {
        Row: {
          application_id: string | null
          conduct_policy_accepted: boolean | null
          created_at: string | null
          customer_respect_policy_accepted: boolean | null
          id: string
          ip_address: string | null
          pricing_policy_accepted: boolean | null
          punctuality_policy_accepted: boolean | null
          quality_policy_accepted: boolean | null
          signed_at: string | null
        }
        Insert: {
          application_id?: string | null
          conduct_policy_accepted?: boolean | null
          created_at?: string | null
          customer_respect_policy_accepted?: boolean | null
          id?: string
          ip_address?: string | null
          pricing_policy_accepted?: boolean | null
          punctuality_policy_accepted?: boolean | null
          quality_policy_accepted?: boolean | null
          signed_at?: string | null
        }
        Update: {
          application_id?: string | null
          conduct_policy_accepted?: boolean | null
          created_at?: string | null
          customer_respect_policy_accepted?: boolean | null
          id?: string
          ip_address?: string | null
          pricing_policy_accepted?: boolean | null
          punctuality_policy_accepted?: boolean | null
          quality_policy_accepted?: boolean | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "technician_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_applications: {
        Row: {
          alternative_contact: string | null
          city_id: number | null
          created_at: string | null
          district_id: number | null
          full_name: string
          home_address: string | null
          id: string
          national_id: string
          phone: string
          profile_image: string | null
          specialization: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          years_of_experience: number | null
        }
        Insert: {
          alternative_contact?: string | null
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          full_name: string
          home_address?: string | null
          id?: string
          national_id: string
          phone: string
          profile_image?: string | null
          specialization: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Update: {
          alternative_contact?: string | null
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          full_name?: string
          home_address?: string | null
          id?: string
          national_id?: string
          phone?: string
          profile_image?: string | null
          specialization?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_applications_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_applications_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_applications_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_badges: {
        Row: {
          awarded_at: string | null
          awarded_for: string | null
          badge_description: string | null
          badge_title: string
          badge_type: string
          created_at: string | null
          id: string
          technician_id: string | null
        }
        Insert: {
          awarded_at?: string | null
          awarded_for?: string | null
          badge_description?: string | null
          badge_title: string
          badge_type: string
          created_at?: string | null
          id?: string
          technician_id?: string | null
        }
        Update: {
          awarded_at?: string | null
          awarded_for?: string | null
          badge_description?: string | null
          badge_title?: string
          badge_type?: string
          created_at?: string | null
          id?: string
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_badges_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_complaints: {
        Row: {
          complaint_type: string
          created_at: string
          customer_id: string | null
          description: string
          id: string
          penalty_applied: number | null
          request_id: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          technician_id: string
          updated_at: string
        }
        Insert: {
          complaint_type: string
          created_at?: string
          customer_id?: string | null
          description: string
          id?: string
          penalty_applied?: number | null
          request_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          technician_id: string
          updated_at?: string
        }
        Update: {
          complaint_type?: string
          created_at?: string
          customer_id?: string | null
          description?: string
          id?: string
          penalty_applied?: number | null
          request_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_complaints_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_complaints_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_complaints_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_coverage: {
        Row: {
          city_id: number | null
          created_at: string | null
          district_id: number | null
          id: string
          radius_km: number | null
          technician_id: string
        }
        Insert: {
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          id?: string
          radius_km?: number | null
          technician_id: string
        }
        Update: {
          city_id?: number | null
          created_at?: string | null
          district_id?: number | null
          id?: string
          radius_km?: number | null
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_coverage_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_coverage_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_coverage_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_coverage_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_daily_stats: {
        Row: {
          average_arrival_time: number | null
          average_rating: number | null
          average_response_time: number | null
          complaints_received: number | null
          created_at: string
          date: string
          id: string
          technician_id: string
          total_earnings: number | null
          updated_at: string
          visits_accepted: number | null
          visits_assigned: number | null
          visits_cancelled: number | null
          visits_completed: number | null
          visits_rejected: number | null
        }
        Insert: {
          average_arrival_time?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          complaints_received?: number | null
          created_at?: string
          date?: string
          id?: string
          technician_id: string
          total_earnings?: number | null
          updated_at?: string
          visits_accepted?: number | null
          visits_assigned?: number | null
          visits_cancelled?: number | null
          visits_completed?: number | null
          visits_rejected?: number | null
        }
        Update: {
          average_arrival_time?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          complaints_received?: number | null
          created_at?: string
          date?: string
          id?: string
          technician_id?: string
          total_earnings?: number | null
          updated_at?: string
          visits_accepted?: number | null
          visits_assigned?: number | null
          visits_cancelled?: number | null
          visits_completed?: number | null
          visits_rejected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_daily_stats_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_level_history: {
        Row: {
          achieved_at: string
          created_at: string
          id: string
          level: string
          previous_level: string | null
          requirements_met: Json
          technician_id: string
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          id?: string
          level: string
          previous_level?: string | null
          requirements_met: Json
          technician_id: string
        }
        Update: {
          achieved_at?: string
          created_at?: string
          id?: string
          level?: string
          previous_level?: string | null
          requirements_met?: Json
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_level_history_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_levels: {
        Row: {
          created_at: string | null
          current_level: string | null
          id: string
          level_updated_at: string | null
          promotion_history: Json | null
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_level?: string | null
          id?: string
          level_updated_at?: string | null
          promotion_history?: Json | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_level?: string | null
          id?: string
          level_updated_at?: string | null
          promotion_history?: Json | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_levels_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_location: {
        Row: {
          lat: number | null
          lng: number | null
          technician_id: string
          updated_at: string | null
        }
        Insert: {
          lat?: number | null
          lng?: number | null
          technician_id: string
          updated_at?: string | null
        }
        Update: {
          lat?: number | null
          lng?: number | null
          technician_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_location_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_monthly_bonuses: {
        Row: {
          acceptance_rate: number | null
          average_arrival_time: number | null
          average_rating: number | null
          average_response_time: number | null
          cancellation_rate: number | null
          commitment_bonus: number | null
          complaints_count: number | null
          created_at: string
          id: string
          month: string
          paid_at: string | null
          quality_bonus: number | null
          status: string | null
          super_pro_bonus: number | null
          technician_id: string
          time_bonus: number | null
          top_rated_bonus: number | null
          total_bonus: number
          updated_at: string
          visits_completed: number
        }
        Insert: {
          acceptance_rate?: number | null
          average_arrival_time?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          cancellation_rate?: number | null
          commitment_bonus?: number | null
          complaints_count?: number | null
          created_at?: string
          id?: string
          month: string
          paid_at?: string | null
          quality_bonus?: number | null
          status?: string | null
          super_pro_bonus?: number | null
          technician_id: string
          time_bonus?: number | null
          top_rated_bonus?: number | null
          total_bonus?: number
          updated_at?: string
          visits_completed?: number
        }
        Update: {
          acceptance_rate?: number | null
          average_arrival_time?: number | null
          average_rating?: number | null
          average_response_time?: number | null
          cancellation_rate?: number | null
          commitment_bonus?: number | null
          complaints_count?: number | null
          created_at?: string
          id?: string
          month?: string
          paid_at?: string | null
          quality_bonus?: number | null
          status?: string | null
          super_pro_bonus?: number | null
          technician_id?: string
          time_bonus?: number | null
          top_rated_bonus?: number | null
          total_bonus?: number
          updated_at?: string
          visits_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "technician_monthly_bonuses_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_performance: {
        Row: {
          average_rating: number | null
          cancelled_tasks: number | null
          complaints_count: number | null
          completed_tasks: number | null
          created_at: string | null
          excellence_count: number | null
          id: string
          last_calculated_at: string | null
          professionalism_score: number | null
          punctuality_score: number | null
          quality_score: number | null
          technician_id: string | null
          total_points: number | null
          total_tasks: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          cancelled_tasks?: number | null
          complaints_count?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          excellence_count?: number | null
          id?: string
          last_calculated_at?: string | null
          professionalism_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
          technician_id?: string | null
          total_points?: number | null
          total_tasks?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          cancelled_tasks?: number | null
          complaints_count?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          excellence_count?: number | null
          id?: string
          last_calculated_at?: string | null
          professionalism_score?: number | null
          punctuality_score?: number | null
          quality_score?: number | null
          technician_id?: string | null
          total_points?: number | null
          total_tasks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_performance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_portfolio: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          media_type: string
          media_urls: string[]
          technician_id: string
          title: string
          updated_at: string
          work_type: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          media_type: string
          media_urls: string[]
          technician_id: string
          title: string
          updated_at?: string
          work_type?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_urls?: string[]
          technician_id?: string
          title?: string
          updated_at?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_portfolio_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_services: {
        Row: {
          created_at: string | null
          experience_years: number | null
          id: string
          is_primary: boolean | null
          service_id: string
          technician_id: string
        }
        Insert: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_primary?: boolean | null
          service_id: string
          technician_id: string
        }
        Update: {
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_primary?: boolean | null
          service_id?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_services_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_skill_tests: {
        Row: {
          answers_data: Json | null
          completed_at: string | null
          created_at: string | null
          grade: string | null
          id: string
          questions_data: Json | null
          score: number | null
          specialization: string
          technician_id: string | null
        }
        Insert: {
          answers_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          questions_data?: Json | null
          score?: number | null
          specialization: string
          technician_id?: string | null
        }
        Update: {
          answers_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          questions_data?: Json | null
          score?: number | null
          specialization?: string
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_skill_tests_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_tasks: {
        Row: {
          actual_duration: number | null
          after_photos: string[] | null
          before_photos: string[] | null
          check_in_at: string | null
          check_in_photo: string | null
          check_out_at: string | null
          created_at: string | null
          customer_location: string | null
          estimated_duration: number | null
          estimated_price: number | null
          id: string
          latitude: number | null
          longitude: number | null
          maintenance_request_id: string | null
          status: string | null
          task_description: string | null
          task_title: string
          technician_id: string | null
          updated_at: string | null
          work_report: string | null
        }
        Insert: {
          actual_duration?: number | null
          after_photos?: string[] | null
          before_photos?: string[] | null
          check_in_at?: string | null
          check_in_photo?: string | null
          check_out_at?: string | null
          created_at?: string | null
          customer_location?: string | null
          estimated_duration?: number | null
          estimated_price?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          maintenance_request_id?: string | null
          status?: string | null
          task_description?: string | null
          task_title: string
          technician_id?: string | null
          updated_at?: string | null
          work_report?: string | null
        }
        Update: {
          actual_duration?: number | null
          after_photos?: string[] | null
          before_photos?: string[] | null
          check_in_at?: string | null
          check_in_photo?: string | null
          check_out_at?: string | null
          created_at?: string | null
          customer_location?: string | null
          estimated_duration?: number | null
          estimated_price?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          maintenance_request_id?: string | null
          status?: string | null
          task_description?: string | null
          task_title?: string
          technician_id?: string | null
          updated_at?: string | null
          work_report?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_tasks_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_tasks_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_training: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          course_title: string
          course_type: string
          created_at: string | null
          id: string
          progress: number | null
          score: number | null
          status: string | null
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          course_title: string
          course_type: string
          created_at?: string | null
          id?: string
          progress?: number | null
          score?: number | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          course_title?: string
          course_type?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          score?: number | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_training_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          net_amount: number
          platform_fee: number | null
          request_id: string | null
          status: string
          technician_id: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          platform_fee?: number | null
          request_id?: string | null
          status?: string
          technician_id: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          platform_fee?: number | null
          request_id?: string | null
          status?: string
          technician_id?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_transactions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_verifications: {
        Row: {
          application_id: string | null
          created_at: string | null
          id: string
          national_id_back: string | null
          national_id_front: string | null
          rejection_reason: string | null
          selfie_image: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          national_id_back?: string | null
          national_id_front?: string | null
          rejection_reason?: string | null
          selfie_image?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          national_id_back?: string | null
          national_id_front?: string | null
          rejection_reason?: string | null
          selfie_image?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "technician_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_wallet: {
        Row: {
          balance_current: number
          balance_locked: number
          balance_pending: number
          created_at: string
          id: string
          last_withdrawal_at: string | null
          minimum_withdrawal: number
          technician_id: string
          total_earnings: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          balance_current?: number
          balance_locked?: number
          balance_pending?: number
          created_at?: string
          id?: string
          last_withdrawal_at?: string | null
          minimum_withdrawal?: number
          technician_id: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          balance_current?: number
          balance_locked?: number
          balance_pending?: number
          created_at?: string
          id?: string
          last_withdrawal_at?: string | null
          minimum_withdrawal?: number
          technician_id?: string
          total_earnings?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_wallet_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: true
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_withdrawals: {
        Row: {
          account_details: Json
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string
          status: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          account_details: Json
          amount: number
          created_at?: string
          id?: string
          method: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          account_details?: Json
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_withdrawals_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_work_zones: {
        Row: {
          city_id: number | null
          created_at: string
          district_id: number | null
          id: string
          is_primary: boolean | null
          technician_id: string
        }
        Insert: {
          city_id?: number | null
          created_at?: string
          district_id?: number | null
          id?: string
          is_primary?: boolean | null
          technician_id: string
        }
        Update: {
          city_id?: number | null
          created_at?: string
          district_id?: number | null
          id?: string
          is_primary?: boolean | null
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_work_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_work_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_work_zones_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_work_zones_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          application_id: string | null
          available_from: string | null
          available_to: string | null
          bio: string | null
          certifications: Json | null
          city_id: number | null
          code: string | null
          company_id: string | null
          country_code: string | null
          created_at: string | null
          created_by: string | null
          current_latitude: number | null
          current_longitude: number | null
          district_id: number | null
          email: string | null
          hourly_rate: number | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          lat: number | null
          level: string
          lng: number | null
          location_updated_at: string | null
          name: string
          phone: string | null
          primary_service_id: string | null
          profile_image: string | null
          rating: number | null
          service_area_radius: number | null
          specialization: string
          standard_rate: number | null
          status: string | null
          total_reviews: number | null
          updated_at: string | null
          verification_center_id: string | null
          verification_notes: string | null
          verified_at: string | null
          visit_fee: number | null
        }
        Insert: {
          application_id?: string | null
          available_from?: string | null
          available_to?: string | null
          bio?: string | null
          certifications?: Json | null
          city_id?: number | null
          code?: string | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          district_id?: number | null
          email?: string | null
          hourly_rate?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          level?: string
          lng?: number | null
          location_updated_at?: string | null
          name: string
          phone?: string | null
          primary_service_id?: string | null
          profile_image?: string | null
          rating?: number | null
          service_area_radius?: number | null
          specialization: string
          standard_rate?: number | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_center_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          visit_fee?: number | null
        }
        Update: {
          application_id?: string | null
          available_from?: string | null
          available_to?: string | null
          bio?: string | null
          certifications?: Json | null
          city_id?: number | null
          code?: string | null
          company_id?: string | null
          country_code?: string | null
          created_at?: string | null
          created_by?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          district_id?: number | null
          email?: string | null
          hourly_rate?: number | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          level?: string
          lng?: number | null
          location_updated_at?: string | null
          name?: string
          phone?: string | null
          primary_service_id?: string | null
          profile_image?: string | null
          rating?: number | null
          service_area_radius?: number | null
          specialization?: string
          standard_rate?: number | null
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_center_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          visit_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "vw_cities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technicians_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          last_updated: string
          latitude: number
          longitude: number
          vendor_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          latitude: number
          longitude: number
          vendor_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          latitude?: number
          longitude?: number
          vendor_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          email: string | null
          experience_years: number | null
          id: string
          is_tracking_enabled: boolean | null
          last_modified_by: string | null
          location_updated_at: string | null
          map_icon: string | null
          name: string
          phone: string | null
          profile_image: string | null
          rating: number | null
          specialization: string[] | null
          status: string | null
          total_jobs: number | null
          tracking_started_at: string | null
          unit_rate: number | null
          updated_at: string
          version: number
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_tracking_enabled?: boolean | null
          last_modified_by?: string | null
          location_updated_at?: string | null
          map_icon?: string | null
          name: string
          phone?: string | null
          profile_image?: string | null
          rating?: number | null
          specialization?: string[] | null
          status?: string | null
          total_jobs?: number | null
          tracking_started_at?: string | null
          unit_rate?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_tracking_enabled?: boolean | null
          last_modified_by?: string | null
          location_updated_at?: string | null
          map_icon?: string | null
          name?: string
          phone?: string | null
          profile_image?: string | null
          rating?: number | null
          specialization?: string[] | null
          status?: string | null
          total_jobs?: number | null
          tracking_started_at?: string | null
          unit_rate?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          actual_cost: number | null
          assigned_count: number | null
          avg_completion_days: number | null
          completed_requests: number | null
          completion_rate: number | null
          high_priority_count: number | null
          in_progress_count: number | null
          last_updated: string | null
          low_priority_count: number | null
          medium_priority_count: number | null
          pending_requests: number | null
          submitted_count: number | null
          this_month_requests: number | null
          today_requests: number | null
          total_budget: number | null
          total_requests: number | null
          workflow_completed_count: number | null
        }
        Relationships: []
      }
      monthly_stats: {
        Row: {
          completed_requests: number | null
          completion_rate: number | null
          month: string | null
          pending_requests: number | null
          total_actual: number | null
          total_estimated: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      vw_cities_public: {
        Row: {
          id: number | null
          name_ar: string | null
        }
        Insert: {
          id?: number | null
          name_ar?: string | null
        }
        Update: {
          id?: number | null
          name_ar?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_sla_deadlines: {
        Args: {
          p_category_id?: string
          p_priority: string
          p_request_id: string
        }
        Returns: undefined
      }
      calculate_sla_due_date: {
        Args: {
          created_at: string
          priority_level: string
          service_type: string
        }
        Returns: string
      }
      can_access_full_appointment: {
        Args: { appointment_id: string }
        Returns: boolean
      }
      can_access_service_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      can_transition_stage: {
        Args: { current_stage: string; next_stage: string; user_role: string }
        Returns: boolean
      }
      find_nearest_vendor: {
        Args: {
          request_latitude: number
          request_longitude: number
          service_specialization?: string
        }
        Returns: {
          distance: number
          email: string
          phone: string
          vendor_id: string
          vendor_name: string
        }[]
      }
      generate_invoice_number: { Args: never; Returns: string }
      get_appointment_contact_info: {
        Args: { appointment_id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
        }[]
      }
      get_appointment_customer_info: {
        Args: { appointment_id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
        }[]
      }
      get_appointments_for_staff: {
        Args: never
        Returns: {
          appointment_date: string
          appointment_time: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          location: string
          maintenance_request_id: string
          notes: string
          property_id: string
          reminder_sent: boolean
          status: string
          title: string
          updated_at: string
          vendor_id: string
        }[]
      }
      get_cities_for_user: {
        Args: { p_user_id: string }
        Returns: {
          city_id: string
          country: string
          name: string
        }[]
      }
      get_current_user_company_id: { Args: never; Returns: string }
      get_customer_contact_info: {
        Args: { appointment_id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
        }[]
      }
      get_customer_email: { Args: { appointment_id: string }; Returns: string }
      get_customer_name: { Args: { appointment_id: string }; Returns: string }
      get_customer_phone: { Args: { appointment_id: string }; Returns: string }
      get_full_customer_info: {
        Args: { appointment_id: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
        }[]
      }
      get_table_row_counts: {
        Args: never
        Returns: {
          row_count: number
          table_name: string
        }[]
      }
      get_user_tenant: { Args: never; Returns: string }
      get_vendor_appointments: {
        Args: never
        Returns: {
          appointment_date: string
          appointment_time: string
          created_at: string
          customer_name: string
          description: string
          duration_minutes: number
          id: string
          location: string
          maintenance_request_id: string
          notes: string
          property_id: string
          reminder_sent: boolean
          status: string
          title: string
          updated_at: string
          vendor_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_email_confirmed: { Args: never; Returns: boolean }
      is_staff:
        | { Args: { uid: string }; Returns: boolean }
        | { Args: never; Returns: boolean }
      recalc_request_totals: {
        Args: { p_request_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "staff"
        | "technician"
        | "vendor"
        | "customer"
        | "warehouse"
        | "accounting"
        | "engineering"
        | "dispatcher"
      maintenance_stage:
        | "DRAFT"
        | "SUBMITTED"
        | "TRIAGED"
        | "ASSIGNED"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "INSPECTION"
        | "COMPLETED"
        | "BILLED"
        | "PAID"
        | "CLOSED"
        | "ON_HOLD"
        | "WAITING_PARTS"
        | "CANCELLED"
        | "REJECTED"
      maintenance_status:
        | "draft"
        | "submitted"
        | "acknowledged"
        | "assigned"
        | "scheduled"
        | "in_progress"
        | "inspection"
        | "waiting_parts"
        | "completed"
        | "billed"
        | "paid"
        | "closed"
        | "cancelled"
        | "on_hold"
      maintenance_status_v2:
        | "submitted"
        | "triaged"
        | "needs_info"
        | "scheduled"
        | "in_progress"
        | "paused"
        | "escalated"
        | "completed"
        | "qa_review"
        | "closed"
        | "reopened"
        | "canceled"
        | "rejected"
      mr_status:
        | "Open"
        | "Assigned"
        | "InProgress"
        | "Waiting"
        | "Completed"
        | "Rejected"
        | "Cancelled"
      priority_level: "low" | "medium" | "high"
      provider_type_t: "internal_team" | "external_vendor"
      request_status_t:
        | "draft"
        | "awaiting_vendor"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      update_type:
        | "status_change"
        | "assignment"
        | "scheduling"
        | "cost_estimate"
        | "completion"
        | "feedback"
        | "payment"
        | "note"
      wo_status:
        | "Pending"
        | "Scheduled"
        | "EnRoute"
        | "InProgress"
        | "Paused"
        | "Completed"
        | "Cancelled"
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
      app_role: [
        "admin",
        "manager",
        "staff",
        "technician",
        "vendor",
        "customer",
        "warehouse",
        "accounting",
        "engineering",
        "dispatcher",
      ],
      maintenance_stage: [
        "DRAFT",
        "SUBMITTED",
        "TRIAGED",
        "ASSIGNED",
        "SCHEDULED",
        "IN_PROGRESS",
        "INSPECTION",
        "COMPLETED",
        "BILLED",
        "PAID",
        "CLOSED",
        "ON_HOLD",
        "WAITING_PARTS",
        "CANCELLED",
        "REJECTED",
      ],
      maintenance_status: [
        "draft",
        "submitted",
        "acknowledged",
        "assigned",
        "scheduled",
        "in_progress",
        "inspection",
        "waiting_parts",
        "completed",
        "billed",
        "paid",
        "closed",
        "cancelled",
        "on_hold",
      ],
      maintenance_status_v2: [
        "submitted",
        "triaged",
        "needs_info",
        "scheduled",
        "in_progress",
        "paused",
        "escalated",
        "completed",
        "qa_review",
        "closed",
        "reopened",
        "canceled",
        "rejected",
      ],
      mr_status: [
        "Open",
        "Assigned",
        "InProgress",
        "Waiting",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      priority_level: ["low", "medium", "high"],
      provider_type_t: ["internal_team", "external_vendor"],
      request_status_t: [
        "draft",
        "awaiting_vendor",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      update_type: [
        "status_change",
        "assignment",
        "scheduling",
        "cost_estimate",
        "completion",
        "feedback",
        "payment",
        "note",
      ],
      wo_status: [
        "Pending",
        "Scheduled",
        "EnRoute",
        "InProgress",
        "Paused",
        "Completed",
        "Cancelled",
      ],
    },
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          clinic_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          offer_id: string
          patient_id: string
          request_id: string
          scheduled_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          offer_id: string
          patient_id: string
          request_id: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          offer_id?: string
          patient_id?: string
          request_id?: string
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          active: boolean
          address: string | null
          area: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          org_number: string | null
          phone: string | null
          postal_code: string | null
          rating: number | null
          rating_count: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          area?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          org_number?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          rating_count?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          area?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          org_number?: string | null
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          rating_count?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          clinic_id: string | null
          created_at: string
          id: string
          read_at: string | null
          request_id: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          body: string
          clinic_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          request_id: string
          sender_id: string
          sender_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          body?: string
          clinic_id?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          request_id?: string
          sender_id?: string
          sender_role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          clinic_id: string
          created_at: string
          earliest_date: string | null
          id: string
          line_items: Json | null
          message: string | null
          request_id: string
          status: Database["public"]["Enums"]["offer_status"]
          total_price: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string
          earliest_date?: string | null
          id?: string
          line_items?: Json | null
          message?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["offer_status"]
          total_price: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string
          earliest_date?: string | null
          id?: string
          line_items?: Json | null
          message?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["offer_status"]
          total_price?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_year: number | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_clinics: {
        Row: {
          claimed_at: string | null
          clinic_id: string
          created_at: string
          declined_at: string | null
          distance_km: number | null
          id: string
          invited_at: string
          request_id: string
          status: Database["public"]["Enums"]["request_clinic_status"]
        }
        Insert: {
          claimed_at?: string | null
          clinic_id: string
          created_at?: string
          declined_at?: string | null
          distance_km?: number | null
          id?: string
          invited_at?: string
          request_id: string
          status?: Database["public"]["Enums"]["request_clinic_status"]
        }
        Update: {
          claimed_at?: string | null
          clinic_id?: string
          created_at?: string
          declined_at?: string | null
          distance_km?: number | null
          id?: string
          invited_at?: string
          request_id?: string
          status?: Database["public"]["Enums"]["request_clinic_status"]
        }
        Relationships: [
          {
            foreignKeyName: "request_clinics_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_clinics_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          accepted_offer_id: string | null
          area: string | null
          claimed_count: number
          created_at: string
          description: string | null
          id: string
          pain_level: number | null
          patient_id: string
          postal_code: string | null
          selected_teeth: string[] | null
          status: Database["public"]["Enums"]["request_status"]
          symptom: string | null
          time_preference: string | null
          track: string | null
          treatment_free_text: string | null
          treatments: Json | null
          updated_at: string
        }
        Insert: {
          accepted_offer_id?: string | null
          area?: string | null
          claimed_count?: number
          created_at?: string
          description?: string | null
          id?: string
          pain_level?: number | null
          patient_id: string
          postal_code?: string | null
          selected_teeth?: string[] | null
          status?: Database["public"]["Enums"]["request_status"]
          symptom?: string | null
          time_preference?: string | null
          track?: string | null
          treatment_free_text?: string | null
          treatments?: Json | null
          updated_at?: string
        }
        Update: {
          accepted_offer_id?: string | null
          area?: string | null
          claimed_count?: number
          created_at?: string
          description?: string | null
          id?: string
          pain_level?: number | null
          patient_id?: string
          postal_code?: string | null
          selected_teeth?: string[] | null
          status?: Database["public"]["Enums"]["request_status"]
          symptom?: string | null
          time_preference?: string | null
          track?: string | null
          treatment_free_text?: string | null
          treatments?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          clinic_id: string
          comment: string | null
          created_at: string
          id: string
          patient_id: string
          rating: number
          request_id: string | null
        }
        Insert: {
          clinic_id: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          rating: number
          request_id?: string | null
        }
        Update: {
          clinic_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          rating?: number
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_clinic_fk"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_request_for_clinic: {
        Args: { _clinic_id: string; _request_id: string }
        Returns: Json
      }
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "clinic" | "admin"
      booking_status: "confirmed" | "rescheduled" | "cancelled" | "completed"
      offer_status: "pending" | "accepted" | "declined" | "withdrawn"
      request_clinic_status:
        | "invited"
        | "claimed"
        | "declined"
        | "closed"
        | "quoted"
      request_status: "open" | "quoted" | "accepted" | "declined" | "closed"
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
      app_role: ["patient", "clinic", "admin"],
      booking_status: ["confirmed", "rescheduled", "cancelled", "completed"],
      offer_status: ["pending", "accepted", "declined", "withdrawn"],
      request_clinic_status: [
        "invited",
        "claimed",
        "declined",
        "closed",
        "quoted",
      ],
      request_status: ["open", "quoted", "accepted", "declined", "closed"],
    },
  },
} as const

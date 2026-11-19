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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          active_society_id: string | null
          active_unit_id: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          force_password_change: boolean
          id: string
          language: string
          mobile: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          theme: string
          updated_at: string
        }
        Insert: {
          active_society_id?: string | null
          active_unit_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          force_password_change?: boolean
          id: string
          language?: string
          mobile: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Update: {
          active_society_id?: string | null
          active_unit_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          force_password_change?: boolean
          id?: string
          language?: string
          mobile?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          theme?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_society_id_fkey"
            columns: ["active_society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      societies: {
        Row: {
          address: string
          city: string
          contact_email: string
          contact_mobile: string
          contact_name: string
          created_at: string
          id: string
          language: string
          legal_name: string | null
          logo_url: string | null
          name: string
          pin: string
          registration_number: string | null
          state: string
          theme: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          contact_email: string
          contact_mobile: string
          contact_name: string
          created_at?: string
          id?: string
          language?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          pin: string
          registration_number?: string | null
          state: string
          theme?: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          contact_email?: string
          contact_mobile?: string
          contact_name?: string
          created_at?: string
          id?: string
          language?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          pin?: string
          registration_number?: string | null
          state?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      society_links: {
        Row: {
          created_at: string
          id: string
          join_link_active: boolean
          resident_join_token: string
          society_id: string
          updated_at: string
          vehicle_directory_active: boolean
          vehicle_directory_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_link_active?: boolean
          resident_join_token?: string
          society_id: string
          updated_at?: string
          vehicle_directory_active?: boolean
          vehicle_directory_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          join_link_active?: boolean
          resident_join_token?: string
          society_id?: string
          updated_at?: string
          vehicle_directory_active?: boolean
          vehicle_directory_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "society_links_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: true
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      society_settings: {
        Row: {
          auto_billing_enabled: boolean
          bank_account: string | null
          bank_ifsc: string | null
          bank_name: string | null
          billing_day: number
          created_at: string
          due_day: number
          id: string
          late_fee_type: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value: number
          notify_on_gate_entry: boolean
          notify_on_new_bill: boolean
          notify_on_payment_approved: boolean
          notify_via_app: boolean
          notify_via_email: boolean
          notify_via_whatsapp: boolean
          payment_instructions: string | null
          society_id: string
          updated_at: string
          upi_vpa: string | null
        }
        Insert: {
          auto_billing_enabled?: boolean
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          late_fee_type?: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value?: number
          notify_on_gate_entry?: boolean
          notify_on_new_bill?: boolean
          notify_on_payment_approved?: boolean
          notify_via_app?: boolean
          notify_via_email?: boolean
          notify_via_whatsapp?: boolean
          payment_instructions?: string | null
          society_id: string
          updated_at?: string
          upi_vpa?: string | null
        }
        Update: {
          auto_billing_enabled?: boolean
          bank_account?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          late_fee_type?: Database["public"]["Enums"]["late_fee_type"]
          late_fee_value?: number
          notify_on_gate_entry?: boolean
          notify_on_new_bill?: boolean
          notify_on_payment_approved?: boolean
          notify_via_app?: boolean
          notify_via_email?: boolean
          notify_via_whatsapp?: boolean
          payment_instructions?: string | null
          society_id?: string
          updated_at?: string
          upi_vpa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "society_settings_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: true
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          advance_credit: number
          block: string | null
          created_at: string
          current_dues: number
          floor: number
          id: string
          kind: Database["public"]["Enums"]["unit_kind"]
          monthly_maintenance: number
          occupancy_status: Database["public"]["Enums"]["occupancy_status"]
          opening_balance: number
          society_id: string
          type: Database["public"]["Enums"]["unit_type"]
          unit_number: string
          updated_at: string
        }
        Insert: {
          advance_credit?: number
          block?: string | null
          created_at?: string
          current_dues?: number
          floor?: number
          id?: string
          kind?: Database["public"]["Enums"]["unit_kind"]
          monthly_maintenance?: number
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          opening_balance?: number
          society_id: string
          type?: Database["public"]["Enums"]["unit_type"]
          unit_number: string
          updated_at?: string
        }
        Update: {
          advance_credit?: number
          block?: string | null
          created_at?: string
          current_dues?: number
          floor?: number
          id?: string
          kind?: Database["public"]["Enums"]["unit_kind"]
          monthly_maintenance?: number
          occupancy_status?: Database["public"]["Enums"]["occupancy_status"]
          opening_balance?: number
          society_id?: string
          type?: Database["public"]["Enums"]["unit_type"]
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_society_id_fkey"
            columns: ["society_id"]
            isOneToOne: false
            referencedRelation: "societies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      bank_match_status: "SUGGESTED" | "CONFIRMED" | "REJECTED"
      bill_status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
      billing_cycle: "MONTHLY" | "QUARTERLY" | "YEARLY"
      booking_status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
      complaint_scope: "IN_HOME" | "COMMON_AREA"
      complaint_status:
        | "OPEN"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "RESOLVED"
        | "CLOSED"
      emergency_status: "ACTIVE" | "RESPONDED" | "RESOLVED"
      expense_status: "PENDING" | "APPROVED"
      family_relation:
        | "Spouse"
        | "Son"
        | "Daughter"
        | "Father"
        | "Mother"
        | "Brother"
        | "Sister"
        | "Other"
      fund_status: "ACTIVE" | "CLOSED"
      late_fee_type: "FIXED" | "PERCENTAGE"
      lost_found_status: "OPEN" | "RESOLVED"
      lost_found_type: "LOST" | "FOUND"
      message_channel: "WHATSAPP" | "EMAIL" | "PUSH"
      message_status: "SENT" | "DELIVERED" | "FAILED"
      meter_type: "WATER" | "ELECTRICITY"
      move_type: "MOVE_IN" | "MOVE_OUT"
      noc_status: "REQUESTED" | "ISSUED" | "DENIED"
      occupancy_status: "OWNER_OCCUPIED" | "TENANT_OCCUPIED" | "VACANT"
      parcel_courier:
        | "AMAZON"
        | "FLIPKART"
        | "SWIGGY"
        | "BLINKIT"
        | "BLUEDART"
        | "INDIAPOST"
        | "OTHER"
      parcel_status: "WAITING" | "COLLECTED"
      pass_status: "ACTIVE" | "USED" | "EXPIRED"
      payment_mode: "UPI" | "BANK" | "CASH" | "CHEQUE"
      payment_status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
      poll_status: "ACTIVE" | "CLOSED"
      poll_voting_type: "ONE_PER_UNIT"
      post_section: "BUY_SELL" | "RENT_SALE" | "CARPOOL"
      post_status: "ACTIVE" | "SOLD" | "EXPIRED"
      resident_role: "OWNER" | "TENANT"
      resident_status: "PENDING" | "APPROVED" | "REJECTED"
      rsvp_status: "GOING" | "NOT_GOING" | "MAYBE"
      subscription_plan: "STARTER" | "GROWTH" | "STANDARD" | "ENTERPRISE"
      txn_mode: "BANK" | "CASH"
      unit_kind: "FLAT" | "SHOP" | "OFFICE" | "PENTHOUSE" | "DUPLEX" | "OTHER"
      unit_type:
        | "1BHK"
        | "2BHK"
        | "3BHK"
        | "4BHK"
        | "STUDIO"
        | "SHOP"
        | "OFFICE"
        | "OTHER"
      user_role:
        | "ADMIN"
        | "CHAIRMAN"
        | "SECRETARY"
        | "TREASURER"
        | "RESIDENT_OWNER"
        | "RESIDENT_TENANT"
        | "GUARD"
        | "SUPERVISOR"
      visit_purpose:
        | "DELIVERY"
        | "VISITOR"
        | "HOUSE_HELP"
        | "ELECTRICIAN"
        | "PLUMBER"
        | "CARPENTER"
        | "PEST_CONTROL"
        | "GAS"
        | "OTHER"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      bank_match_status: ["SUGGESTED", "CONFIRMED", "REJECTED"],
      bill_status: ["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"],
      billing_cycle: ["MONTHLY", "QUARTERLY", "YEARLY"],
      booking_status: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      complaint_scope: ["IN_HOME", "COMMON_AREA"],
      complaint_status: [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "RESOLVED",
        "CLOSED",
      ],
      emergency_status: ["ACTIVE", "RESPONDED", "RESOLVED"],
      expense_status: ["PENDING", "APPROVED"],
      family_relation: [
        "Spouse",
        "Son",
        "Daughter",
        "Father",
        "Mother",
        "Brother",
        "Sister",
        "Other",
      ],
      fund_status: ["ACTIVE", "CLOSED"],
      late_fee_type: ["FIXED", "PERCENTAGE"],
      lost_found_status: ["OPEN", "RESOLVED"],
      lost_found_type: ["LOST", "FOUND"],
      message_channel: ["WHATSAPP", "EMAIL", "PUSH"],
      message_status: ["SENT", "DELIVERED", "FAILED"],
      meter_type: ["WATER", "ELECTRICITY"],
      move_type: ["MOVE_IN", "MOVE_OUT"],
      noc_status: ["REQUESTED", "ISSUED", "DENIED"],
      occupancy_status: ["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT"],
      parcel_courier: [
        "AMAZON",
        "FLIPKART",
        "SWIGGY",
        "BLINKIT",
        "BLUEDART",
        "INDIAPOST",
        "OTHER",
      ],
      parcel_status: ["WAITING", "COLLECTED"],
      pass_status: ["ACTIVE", "USED", "EXPIRED"],
      payment_mode: ["UPI", "BANK", "CASH", "CHEQUE"],
      payment_status: ["PENDING_APPROVAL", "APPROVED", "REJECTED"],
      poll_status: ["ACTIVE", "CLOSED"],
      poll_voting_type: ["ONE_PER_UNIT"],
      post_section: ["BUY_SELL", "RENT_SALE", "CARPOOL"],
      post_status: ["ACTIVE", "SOLD", "EXPIRED"],
      resident_role: ["OWNER", "TENANT"],
      resident_status: ["PENDING", "APPROVED", "REJECTED"],
      rsvp_status: ["GOING", "NOT_GOING", "MAYBE"],
      subscription_plan: ["STARTER", "GROWTH", "STANDARD", "ENTERPRISE"],
      txn_mode: ["BANK", "CASH"],
      unit_kind: ["FLAT", "SHOP", "OFFICE", "PENTHOUSE", "DUPLEX", "OTHER"],
      unit_type: [
        "1BHK",
        "2BHK",
        "3BHK",
        "4BHK",
        "STUDIO",
        "SHOP",
        "OFFICE",
        "OTHER",
      ],
      user_role: [
        "ADMIN",
        "CHAIRMAN",
        "SECRETARY",
        "TREASURER",
        "RESIDENT_OWNER",
        "RESIDENT_TENANT",
        "GUARD",
        "SUPERVISOR",
      ],
      visit_purpose: [
        "DELIVERY",
        "VISITOR",
        "HOUSE_HELP",
        "ELECTRICIAN",
        "PLUMBER",
        "CARPENTER",
        "PEST_CONTROL",
        "GAS",
        "OTHER",
      ],
    },
  },
} as const

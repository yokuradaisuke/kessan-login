import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (for server actions and API routes)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found, using anon key")
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// 型定義
export interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string
  password_hash?: string
  role: "admin" | "general" | "system_admin"
  is_active: boolean
  contract_id?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Corporation {
  id: string
  corporate_number: string
  name: string
  furigana?: string
  type: string
  prefecture?: string
  city?: string
  address?: string
  overseas_location?: string
  closure_date?: string
  closure_reason?: string
  successor_number?: string
  english_name?: string
  english_prefecture?: string
  english_city?: string
  english_overseas_location?: string
  created_at: string
  updated_at: string
}

export interface CorporateUser {
  id: string
  corporate_id: string
  user_id: string
  role: "admin" | "general"
  status: "active" | "invited" | "pending"
  invited_by?: string
  invited_at?: string
  joined_at?: string
  created_at: string
}

export interface Notification {
  id: string
  title: string
  content?: string
  type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  corporate_id: string
  email: string
  invited_by: string
  status: "pending" | "accepted" | "declined" | "expired"
  expires_at: string
  created_at: string
}

export interface SettlementRobot {
  id: string
  corporate_id: string
  name: string
  business_year_start: string
  business_year_end: string
  phase: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  activity_data?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface Contract {
  id: string
  corporate_id: string
  contract_type: string
  start_date: string
  end_date?: string
  status: string
  admin_user_id?: string
  created_by: string
  created_at: string
  updated_at: string
}

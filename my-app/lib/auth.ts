import { supabase } from "./supabase"
import { ApiService } from "../services/api"
import type { Profile } from "./supabase"

export class AuthService {
  private static instance: AuthService
  private currentUser: Profile | null = null

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(userId: string, password: string): Promise<AuthUser> {
    try {
      console.log("Attempting login with userId:", userId)

      // Query the profiles table directly using the client-side supabase client
      const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Database query error:", error)
        throw new Error("ユーザーが見つかりません")
      }

      if (!user) {
        throw new Error("ユーザーが見つかりません")
      }

      console.log("Found user:", user)

      // Simple password verification (in production, use proper hashing)
      if (user.password_hash !== password) {
        throw new Error("パスワードが正しくありません")
      }

      // Update last login
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating last login:", updateError)
      }

      // Convert to AuthUser format
      const authUser: AuthUser = {
        id: user.id,
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        contractId: user.contract_id,
        requiresInitialSetup:
          user.user_id.startsWith("temp_") || !user.password_hash || user.password_hash.startsWith("temp_"),
      }

      this.currentUser = user
      return authUser
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // In a real app, this would check session/token
    return null
  }

  async saveUserSession(user: AuthUser): Promise<void> {
    // In a real app, this would save to localStorage or session
    console.log("Saving user session:", user)
  }

  setCurrentUser(user: AuthUser): void {
    // Update current user
    console.log("Setting current user:", user)
  }

  static async login(userId: string, password: string): Promise<AuthUser> {
    return AuthService.getInstance().login(userId, password)
  }

  static async logout(): Promise<void> {
    return AuthService.getInstance().logout()
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    return AuthService.getInstance().getCurrentUser()
  }

  static async saveUserSession(user: AuthUser): Promise<void> {
    return AuthService.getInstance().saveUserSession(user)
  }

  static setCurrentUser(user: AuthUser): void {
    return AuthService.getInstance().setCurrentUser(user)
  }

  static async register(formData: any): Promise<AuthUser> {
    try {
      const profile = await ApiService.createProfile({
        user_id: formData.userId,
        email: formData.email,
        full_name: formData.fullName,
        password_hash: formData.password,
        role: "general",
        is_active: true,
      })

      return {
        id: profile.id,
        userId: profile.user_id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        requiresInitialSetup: false,
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }
}

export interface AuthUser {
  id: string
  userId: string
  email: string
  fullName: string
  role: "admin" | "general" | "system_admin"
  contractId?: string
  requiresInitialSetup?: boolean
}

export const authService = AuthService.getInstance()

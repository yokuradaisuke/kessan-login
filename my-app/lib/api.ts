import { createServerClient } from "./supabase"
import type { Corporation, Profile, Notification } from "./supabase"

// Replace the existing functions with Supabase queries:

export async function getCorporationsByContract(contractId?: string): Promise<Corporation[]> {
  try {
    const serverClient = createServerClient()

    let query = serverClient
      .from("corporations")
      .select(`
        *,
        contracts!inner(*)
      `)
      .eq("contracts.status", "active")

    if (contractId) {
      query = query.eq("contracts.id", contractId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching corporations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getCorporationsByContract:", error)
    return []
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const serverClient = createServerClient()

    const { data, error } = await serverClient
      .from("notifications")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching notifications:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getNotifications:", error)
    return []
  }
}

export async function createCorporation(corporationData: Partial<Corporation>): Promise<Corporation> {
  try {
    const serverClient = createServerClient()

    const { data, error } = await serverClient.from("corporations").insert([corporationData]).select().single()

    if (error) {
      throw new Error(`法人の作成に失敗しました: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error creating corporation:", error)
    throw error
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const serverClient = createServerClient()

    const { data, error } = await serverClient.from("profiles").select("*").eq("user_id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

// Keep other existing functions but update them to use Supabase similarly...

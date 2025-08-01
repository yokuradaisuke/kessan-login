import {
  supabase,
  type Corporation,
  type CorporateUser,
  type Notification,
  type Invitation,
  type SettlementRobot,
  type Profile,
  type Contract,
} from "@/lib/supabase"

export class ApiService {
  // デバッグログ関数
  private static addDebugLog(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[ApiService ${timestamp}] ${message}`)
  }

  // エラーハンドリング関数
  private static handleError(error: any, context: string) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const fullMessage = `${context}: ${errorMessage}`
    console.error(fullMessage, error)

    // Supabaseの詳細エラー情報をログ出力
    if (error?.details) {
      console.error("Error details:", error.details)
    }
    if (error?.hint) {
      console.error("Error hint:", error.hint)
    }
    if (error?.code) {
      console.error("Error code:", error.code)
    }

    throw new Error(fullMessage)
  }

  // 通知関連
  static async getNotifications(limit?: number): Promise<Notification[]> {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) this.handleError(error, "通知一覧の取得に失敗しました")
    return data || []
  }

  // 法人関連
  static async getCorporations(): Promise<Corporation[]> {
    this.addDebugLog("Fetching corporations...")

    // Supabaseクライアントの状態確認
    if (!supabase) {
      throw new Error("Supabaseクライアントが初期化されていません")
    }

    const { data, error } = await supabase.from("corporations").select("*").order("created_at", { ascending: false })

    if (error) {
      this.addDebugLog(`Error fetching corporations: ${JSON.stringify(error)}`)
      this.handleError(error, "法人一覧の取得に失敗しました")
    }

    this.addDebugLog(`Successfully fetched ${data?.length || 0} corporations`)
    return data || []
  }

  static async getCorporationById(id: string): Promise<Corporation | null> {
    const { data, error } = await supabase.from("corporations").select("*").eq("id", id).single()

    if (error) this.handleError(error, "法人情報の取得に失敗しました")
    return data
  }

  static async createCorporation(corporation: Partial<Corporation>): Promise<Corporation> {
    const { data, error } = await supabase.from("corporations").insert([corporation]).select().single()

    if (error) this.handleError(error, "法人の作成に失敗しました")
    return data
  }

  static async updateCorporation(id: string, updates: Partial<Corporation>): Promise<Corporation> {
    const { data, error } = await supabase.from("corporations").update(updates).eq("id", id).select().single()

    if (error) this.handleError(error, "法人の更新に失敗しました")
    return data
  }

  // 契約に紐づく法人を取得
  static async getCorporationsByContract(contractId: string): Promise<Corporation[]> {
    const { data, error } = await supabase
      .from("corporations")
      .select(`
        *,
        corporate_users!inner (
          contract_id
        )
      `)
      .eq("corporate_users.contract_id", contractId)
      .order("created_at", { ascending: false })

    if (error) this.handleError(error, "契約法人一覧の取得に失敗しました")
    return data || []
  }

  // ユーザーの担当法人を取得
  static async getUserCorporations(
    userId: string,
  ): Promise<Array<Corporation & { userRole: string; userStatus: string }>> {
    const { data, error } = await supabase
      .from("corporate_users")
      .select(`
        role,
        status,
        corporations (*)
      `)
      .eq("user_id", userId)
      .eq("status", "active")

    if (error) this.handleError(error, "ユーザー法人一覧の取得に失敗しました")

    return (data || []).map((item) => ({
      ...item.corporations,
      userRole: item.role,
      userStatus: item.status,
    }))
  }

  // 法人担当者関連
  static async getCorporateUsers(corporateId: string): Promise<Array<CorporateUser & { profile: Profile }>> {
    const { data, error } = await supabase
      .from("corporate_users")
      .select(`
        *,
        profiles (*)
      `)
      .eq("corporate_id", corporateId)

    if (error) this.handleError(error, "法人担当者一覧の取得に失敗しました")
    return (data || []).map((item) => ({
      ...item,
      profile: item.profiles,
    }))
  }

  // 法人ユーザー追加（契約IDオプション対応）
  static async addCorporateUser(
    corporateId: string,
    userId: string,
    role = "general",
    contractId?: string,
  ): Promise<CorporateUser> {
    const insertData: any = {
      corporate_id: corporateId,
      user_id: userId,
      role,
      status: "active",
      joined_at: new Date().toISOString(),
    }

    if (contractId) {
      insertData.contract_id = contractId
    }

    const { data, error } = await supabase.from("corporate_users").insert([insertData]).select().single()

    if (error) this.handleError(error, "法人ユーザーの追加に失敗しました")
    return data
  }

  static async removeCorporateUser(corporateId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("corporate_users")
      .delete()
      .eq("corporate_id", corporateId)
      .eq("user_id", userId)

    if (error) this.handleError(error, "法人ユーザーの削除に失敗しました")
  }

  static async updateCorporateUserRole(corporateId: string, userId: string, role: string): Promise<CorporateUser> {
    const { data, error } = await supabase
      .from("corporate_users")
      .update({ role })
      .eq("corporate_id", corporateId)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) this.handleError(error, "法人ユーザーの役割更新に失敗しました")
    return data
  }

  // 招待関連
  static async createInvitation(corporateId: string, email: string, invitedBy: string): Promise<Invitation> {
    const { data, error } = await supabase
      .from("invitations")
      .insert([
        {
          corporate_id: corporateId,
          email,
          invited_by: invitedBy,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (error) this.handleError(error, "招待の作成に失敗しました")
    return data
  }

  static async getUserInvitations(email: string): Promise<Array<Invitation & { corporation: Corporation }>> {
    const { data, error } = await supabase
      .from("invitations")
      .select(`
        *,
        corporations (*)
      `)
      .eq("email", email)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())

    if (error) this.handleError(error, "ユーザー招待一覧の取得に失敗しました")
    return (data || []).map((item) => ({
      ...item,
      corporation: item.corporations,
    }))
  }

  static async respondToInvitation(invitationId: string, response: "accepted" | "declined"): Promise<void> {
    const { error } = await supabase.from("invitations").update({ status: response }).eq("id", invitationId)

    if (error) this.handleError(error, "招待への回答に失敗しました")
  }

  // 決算ロボット関連
  static async getSettlementRobots(corporateId: string): Promise<SettlementRobot[]> {
    const { data, error } = await supabase
      .from("settlement_robots")
      .select("*")
      .eq("corporate_id", corporateId)
      .order("created_at", { ascending: false })

    if (error) this.handleError(error, "決算ロボット一覧の取得に失敗しました")
    return data || []
  }

  static async createSettlementRobot(robot: Partial<SettlementRobot>): Promise<SettlementRobot> {
    const { data, error } = await supabase.from("settlement_robots").insert([robot]).select().single()

    if (error) this.handleError(error, "決算ロボットの作成に失敗しました")
    return data
  }

  // プロファイル関連
  static async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") this.handleError(error, "プロファイルの取得に失敗しました")
    return data
  }

  static async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase.from("profiles").insert([profile]).select().single()

    if (error) this.handleError(error, "プロファイルの作成に失敗しました")
    return data
  }

  // メールアドレスの重複チェック
  static async checkEmailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase.from("profiles").select("id").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      this.handleError(error, "メールアドレスの重複チェックに失敗しました")
    }

    return !!data
  }

  // Debug methods
  static async debugInvitations(email: string): Promise<void> {
    this.addDebugLog(`Checking invitations for email: ${email}`)
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select(`
          *,
          corporations (*)
        `)
        .eq("email", email)

      this.addDebugLog(`Invitations found: ${JSON.stringify(data)}`)
      if (error) console.error("Debug: Error fetching invitations:", error)
    } catch (error) {
      console.error("Debug: Exception in debugInvitations:", error)
    }
  }

  // Accept invitation
  static async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const { error } = await supabase.from("invitations").update({ status: "accepted" }).eq("id", invitationId)

    if (error) this.handleError(error, "招待の承認に失敗しました")

    // Add user to corporate_users table
    const { data: invitation } = await supabase
      .from("invitations")
      .select("corporate_id")
      .eq("id", invitationId)
      .single()

    if (invitation) {
      await supabase.from("corporate_users").insert({
        corporate_id: invitation.corporate_id,
        user_id: userId,
        role: "general",
        status: "active",
        joined_at: new Date().toISOString(),
      })
    }
  }

  // System stats
  static async getSystemStats(): Promise<any> {
    // Get real stats from database
    const [usersResult, corporatesResult, notificationsResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("corporations").select("id", { count: "exact" }),
      supabase.from("notifications").select("id", { count: "exact" }),
    ])

    return {
      totalUsers: usersResult.count || 0,
      totalCorporates: corporatesResult.count || 0,
      activeUsers: usersResult.count || 0, // Simplified for now
      totalNotifications: notificationsResult.count || 0,
      todayLogins: 2, // Mock data
      monthlyGrowth: 15, // Mock data
    }
  }

  // All notifications
  static async getAllNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false })

    if (error) this.handleError(error, "全通知一覧の取得に失敗しました")
    return data || []
  }

  // Create notification
  static async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase.from("notifications").insert([notification]).select().single()

    if (error) this.handleError(error, "通知の作成に失敗しました")
    return data
  }

  // Update notification
  static async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase.from("notifications").update(updates).eq("id", id).select().single()

    if (error) this.handleError(error, "通知の更新に失敗しました")
    return data
  }

  // Delete notification
  static async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) this.handleError(error, "通知の削除に失敗しました")
  }

  // Get all users (system admin)
  static async getAllUsers(): Promise<Profile[]> {
    this.addDebugLog("Fetching all users...")
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) this.handleError(error, "全ユーザー一覧の取得に失敗しました")
    this.addDebugLog(`Successfully fetched ${data?.length || 0} users`)
    return data || []
  }

  // Update user role
  static async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) this.handleError(error, "ユーザー役割の更新に失敗しました")
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", userId)

    if (error) this.handleError(error, "ユーザーの削除に失敗しました")
  }

  // Get engagement data
  static async getEngagementData(): Promise<any> {
    const { data: activities, error } = await supabase
      .from("user_activities")
      .select(`
        *,
        profiles (*)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.warn("Could not fetch user activities:", error)
      return {
        userActivities: [],
        totalActivities: 0,
        dailyLogins: {},
      }
    }

    return {
      userActivities: activities || [],
      totalActivities: activities?.length || 0,
      dailyLogins: {}, // Mock data
    }
  }

  // Get contracts
  static async getContracts(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from("contracts")
      .select(`
        *,
        corporations (*),
        admin_profile:profiles!contracts_admin_user_id_fkey (*)
      `)
      .order("created_at", { ascending: false })

    if (error) this.handleError(error, "契約一覧の取得に失敗しました")
    return data || []
  }

  // Create contract with admin
  static async createContractWithAdmin(contractData: any): Promise<any> {
    // This would be a complex operation involving multiple tables
    // For now, return mock credentials
    return {
      tempUserId: `temp_${Date.now()}`,
      tempPassword: `temp_${Math.random().toString(36).substring(7)}`,
    }
  }

  // Get user contract
  static async getUserContract(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        contract_id,
        contracts (*)
      `)
      .eq("id", userId)
      .single()

    if (error && error.code !== "PGRST116") this.handleError(error, "ユーザー契約の取得に失敗しました")
    return data?.contracts
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: any): Promise<Profile> {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) this.handleError(error, "ユーザープロファイルの更新に失敗しました")
    return data
  }

  // Change password
  static async changePassword(userId: string, passwordData: any): Promise<void> {
    // In a real app, verify current password first
    const { error } = await supabase
      .from("profiles")
      .update({ password_hash: passwordData.newPassword })
      .eq("id", userId)

    if (error) this.handleError(error, "パスワードの変更に失敗しました")
  }

  // Delete user account
  static async deleteUserAccount(userId: string): Promise<void> {
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) this.handleError(error, "ユーザーアカウントの削除に失敗しました")
  }

  // Complete initial setup
  static async completeInitialSetup(userId: string, setupData: any): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        user_id: setupData.newUserId,
        password_hash: setupData.newPassword,
        full_name: setupData.fullName,
        email: setupData.email,
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) this.handleError(error, "初期設定の完了に失敗しました")
    return data
  }

  // Get users by contract
  static async getUsersByContract(contractId: string): Promise<Profile[]> {
    this.addDebugLog(`Fetching users for contract: ${contractId}`)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("contract_id", contractId)
      .order("created_at", { ascending: false })

    if (error) this.handleError(error, "契約ユーザー一覧の取得に失敗しました")
    this.addDebugLog(`Successfully fetched ${data?.length || 0} contract users`)
    return data || []
  }

  // Create user by admin - 改良版
  static async createUserByAdmin(adminId: string, userData: any): Promise<any> {
    this.addDebugLog(`Creating user by admin: ${adminId}`)

    // まずメールアドレスの重複をチェック
    const emailExists = await this.checkEmailExists(userData.email)
    if (emailExists) {
      throw new Error(
        `メールアドレス「${userData.email}」は既に使用されています。別のメールアドレスを入力してください。`,
      )
    }

    const tempUserId = `temp_${Date.now()}`
    const tempPassword = `temp_${Math.random().toString(36).substring(7)}`

    // 管理者の契約IDを取得
    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("contract_id")
      .eq("id", adminId)
      .single()

    if (adminError) {
      console.warn("Could not fetch admin contract ID:", adminError)
    }

    this.addDebugLog(
      `Creating user with data: ${JSON.stringify({
        tempUserId,
        email: userData.email,
        fullName: userData.fullName,
        contractId: adminProfile?.contract_id,
      })}`,
    )

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: tempUserId,
        email: userData.email,
        full_name: userData.fullName,
        password_hash: tempPassword,
        role: "general",
        is_active: true,
        contract_id: adminProfile?.contract_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      this.addDebugLog(`Database error during user creation: ${JSON.stringify(error)}`)
      // より詳細なエラーメッセージを提供
      if (error.code === "23505" && error.message.includes("profiles_email_key")) {
        throw new Error(
          `メールアドレス「${userData.email}」は既に使用されています。別のメールアドレスを入力してください。`,
        )
      }
      this.handleError(error, "ユーザーの作成に失敗しました")
    }

    this.addDebugLog("User created successfully")

    return {
      tempUserId,
      tempPassword,
      userId: data.id,
      createdUser: data, // 作成されたユーザー情報も返す
    }
  }

  // System admin methods
  static async getSystemAllUsers(): Promise<Profile[]> {
    return this.getAllUsers()
  }

  static async getSystemAllCorporations(): Promise<Corporation[]> {
    return this.getCorporations()
  }

  // 法人権限関連
  static async getCorporatePermissions(userId: string): Promise<any[]> {
    try {
      this.addDebugLog(`Fetching corporate permissions for user: ${userId}`)

      const { data, error } = await supabase
        .from("corporate_permissions")
        .select(`
        *,
        corporations (
          id,
          name,
          corporate_number
        )
      `)
        .eq("user_id", userId)

      if (error) {
        this.addDebugLog(`Error fetching corporate permissions: ${JSON.stringify(error)}`)
        console.warn("Could not fetch corporate permissions:", error)
        return []
      }

      const result = (data || []).map((item) => ({
        id: item.id,
        corporateId: item.corporate_id,
        corporateName: item.corporations?.name || "Unknown",
        view: item.view_permission,
        create: item.create_permission,
        approve: item.approve_permission,
      }))

      this.addDebugLog(`Successfully fetched ${result.length} corporate permissions`)
      return result
    } catch (error) {
      this.addDebugLog(`Exception in getCorporatePermissions: ${error}`)
      console.error("Error in getCorporatePermissions:", error)
      return []
    }
  }

  // Save corporate permissions
  static async saveCorporatePermissions(userId: string, permissions: any[]): Promise<void> {
    try {
      this.addDebugLog(`Saving corporate permissions for user: ${userId}`)
      this.addDebugLog(`Permissions to save: ${JSON.stringify(permissions)}`)

      // Delete existing permissions
      const { error: deleteError } = await supabase.from("corporate_permissions").delete().eq("user_id", userId)
      if (deleteError) {
        this.addDebugLog(`Error deleting existing permissions: ${JSON.stringify(deleteError)}`)
        throw deleteError
      }

      // Insert new permissions
      const insertData = permissions.map((perm) => ({
        user_id: userId,
        corporate_id: perm.corporateId,
        view_permission: perm.view,
        create_permission: perm.create,
        approve_permission: perm.approve,
      }))

      if (insertData.length > 0) {
        const { error: insertError } = await supabase.from("corporate_permissions").insert(insertData)
        if (insertError) {
          this.addDebugLog(`Error inserting new permissions: ${JSON.stringify(insertError)}`)
          throw insertError
        }
      }

      this.addDebugLog("Corporate permissions saved successfully")
    } catch (error) {
      this.addDebugLog(`Exception in saveCorporatePermissions: ${error}`)
      this.handleError(error, "法人権限の保存に失敗しました")
    }
  }

  // 新しいメソッド: ユーザーの既存法人割り当て状況を取得
  static async getUserCorporateAssignments(userId: string): Promise<string[]> {
    try {
      this.addDebugLog(`Fetching corporate assignments for user: ${userId}`)

      const { data, error } = await supabase
        .from("corporate_users")
        .select("corporate_id")
        .eq("user_id", userId)
        .eq("status", "active")

      if (error) {
        this.addDebugLog(`Error fetching user corporate assignments: ${JSON.stringify(error)}`)
        console.warn("Could not fetch user corporate assignments:", error)
        return []
      }

      const result = (data || []).map((item) => item.corporate_id)
      this.addDebugLog(`Successfully fetched ${result.length} corporate assignments`)
      return result
    } catch (error) {
      this.addDebugLog(`Exception in getUserCorporateAssignments: ${error}`)
      console.error("Error in getUserCorporateAssignments:", error)
      return []
    }
  }

  static async bulkAssignCorporatesToUsers(userIds: string[], corporateIds: string[]): Promise<void> {
    try {
      this.addDebugLog(`Bulk assigning corporates to users: ${userIds.length} users, ${corporateIds.length} corporates`)

      // corporate_usersテーブルに追加
      const insertData = []
      for (const userId of userIds) {
        for (const corporateId of corporateIds) {
          insertData.push({
            corporate_id: corporateId,
            user_id: userId,
            role: "general",
            status: "active",
            joined_at: new Date().toISOString(),
          })
        }
      }

      if (insertData.length > 0) {
        const { error: corporateUsersError } = await supabase.from("corporate_users").upsert(insertData, {
          onConflict: "corporate_id,user_id",
          ignoreDuplicates: true,
        })

        if (corporateUsersError) {
          this.addDebugLog(`Error inserting corporate users: ${JSON.stringify(corporateUsersError)}`)
          throw corporateUsersError
        }
      }

      // corporate_permissionsテーブルにデフォルト権限を追加
      const permissionData = []
      for (const userId of userIds) {
        for (const corporateId of corporateIds) {
          permissionData.push({
            user_id: userId,
            corporate_id: corporateId,
            view_permission: true,
            create_permission: false,
            approve_permission: false,
          })
        }
      }

      if (permissionData.length > 0) {
        const { error: permissionsError } = await supabase.from("corporate_permissions").upsert(permissionData, {
          onConflict: "user_id,corporate_id",
          ignoreDuplicates: true,
        })

        if (permissionsError) {
          this.addDebugLog(`Error inserting corporate permissions: ${JSON.stringify(permissionsError)}`)
          throw permissionsError
        }
      }

      this.addDebugLog("Bulk assignment completed successfully")
    } catch (error) {
      this.addDebugLog(`Exception in bulkAssignCorporatesToUsers: ${error}`)
      this.handleError(error, "法人の一括割り当てに失敗しました")
    }
  }

  // Get corporate permissions for all users
  static async getCorporatePermissionsForAllUsers(corporateId: string): Promise<any[]> {
    // Get all users in the system and their permissions for this corporate
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("is_active", true)

    if (usersError) this.handleError(usersError, "ユーザー一覧の取得に失敗しました")

    const { data: permissions, error: permissionsError } = await supabase
      .from("corporate_permissions")
      .select("*")
      .eq("corporate_id", corporateId)

    if (permissionsError) {
      console.warn("Could not fetch permissions:", permissionsError)
    }

    const permissionsMap = new Map()
    if (permissions) {
      permissions.forEach((perm) => {
        permissionsMap.set(perm.user_id, perm)
      })
    }

    return (users || []).map((user) => {
      const userPermission = permissionsMap.get(user.id)
      return {
        userId: user.id,
        userName: user.full_name,
        email: user.email,
        view: userPermission?.view_permission || false,
        create: userPermission?.create_permission || false,
        approve: userPermission?.approve_permission || false,
      }
    })
  }

  // Update corporate permissions for all users
  static async updateCorporatePermissionsForAllUsers(corporateId: string, permissions: any[]): Promise<void> {
    // Delete existing permissions for this corporate
    await supabase.from("corporate_permissions").delete().eq("corporate_id", corporateId)

    // Insert new permissions (only for users with at least one permission)
    const insertData = permissions
      .filter((perm) => perm.view || perm.create || perm.approve)
      .map((perm) => ({
        corporate_id: corporateId,
        user_id: perm.userId,
        view_permission: perm.view,
        create_permission: perm.create,
        approve_permission: perm.approve,
      }))

    if (insertData.length > 0) {
      const { error } = await supabase.from("corporate_permissions").insert(insertData)
      if (error) this.handleError(error, "法人権限の一括更新に失敗しました")
    }
  }

  // Add users as corporate members
  static async addUsersAsCorporateMembers(corporateId: string, userIds: string[], contractId?: string): Promise<void> {
    const insertData = userIds.map((userId) => ({
      corporate_id: corporateId,
      user_id: userId,
      role: "general",
      status: "active",
      contract_id: contractId,
      joined_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("corporate_users").upsert(insertData, {
      onConflict: "corporate_id,user_id",
      ignoreDuplicates: true,
    })

    if (error) this.handleError(error, "法人メンバーの追加に失敗しました")
  }
}

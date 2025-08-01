"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import CorporateAssignmentModal from "./corporate-assignment-modal"
import { ApiService } from "./services/api"
import type { Profile } from "./lib/supabase"
import type { AuthUser } from "./lib/auth"
import { Copy, AlertCircle } from "lucide-react"

interface UserManagementProps {
  currentUser: AuthUser
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false)
  const [assignmentTarget, setAssignmentTarget] = useState<"single" | "bulk">("single")
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState([])
  const [newUserData, setNewUserData] = useState({
    email: "",
    fullName: "",
  })
  const [showTempCredentials, setShowTempCredentials] = useState(false)
  const [tempCredentials, setTempCredentials] = useState({ tempUserId: "", tempPassword: "" })
  const [existingAssignments, setExistingAssignments] = useState<string[]>([])
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // デバッグログ追加関数
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugInfo((prev) => [...prev.slice(-9), logMessage]) // 最新10件を保持
  }

  // エラーハンドリング関数
  const handleError = (error: any, context: string) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const fullMessage = `${context}: ${errorMessage}`
    console.error(fullMessage, error)
    setLastError(fullMessage)
    addDebugLog(`ERROR - ${fullMessage}`)
    alert(fullMessage)
  }

  useEffect(() => {
    addDebugLog("UserManagement component mounted")
    addDebugLog(
      `Current user: ${JSON.stringify({ id: currentUser?.id, role: currentUser?.role, contractId: currentUser?.contractId })}`,
    )

    // 環境変数の確認
    addDebugLog(
      `Environment check - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET"}`,
    )
    addDebugLog(
      `Environment check - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET"}`,
    )

    if (currentUser?.contractId) {
      addDebugLog(`Loading users for contract: ${currentUser.contractId}`)
      loadUsers(currentUser.contractId)
    } else if (currentUser?.role === "system_admin") {
      addDebugLog("Loading all users for system admin")
      loadAllUsers()
    } else {
      addDebugLog("No contract ID found and not system admin")
      setIsLoading(false)
    }
  }, [currentUser])

  const loadAllUsers = async () => {
    setIsLoading(true)
    try {
      addDebugLog("Fetching all users...")
      const userData = await ApiService.getSystemAllUsers()
      addDebugLog(`All users loaded: ${userData.length} users`)
      setUsers(userData)
      setLastError(null)
    } catch (error) {
      handleError(error, "全ユーザー一覧の取得に失敗しました")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async (contractId: string) => {
    setIsLoading(true)
    try {
      addDebugLog(`Fetching users for contract: ${contractId}`)
      const userData = await ApiService.getUsersByContract(contractId)
      addDebugLog(`Contract users loaded: ${userData.length} users`)
      setUsers(userData)
      setLastError(null)
    } catch (error) {
      handleError(error, "ユーザー一覧の取得に失敗しました")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.fullName) {
      alert("メールアドレスと氏名を入力してください")
      return
    }
    if (!currentUser) {
      alert("ログイン情報が見つかりません")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUserData.email)) {
      alert("正しいメールアドレスの形式で入力してください")
      return
    }

    try {
      addDebugLog(`Creating user with admin: ${currentUser.id}`)
      const credentials = await ApiService.createUserByAdmin(currentUser.id, {
        email: newUserData.email,
        fullName: newUserData.fullName,
      })

      setTempCredentials(credentials)
      setShowTempCredentials(true)
      setNewUserData({ email: "", fullName: "" })

      if (currentUser.contractId) {
        addDebugLog(`Reloading users for contract: ${currentUser.contractId}`)
        await loadUsers(currentUser.contractId)
      } else if (currentUser.role === "system_admin") {
        addDebugLog("Reloading all users for system admin")
        await loadAllUsers()
      }

      addDebugLog("User creation and list update completed successfully")
      setLastError(null)
    } catch (error) {
      handleError(error, "ユーザーの追加に失敗しました")
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("コピーしました")
      },
      (err) => {
        console.error("コピーに失敗しました: ", err)
        alert("コピーに失敗しました")
      },
    )
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleAssignCorporate = async (userId: string) => {
    try {
      addDebugLog(`Starting corporate assignment for user: ${userId}`)

      // 既存の割り当て状況を取得
      addDebugLog("Fetching existing corporate assignments...")
      const existingAssignments = await ApiService.getUserCorporateAssignments(userId)
      addDebugLog(`Existing assignments: ${JSON.stringify(existingAssignments)}`)

      setExistingAssignments(existingAssignments)
      setTargetUserId(userId)
      setAssignmentTarget("single")

      addDebugLog("Opening assignment modal...")
      // 少し遅延を入れてモーダルの状態更新を確実にする
      setTimeout(() => {
        setIsAssignmentModalOpen(true)
        addDebugLog(`Assignment modal state set to: ${true}`)
      }, 100)

      setLastError(null)
    } catch (error) {
      handleError(error, "既存の割り当て状況の取得に失敗しました")
      setExistingAssignments([])
    }
  }

  const handleBulkAssignCorporate = () => {
    if (selectedUsers.length === 0) {
      alert("ユーザーを選択してください")
      return
    }

    addDebugLog(`Starting bulk assignment for ${selectedUsers.length} users`)
    setAssignmentTarget("bulk")
    setTimeout(() => {
      setIsAssignmentModalOpen(true)
      addDebugLog(`Bulk assignment modal state set to: ${true}`)
    }, 100)
  }

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      alert("ユーザーを選択してください")
      return
    }

    if (confirm(`選択した${selectedUsers.length}人のユーザーを削除しますか？`)) {
      try {
        addDebugLog(`Deleting ${selectedUsers.length} users`)
        for (const userId of selectedUsers) {
          await ApiService.deleteUser(userId)
        }
        if (currentUser?.contractId) {
          await loadUsers(currentUser.contractId)
        } else if (currentUser?.role === "system_admin") {
          await loadAllUsers()
        }
        setSelectedUsers([])
        alert("選択したユーザーを削除しました")
        setLastError(null)
      } catch (error) {
        handleError(error, "ユーザーの削除に失敗しました")
      }
    }
  }

  const handleAssignmentComplete = async (selectedCorporateIds: string[]) => {
    try {
      addDebugLog(`Completing assignment with corporate IDs: ${JSON.stringify(selectedCorporateIds)}`)

      if (assignmentTarget === "single" && targetUserId) {
        await ApiService.bulkAssignCorporatesToUsers([targetUserId], selectedCorporateIds)
      } else if (assignmentTarget === "bulk") {
        await ApiService.bulkAssignCorporatesToUsers(selectedUsers, selectedCorporateIds)
      }

      // ユーザーリストを再読み込み
      if (currentUser?.contractId) {
        await loadUsers(currentUser.contractId)
      } else if (currentUser?.role === "system_admin") {
        await loadAllUsers()
      }

      setIsAssignmentModalOpen(false)
      setTargetUserId(null)
      setSelectedUsers([])
      alert("法人を割り当てました")
      setLastError(null)
      addDebugLog("Assignment completed successfully")
    } catch (error) {
      handleError(error, "法人の割り当てに失敗しました")
    }
  }

  const handleEditPermissions = async (userId: string) => {
    try {
      addDebugLog(`Starting permission edit for user: ${userId}`)

      // まず法人割り当て状況を確認
      const assignments = await ApiService.getUserCorporateAssignments(userId)
      addDebugLog(`User corporate assignments: ${JSON.stringify(assignments)}`)

      if (assignments.length === 0) {
        alert("このユーザーには割り当てられた法人がありません。先に法人割り当てを行ってください。")
        return
      }

      // 権限情報を取得
      addDebugLog("Fetching corporate permissions...")
      const permissions = await ApiService.getCorporatePermissions(userId)
      addDebugLog(`Loaded permissions: ${JSON.stringify(permissions)}`)

      if (permissions.length === 0) {
        // 権限レコードが存在しない場合、デフォルト権限を作成
        addDebugLog("No permission records found, creating default permissions...")

        // 割り当てられた法人の情報を取得
        const corporates = await ApiService.getCorporations()
        const assignedCorporates = corporates.filter((corp) => assignments.includes(corp.id))

        const defaultPermissions = assignedCorporates.map((corp) => ({
          id: `temp_${corp.id}`,
          corporateName: corp.name,
          corporateId: corp.id,
          view: true,
          create: false,
          approve: false,
        }))

        setUserPermissions(defaultPermissions)
        addDebugLog(`Created default permissions: ${JSON.stringify(defaultPermissions)}`)
      } else {
        const formattedPermissions = permissions.map((perm) => ({
          id: perm.id,
          corporateName: perm.corporateName || "不明な法人",
          corporateId: perm.corporateId,
          view: perm.view !== false,
          create: perm.create || false,
          approve: perm.approve || false,
        }))
        setUserPermissions(formattedPermissions)
        addDebugLog(`Formatted permissions: ${JSON.stringify(formattedPermissions)}`)
      }

      setEditingUserId(userId)
      addDebugLog("Opening permission modal...")
      // 少し遅延を入れてモーダルの状態更新を確実にする
      setTimeout(() => {
        setIsPermissionModalOpen(true)
        addDebugLog(`Permission modal state set to: ${true}`)
      }, 100)
      setLastError(null)
    } catch (error) {
      handleError(error, "権限情報の取得に失敗しました")
    }
  }

  const handleSavePermissions = async () => {
    if (!editingUserId) return

    try {
      addDebugLog(`Saving permissions for user: ${editingUserId}`)
      addDebugLog(`Permissions to save: ${JSON.stringify(userPermissions)}`)

      await ApiService.saveCorporatePermissions(editingUserId, userPermissions)
      alert("権限を保存しました")
      setIsPermissionModalOpen(false)
      setEditingUserId(null)
      setUserPermissions([])
      setLastError(null)
      addDebugLog("Permissions saved successfully")
    } catch (error) {
      handleError(error, "権限の保存に失敗しました")
    }
  }

  const handlePermissionChange = (permissionId: string, field: "view" | "create" | "approve", value: boolean) => {
    if (field === "view") return

    if (field === "approve" && value) {
      if (!confirm("承認権限を付与しますか？この権限により重要な操作が可能になります。")) {
        return
      }
    }

    setUserPermissions((prev) => prev.map((perm) => (perm.id === permissionId ? { ...perm, [field]: value } : perm)))
  }

  const getStatusText = (user: Profile) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60))
      if (diffMinutes < 30) return "ログイン中"
    }
    return "オフライン"
  }

  return (
    <div className="space-y-6">
      {/* デバッグ情報表示 */}
      {(showDebug || lastError) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              デバッグ情報
              <Button size="sm" variant="ghost" onClick={() => setShowDebug(!showDebug)} className="ml-auto">
                {showDebug ? "非表示" : "表示"}
              </Button>
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent className="space-y-2">
              {lastError && (
                <div className="p-2 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
                  <strong>最新エラー:</strong> {lastError}
                </div>
              )}
              <div className="text-xs font-mono bg-white p-2 rounded border max-h-40 overflow-y-auto">
                {debugInfo.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setDebugInfo([])}>
                  ログクリア
                </Button>
                <Button size="sm" onClick={() => setLastError(null)}>
                  エラークリア
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>新規ユーザー作成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <Input
                id="newUserEmail"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newUserFullName" className="block text-sm font-medium text-gray-700 mb-1">
                氏名
              </label>
              <Input
                id="newUserFullName"
                placeholder="山田太郎"
                value={newUserData.fullName}
                onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
              />
            </div>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white md:self-end">
              新規作成
            </Button>
          </div>
        </CardContent>
      </Card>

      {showTempCredentials && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">ユーザーが作成されました</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">仮認証情報</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">仮ユーザーID:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{tempCredentials.tempUserId}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(tempCredentials.tempUserId)}
                    aria-label="仮ユーザーIDをコピー"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">仮パスワード:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{tempCredentials.tempPassword}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(tempCredentials.tempPassword)}
                    aria-label="仮パスワードをコピー"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-green-700">
              この情報をユーザーにお伝えください。ユーザーは初回ログイン時に新しいユーザーIDとパスワードを設定します。
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setShowTempCredentials(false)}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              閉じる
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentUser?.contractId && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">一括操作:</span>
                <Button onClick={handleBulkAssignCorporate} variant="outline" disabled={selectedUsers.length === 0}>
                  法人一括割り当て
                </Button>
                <Button
                  onClick={handleDeleteUsers}
                  variant="outline"
                  disabled={selectedUsers.length === 0}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                >
                  ユーザー削除
                </Button>
                <span className="text-sm text-gray-500">
                  {selectedUsers.length > 0 && `${selectedUsers.length}人選択中`}
                </span>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={users.length === 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">メールアドレス</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">区分</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">法人割り当て</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">権限編集</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">読み込み中...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      {currentUser?.contractId
                        ? "契約内のユーザーがいません。上のフォームから新規ユーザーを作成してください。"
                        : currentUser?.role === "system_admin"
                          ? "システム内にユーザーがいません。上のフォームから新規ユーザーを作成してください。"
                          : "契約情報がありません。ユーザー管理機能を利用するには契約が必要です。"}
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, Boolean(checked))}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.full_name}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {user.role === "admin" ? "管理者" : user.role === "system_admin" ? "システム管理者" : "一般"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            getStatusText(user) === "ログイン中"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {getStatusText(user)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => handleAssignCorporate(user.id)}>
                          設定
                        </Button>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => handleEditPermissions(user.id)}>
                          編集
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">権限設定</h2>
              <p className="text-sm text-gray-600 mt-1">
                ユーザーの法人に対する権限を設定します。参照権限は全ユーザー必須です。
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  ユーザー: {users.find((u) => u.id === editingUserId)?.full_name || ""}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r">法人名</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 border-r w-20">参照</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 border-r w-20">作成</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 w-20">承認</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userPermissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-900 border-r">{permission.corporateName}</td>
                          <td className="px-3 py-2 text-center border-r">
                            <Checkbox checked={permission.view} disabled className="opacity-50" />
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            <Checkbox
                              checked={permission.create}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.id, "create", Boolean(checked))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Checkbox
                              checked={permission.approve}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.id, "approve", Boolean(checked))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSavePermissions} className="bg-blue-600 hover:bg-blue-700 text-white">
                保存
              </Button>
            </div>
          </div>
        </div>
      )}

      <CorporateAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          addDebugLog("Assignment modal closed")
          setIsAssignmentModalOpen(false)
        }}
        onAssign={handleAssignmentComplete}
        isBulkMode={assignmentTarget === "bulk"}
        selectedUserCount={assignmentTarget === "bulk" ? selectedUsers.length : 1}
        targetUserId={targetUserId}
        existingAssignments={existingAssignments}
      />
    </div>
  )
}

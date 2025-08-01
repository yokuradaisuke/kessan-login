"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { User, Lock, Trash2, Save, AlertTriangle } from "lucide-react"
import { ApiService } from "./services/api"
import { AuthService, type AuthUser } from "./lib/auth"

interface UserSettingsProps {
  currentUser: AuthUser
  onBack: () => void
  onUserUpdate: (user: AuthUser) => void
  onLogout: () => void
}

export default function UserSettings({ currentUser, onBack, onUserUpdate, onLogout }: UserSettingsProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "account">("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [contractInfo, setContractInfo] = useState<any>(null)

  // プロファイル設定
  const [profileData, setProfileData] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    userId: currentUser.userId,
  })

  // パスワード変更
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // アカウント削除
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  useEffect(() => {
    loadContractInfo()
  }, [])

  const loadContractInfo = async () => {
    try {
      const contract = await ApiService.getUserContract(currentUser.id)
      setContractInfo(contract)
    } catch (error) {
      console.error("契約情報の取得に失敗しました:", error)
    }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      const updatedUser = await ApiService.updateUserProfile(currentUser.id, {
        full_name: profileData.fullName,
        email: profileData.email,
        user_id: profileData.userId,
      })

      // 現在のユーザー情報を更新
      const newUserData = {
        ...currentUser,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        userId: updatedUser.user_id,
      }

      AuthService.setCurrentUser(newUserData)
      onUserUpdate(newUserData)
      alert("プロファイルを更新しました")
    } catch (error) {
      console.error("プロファイルの更新に失敗しました:", error)
      alert("プロファイルの更新に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("新しいパスワードが一致しません")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("パスワードは6文字以上で入力してください")
      return
    }

    setIsLoading(true)
    try {
      await ApiService.changePassword(currentUser.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("パスワードを変更しました")
    } catch (error) {
      console.error("パスワードの変更に失敗しました:", error)
      alert("パスワードの変更に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDelete = async () => {
    if (deleteConfirmation !== "DELETE") {
      alert("削除を確認するため「DELETE」と入力してください")
      return
    }

    if (!confirm("本当にアカウントを削除しますか？この操作は取り消せません。")) {
      return
    }

    setIsLoading(true)
    try {
      await ApiService.deleteUserAccount(currentUser.id)
      alert("アカウントを削除しました")
      onLogout()
    } catch (error) {
      console.error("アカウントの削除に失敗しました:", error)
      alert("アカウントの削除に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "契約管理者"
      case "system_admin":
        return "システム管理者"
      default:
        return "一般ユーザー"
    }
  }

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "system_admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ユーザー設定</h1>
              <p className="text-gray-600 mt-2">アカウント情報とセキュリティ設定</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              マイページに戻る
            </Button>
          </div>

          {/* User Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentUser.fullName}</h2>
                  <p className="text-gray-600">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleBadgeStyle(currentUser.role)}>{getRoleLabel(currentUser.role)}</Badge>
                    {contractInfo && (
                      <Badge className="bg-green-100 text-green-800">契約: {contractInfo.contract_type}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "profile"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  プロファイル
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "security"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  セキュリティ
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === "account"
                      ? "border-red-500 text-red-600 bg-red-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  アカウント管理
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">プロファイル情報</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      placeholder="山田太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="example@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ユーザーID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={profileData.userId}
                      onChange={(e) => setProfileData({ ...profileData, userId: e.target.value })}
                      placeholder="user001"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ユーザーIDはログイン時に使用します。変更後は新しいIDでログインしてください。
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "更新中..." : "プロファイルを更新"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">パスワード変更</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      現在のパスワード <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="現在のパスワード"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="6文字以上"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード（確認） <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="パスワードを再入力"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {isLoading ? "変更中..." : "パスワードを変更"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "account" && (
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">危険な操作</h3>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-red-900 mb-2">アカウント削除について</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• アカウントを削除すると、すべてのデータが永久に失われます</li>
                    <li>• 担当している法人へのアクセスができなくなります</li>
                    <li>• この操作は取り消すことができません</li>
                    {currentUser.role === "admin" && (
                      <li className="font-medium">
                        • 契約管理者の場合、事前に他のユーザーに管理者権限を移譲してください
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      削除を確認するため「DELETE」と入力してください
                    </label>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="max-w-xs"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleAccountDelete}
                      disabled={isLoading || deleteConfirmation !== "DELETE"}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isLoading ? "削除中..." : "アカウントを削除"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

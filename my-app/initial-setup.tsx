"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { ApiService } from "./services/api"
import { AuthService, type AuthUser } from "./lib/auth"
import { User, Lock, Mail, BadgeIcon as IdCard } from "lucide-react"

interface InitialSetupProps {
  currentUser: AuthUser
  onSetupComplete: (user: AuthUser) => void
}

export default function InitialSetup({ currentUser, onSetupComplete }: InitialSetupProps) {
  const [formData, setFormData] = useState({
    newUserId: "",
    newPassword: "",
    confirmPassword: "",
    fullName: currentUser.fullName,
    email: currentUser.email,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async () => {
    // バリデーション
    if (
      !formData.newUserId ||
      !formData.newPassword ||
      !formData.confirmPassword ||
      !formData.fullName ||
      !formData.email
    ) {
      setError("すべての項目を入力してください")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    if (formData.newPassword.length < 6) {
      setError("パスワードは6文字以上で入力してください")
      return
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("正しいメールアドレスを入力してください")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const updatedProfile = await ApiService.completeInitialSetup(currentUser.id, {
        newUserId: formData.newUserId,
        newPassword: formData.newPassword,
        fullName: formData.fullName,
        email: formData.email,
      })

      // 新しいユーザー情報でセッションを更新
      const newUserData: AuthUser = {
        id: updatedProfile.id,
        userId: updatedProfile.user_id,
        email: updatedProfile.email,
        fullName: updatedProfile.full_name,
        role: updatedProfile.role,
        requiresInitialSetup: false,
      }

      AuthService.setCurrentUser(newUserData)
      onSetupComplete(newUserData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "初期設定に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">初期設定</h1>
            <p className="text-gray-600">
              アカウントの初期設定を行います。
              <br />
              新しいユーザーIDとパスワードを設定してください。
            </p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <IdCard className="w-4 h-4 inline mr-2" />
                  新しいユーザーID <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.newUserId}
                  onChange={(e) => handleInputChange("newUserId", e.target.value)}
                  placeholder="新しいユーザーIDを入力"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">今後のログインで使用するユーザーIDです</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-2" />
                  氏名 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="山田太郎"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4 inline mr-2" />
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 inline mr-2" />
                  新しいパスワード <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="6文字以上"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4 inline mr-2" />
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="パスワードを再入力"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">現在の仮認証情報</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>仮ユーザーID:</strong> {currentUser.userId}
                </p>
                <p>
                  <strong>役割:</strong> {currentUser.role === "admin" ? "管理者" : "一般ユーザー"}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    設定中...
                  </div>
                ) : (
                  "初期設定を完了"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

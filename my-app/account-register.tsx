"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { AuthService, type AuthUser } from "./lib/auth"

interface AccountRegisterProps {
  onBack: () => void
  onRegisterSuccess: (user: AuthUser) => void
}

export default function AccountRegister({ onBack, onRegisterSuccess }: AccountRegisterProps) {
  const [formData, setFormData] = useState({
    userId: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    if (!formData.userId || !formData.email || !formData.fullName || !formData.password || !formData.confirmPassword) {
      setError("すべての項目を入力してください")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const user = await AuthService.register(formData)
      if (user) {
        onRegisterSuccess(user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "アカウント作成に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRegister()
    }
  }

  return (
    <div className="flex items-center justify-center p-6" style={{ minHeight: "calc(100vh - 80px)" }}>
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">アカウント作成</h1>
            <p className="text-sm text-gray-600 mt-2">新しいアカウントを作成してください</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ユーザーID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="ユーザーID"
                value={formData.userId}
                onChange={(e) => handleInputChange("userId", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                氏名 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="山田太郎"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                パスワード <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="6文字以上"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="パスワードを再入力"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-base font-medium relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  作成中...
                </div>
              ) : (
                "アカウント作成"
              )}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">既にアカウントをお持ちですか？ </span>
              <button onClick={onBack} className="text-sm text-orange-600 hover:text-orange-800">
                ログインに戻る
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

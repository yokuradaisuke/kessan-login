"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { AuthService, type AuthUser } from "./lib/auth"
import AccountRegister from "./account-register"
import Header from "./components/header"

interface LoginProps {
  onLogin: (user: AuthUser) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [currentView, setCurrentView] = useState<"login" | "register">("login")
  const [loginData, setLoginData] = useState({
    userId: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.userId || !loginData.password) {
      setError("ユーザーIDとパスワードを入力してください")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", loginData.userId)
      const user = await AuthService.login(loginData.userId, loginData.password)
      console.log("Login successful, user:", user)

      // セッションを保存
      await AuthService.saveUserSession(user)

      // ログイン成功をコールバック
      onLogin(user)
    } catch (error) {
      console.error("Login failed:", error)
      setError(error instanceof Error ? error.message : "ログインに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    setCurrentView("register")
  }

  const handleBackToLogin = () => {
    setCurrentView("login")
  }

  const handleRegisterComplete = () => {
    setCurrentView("login")
    setError("")
    alert("アカウントが作成されました。ログインしてください。")
  }

  if (currentView === "register") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showUserMenu={false} />
        <AccountRegister onBack={handleBackToLogin} onRegisterComplete={handleRegisterComplete} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showUserMenu={false} />
      <div className="flex items-center justify-center p-6" style={{ minHeight: "calc(100vh - 80px)" }}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ユーザー名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="userId"
                  type="text"
                  value={loginData.userId}
                  onChange={(e) => setLoginData({ ...loginData, userId: e.target.value })}
                  placeholder="ユーザー名またはメールアドレス"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="パスワード"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="text-left">
                <button type="button" className="text-sm text-orange-600 hover:text-orange-800">
                  パスワードをお忘れですか？
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">初めてですか？ </span>
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="text-orange-600 hover:text-orange-800 font-medium"
                  >
                    アカウント作成
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 font-medium"
                >
                  {isLoading ? "ログイン中..." : "ログイン"}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">テスト用アカウント</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>管理者: admin / admin</div>
                <div>一般ユーザー: user001 / user001</div>
                <div>システム管理者: systemadmin / systemadmin</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import UserManagement from "./user-management"
import CorporateManagement from "./corporate-management"
import type { AuthUser } from "@/types/auth-user" // Declare the AuthUser variable

// AdminSettingsPropsにcurrentUserを追加
interface AdminSettingsProps {
  currentUser: AuthUser
  onBack: () => void
}

export default function AdminSettings({ currentUser, onBack }: AdminSettingsProps) {
  const [currentTab, setCurrentTab] = useState<"user" | "corporate">("user")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">管理者設定</h1>
          </div>

          {/* Tab Navigation */}
          <Card>
            <CardContent className="p-0">
              <div className="flex border-b">
                <button
                  onClick={() => setCurrentTab("user")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    currentTab === "user"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  ユーザー管理
                </button>
                <button
                  onClick={() => setCurrentTab("corporate")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    currentTab === "corporate"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  法人管理
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {currentTab === "user" && <UserManagement currentUser={currentUser} />}
          {currentTab === "corporate" && <CorporateManagement currentUser={currentUser} />}

          {/* Back Button */}
          <div className="flex justify-center pt-8">
            <Button variant="outline" onClick={onBack} className="px-8">
              マイページに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import InviteConfirmationModal from "./invite-confirmation-modal"
import { ApiService } from "./services/api"
import type { AuthUser } from "./lib/auth"

interface UserListProps {
  corporateData: {
    number: string
    name: string
    status: string
    apps: string[]
    id: string
  }
  userRole: "admin" | "general"
  currentUser: AuthUser
  onBack: () => void
  onBackToTop: () => void
}

export default function UserList({ corporateData, userRole, currentUser, onBack, onBackToTop }: UserListProps) {
  const [newUserEmail, setNewUserEmail] = useState("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [userData, setUserData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteUserName, setInviteUserName] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await ApiService.getCorporateUsers(corporateData.id)
        const formattedUsers = users.map((user) => ({
          id: user.id,
          name: user.profile?.full_name || "Unknown User",
          email: user.profile?.email || "No Email",
          role: user.role === "admin" ? "管理者" : "一般",
          status: user.status === "active" ? "担当中" : user.status === "invited" ? "招待中" : user.status,
          userId: user.user_id,
        }))
        setUserData(formattedUsers)
      } catch (error) {
        console.error("ユーザー一覧の取得に失敗しました:", error)
        setUserData([])
      } finally {
        setIsLoading(false)
      }
    }

    if (corporateData.id) {
      loadUsers()
    }
  }, [corporateData.id])

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "担当中":
        return "bg-green-100 text-green-800"
      case "招待中":
        return "bg-yellow-100 text-yellow-800"
      case "申請否認":
        return "bg-red-100 text-red-800"
      case "担当者申請中":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddUserClick = async () => {
    if (!newUserEmail) {
      alert("メールアドレスを入力してください")
      return
    }

    if (userRole !== "admin") {
      alert("管理者権限が必要です")
      return
    }

    try {
      // メールアドレスからユーザー情報を取得
      const profile = await ApiService.getProfileByEmail(newUserEmail)
      if (profile) {
        setInviteUserName(profile.full_name)
      } else {
        setInviteUserName("未登録ユーザー")
      }
      setIsInviteModalOpen(true)
    } catch (error) {
      console.error("ユーザー情報の取得に失敗しました:", error)
      setInviteUserName("不明なユーザー")
      setIsInviteModalOpen(true)
    }
  }

  const handleConfirmInvite = async () => {
    try {
      // 招待を作成
      await ApiService.createInvitation(corporateData.id, newUserEmail, currentUser.id)

      // ユーザー一覧を更新（招待中として表示するため、一時的にローカル状態を更新）
      const newUser = {
        id: `temp-${Date.now()}`,
        name: inviteUserName,
        email: newUserEmail,
        role: "一般",
        status: "招待中",
        userId: null,
      }
      setUserData([...userData, newUser])

      setNewUserEmail("")
      setInviteUserName("")
      setIsInviteModalOpen(false)
      alert("招待を送信しました")
    } catch (error) {
      console.error("招待の送信に失敗しました:", error)
      alert("招待の送信に失敗しました")
    }
  }

  const handleDeleteUser = (userId: number) => {
    if (userRole === "admin") {
      setUserData(userData.filter((user) => user.id !== userId))
      alert("ユーザーを削除しました")
    }
  }

  const handlePromoteToAdmin = (userId: number) => {
    if (userRole === "admin") {
      setUserData(userData.map((user) => (user.id === userId ? { ...user, role: "管理者" } : user)))
      alert("管理者に変更しました")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">法人担当一覧</h1>
            <div className="text-lg text-gray-700">
              <span className="font-semibold">法人名：</span>
              <span className="text-gray-900">{corporateData.name}</span>
            </div>
          </div>

          {/* Add User Section - Only for Admin */}
          {userRole === "admin" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">メールアドレス</label>
                  <Input
                    placeholder="d-yokura@psc-inc.co.jp"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="flex-1 max-w-md"
                  />
                  <Button onClick={handleAddUserClick} className="bg-blue-600 hover:bg-blue-700 text-white">
                    担当を追加する
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User List Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">名前</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">メールアドレス</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">管理者・一般</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">ステータス</th>
                      {userRole === "admin" && (
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">操作</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {userData.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800">
                          <a href={`mailto:${user.email}`}>{user.email}</a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.role}</td>
                        <td className="px-6 py-4">
                          <Badge className={`text-xs ${getStatusBadgeStyle(user.status)}`}>{user.status}</Badge>
                        </td>
                        {userRole === "admin" && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {user.status === "招待中" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-gray-500 text-white hover:bg-gray-600 border-gray-500"
                                >
                                  削除する
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-gray-500 text-white hover:bg-gray-600 border-gray-500"
                                  >
                                    削除する
                                  </Button>
                                  {user.role === "一般" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handlePromoteToAdmin(user.id)}
                                      className="bg-orange-500 text-white hover:bg-orange-600"
                                    >
                                      管理者にする
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center space-y-6 pt-8">
            <Button variant="link" className="text-blue-600 hover:text-blue-800 text-sm">
              マニュアル
            </Button>
            <div className="flex space-x-6 text-sm">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800 underline">
                戻る
              </button>
              <button onClick={onBackToTop} className="text-gray-600 hover:text-gray-800 underline">
                トップに戻る
              </button>
            </div>
          </div>

          {/* Invite Confirmation Modal */}
          <InviteConfirmationModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            onConfirm={handleConfirmInvite}
            email={newUserEmail}
            name={inviteUserName}
          />
        </div>
      </div>
    </div>
  )
}

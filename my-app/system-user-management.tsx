"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Search, Download, UserPlus } from "lucide-react"
import { ApiService } from "./services/api"
import type { Profile } from "./lib/supabase"

export default function SystemUserManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "general" | "system_admin">("all")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const userData = await ApiService.getAllUsers()
      setUsers(userData)
    } catch (error) {
      console.error("ユーザー一覧の取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "general") => {
    try {
      await ApiService.updateUserRole(userId, newRole)
      await loadUsers()
      alert("ユーザーの役割を更新しました")
    } catch (error) {
      console.error("役割の更新に失敗しました:", error)
      alert("役割の更新に失敗しました")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert("ユーザーを選択してください")
      return
    }

    if (confirm(`選択した${selectedUsers.length}人のユーザーを削除しますか？`)) {
      try {
        for (const userId of selectedUsers) {
          await ApiService.deleteUser(userId)
        }
        await loadUsers()
        setSelectedUsers([])
        alert("選択したユーザーを削除しました")
      } catch (error) {
        console.error("ユーザーの削除に失敗しました:", error)
        alert("ユーザーの削除に失敗しました")
      }
    }
  }

  const handleExportUsers = () => {
    const csvContent = [
      ["ユーザーID", "名前", "メールアドレス", "役割", "最終ログイン", "作成日"],
      ...filteredUsers.map((user) => [
        user.user_id,
        user.full_name,
        user.email,
        user.role === "admin" ? "管理者" : user.role === "system_admin" ? "システム管理者" : "一般",
        user.last_login_at ? new Date(user.last_login_at).toLocaleString("ja-JP") : "未ログイン",
        new Date(user.created_at).toLocaleString("ja-JP"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `users_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "管理者"
      case "system_admin":
        return "システム管理者"
      default:
        return "一般"
    }
  }

  const getStatusText = (user: Profile) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60))

      if (diffMinutes < 30) {
        return { text: "オンライン", style: "bg-green-100 text-green-800" }
      } else if (diffMinutes < 1440) {
        // 24時間
        return { text: "最近", style: "bg-yellow-100 text-yellow-800" }
      }
    }
    return { text: "オフライン", style: "bg-gray-100 text-gray-800" }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportUsers} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            エクスポート
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            新規ユーザー作成
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="名前、メールアドレス、ユーザーIDで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべての役割</option>
              <option value="general">一般ユーザー</option>
              <option value="admin">管理者</option>
              <option value="system_admin">システム管理者</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFilterRole("all")
              }}
            >
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">{selectedUsers.length}人選択中 - 一括操作:</span>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                選択したユーザーを削除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ユーザー情報</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">役割</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">最終ログイン</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => {
                  const status = getStatusText(user)
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">ID: {user.user_id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getRoleBadgeStyle(user.role)}>{getRoleLabel(user.role)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={status.style}>{status.text}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleString("ja-JP") : "未ログイン"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {user.role !== "system_admin" && (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "general")}
                              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="general">一般</option>
                              <option value="admin">管理者</option>
                            </select>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm("このユーザーを削除しますか？")) {
                                ApiService.deleteUser(user.id)
                                  .then(() => {
                                    loadUsers()
                                    alert("ユーザーを削除しました")
                                  })
                                  .catch(() => {
                                    alert("削除に失敗しました")
                                  })
                              }
                            }}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              表示中: {filteredUsers.length}件 / 全{users.length}件
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

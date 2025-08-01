"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { ApiService } from "./services/api"
import type { Notification } from "./lib/supabase"

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await ApiService.getAllNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("お知らせの取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert("タイトルを入力してください")
      return
    }

    try {
      await ApiService.createNotification({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        is_active: true,
      })

      setFormData({ title: "", content: "", type: "info" })
      setIsCreating(false)
      await loadNotifications()
      alert("お知らせを作成しました")
    } catch (error) {
      console.error("お知らせの作成に失敗しました:", error)
      alert("お知らせの作成に失敗しました")
    }
  }

  const handleUpdate = async () => {
    if (!editingNotification || !formData.title.trim()) {
      alert("タイトルを入力してください")
      return
    }

    try {
      await ApiService.updateNotification(editingNotification.id, {
        title: formData.title,
        content: formData.content,
        type: formData.type,
      })

      setFormData({ title: "", content: "", type: "info" })
      setEditingNotification(null)
      await loadNotifications()
      alert("お知らせを更新しました")
    } catch (error) {
      console.error("お知らせの更新に失敗しました:", error)
      alert("お知らせの更新に失敗しました")
    }
  }

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      content: notification.content || "",
      type: notification.type,
    })
    setIsCreating(true)
  }

  const handleToggleActive = async (notification: Notification) => {
    try {
      await ApiService.updateNotification(notification.id, {
        is_active: !notification.is_active,
      })
      await loadNotifications()
    } catch (error) {
      console.error("お知らせの状態変更に失敗しました:", error)
      alert("お知らせの状態変更に失敗しました")
    }
  }

  const handleDelete = async (notification: Notification) => {
    if (!confirm("このお知らせを削除しますか？")) return

    try {
      await ApiService.deleteNotification(notification.id)
      await loadNotifications()
      alert("お知らせを削除しました")
    } catch (error) {
      console.error("お知らせの削除に失敗しました:", error)
      alert("お知らせの削除に失敗しました")
    }
  }

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 text-blue-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "success":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "info":
        return "情報"
      case "warning":
        return "警告"
      case "error":
        return "エラー"
      case "success":
        return "成功"
      default:
        return "その他"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">お知らせ管理</h1>
        <Button
          onClick={() => {
            setIsCreating(true)
            setEditingNotification(null)
            setFormData({ title: "", content: "", type: "info" })
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingNotification ? "お知らせ編集" : "お知らせ作成"}
            </h3>

            {/* プレビュー表示 */}
            {formData.title && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">プレビュー</h4>
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    formData.type === "warning"
                      ? "bg-yellow-50 border-l-yellow-400"
                      : formData.type === "error"
                        ? "bg-red-50 border-l-red-400"
                        : formData.type === "success"
                          ? "bg-green-50 border-l-green-400"
                          : "bg-blue-50 border-l-blue-400"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">
                      {formData.type === "warning"
                        ? "⚠️"
                        : formData.type === "error"
                          ? "🚨"
                          : formData.type === "success"
                            ? "✅"
                            : "ℹ️"}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formData.title}</div>
                      {formData.content && <div className="text-sm text-gray-600 mt-1">{formData.content}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="お知らせのタイトルを入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種別</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">情報</option>
                  <option value="warning">警告</option>
                  <option value="error">エラー</option>
                  <option value="success">成功</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="お知らせの詳細内容を入力"
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingNotification ? handleUpdate : handleCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingNotification ? "更新" : "作成"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingNotification(null)
                    setFormData({ title: "", content: "", type: "info" })
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">タイトル</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">種別</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">状態</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">作成日時</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                        {notification.content && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {notification.content.length > 50
                              ? `${notification.content.substring(0, 50)}...`
                              : notification.content}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getTypeBadgeStyle(notification.type)}>{getTypeLabel(notification.type)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={notification.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {notification.is_active ? "アクティブ" : "非アクティブ"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(notification.created_at).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(notification)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(notification)}
                          className={notification.is_active ? "text-gray-600" : "text-green-600"}
                        >
                          {notification.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(notification)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

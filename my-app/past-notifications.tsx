"use client"

import type React from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import { ApiService } from "./services/api"
import NotificationModal from "./notification-modal"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  title: string
  content: string
  type: string
  created_at: string
}

interface PastNotificationsProps {
  onBack: () => void
}

const PastNotifications: React.FC<PastNotificationsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true)
        // Fetch all notifications (not limited to 4 like in the main page)
        const data = await ApiService.getNotifications(50) // Get more notifications for the past notifications view
        setNotifications(data)
      } catch (error) {
        console.error("通知の読み込みに失敗しました:", error)
        setNotifications([]) // Set empty array as fallback
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "warning":
        return "Warning"
      case "error":
        return "Error"
      case "success":
        return "Success"
      case "info":
      default:
        return "Info"
    }
  }

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "info":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">過去のお知らせ一覧</h1>
            <Button variant="outline" onClick={onBack}>
              戻る
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-600">読み込み中...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">過去のお知らせ一覧</h1>
          <Button variant="outline" onClick={onBack}>
            戻る
          </Button>
        </div>
        <ScrollArea className="w-full">
          <Table>
            <TableCaption>過去のお知らせ一覧</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>内容</TableHead>
                <TableHead>種類</TableHead>
                <TableHead>日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => {
                const getRowStyle = (type: string) => {
                  switch (type) {
                    case "warning":
                      return "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-400"
                    case "error":
                      return "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-400"
                    case "success":
                      return "bg-green-50 hover:bg-green-100 border-l-4 border-l-green-400"
                    case "info":
                    default:
                      return "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400"
                  }
                }

                const getIcon = (type: string) => {
                  switch (type) {
                    case "warning":
                      return "⚠️"
                    case "error":
                      return "🚨"
                    case "success":
                      return "✅"
                    case "info":
                    default:
                      return "ℹ️"
                  }
                }

                return (
                  <TableRow
                    key={notification.id}
                    className={`cursor-pointer transition-colors duration-200 ${getRowStyle(notification.type)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getIcon(notification.type)}</span>
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
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={getTypeBadgeStyle(notification.type)}>{getTypeLabel(notification.type)}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-gray-900">
                      {new Date(notification.created_at).toLocaleString("ja-JP")}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        {/* Notification Modal */}
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          notification={selectedNotification}
        />
      </div>
    </div>
  )
}

export default PastNotifications

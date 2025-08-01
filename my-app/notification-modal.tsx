"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notification: any
}

export default function NotificationModal({ isOpen, onClose, notification }: NotificationModalProps) {
  if (!notification) return null

  const getModalHeaderStyle = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-b border-yellow-200"
      case "error":
        return "bg-red-50 border-b border-red-200"
      case "success":
        return "bg-green-50 border-b border-green-200"
      case "info":
      default:
        return "bg-blue-50 border-b border-blue-200"
    }
  }

  const getModalIcon = (type: string) => {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className={`px-6 py-4 ${getModalHeaderStyle(notification?.type || "info")}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getModalIcon(notification?.type || "info")}</span>
              <DialogTitle className="text-xl font-bold text-gray-900">{notification?.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-4">
            {notification?.content && (
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{notification.content}</div>
            )}

            {notification?.description && (
              <div className="text-gray-600 text-sm whitespace-pre-wrap">{notification.description}</div>
            )}

            <div className="text-xs text-gray-500 pt-2 border-t">
              投稿日時:{" "}
              {new Date(notification.created_at).toLocaleString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          {notification?.url && (
            <Button
              onClick={() => window.open(notification.url, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              詳細を確認
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

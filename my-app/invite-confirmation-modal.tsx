"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface InviteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  email: string
  name: string
}

export default function InviteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  email,
  name,
}: InviteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-gray-900">担当として招待しますか？</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-700">
              <span className="font-medium">メールアドレス：</span>
              <span>{email}</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">名前：</span>
              <span>{name}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 pt-6">
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            招待する
          </Button>
          <Button onClick={onClose} variant="outline" className="px-6">
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

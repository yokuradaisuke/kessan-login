"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface InvitationResponseModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
  corporateData: {
    number: string
    name: string
  }
}

export default function InvitationResponseModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  corporateData,
}: InvitationResponseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-700">
              <span className="font-medium">法人番号：</span>
              <span>{corporateData.number}</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">法人名：</span>
              <span>{corporateData.name}</span>
            </div>
            <div className="text-base text-gray-900 mt-4">この法人の担当者に招待されています。参加しますか？</div>
          </div>
        </div>

        <div className="flex justify-center space-x-3 pt-6">
          <Button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white px-6">
            参加
          </Button>
          <Button onClick={onDecline} className="bg-red-600 hover:bg-red-700 text-white px-6">
            辞退
          </Button>
          <Button onClick={onClose} variant="outline" className="px-6">
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

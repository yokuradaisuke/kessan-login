"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useMemo } from "react"
import { ApiService } from "./services/api"
import { Input } from "@/components/ui/input"

interface CorporateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (selectedCorporates: string[]) => void
  isBulkMode: boolean
  selectedUserCount: number
  targetUserId?: string | null
  existingAssignments?: string[]
}

export default function CorporateAssignmentModal({
  isOpen,
  onClose,
  onAssign,
  isBulkMode,
  selectedUserCount,
  targetUserId = null,
  existingAssignments = [],
}: CorporateAssignmentModalProps) {
  const [corporates, setCorporates] = useState([])
  const [selectedCorporates, setSelectedCorporates] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // デバッグログ関数
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[CorporateAssignmentModal ${timestamp}] ${message}`)
  }

  useEffect(() => {
    addDebugLog(`Modal opened: ${isOpen}`)
    addDebugLog(`Props: isBulkMode=${isBulkMode}, selectedUserCount=${selectedUserCount}, targetUserId=${targetUserId}`)
    addDebugLog(`Existing assignments: ${JSON.stringify(existingAssignments)}`)

    const loadCorporates = async () => {
      if (!isOpen) return

      setIsLoading(true)
      setError(null)

      try {
        addDebugLog("Fetching corporates...")

        // 環境変数の確認
        addDebugLog(
          `Environment check - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET"}`,
        )
        addDebugLog(
          `Environment check - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET"}`,
        )

        const corporateData = await ApiService.getCorporations()
        addDebugLog(`Fetched ${corporateData.length} corporates`)

        const formattedCorporates = corporateData.map((corp) => ({
          id: corp.id,
          number: corp.corporate_number,
          name: corp.name,
        }))

        setCorporates(formattedCorporates)
        addDebugLog(`Formatted corporates: ${JSON.stringify(formattedCorporates.slice(0, 3))}...`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        addDebugLog(`Error fetching corporates: ${errorMessage}`)
        setError(`法人一覧の取得に失敗しました: ${errorMessage}`)
        console.error("法人一覧の取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadCorporates()
    }
  }, [isOpen, isBulkMode, selectedUserCount, targetUserId])

  // 既存の割り当て状況を反映
  useEffect(() => {
    if (isOpen && existingAssignments.length > 0 && corporates.length > 0) {
      addDebugLog("Setting existing assignments...")
      const existingCorporateNames = corporates
        .filter((corp) => existingAssignments.includes(corp.id))
        .map((corp) => corp.name)

      addDebugLog(`Existing corporate names: ${JSON.stringify(existingCorporateNames)}`)
      setSelectedCorporates(existingCorporateNames)
    } else if (isOpen) {
      addDebugLog("Clearing selected corporates")
      setSelectedCorporates([])
    }
  }, [isOpen, existingAssignments, corporates])

  const handleSelectCorporate = (corporateName: string, checked: boolean) => {
    addDebugLog(`Corporate selection changed: ${corporateName} = ${checked}`)
    if (checked) {
      setSelectedCorporates([...selectedCorporates, corporateName])
    } else {
      setSelectedCorporates(selectedCorporates.filter((name) => name !== corporateName))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    addDebugLog(`Select all: ${checked}`)
    if (checked) {
      setSelectedCorporates(corporates.map((corp) => corp.name))
    } else {
      setSelectedCorporates([])
    }
  }

  const handleAssign = () => {
    const selectedCorporateIds = corporates
      .filter((corp) => selectedCorporates.includes(corp.name))
      .map((corp) => corp.id)

    addDebugLog(`Assigning corporates: ${JSON.stringify(selectedCorporateIds)}`)
    onAssign(selectedCorporateIds)
    setSelectedCorporates([])
  }

  const handleClose = () => {
    addDebugLog("Modal closing...")
    setSelectedCorporates([])
    setError(null)
    onClose()
  }

  const filteredCorporates = useMemo(() => {
    if (!searchTerm) return corporates
    return corporates.filter(
      (corp) => corp.name.toLowerCase().includes(searchTerm.toLowerCase()) || corp.number.includes(searchTerm),
    )
  }, [corporates, searchTerm])

  // モーダルが開かない場合のデバッグ情報
  if (!isOpen) {
    return null
  }

  addDebugLog(`Rendering modal with ${corporates.length} corporates, ${selectedCorporates.length} selected`)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            法人割り当て
            {isBulkMode && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({selectedUserCount}人のユーザーに一括割り当て)
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isBulkMode
              ? `選択した${selectedUserCount}人のユーザーに法人を一括で割り当てます。`
              : "ユーザーに法人を割り当てます。既に割り当て済みの法人は青色で表示されます。"}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm">{error}</div>
        )}

        <div className="p-6 border-b">
          <Input
            placeholder="法人名または法人番号で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">読み込み中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedCorporates.length === filteredCorporates.length && filteredCorporates.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">すべて選択</span>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedCorporates.length}/{filteredCorporates.length}件選択
                </span>
              </div>

              <div className="space-y-2">
                {filteredCorporates.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">
                    {corporates.length === 0 ? "法人データがありません" : "検索条件に一致する法人がありません"}
                  </div>
                ) : (
                  filteredCorporates.map((corporate) => {
                    const isExisting = existingAssignments.includes(corporate.id)
                    return (
                      <div
                        key={corporate.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                          isExisting
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                        }`}
                      >
                        <Checkbox
                          checked={selectedCorporates.includes(corporate.name)}
                          onCheckedChange={(checked) => handleSelectCorporate(corporate.name, checked)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {corporate.name}
                            {isExisting && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">割り当て済み</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">法人番号: {corporate.number}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleAssign}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={selectedCorporates.length === 0 || isLoading}
          >
            割り当て ({selectedCorporates.length}件)
          </Button>
        </div>
      </div>
    </div>
  )
}

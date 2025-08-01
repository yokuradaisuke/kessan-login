"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Search, Download, Building2, Users } from "lucide-react"
import { ApiService } from "./services/api"
import type { Corporation } from "./lib/supabase"

export default function SystemCorporateManagement() {
  const [corporations, setCorporations] = useState<Corporation[]>([])
  const [selectedCorporations, setSelectedCorporations] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [corporateUsers, setCorporateUsers] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    loadCorporations()
  }, [])

  const loadCorporations = async () => {
    try {
      const corporateData = await ApiService.getCorporations()
      setCorporations(corporateData)

      // 各法人のユーザー数を取得
      const userCounts = {}
      for (const corp of corporateData) {
        try {
          const users = await ApiService.getCorporateUsers(corp.id)
          userCounts[corp.id] = users.length
        } catch (error) {
          userCounts[corp.id] = 0
        }
      }
      setCorporateUsers(userCounts)
    } catch (error) {
      console.error("法人一覧の取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCorporations = corporations.filter(
    (corp) =>
      corp.corporate_number.includes(searchTerm) ||
      corp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      corp.furigana?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectCorporation = (corporationId: string, checked: boolean) => {
    if (checked) {
      setSelectedCorporations([...selectedCorporations, corporationId])
    } else {
      setSelectedCorporations(selectedCorporations.filter((id) => id !== corporationId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCorporations(filteredCorporations.map((corp) => corp.id))
    } else {
      setSelectedCorporations([])
    }
  }

  const handleExportCorporations = () => {
    const csvContent = [
      ["法人番号", "法人名", "フリガナ", "種別", "都道府県", "市区町村", "担当者数", "作成日"],
      ...filteredCorporations.map((corp) => [
        corp.corporate_number,
        corp.name,
        corp.furigana || "",
        corp.type,
        corp.prefecture || "",
        corp.city || "",
        corporateUsers[corp.id] || 0,
        new Date(corp.created_at).toLocaleString("ja-JP"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `corporations_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const handleBulkDelete = async () => {
    if (selectedCorporations.length === 0) {
      alert("法人を選択してください")
      return
    }

    if (confirm(`選択した${selectedCorporations.length}件の法人を削除しますか？`)) {
      try {
        // 実際の削除処理は慎重に実装する必要があります
        alert("法人の削除機能は安全のため無効化されています")
      } catch (error) {
        console.error("法人の削除に失敗しました:", error)
        alert("法人の削除に失敗しました")
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-900">法人管理</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCorporations} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            エクスポート
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Building2 className="w-4 h-4 mr-2" />
            新規法人登録
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="法人番号、法人名、フリガナで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                クリア
              </Button>
            </div>
            {selectedCorporations.length > 0 && (
              <span className="text-sm text-gray-500">{selectedCorporations.length}件選択中</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCorporations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedCorporations.length}件選択中 - 一括操作:
              </span>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                選択した法人を削除
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corporation List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={
                        selectedCorporations.length === filteredCorporations.length && filteredCorporations.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">法人情報</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">所在地</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">担当者数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">登録日</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCorporations.map((corporation) => (
                  <tr key={corporation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedCorporations.includes(corporation.id)}
                        onCheckedChange={(checked) => handleSelectCorporation(corporation.id, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{corporation.name}</div>
                        <div className="text-sm text-gray-500">{corporation.furigana}</div>
                        <div className="text-xs text-gray-400">
                          {corporation.corporate_number} | {corporation.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {corporation.prefecture}
                      {corporation.city}
                      {corporation.address && <div className="text-xs text-gray-500">{corporation.address}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{corporateUsers[corporation.id] || 0}人</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(corporation.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          詳細
                        </Button>
                        <Button size="sm" variant="outline">
                          編集
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              表示中: {filteredCorporations.length}件 / 全{corporations.length}件
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Plus, Search, Calendar, Copy } from "lucide-react"
import { ApiService } from "./services/api"
import type { Contract } from "./lib/supabase"

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreating, setIsCreating] = useState(false)
  const [showTempCredentials, setShowTempCredentials] = useState(false)
  const [tempCredentials, setTempCredentials] = useState({ tempUserId: "", tempPassword: "" })
  const [formData, setFormData] = useState({
    corporateId: "",
    corporateName: "",
    adminEmail: "",
    adminFullName: "",
    contractType: "standard",
    startDate: "",
    endDate: "",
    status: "active",
    monthlyFee: 5000,
  })

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const contractData = await ApiService.getContracts()
      setContracts(contractData)
    } catch (error) {
      console.error("契約一覧の取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.corporations?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreate = async () => {
    if (
      !formData.corporateId ||
      !formData.corporateName ||
      !formData.adminEmail ||
      !formData.adminFullName ||
      !formData.startDate
    ) {
      alert("必須項目を入力してください")
      return
    }
    try {
      const result = await ApiService.createContractWithAdmin({
        corporateNumber: formData.corporateId,
        corporateName: formData.corporateName,
        adminEmail: formData.adminEmail,
        adminFullName: formData.adminFullName,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        status: formData.status,
        monthlyFee: formData.monthlyFee,
      })
      setTempCredentials(result)
      setShowTempCredentials(true)
      setFormData({
        corporateId: "",
        corporateName: "",
        adminEmail: "",
        adminFullName: "",
        contractType: "standard",
        startDate: "",
        endDate: "",
        status: "active",
        monthlyFee: 5000,
      })
      setIsCreating(false)
      await loadContracts()
    } catch (error) {
      console.error("契約の作成に失敗しました:", error)
      alert("契約の作成に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("コピーしました")
    })
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "アクティブ"
      case "expired":
        return "期限切れ"
      case "suspended":
        return "停止中"
      default:
        return "不明"
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">契約管理</h1>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          新規契約作成
        </Button>
      </div>

      {showTempCredentials && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">契約が作成されました</h3>
            <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">管理者向け仮認証情報</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">仮ユーザーID:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{tempCredentials.tempUserId}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(tempCredentials.tempUserId)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">仮パスワード:</span>
                    <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{tempCredentials.tempPassword}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(tempCredentials.tempPassword)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-sm text-green-700 mb-4">
              この情報を管理者にお伝えください。管理者は初回ログイン時に新しいユーザーIDとパスワードを設定します。
            </p>
            <Button
              onClick={() => setShowTempCredentials(false)}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              閉じる
            </Button>
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">新規契約作成</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">法人番号</label>
                <Input
                  value={formData.corporateId}
                  onChange={(e) => setFormData({ ...formData, corporateId: e.target.value })}
                  placeholder="13桁の法人番号を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">法人名</label>
                <Input
                  value={formData.corporateName}
                  onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                  placeholder="法人名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">管理者メールアドレス</label>
                <Input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">管理者氏名</label>
                <Input
                  value={formData.adminFullName}
                  onChange={(e) => setFormData({ ...formData, adminFullName: e.target.value })}
                  placeholder="管理者の氏名を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">契約種別</label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">スタンダード</SelectItem>
                    <SelectItem value="premium">プレミアム</SelectItem>
                    <SelectItem value="enterprise">エンタープライズ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月額料金</label>
                <Input
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white">
                作成
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="法人名、契約種別で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="expired">期限切れ</SelectItem>
                <SelectItem value="suspended">停止中</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
              }}
            >
              クリア
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">法人名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">契約種別</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">期間</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">管理者</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{contract.corporations?.name || "不明な法人"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">{contract.contract_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>
                          {new Date(contract.start_date).toLocaleDateString("ja-JP")}
                          {contract.end_date && <> ～ {new Date(contract.end_date).toLocaleDateString("ja-JP")}</>}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusBadgeStyle(contract.status)}>{getStatusLabel(contract.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{contract.admin_profile?.full_name || "未設定"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          編集
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          停止
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              表示中: {filteredContracts.length}件 / 全{contracts.length}件
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

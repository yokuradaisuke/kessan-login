"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import CorporateEdit from "./corporate-edit"
import { ApiService } from "./services/api"
import type { Corporation } from "./lib/supabase"
import type { AuthUser } from "./lib/auth"

interface CorporateManagementProps {
  currentUser: AuthUser
}

export default function CorporateManagement({ currentUser }: CorporateManagementProps) {
  const [currentView, setCurrentView] = useState<"list" | "edit">("list")
  const [corporates, setCorporates] = useState<Corporation[]>([])
  const [selectedCorporates, setSelectedCorporates] = useState<string[]>([])
  const [selectedCorporate, setSelectedCorporate] = useState<Corporation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [selectedCorporateId, setSelectedCorporateId] = useState<string | null>(null)
  const [corporatePermissions, setCorporatePermissions] = useState<any[]>([])
  const [newCorporateData, setNewCorporateData] = useState({
    corporateNumber: "",
    name: "",
  })

  useEffect(() => {
    console.log("CorporateManagement: currentUser:", currentUser)
    console.log("CorporateManagement: contractId:", currentUser?.contractId)

    if (currentUser?.contractId) {
      console.log("Loading corporates for contract:", currentUser.contractId)
      loadCorporates(currentUser.contractId)
    } else if (currentUser?.role === "system_admin") {
      console.log("Loading all corporates for system admin")
      loadAllCorporates()
    } else {
      console.log("No contract ID found and not system admin, user:", currentUser)
      setIsLoading(false)
    }
  }, [currentUser])

  const loadAllCorporates = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching all corporates...")
      const corporateData = await ApiService.getSystemAllCorporations()
      console.log("All corporates loaded:", corporateData)
      setCorporates(corporateData)
    } catch (error) {
      console.error("全法人一覧の取得に失敗しました:", error)
      setCorporates([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadCorporates = async (contractId: string) => {
    setIsLoading(true)
    try {
      console.log("Fetching corporates for contract:", contractId)
      const corporateData = await ApiService.getCorporationsByContract(contractId)
      console.log("Contract corporates loaded:", corporateData)
      setCorporates(corporateData)
    } catch (error) {
      console.error("法人一覧の取得に失敗しました:", error)
      setCorporates([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadCorporatePermissions = async (corporateId: string) => {
    try {
      const permissions = await ApiService.getCorporatePermissionsForAllUsers(corporateId)
      setCorporatePermissions(permissions)
    } catch (error) {
      console.error("権限情報の取得に失敗しました:", error)
    }
  }

  const filteredCorporates = useMemo(() => {
    if (!searchTerm) return corporates
    return corporates.filter(
      (corp) =>
        corp.corporate_number.includes(searchTerm) ||
        corp.name.includes(searchTerm) ||
        corp.furigana?.includes(searchTerm),
    )
  }, [searchTerm, corporates])

  const handleSelectCorporate = (corporateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCorporates([...selectedCorporates, corporateId])
    } else {
      setSelectedCorporates(selectedCorporates.filter((id) => id !== corporateId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCorporates(filteredCorporates.map((corp) => corp.id))
    } else {
      setSelectedCorporates([])
    }
  }

  const handleAddCorporate = () => {
    setIsAddModalOpen(true)
  }

  const handleEditCorporate = (corporate: Corporation) => {
    setSelectedCorporate(corporate)
    setCurrentView("edit")
  }

  const handleRowClick = (corporate: Corporation) => {
    handleEditCorporate(corporate)
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedCorporate(null)
  }

  const handleCreateCorporate = async () => {
    if (!newCorporateData.corporateNumber || !newCorporateData.name) {
      alert("法人番号と会社名を入力してください")
      return
    }

    try {
      const corporateData = {
        corporate_number: newCorporateData.corporateNumber,
        name: newCorporateData.name,
        type: "株式会社", // デフォルト値
        prefecture: "",
        city: "",
        address: "",
      }

      const createdCorp = await ApiService.createCorporation(corporateData)
      if (createdCorp && createdCorp.id) {
        if (currentUser.contractId) {
          await ApiService.addCorporateUser(createdCorp.id, currentUser.id, "admin", currentUser.contractId)
          await loadCorporates(currentUser.contractId)
        } else if (currentUser.role === "system_admin") {
          await ApiService.addCorporateUser(createdCorp.id, currentUser.id, "admin")
          await loadAllCorporates()
        }
      }

      setIsAddModalOpen(false)
      setNewCorporateData({ corporateNumber: "", name: "" })
      alert("法人を追加しました")
    } catch (error) {
      console.error("法人の追加に失敗しました:", error)
      alert("法人の追加に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  const handleTogglePermissions = async (corporateId: string) => {
    console.log("[CorporateManagement] Opening permission modal for corporate:", corporateId)
    setSelectedCorporateId(corporateId)
    await loadCorporatePermissions(corporateId)
    console.log("[CorporateManagement] Setting permission modal state to true")
    setIsPermissionModalOpen(true)
    console.log("[CorporateManagement] Permission modal state:", isPermissionModalOpen)
  }

  const handlePermissionChange = (userId: string, field: string, value: boolean) => {
    setCorporatePermissions((prev) => prev.map((perm) => (perm.userId === userId ? { ...perm, [field]: value } : perm)))
  }

  const handleSavePermissions = async () => {
    if (!selectedCorporateId) return

    try {
      await ApiService.updateCorporatePermissionsForAllUsers(selectedCorporateId, corporatePermissions)

      const usersWithAnyPermission = corporatePermissions
        .filter((perm) => perm.view || perm.create || perm.approve)
        .map((perm) => perm.userId)

      if (usersWithAnyPermission.length > 0 && currentUser?.contractId) {
        await ApiService.addUsersAsCorporateMembers(selectedCorporateId, usersWithAnyPermission, currentUser.contractId)
      }

      setIsPermissionModalOpen(false)
      alert("権限を保存しました")
    } catch (error) {
      console.error("権限の保存に失敗しました:", error)
      alert("権限の保存に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    }
  }

  if (currentView === "edit" && selectedCorporate) {
    return (
      <CorporateEdit
        corporateData={selectedCorporate}
        userRole={currentUser?.role || "general"}
        onBack={handleBackToList}
        onViewUsers={() => {}}
        hideTopButton={true}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">法人管理</h3>
            <Button onClick={handleAddCorporate} className="bg-blue-600 hover:bg-blue-700 text-white">
              法人追加
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {selectedCorporates.length > 0 && (
              <span className="text-sm text-gray-500">{selectedCorporates.length}件選択中</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>法人一覧</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <Checkbox
                      checked={selectedCorporates.length === filteredCorporates.length && filteredCorporates.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                      disabled={filteredCorporates.length === 0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-16">No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">法人名</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-24">権限設定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">読み込み中...</p>
                    </td>
                  </tr>
                ) : filteredCorporates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      {currentUser?.contractId
                        ? "契約内の法人がありません。上の「法人追加」ボタンから追加してください。"
                        : currentUser?.role === "system_admin"
                          ? "システム内に法人がありません。上の「法人追加」ボタンから追加してください。"
                          : "契約情報がありません。法人管理機能を利用するには契約が必要です。"}
                    </td>
                  </tr>
                ) : (
                  filteredCorporates.map((corporate, index) => (
                    <tr
                      key={corporate.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(corporate)}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedCorporates.includes(corporate.id)}
                          onCheckedChange={(checked) => handleSelectCorporate(corporate.id, Boolean(checked))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{corporate.name}</div>
                          <div className="text-xs text-gray-500">
                            法人番号: {corporate.corporate_number} | {corporate.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {corporate.prefecture}
                            {corporate.city}
                            {corporate.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePermissions(corporate.id)
                          }}
                        >
                          権限設定
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600">
              表示中: {filteredCorporates.length}件 / 全{corporates.length}件
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Corporate Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>法人追加</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="corporateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                法人番号
              </label>
              <Input
                id="corporateNumber"
                placeholder="1234567890123"
                value={newCorporateData.corporateNumber}
                onChange={(e) => setNewCorporateData({ ...newCorporateData, corporateNumber: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="corporateName" className="block text-sm font-medium text-gray-700 mb-1">
                会社名
              </label>
              <Input
                id="corporateName"
                placeholder="株式会社サンプル"
                value={newCorporateData.name}
                onChange={(e) => setNewCorporateData({ ...newCorporateData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateCorporate} className="bg-blue-600 hover:bg-blue-700 text-white">
              追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsPermissionModalOpen(false)} />

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] w-full mx-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">権限設定</h2>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  法人: {corporates.find((c) => c.id === selectedCorporateId)?.name || ""}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r">ユーザー名</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r">
                          メールアドレス
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 border-r w-20">参照</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 border-r w-20">作成</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-900 w-20">承認</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {corporatePermissions.map((permission) => (
                        <tr key={permission.userId} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs text-gray-900 border-r">{permission.userName}</td>
                          <td className="px-3 py-2 text-xs text-gray-600 border-r">{permission.email}</td>
                          <td className="px-3 py-2 text-center border-r">
                            <Checkbox
                              checked={permission.view}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.userId, "view", Boolean(checked))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            <Checkbox
                              checked={permission.create}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.userId, "create", Boolean(checked))
                              }
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Checkbox
                              checked={permission.approve}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.userId, "approve", Boolean(checked))
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t">
              <Button variant="outline" onClick={() => setIsPermissionModalOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSavePermissions} className="bg-blue-600 hover:bg-blue-700 text-white">
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

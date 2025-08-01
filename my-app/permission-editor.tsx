"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useMemo } from "react"

interface Permission {
  id: string
  corporateName: string
  view: boolean
  create: boolean
  approve: boolean
}

interface PermissionEditorProps {
  userId: string
  userName: string
  permissions: Permission[]
  onSave: (permissions: any[]) => void
  onCancel: () => void
}

export default function PermissionEditor({ userId, userName, permissions, onSave, onCancel }: PermissionEditorProps) {
  const [editedPermissions, setEditedPermissions] = useState<Permission[]>(permissions)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [filterText, setFilterText] = useState("")

  // フィルタリング
  const filteredPermissions = useMemo(() => {
    return editedPermissions.filter((perm) => perm.corporateName.toLowerCase().includes(filterText.toLowerCase()))
  }, [editedPermissions, filterText])

  const handlePermissionChange = (permissionId: string, field: "view" | "create" | "approve", value: boolean) => {
    // 参照権限は変更不可
    if (field === "view") return

    // 承認権限を付与する場合は確認
    if (field === "approve" && value) {
      if (!confirm("承認権限を付与しますか？この権限により重要な操作が可能になります。")) {
        return
      }
    }

    setEditedPermissions((prev) => prev.map((perm) => (perm.id === permissionId ? { ...perm, [field]: value } : perm)))
  }

  const handleSelectPermission = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(filteredPermissions.map((perm) => perm.id))
    } else {
      setSelectedPermissions([])
    }
  }

  const handleBulkPermissionChange = (field: "create" | "approve", value: boolean) => {
    setEditedPermissions((prev) =>
      prev.map((perm) => (selectedPermissions.includes(perm.id) ? { ...perm, [field]: value } : perm)),
    )
  }

  // onSaveメソッドのパラメータを修正
  const handleSave = () => {
    const formattedPermissions = editedPermissions.map((perm) => ({
      corporateId: perm.corporateId || perm.id, // corporateIdを優先、なければidを使用
      view: perm.view,
      create: perm.create,
      approve: perm.approve,
    }))

    console.log("Saving permissions:", formattedPermissions)

    // 保存処理
    onSave(formattedPermissions)
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">ユーザに対する担当設定・権限設定</h3>
            <p className="text-sm text-gray-600">ユーザー: {userName}</p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            保存
          </Button>
        </div>

        {/* フィルタ */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="法人名で検索"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* 一括操作 */}
        {selectedPermissions.length > 0 && (
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedPermissions.length}件選択中 - 一括操作:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPermissionChange("create", true)}
                className="text-xs"
              >
                作成権限を付与
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPermissionChange("create", false)}
                className="text-xs"
              >
                作成権限を削除
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPermissionChange("approve", true)}
                className="text-xs"
              >
                承認権限を付与
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkPermissionChange("approve", false)}
                className="text-xs"
              >
                承認権限を削除
              </Button>
            </div>
          </div>
        )}

        {/* 権限設定テーブル */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <Checkbox
                    checked={
                      selectedPermissions.length === filteredPermissions.length && filteredPermissions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-16">No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-80">法人名</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-20">
                  <div className="flex flex-col items-center">
                    <span>参照</span>
                    <Checkbox
                      checked={true}
                      disabled={true}
                      className="mt-1 opacity-50"
                      title="参照権限は全ユーザー必須です"
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-20">
                  <div className="flex flex-col items-center">
                    <span>作成</span>
                    <Checkbox
                      checked={filteredPermissions.every((perm) => perm.create)}
                      ref={(el) => {
                        if (el) {
                          const isIndeterminate =
                            filteredPermissions.some((perm) => perm.create) &&
                            !filteredPermissions.every((perm) => perm.create)
                          el.indeterminate = isIndeterminate
                        }
                      }}
                      onCheckedChange={(checked) => {
                        const newValue = checked === true
                        setEditedPermissions((prev) =>
                          prev.map((perm) =>
                            filteredPermissions.find((filtered) => filtered.id === perm.id)
                              ? { ...perm, create: newValue }
                              : perm,
                          ),
                        )
                      }}
                      className="mt-1"
                    />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-20">
                  <div className="flex flex-col items-center">
                    <span>承認</span>
                    <Checkbox
                      checked={filteredPermissions.every((perm) => perm.approve)}
                      ref={(el) => {
                        if (el) {
                          const isIndeterminate =
                            filteredPermissions.some((perm) => perm.approve) &&
                            !filteredPermissions.every((perm) => perm.approve)
                          el.indeterminate = isIndeterminate
                        }
                      }}
                      onCheckedChange={(checked) => {
                        const newValue = checked === true
                        setEditedPermissions((prev) =>
                          prev.map((perm) =>
                            filteredPermissions.find((filtered) => filtered.id === perm.id)
                              ? { ...perm, approve: newValue }
                              : perm,
                          ),
                        )
                      }}
                      className="mt-1"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPermissions.map((permission, index) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => handleSelectPermission(permission.id, checked)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{permission.corporateName}</td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={permission.view}
                      disabled={true}
                      className="opacity-50"
                      title="参照権限は全ユーザー必須です"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={permission.create}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, "create", checked)}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Checkbox
                      checked={permission.approve}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, "approve", checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            表示中: {filteredPermissions.length}件 / 全{editedPermissions.length}件
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

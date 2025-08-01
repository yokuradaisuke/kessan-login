"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { ApiService } from "./services/api"
import type { Corporation } from "./lib/supabase"

interface CorporateEditProps {
  corporateData: Corporation
  userRole: string
  onBack: () => void
  onViewUsers: () => void
  hideTopButton?: boolean
}

export default function CorporateEdit({
  corporateData,
  userRole,
  onBack,
  onViewUsers,
  hideTopButton = false,
}: CorporateEditProps) {
  const [formData, setFormData] = useState({
    corporate_number: corporateData.corporate_number || "",
    name: corporateData.name || "",
    furigana: corporateData.furigana || "",
    type: corporateData.type || "",
    prefecture: corporateData.prefecture || "",
    city: corporateData.city || "",
    address: corporateData.address || "",
    phone: corporateData.phone || "",
    fax: corporateData.fax || "",
    email: corporateData.email || "",
    website: corporateData.website || "",
    representative: corporateData.representative || "",
    capital: corporateData.capital || "",
    employees: corporateData.employees || "",
    business_description: corporateData.business_description || "",
    notes: corporateData.notes || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const prefectures = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ]

  const corporateTypes = [
    "株式会社",
    "有限会社",
    "合同会社",
    "合名会社",
    "合資会社",
    "一般社団法人",
    "一般財団法人",
    "公益社団法人",
    "公益財団法人",
    "NPO法人",
    "医療法人",
    "学校法人",
    "宗教法人",
    "その他",
  ]

  useEffect(() => {
    const originalData = {
      corporate_number: corporateData.corporate_number || "",
      name: corporateData.name || "",
      furigana: corporateData.furigana || "",
      type: corporateData.type || "",
      prefecture: corporateData.prefecture || "",
      city: corporateData.city || "",
      address: corporateData.address || "",
      phone: corporateData.phone || "",
      fax: corporateData.fax || "",
      email: corporateData.email || "",
      website: corporateData.website || "",
      representative: corporateData.representative || "",
      capital: corporateData.capital || "",
      employees: corporateData.employees || "",
      business_description: corporateData.business_description || "",
      notes: corporateData.notes || "",
    }

    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData)
    setHasChanges(hasChanged)
  }, [formData, corporateData])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!hasChanges) {
      alert("変更がありません")
      return
    }

    setIsLoading(true)
    try {
      await ApiService.updateCorporation(corporateData.id, formData)
      alert("法人情報を更新しました")
      setHasChanges(false)
    } catch (error) {
      console.error("法人情報の更新に失敗しました:", error)
      alert("法人情報の更新に失敗しました: " + (error instanceof Error ? error.message : "不明なエラー"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("変更が保存されていません。破棄しますか？")) {
        onBack()
      }
    } else {
      onBack()
    }
  }

  return (
    <div className="space-y-6">
      {!hideTopButton && (
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="outline">
            ← 法人一覧に戻る
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            トップに戻る
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>法人情報編集</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="corporate_number">法人番号 *</Label>
              <Input
                id="corporate_number"
                value={formData.corporate_number}
                onChange={(e) => handleInputChange("corporate_number", e.target.value)}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>
            <div>
              <Label htmlFor="type">法人種別 *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="法人種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  {corporateTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">法人名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="株式会社サンプル"
              />
            </div>
            <div>
              <Label htmlFor="furigana">フリガナ</Label>
              <Input
                id="furigana"
                value={formData.furigana}
                onChange={(e) => handleInputChange("furigana", e.target.value)}
                placeholder="カブシキガイシャサンプル"
              />
            </div>
          </div>

          {/* 住所情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">住所情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prefecture">都道府県</Label>
                <Select value={formData.prefecture} onValueChange={(value) => handleInputChange("prefecture", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="都道府県を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefectures.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">市区町村</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="渋谷区"
                />
              </div>
              <div>
                <Label htmlFor="address">番地・建物名</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="道玄坂1-2-3 ビル名4F"
                />
              </div>
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">連絡先情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="03-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="fax">FAX番号</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleInputChange("fax", e.target.value)}
                  placeholder="03-1234-5679"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <Label htmlFor="website">ウェブサイト</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* 会社情報 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">会社情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="representative">代表者名</Label>
                <Input
                  id="representative"
                  value={formData.representative}
                  onChange={(e) => handleInputChange("representative", e.target.value)}
                  placeholder="山田太郎"
                />
              </div>
              <div>
                <Label htmlFor="capital">資本金</Label>
                <Input
                  id="capital"
                  value={formData.capital}
                  onChange={(e) => handleInputChange("capital", e.target.value)}
                  placeholder="1000万円"
                />
              </div>
              <div>
                <Label htmlFor="employees">従業員数</Label>
                <Input
                  id="employees"
                  value={formData.employees}
                  onChange={(e) => handleInputChange("employees", e.target.value)}
                  placeholder="50名"
                />
              </div>
            </div>
          </div>

          {/* 事業内容・備考 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="business_description">事業内容</Label>
              <Textarea
                id="business_description"
                value={formData.business_description}
                onChange={(e) => handleInputChange("business_description", e.target.value)}
                placeholder="主な事業内容を記載してください"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="その他の情報や特記事項があれば記載してください"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ボタン */}
      <div className="flex justify-center space-x-4">
        <Button onClick={handleCancel} variant="outline">
          戻る
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          トップに戻る
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
}

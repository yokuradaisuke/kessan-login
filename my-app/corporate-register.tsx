"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useState } from "react"

interface CorporateRegisterProps {
  onBack: () => void
  onRegister: (corporateData: any) => void
  hideTopButton?: boolean
}

export default function CorporateRegister({ onBack, onRegister, hideTopButton = false }: CorporateRegisterProps) {
  const [step, setStep] = useState<"input" | "form">("input")
  const [corporateNumber, setCorporateNumber] = useState("")
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    furigana: "",
    type: "株式会社",
    prefecture: "",
    city: "",
    address: "",
    overseasLocation: "",
    closureDate: "",
    closureReason: "",
    successorNumber: "",
    englishName: "",
    englishPrefecture: "",
    englishCity: "",
    englishOverseasLocation: "",
  })

  const handleNext = () => {
    if (corporateNumber.length === 13) {
      setFormData((prev) => ({ ...prev, number: corporateNumber }))
      setStep("form")

      // 法人番号に基づいてサンプルデータを設定
      if (corporateNumber === "1120001169433") {
        setFormData((prev) => ({
          ...prev,
          name: "株式会社ＰＳＣ",
          furigana: "ピーエスシー",
          type: "株式会社",
          prefecture: "大阪府",
          city: "堺津市",
          address: "浜町12番13号",
        }))
      }
    } else {
      alert("13桁の法人番号を入力してください")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = () => {
    // Create corporation data without apps field
    const corporationData = {
      corporate_number: formData.number,
      name: formData.name,
      furigana: formData.furigana,
      type: formData.type,
      prefecture: formData.prefecture,
      city: formData.city,
      address: formData.address,
      overseas_location: formData.overseasLocation,
      closure_date: formData.closureDate || null,
      closure_reason: formData.closureReason || null,
      successor_number: formData.successorNumber || null,
      english_name: formData.englishName || null,
      english_prefecture: formData.englishPrefecture || null,
      english_city: formData.englishCity || null,
      english_overseas_location: formData.englishOverseasLocation || null,
    }

    onRegister(corporationData)
  }

  if (step === "input") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">法人情報登録</h1>
              <p className="text-gray-600">法人番号を入力して、「次へ」進んでください</p>
            </div>

            {/* Input Form */}
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Input
                      placeholder="13桁の法人番号を入力"
                      value={corporateNumber}
                      onChange={(e) => setCorporateNumber(e.target.value)}
                      className="max-w-md text-center text-lg"
                      maxLength={13}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                      disabled={corporateNumber.length !== 13}
                    >
                      次へ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Links */}
            <div className="flex justify-center space-x-6 text-sm">
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800 underline">
                戻る
              </button>
              {!hideTopButton && (
                <button onClick={onBack} className="text-gray-600 hover:text-gray-800 underline">
                  トップに戻る
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">法人情報登録</h1>
          </div>

          <Card>
            <CardContent className="p-8">
              {/* Corporate Number Display */}
              <div className="mb-8 text-center">
                <div className="text-lg text-gray-700">
                  <span className="font-semibold">法人番号：</span>
                  <span className="text-gray-900">{formData.number}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">法人名</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">法人名フリガナ</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.furigana}
                      onChange={(e) => handleInputChange("furigana", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">法人種別</label>
                  <div className="col-span-3">
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="株式会社">株式会社</SelectItem>
                        <SelectItem value="有限会社">有限会社</SelectItem>
                        <SelectItem value="合同会社">合同会社</SelectItem>
                        <SelectItem value="合資会社">合資会社</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">所在 都道府県</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.prefecture}
                      onChange={(e) => handleInputChange("prefecture", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">所在 市区町村</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">所在 丁目番地等</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">国外所在地</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.overseasLocation}
                      onChange={(e) => handleInputChange("overseasLocation", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">登記の閉鎖年月日</label>
                  <div className="col-span-3 relative">
                    <Input
                      placeholder="yyyy/mm/dd"
                      value={formData.closureDate}
                      onChange={(e) => handleInputChange("closureDate", e.target.value)}
                      className="w-full pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">登記の閉鎖等事由</label>
                  <div className="col-span-3">
                    <Select
                      value={formData.closureReason}
                      onValueChange={(value) => handleInputChange("closureReason", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="解散">解散</SelectItem>
                        <SelectItem value="合併">合併</SelectItem>
                        <SelectItem value="分割">分割</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">承継先法人番号</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.successorNumber}
                      onChange={(e) => handleInputChange("successorNumber", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">法人名(英語表記)</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.englishName}
                      onChange={(e) => handleInputChange("englishName", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">
                    所在 都道府県
                    <br />
                    (英語表記)
                  </label>
                  <div className="col-span-3">
                    <Input
                      value={formData.englishPrefecture}
                      onChange={(e) => handleInputChange("englishPrefecture", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">
                    所在 市区町村
                    <br />
                    (英語表記)
                  </label>
                  <div className="col-span-3">
                    <Input
                      value={formData.englishCity}
                      onChange={(e) => handleInputChange("englishCity", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-semibold text-gray-700 text-right">国外所在地(英語表記)</label>
                  <div className="col-span-3">
                    <Input
                      value={formData.englishOverseasLocation}
                      onChange={(e) => handleInputChange("englishOverseasLocation", e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-12 flex flex-col items-center space-y-6 pt-8 border-t border-gray-200">
                <Button
                  onClick={handleRegister}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 text-base font-medium"
                >
                  登録
                </Button>
                <Button variant="link" className="text-blue-600 hover:text-blue-800 text-sm">
                  マニュアル
                </Button>
                <div className="flex space-x-6 text-sm">
                  <button onClick={() => setStep("input")} className="text-gray-600 hover:text-gray-800 underline">
                    戻る
                  </button>
                  {!hideTopButton && (
                    <button onClick={onBack} className="text-gray-600 hover:text-gray-800 underline">
                      トップに戻る
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

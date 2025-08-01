"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus } from "lucide-react"
import { ApiService } from "./services/api"
import { useEffect, useState } from "react"
import type { AuthUser } from "./lib/auth"

interface RobotListProps {
  corporateData: {
    number: string
    name: string
    status: string
    apps: string[]
    id: string
  }
  currentUser: AuthUser
  onBack: () => void
  onBackToTop: () => void
}

export default function RobotList({ corporateData, currentUser, onBack, onBackToTop }: RobotListProps) {
  const [robotData, setRobotData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRobots = async () => {
      try {
        const robots = await ApiService.getSettlementRobots(corporateData.id)
        const formattedRobots = robots.map((robot) => ({
          businessYear: `${robot.business_year_start} ~ ${robot.business_year_end}`,
          phase: robot.phase,
          name: robot.name,
          createdAt: new Date(robot.created_at).toLocaleString("ja-JP"),
          editedAt: new Date(robot.updated_at).toLocaleString("ja-JP"),
        }))
        setRobotData(formattedRobots)
      } catch (error) {
        console.error("決算ロボットの取得に失敗しました:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (corporateData.id) {
      loadRobots()
    }
  }, [corporateData.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Robot List Section */}
          <Card>
            <CardContent className="p-0">
              <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">決算ロボット一覧</h2>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  決算ロボットを新規作成
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">事業年度</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">フェーズ</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">名称</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">作成日時</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">編集日時</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {robotData.map((robot, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{robot.businessYear}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{robot.phase}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{robot.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{robot.createdAt}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{robot.editedAt}</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              戻る
            </Button>
            <Button variant="outline" onClick={onBackToTop}>
              トップに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

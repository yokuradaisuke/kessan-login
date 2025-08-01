"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { TrendingUp, Users, Activity } from "lucide-react"
import { ApiService } from "./services/api"

export default function EngagementAnalytics() {
  const [engagementData, setEngagementData] = useState<any>({
    dailyLogins: {},
    userActivities: [],
    totalActivities: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEngagementData()
  }, [])

  const loadEngagementData = async () => {
    try {
      const data = await ApiService.getEngagementData()
      setEngagementData(data)
    } catch (error) {
      console.error("エンゲージメントデータの取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 過去7日間の日付を生成
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  // ユーザー別活動統計
  const getUserActivityStats = () => {
    const userStats = {}
    engagementData.userActivities.forEach((activity) => {
      const userId = activity.user_id
      if (!userStats[userId]) {
        userStats[userId] = {
          user: activity.profiles,
          loginCount: 0,
          totalActivities: 0,
        }
      }
      userStats[userId].totalActivities++
      if (activity.activity_type === "login") {
        userStats[userId].loginCount++
      }
    })

    return Object.values(userStats).sort((a: any, b: any) => b.totalActivities - a.totalActivities)
  }

  const last7Days = getLast7Days()
  const userActivityStats = getUserActivityStats()

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
        <h1 className="text-2xl font-bold text-gray-900">エンゲージメント分析</h1>
        <Badge className="bg-blue-100 text-blue-800">過去7日間のデータ</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総活動数</p>
                <p className="text-3xl font-bold text-gray-900">{engagementData.totalActivities}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                <p className="text-3xl font-bold text-gray-900">{userActivityStats.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均日次ログイン</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(Object.values(engagementData.dailyLogins).reduce((a: number, b: number) => a + b, 0) / 7)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Login Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">日別ログイン数</h3>
          <div className="space-y-3">
            {last7Days.map((date, index) => {
              const dateStr = date.toDateString()
              const loginCount = engagementData.dailyLogins[dateStr] || 0
              const maxLogins = Math.max(...Object.values(engagementData.dailyLogins), 1)
              const percentage = (loginCount / maxLogins) * 100

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">
                    {date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {loginCount}回
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Active Users */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">アクティブユーザーランキング</h3>
          <div className="space-y-3">
            {userActivityStats.slice(0, 10).map((userStat: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {userStat.user?.full_name || "不明なユーザー"}
                    </div>
                    <div className="text-xs text-gray-500">{userStat.user?.email || ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{userStat.totalActivities}回の活動</div>
                  <div className="text-xs text-gray-500">ログイン: {userStat.loginCount}回</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Types */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">活動種別</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              engagementData.userActivities.reduce((acc, activity) => {
                acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
                return acc
              }, {}),
            ).map(([type, count]: [string, any]) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

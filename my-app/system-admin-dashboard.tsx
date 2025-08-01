"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Users, Building2, Bell, Activity, TrendingUp, Calendar } from "lucide-react"
import NotificationManagement from "./notification-management"
import SystemUserManagement from "./system-user-management"
import SystemCorporateManagement from "./system-corporate-management"
import EngagementAnalytics from "./engagement-analytics"
import ContractManagement from "./contract-management"
import { ApiService } from "./services/api"

interface SystemAdminDashboardProps {
  onBack: () => void
}

export default function SystemAdminDashboard({ onBack }: SystemAdminDashboardProps) {
  const [currentTab, setCurrentTab] = useState<
    "dashboard" | "notifications" | "users" | "corporates" | "engagement" | "contracts"
  >("dashboard")
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalCorporates: 0,
    activeUsers: 0,
    totalNotifications: 0,
    todayLogins: 0,
    monthlyGrowth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const stats = await ApiService.getSystemStats()
      setDashboardStats(stats)
    } catch (error) {
      console.error("統計情報の取得に失敗しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (currentTab === "notifications") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setCurrentTab("dashboard")}>
                ← ダッシュボードに戻る
              </Button>
            </div>
            <NotificationManagement />
          </div>
        </div>
      </div>
    )
  }

  if (currentTab === "users") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setCurrentTab("dashboard")}>
                ← ダッシュボードに戻る
              </Button>
            </div>
            <SystemUserManagement />
          </div>
        </div>
      </div>
    )
  }

  if (currentTab === "corporates") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setCurrentTab("dashboard")}>
                ← ダッシュボードに戻る
              </Button>
            </div>
            <SystemCorporateManagement />
          </div>
        </div>
      </div>
    )
  }

  if (currentTab === "engagement") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setCurrentTab("dashboard")}>
                ← ダッシュボードに戻る
              </Button>
            </div>
            <EngagementAnalytics />
          </div>
        </div>
      </div>
    )
  }

  if (currentTab === "contracts") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setCurrentTab("dashboard")}>
                ← ダッシュボードに戻る
              </Button>
            </div>
            <ContractManagement />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">システム管理者ダッシュボード</h1>
              <p className="text-gray-600 mt-2">システム全体の管理と監視</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              マイページに戻る
            </Button>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="総ユーザー数"
                value={dashboardStats.totalUsers}
                icon={Users}
                color="bg-blue-500"
                subtitle="登録済みユーザー"
              />
              <StatCard
                title="総法人数"
                value={dashboardStats.totalCorporates}
                icon={Building2}
                color="bg-green-500"
                subtitle="登録済み法人"
              />
              <StatCard
                title="アクティブユーザー"
                value={dashboardStats.activeUsers}
                icon={Activity}
                color="bg-purple-500"
                subtitle="過去30日間"
              />
              <StatCard
                title="お知らせ数"
                value={dashboardStats.totalNotifications}
                icon={Bell}
                color="bg-orange-500"
                subtitle="アクティブなお知らせ"
              />
              <StatCard
                title="今日のログイン"
                value={dashboardStats.todayLogins}
                icon={Calendar}
                color="bg-cyan-500"
                subtitle="本日のログイン数"
              />
              <StatCard
                title="月間成長率"
                value={`${dashboardStats.monthlyGrowth}%`}
                icon={TrendingUp}
                color="bg-pink-500"
                subtitle="前月比ユーザー増加"
              />
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => setCurrentTab("notifications")}
                  className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Bell className="w-6 h-6 mb-2" />
                  お知らせ管理
                </Button>
                <Button
                  onClick={() => setCurrentTab("users")}
                  className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                >
                  <Users className="w-6 h-6 mb-2" />
                  ユーザー管理
                </Button>
                <Button
                  onClick={() => setCurrentTab("corporates")}
                  className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Building2 className="w-6 h-6 mb-2" />
                  法人管理
                </Button>
                <Button
                  onClick={() => setCurrentTab("engagement")}
                  className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Activity className="w-6 h-6 mb-2" />
                  エンゲージメント分析
                </Button>
                <Button
                  onClick={() => setCurrentTab("contracts")}
                  className="h-20 flex flex-col items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Calendar className="w-6 h-6 mb-2" />
                  契約管理
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">最近のアクティビティ</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">ログイン</Badge>
                    <span className="text-sm text-gray-700">user001@example.com がログインしました</span>
                  </div>
                  <span className="text-xs text-gray-500">5分前</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800">法人登録</Badge>
                    <span className="text-sm text-gray-700">新しい法人が登録されました</span>
                  </div>
                  <span className="text-xs text-gray-500">1時間前</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-purple-100 text-purple-800">お知らせ</Badge>
                    <span className="text-sm text-gray-700">新しいお知らせが投稿されました</span>
                  </div>
                  <span className="text-xs text-gray-500">2時間前</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

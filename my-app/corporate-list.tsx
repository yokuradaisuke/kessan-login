"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useMemo, useEffect } from "react"
import CorporateEdit from "./corporate-edit"
import RobotList from "./robot-list"
import CorporateRegister from "./corporate-register"
import NotificationModal from "./notification-modal"
import PastNotifications from "./past-notifications"
import UserList from "./user-list"
import Login from "./login"
import InvitationResponseModal from "./invitation-response-modal"
import AdminSettings from "./admin-settings"
import Header from "./components/header"
import { AuthService, type AuthUser } from "./lib/auth"
import { ApiService } from "./services/api"
import type { Corporation, Notification } from "./lib/supabase"
import SystemAdminDashboard from "./system-admin-dashboard"
import UserSettings from "./user-settings"
import InitialSetup from "./initial-setup"

export default function Component() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<
    | "list"
    | "edit"
    | "robot"
    | "register"
    | "pastNotifications"
    | "userList"
    | "adminSettings"
    | "systemAdminSettings"
    | "userSettings"
    | "initialSetup"
  >("list")
  const [selectedCorporate, setSelectedCorporate] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [corporateList, setCorporateList] = useState<
    Array<Corporation & { userRole: string; userStatus: string; invitationId?: string }>
  >([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null)

  // 初期化
  useEffect(() => {
    const initializeApp = async () => {
      const user = await AuthService.getCurrentUser()
      if (user) {
        setCurrentUser(user)
        await loadUserData(user)
      }
      setIsLoading(false)
    }

    initializeApp()
  }, [])

  // ユーザーデータの読み込み
  const loadUserData = async (user: AuthUser) => {
    try {
      console.log("Loading user data for:", user)

      // デバッグ用: 招待情報を確認
      await ApiService.debugInvitations(user.email)

      // 担当法人一覧を取得（招待も含む）
      const corporations = await ApiService.getUserCorporations(user.id)
      console.log("Loaded corporations:", corporations)
      setCorporateList(corporations)

      // 通知を取得
      const notificationData = await ApiService.getNotifications(4)
      setNotifications(notificationData)
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error)
    }
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "担当者":
      case "general":
      case "active":
        return "bg-blue-100 text-blue-800"
      case "管理者":
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "invited":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string, role: string) => {
    if (status === "invited") {
      return "招待されています"
    }
    return role === "admin" ? "管理者" : "担当者"
  }

  // 行クリック時は決算ロボット一覧画面に遷移
  const handleRowClick = (corporate: any) => {
    if (corporate.userStatus !== "invited") {
      setSelectedCorporate(corporate)
      setCurrentView("robot")
    }
  }

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification)
    setIsNotificationModalOpen(true)
  }

  const handleInvitationConfirm = (corporate: any) => {
    console.log("Confirming invitation for:", corporate)
    setSelectedInvitation({
      id: corporate.invitationId,
      corporation: {
        number: corporate.corporate_number,
        name: corporate.name,
        id: corporate.id,
      },
    })
    setIsInvitationModalOpen(true)
  }

  const handleAcceptInvitation = async () => {
    if (selectedInvitation && currentUser) {
      try {
        console.log("Accepting invitation:", selectedInvitation)
        await ApiService.acceptInvitation(selectedInvitation.id, currentUser.id)

        // データを再読み込み
        await loadUserData(currentUser)

        setIsInvitationModalOpen(false)
        setSelectedInvitation(null)
        alert("招待を承諾しました")
      } catch (error) {
        console.error("招待の承諾に失敗しました:", error)
        alert("エラーが発生しました: " + (error instanceof Error ? error.message : "不明なエラー"))
      }
    }
  }

  const handleDeclineInvitation = async () => {
    if (selectedInvitation) {
      try {
        console.log("Declining invitation:", selectedInvitation)
        await ApiService.respondToInvitation(selectedInvitation.id, "declined")

        // データを再読み込み
        if (currentUser) {
          await loadUserData(currentUser)
        }

        setIsInvitationModalOpen(false)
        setSelectedInvitation(null)
        alert("招待を辞退しました")
      } catch (error) {
        console.error("招待の辞退に失敗しました:", error)
        alert("エラーが発生しました")
      }
    }
  }

  const handleLogin = async (user: AuthUser) => {
    setCurrentUser(user)

    // 初期設定が必要な場合は初期設定画面に遷移
    if (user.requiresInitialSetup) {
      setCurrentView("initialSetup")
    } else {
      await loadUserData(user)
    }
  }

  const handleLogout = async () => {
    await AuthService.logout()
    setCurrentUser(null)
    setCorporateList([])
    setNotifications([])
    setCurrentView("list")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedCorporate(null)
  }

  const handleBackFromRobot = () => {
    setCurrentView("list")
    setSelectedCorporate(null)
  }

  const handleBackToTopFromRobot = () => {
    setCurrentView("list")
    setSelectedCorporate(null)
  }

  const handleBackFromRegister = () => {
    setCurrentView("list")
  }

  const handleViewPastNotifications = () => {
    setCurrentView("pastNotifications")
  }

  const handleBackFromPastNotifications = () => {
    setCurrentView("list")
  }

  const handleViewUsers = () => {
    setCurrentView("userList")
  }

  const handleBackFromUsers = () => {
    setCurrentView("edit")
  }

  const handleBackToTopFromUsers = () => {
    setCurrentView("list")
    setSelectedCorporate(null)
  }

  // handleAdminSettings関数を更新してcurrentUserを渡す
  const handleAdminSettings = () => {
    setCurrentView("adminSettings")
  }

  const handleBackFromAdminSettings = () => {
    setCurrentView("list")
  }

  // システム管理者設定のハンドラーを追加
  const handleSystemAdminSettings = () => {
    setCurrentView("systemAdminSettings")
  }

  const handleBackFromSystemAdminSettings = () => {
    setCurrentView("list")
  }

  // ユーザー設定のハンドラーを追加
  const handleUserSettings = () => {
    setCurrentView("userSettings")
  }

  const handleBackFromUserSettings = () => {
    setCurrentView("list")
  }

  const handleUserUpdate = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser)
  }

  const filteredCorporateData = useMemo(() => {
    if (!searchTerm) return corporateList
    return corporateList.filter(
      (corp) =>
        corp.corporate_number.includes(searchTerm) ||
        corp.name.includes(searchTerm) ||
        corp.furigana?.includes(searchTerm),
    )
  }, [searchTerm, corporateList])

  const handleInitialSetupComplete = async (user: AuthUser) => {
    setCurrentUser(user)
    setCurrentView("list")
    await loadUserData(user)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  if (currentView === "initialSetup" && currentUser) {
    return <InitialSetup currentUser={currentUser} onSetupComplete={handleInitialSetupComplete} />
  }

  if (currentView === "userSettings") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <UserSettings
          currentUser={currentUser}
          onBack={handleBackFromUserSettings}
          onUserUpdate={handleUserUpdate}
          onLogout={handleLogout}
        />
      </div>
    )
  }

  // adminSettings画面の条件分岐を更新
  if (currentView === "adminSettings") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <AdminSettings currentUser={currentUser} onBack={handleBackFromAdminSettings} />
      </div>
    )
  }

  // システム管理者設定画面の条件分岐を追加（adminSettingsの後に）
  if (currentView === "systemAdminSettings") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <SystemAdminDashboard onBack={handleBackFromSystemAdminSettings} />
      </div>
    )
  }

  if (currentView === "pastNotifications") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <PastNotifications onBack={handleBackFromPastNotifications} />
      </div>
    )
  }

  if (currentView === "register") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <CorporateRegister onBack={handleBackFromRegister} onRegister={() => {}} />
      </div>
    )
  }

  if (currentView === "edit" && selectedCorporate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <CorporateEdit
          corporateData={selectedCorporate}
          userRole={currentUser.role}
          onBack={handleBackToList}
          onViewUsers={handleViewUsers}
        />
      </div>
    )
  }

  if (currentView === "robot" && selectedCorporate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <RobotList
          corporateData={selectedCorporate}
          currentUser={currentUser}
          onBack={handleBackFromRobot}
          onBackToTop={handleBackToTopFromRobot}
        />
      </div>
    )
  }

  if (currentView === "userList" && selectedCorporate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onPersonalSettings={handleUserSettings}
          onAdminSettings={handleAdminSettings}
          onSystemAdminSettings={handleSystemAdminSettings}
        />
        <UserList
          corporateData={selectedCorporate}
          currentUser={currentUser}
          onBack={handleBackFromUsers}
          onBackToTop={handleBackToTopFromUsers}
          userRole={currentUser.role}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onPersonalSettings={handleUserSettings}
        onAdminSettings={handleAdminSettings}
        onSystemAdminSettings={handleSystemAdminSettings}
      />
      <div className="p-6">
        <div className="max-w-none w-full px-8 mx-auto space-y-6">
          {/* Page Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">マイページ</h1>
          </div>

          {/* Debug Information */}
          {process.env.NODE_ENV === "development" && (
            <Card className="w-full border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <h3 className="font-bold text-yellow-800 mb-2">デバッグ情報</h3>
                <p className="text-sm text-yellow-700">
                  ユーザーID: {currentUser.id} | メール: {currentUser.email}
                </p>
                <p className="text-sm text-yellow-700">
                  法人数: {corporateList.length} | 招待数:{" "}
                  {corporateList.filter((c) => c.userStatus === "invited").length}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">お知らせ</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-gray-600 hover:text-gray-900"
                    onClick={handleViewPastNotifications}
                  >
                    過去のお知らせ一覧へ
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                  // 通知タイプに応じた背景色とボーダー色を決定
                  const getNotificationStyle = (type: string) => {
                    switch (type) {
                      case "warning":
                        return "bg-yellow-50 border-l-4 border-l-yellow-400 hover:bg-yellow-100"
                      case "error":
                        return "bg-red-50 border-l-4 border-l-red-400 hover:bg-red-100"
                      case "success":
                        return "bg-green-50 border-l-4 border-l-green-400 hover:bg-green-100"
                      case "info":
                      default:
                        return "bg-blue-50 border-l-4 border-l-blue-400 hover:bg-blue-100"
                    }
                  }

                  // 通知タイプに応じたアイコンを決定
                  const getNotificationIcon = (type: string) => {
                    switch (type) {
                      case "warning":
                        return "⚠️"
                      case "error":
                        return "🚨"
                      case "success":
                        return "✅"
                      case "info":
                      default:
                        return "ℹ️"
                    }
                  }

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-colors duration-200 ${getNotificationStyle(notification.type)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">{notification.title}</div>
                              {notification.content && (
                                <div className="text-sm text-gray-600 line-clamp-2">
                                  {notification.content.length > 50
                                    ? `${notification.content.substring(0, 50)}...`
                                    : notification.content}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {new Date(notification.created_at).toLocaleString("ja-JP", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <div className="text-sm">新しいお知らせはありません</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Corporate List Section */}
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="bg-gray-100 px-4 py-3 border-b">
                <h2 className="text-lg font-bold text-gray-900">担当法人一覧</h2>
              </div>

              {/* Search */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-700">検索</span>
                  <Input
                    placeholder="法人番号、法人名、フリガナ"
                    className="max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                    クリア
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-base font-bold text-gray-900">法人番号</th>
                      <th className="px-4 py-3 text-left text-base font-bold text-gray-900">法人名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredCorporateData.map((corp) => (
                      <tr
                        key={corp.id}
                        className={`transition-colors duration-200 ${
                          corp.userStatus === "invited" ? "bg-orange-50" : "hover:bg-gray-100 cursor-pointer"
                        }`}
                        onClick={() => handleRowClick(corp)}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="text-blue-600">{corp.corporate_number}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{corp.name}</span>
                            {corp.userStatus === "invited" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleInvitationConfirm(corp)
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 h-6"
                              >
                                確認する
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notification Modal */}
          <NotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            notification={selectedNotification}
          />

          {/* Invitation Response Modal */}
          <InvitationResponseModal
            isOpen={isInvitationModalOpen}
            onClose={() => setIsInvitationModalOpen(false)}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            corporateData={selectedInvitation?.corporation || { number: "", name: "" }}
          />
        </div>
      </div>
    </div>
  )
}

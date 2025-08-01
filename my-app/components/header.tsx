"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, User, FileText, LogOut, Settings, Shield } from "lucide-react"
import type { AuthUser } from "../lib/auth"

interface HeaderProps {
  currentUser?: AuthUser | null
  onLogout?: () => void
  onPersonalSettings?: () => void
  onAdminSettings?: () => void
  onSystemAdminSettings?: () => void
  showUserMenu?: boolean
}

export default function Header({
  currentUser,
  onLogout,
  onPersonalSettings,
  onAdminSettings,
  onSystemAdminSettings,
  showUserMenu = true,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handlePersonalSettings = () => {
    setIsDropdownOpen(false)
    if (onPersonalSettings) {
      onPersonalSettings()
    }
  }

  const handleAdminSettings = () => {
    setIsDropdownOpen(false)
    if (onAdminSettings) {
      onAdminSettings()
    }
  }

  const handleSystemAdminSettings = () => {
    setIsDropdownOpen(false)
    if (onSystemAdminSettings) {
      onSystemAdminSettings()
    }
  }

  const handleTrademark = () => {
    setIsDropdownOpen(false)
    alert("商標・著作権等の情報は準備中です")
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - App name */}
        <div className="text-xl font-bold text-gray-900">決算ロボット</div>

        {/* Right side - User menu (only show if user is logged in and showUserMenu is true) */}
        {showUserMenu && currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="text-sm text-gray-700">{currentUser.email}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={handlePersonalSettings}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-3" />
                    ユーザー設定
                  </button>
                  {/* 管理者のみ表示 */}
                  {currentUser.role === "admin" && (
                    <button
                      onClick={handleAdminSettings}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      管理者設定
                    </button>
                  )}
                  {/* システム管理者のみ表示 */}
                  {currentUser.role === "system_admin" && (
                    <button
                      onClick={handleSystemAdminSettings}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      システム管理者設定
                    </button>
                  )}
                  <button
                    onClick={handleTrademark}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    商標・著作権等
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    ログアウト
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

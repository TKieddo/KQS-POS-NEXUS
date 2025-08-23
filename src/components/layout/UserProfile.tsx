'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PremiumButton } from '@/components/ui/premium-button'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email || 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    if (name === 'User') return 'U'
    
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getUserInitials()}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false)
                router.push('/admin/settings/general')
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Settings
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
} 
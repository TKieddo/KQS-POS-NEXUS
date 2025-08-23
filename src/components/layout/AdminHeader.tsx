'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, User, Settings, LogOut, ChevronDown, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'

export const AdminHeader = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { selectedBranch } = useBranch()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setIsDropdownOpen(false)
      console.log('Signing out...')
      await signOut()
      console.log('Sign out successful, redirecting to login...')
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Still redirect to login even if there's an error
      router.push('/login')
    } finally {
      setIsSigningOut(false)
    }
  }

  const getUserInitials = () => {
    if (!user) return 'A'
    const name = user.user_metadata?.full_name || user.email || 'Admin'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUserDisplayName = () => {
    if (!user) return 'Admin User'
    return user.user_metadata?.full_name || user.email || 'Admin User'
  }

  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search and POS Button */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search admin panel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:bg-background"
              />
            </div>
          </div>
          
          {/* Go to POS Button */}
          <Button
            onClick={() => router.push('/pos')}
            className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-medium"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Go to POS
          </Button>
        </div>

        {/* Center - Branch Info */}
        <div className="flex items-center space-x-4">
          {selectedBranch && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-muted/50 border border-border">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-foreground">
                {selectedBranch.name}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-accent relative"
          >
            <Bell className="h-4 w-4" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                {getUserInitials()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false)
                      router.push('/admin/settings/general')
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                    Settings
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? (
                      <div className="w-4 h-4 mr-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-3 text-destructive" />
                    )}
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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
        </div>
      </div>
    </header>
  )
}

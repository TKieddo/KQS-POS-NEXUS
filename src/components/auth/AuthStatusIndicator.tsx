'use client'

import React, { useState, useEffect } from 'react'
import { Shield, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { checkAuthStatus, AuthManager } from '@/lib/auth-utils'
import { toast } from 'sonner'

export const AuthStatusIndicator: React.FC = () => {
  const { user, session, isAuthenticated } = useAuth()
  const [isChecking, setIsChecking] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)

  const checkSession = async () => {
    setIsChecking(true)
    try {
      const status = await checkAuthStatus()
      setSessionDetails(status)
      
      if (status.session) {
        const expiresAt = status.session.expires_at
        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0
        
        toast.success(`Session valid. Expires in ${Math.floor(timeUntilExpiry / 60)} minutes`)
      } else {
        toast.error('No valid session found')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      toast.error('Failed to check session status')
    } finally {
      setIsChecking(false)
    }
  }

  const refreshSession = async () => {
    setIsChecking(true)
    try {
      const success = await AuthManager.refreshSession()
      if (success) {
        toast.success('Session refreshed successfully')
        await checkSession()
      } else {
        toast.error('Failed to refresh session')
      }
    } catch (error) {
      toast.error('Error refreshing session')
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    
    if (isAuthenticated && session) {
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0
      
      if (timeUntilExpiry > 300) { // More than 5 minutes
        return <ShieldCheck className="h-4 w-4 text-green-600" />
      } else if (timeUntilExpiry > 60) { // 1-5 minutes
        return <ShieldAlert className="h-4 w-4 text-yellow-600" />
      } else { // Less than 1 minute or expired
        return <Shield className="h-4 w-4 text-red-600" />
      }
    }
    
    return <Shield className="h-4 w-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (!isAuthenticated) return 'Not Authenticated'
    
    if (session) {
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0
      
      if (timeUntilExpiry > 300) {
        return 'Session Valid'
      } else if (timeUntilExpiry > 60) {
        return 'Expires Soon'
      } else {
        return 'Session Expired'
      }
    }
    
    return 'No Session'
  }

  const getStatusVariant = () => {
    if (!isAuthenticated) return 'secondary'
    
    if (session) {
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0
      
      if (timeUntilExpiry > 300) return 'default'
      if (timeUntilExpiry > 60) return 'outline'
      return 'destructive'
    }
    
    return 'secondary'
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant={getStatusVariant()}>
          {getStatusText()}
        </Badge>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={checkSession}
          disabled={isChecking}
          className="h-7 px-2 text-xs"
        >
          Check
        </Button>
        
        {isAuthenticated && (
          <Button
            size="sm"
            variant="outline"
            onClick={refreshSession}
            disabled={isChecking}
            className="h-7 px-2 text-xs"
          >
            Refresh
          </Button>
        )}
      </div>
      
      {user && (
        <div className="text-xs text-gray-500 hidden md:block">
          {user.email}
        </div>
      )}
    </div>
  )
}

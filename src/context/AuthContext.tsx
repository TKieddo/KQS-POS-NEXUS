'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { unifiedAuthService, AuthUser, LoginCredentials } from '@/lib/unified-auth-service'

interface AuthContextType {
  user: User | null
  appUser: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  authenticatePOS: (email: string, pin: string, branchId: string) => Promise<{ error: { message: string } | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: { message: string } | null }>
  updatePassword: (password: string) => Promise<{ error: { message: string } | null }>
  canAccessAdmin: boolean
  canAccessPOS: boolean
  isPOSAuthenticated: boolean
  getPOSBranchId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// POS Authentication persistence keys
const POS_AUTH_KEY = 'pos.auth.session'
const POS_AUTH_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface POSAuthSession {
  user: AuthUser
  branchId: string
  timestamp: number
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFetchingUser, setIsFetchingUser] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  // Helper functions for POS authentication persistence
  const savePOSAuthSession = (user: AuthUser, branchId: string) => {
    try {
      if (typeof window === 'undefined') return
      
      const session: POSAuthSession = {
        user,
        branchId,
        timestamp: Date.now()
      }
      
      localStorage.setItem(POS_AUTH_KEY, JSON.stringify(session))
      // Debug logging removed for production
    } catch (error) {
      console.error('Error saving POS auth session:', error)
    }
  }

  const loadPOSAuthSession = (): POSAuthSession | null => {
    try {
      if (typeof window === 'undefined') return null
      
      const stored = localStorage.getItem(POS_AUTH_KEY)
      if (!stored) return null
      
      const session: POSAuthSession = JSON.parse(stored)
      
      // Check if session is still valid (within TTL)
      const now = Date.now()
      if (now - session.timestamp > POS_AUTH_TTL) {
        // Debug logging removed for production
        localStorage.removeItem(POS_AUTH_KEY)
        return null
      }
      
      // Debug logging removed for production
      return session
    } catch (error) {
      console.error('Error loading POS auth session:', error)
      return null
    }
  }

  const clearPOSAuthSession = () => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(POS_AUTH_KEY)
      console.log('POS auth session cleared from localStorage')
    } catch (error) {
      console.error('Error clearing POS auth session:', error)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        
        // Test Supabase connectivity first
        try {
          const { data, error } = await supabase.from('business_settings').select('id').limit(1)
          if (error) {
            console.warn('Supabase connectivity test failed:', error)
          } else {
            console.log('Supabase connectivity test passed')
          }
        } catch (connectivityError) {
          console.warn('Supabase connectivity test failed:', connectivityError)
        }
        
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            console.log('Session found, getting user data...')
            
            // Prevent duplicate calls and add debounce
            const now = Date.now()
            if (isFetchingUser || (now - lastFetchTime < 2000)) {
              console.log('Already fetching user data or too recent, skipping...')
              return
            }
            
            setIsFetchingUser(true)
            setLastFetchTime(now)
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout getting initial user data')), 15000) // 15 second timeout
            })
            
            const userPromise = unifiedAuthService.getCurrentUser()
            const current = await Promise.race([userPromise, timeoutPromise]) as AuthUser | null
            setAppUser(current)
            console.log('User data retrieved successfully')
          } catch (e) {
            console.error('Error getting initial user data:', e)
            setAppUser(null)
            // Don't fail completely if user data fetch fails
          } finally {
            setIsFetchingUser(false)
          }
        } else {
          console.log('No Supabase session found, checking for POS auth session...')
          
          // Check for POS authentication session
          const posSession = loadPOSAuthSession()
          if (posSession) {
            console.log('POS auth session found, restoring...')
            setAppUser(posSession.user)
            
            // Update the session timestamp to extend the session
            savePOSAuthSession(posSession.user, posSession.branchId)
          } else {
            console.log('No POS auth session found')
            setAppUser(null)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error getting session:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false')
      setLoading(false)
    }, 20000) // 20 second fallback

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Refresh app user on auth changes with timeout
        if (session?.user) {
          try {
            console.log('Getting user data for auth state change...')
            
            // Prevent duplicate calls and add debounce
            const now = Date.now()
            if (isFetchingUser || (now - lastFetchTime < 2000)) {
              console.log('Already fetching user data in auth listener or too recent, skipping...')
              return
            }
            
            setIsFetchingUser(true)
            setLastFetchTime(now)
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Timeout getting user data')), 15000) // 15 second timeout
            })
            
            const userPromise = unifiedAuthService.getCurrentUser()
            const current = await Promise.race([userPromise, timeoutPromise]) as AuthUser | null
            setAppUser(current)
            console.log('User data updated in auth listener')
          } catch (e) {
            console.error('Error getting user data in auth listener:', e)
            setAppUser(null)
            // Don't fail completely if user data fetch fails
          } finally {
            setIsFetchingUser(false)
          }
        } else {
          setAppUser(null)
        }

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          console.log('User signed out, clearing session data')
          clearPOSAuthSession()
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_IN') {
          console.log('User signed in successfully')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await unifiedAuthService.signIn({ email, password })
      if (result.success && result.user) {
        setAppUser(result.user)
        return { error: null }
      }
      return { error: { message: result.error || 'Sign in failed' } }
    } catch (error: any) {
      return { error: { message: error?.message || 'Sign in failed' } }
    }
  }

  const authenticatePOS = async (email: string, pin: string, branchId: string) => {
    try {
      const result = await unifiedAuthService.authenticatePOSUser(email, pin, branchId)
      if (result.success && result.user) {
        setAppUser(result.user)
        
        // Save POS authentication session for persistence
        savePOSAuthSession(result.user, branchId)
        
        return { error: null }
      }
      return { error: { message: result.error || 'POS authentication failed' } }
    } catch (error: any) {
      return { error: { message: error?.message || 'POS authentication failed' } }
    }
  }

  const signOut = async () => {
    try {
      await unifiedAuthService.signOut()
      setAppUser(null)
      setUser(null)
      setSession(null)
      
      // Clear all local storage data
      clearPOSAuthSession()
      localStorage.removeItem('pos.branch.lock')
      localStorage.removeItem('pos.branch.selected')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const result = await unifiedAuthService.resetPassword(email)
      return { error: result.success ? null : { message: result.error || 'Reset password failed' } }
    } catch (error: any) {
      return { error: { message: error?.message || 'Reset password failed' } }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const result = await unifiedAuthService.updatePassword(password)
      return { error: result.success ? null : { message: result.error || 'Update password failed' } }
    } catch (error: any) {
      return { error: { message: error?.message || 'Update password failed' } }
    }
  }

  const canAccessAdmin = unifiedAuthService.canAccessAdmin(appUser)
  const canAccessPOS = unifiedAuthService.canAccessPOS(appUser)

  // Helper functions for POS authentication
  const isPOSAuthenticated = (() => {
    try {
      if (typeof window === 'undefined') return false
      const stored = localStorage.getItem('pos.auth.session')
      if (!stored) return false
      
      const session = JSON.parse(stored)
      const now = Date.now()
      return (now - session.timestamp) <= POS_AUTH_TTL
    } catch {
      return false
    }
  })()

  const getPOSBranchId = (): string | null => {
    try {
      if (typeof window === 'undefined') return null
      const stored = localStorage.getItem('pos.auth.session')
      if (!stored) return null
      
      const session = JSON.parse(stored)
      const now = Date.now()
      if ((now - session.timestamp) > POS_AUTH_TTL) {
        return null
      }
      
      return session.branchId || null
    } catch {
      return null
    }
  }

  const value = {
    user,
    appUser,
    session,
    loading,
    signIn,
    authenticatePOS,
    signOut,
    resetPassword,
    updatePassword,
    canAccessAdmin,
    canAccessPOS,
    isPOSAuthenticated,
    getPOSBranchId
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
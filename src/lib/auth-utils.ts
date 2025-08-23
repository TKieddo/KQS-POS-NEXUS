import { supabase } from './supabase'
import { toast } from 'sonner'

// Enhanced auth utilities for handling JWT expiration
export class AuthManager {
  private static isRefreshing = false
  private static refreshPromise: Promise<boolean> | null = null

  static async ensureValidSession(): Promise<boolean> {
    try {
      // If already refreshing, wait for it
      if (this.isRefreshing && this.refreshPromise) {
        return await this.refreshPromise
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return false
      }

      if (!session) {
        console.log('No session found')
        return false
      }

      // Check if token is about to expire (within 60 seconds)
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0

      if (timeUntilExpiry < 60) {
        console.log('Token expiring soon, refreshing...')
        return await this.refreshSession()
      }

      return true
    } catch (error) {
      console.error('Error ensuring valid session:', error)
      return false
    }
  }

  static async refreshSession(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this._performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private static async _performRefresh(): Promise<boolean> {
    try {
      console.log('Attempting to refresh session...')
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Session refresh failed:', error)
        // If refresh token is invalid or missing, clear stored session and handle gracefully
        if (this.isInvalidRefreshTokenError(error)) {
          await this.clearStoredAuth()
        }
        this.handleAuthFailure()
        return false
      }

      if (data.session) {
        console.log('Session refreshed successfully')
        return true
      }

      console.log('No session returned from refresh')
      await this.clearStoredAuth()
      this.handleAuthFailure()
      return false
    } catch (error) {
      console.error('Unexpected error during session refresh:', error)
      await this.clearStoredAuth()
      this.handleAuthFailure()
      return false
    }
  }

  static handleAuthFailure() {
    const pathname = typeof window !== 'undefined' ? window.location?.pathname || '' : ''
    const isPOSRoute = pathname.startsWith('/pos')
    const isLoginRoute = pathname === '/login'
    console.log('Authentication failed.')
    
    // For POS routes (public), do NOT redirect; just notify once.
    if (isPOSRoute || isLoginRoute) {
      toast.warning('You are not signed in. Some data may be limited.')
      return
    }

    // For protected areas, redirect to login
    toast.error('Your session has expired. Please log in again.')
    // Best-effort client-side cleanup
    try { this.clearStoredAuth() } catch {}
    setTimeout(() => {
      window.location.href = '/login'
    }, 1200)
  }

  static async withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
    try {
      // Ensure we have a valid session before attempting the operation
      const hasValidSession = await this.ensureValidSession()
      if (!hasValidSession) {
        throw new Error('No valid session available')
      }

      // Attempt the operation
      return await operation()
    } catch (error: any) {
      // Check if it's an auth error
      if (this.isAuthError(error)) {
        console.log('Auth error detected, attempting session refresh...')
        
        // Try to refresh the session
        const refreshSuccess = await this.refreshSession()
        if (refreshSuccess) {
          // Retry the operation once after successful refresh
          try {
            return await operation()
          } catch (retryError: any) {
            if (this.isAuthError(retryError)) {
              this.handleAuthFailure()
            }
            throw retryError
          }
        } else {
          this.handleAuthFailure()
          throw error
        }
      }
      
      throw error
    }
  }

  static isAuthError(error: any): boolean {
    return (
      error?.code === 'PGRST301' ||
      error?.code === 'PGRST116' ||
      error?.message?.includes('JWT expired') ||
      error?.message?.includes('Invalid Refresh Token') ||
      error?.message?.includes('permission denied') ||
      error?.message?.includes('Unauthorized') ||
      (error?.status === 401)
    )
  }

  private static isInvalidRefreshTokenError(error: any): boolean {
    const message = String(error?.message || '')
    return message.includes('Invalid Refresh Token') || message.includes('Refresh Token Not Found')
  }

  private static async clearStoredAuth() {
    try {
      await supabase.auth.signOut()
    } catch {}
    try {
      if (typeof window !== 'undefined') {
        // Remove all Supabase auth tokens from localStorage
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (!key) continue
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
      }
    } catch {}
  }
}

// Enhanced database query wrapper
export async function executeWithAuth<T>(operation: () => Promise<T>): Promise<T> {
  return AuthManager.withAuthRetry(operation)
}

// Utility for checking session status
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean
  user: any
  session: any
}> {
  try {
    const { data: { session, user }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error checking auth status:', error)
      return { isAuthenticated: false, user: null, session: null }
    }

    return {
      isAuthenticated: !!session && !!user,
      user,
      session
    }
  } catch (error) {
    console.error('Unexpected error checking auth status:', error)
    return { isAuthenticated: false, user: null, session: null }
  }
}

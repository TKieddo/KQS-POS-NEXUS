'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  // Check if user is authenticated (either Supabase user or our app user)
  const isAuthenticated = !!user || !!appUser

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated and we don't require auth (e.g., login page)
        // redirect to admin dashboard
        router.push('/admin')
      }
    }
  }, [isAuthenticated, loading, requireAuth, redirectTo, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we verify your session</p>
        </div>
      </div>
    )
  }

  // If we require auth and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If we don't require auth and user is authenticated, don't render children
  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
} 
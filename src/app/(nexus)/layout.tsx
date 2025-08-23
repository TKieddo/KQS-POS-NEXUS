'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BranchProvider } from '@/context/BranchContext'
import { Loader2 } from 'lucide-react'

interface NexusLayoutProps {
  children: React.ReactNode
}

export default function NexusLayout({ children }: NexusLayoutProps) {
  const { user, appUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're not loading and have no user
    if (!loading && !user && !appUser) {
      router.push('/login?redirect=nexus')
    }
  }, [user, appUser, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading POS Nexus...</h2>
          <p className="text-gray-600">Please wait while we check your session</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user && !appUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to login...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <BranchProvider>
      <div className="min-h-screen bg-background">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </BranchProvider>
  )
}

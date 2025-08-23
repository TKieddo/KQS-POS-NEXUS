'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { Loader2 } from 'lucide-react'
import { POSInterface } from '@/features/pos/components/POSInterface'

export default function POSPage() {
  const router = useRouter()
  const { appUser } = useAuth()
  const { selectedBranch, isLocked } = useBranch()

  useEffect(() => {
    // If no branch is selected or locked, redirect to home
    if (!selectedBranch || !isLocked) {
      router.push('/')
      return
    }

    // If branch is selected but no user is authenticated, redirect to branch-specific sign-in
    if (!appUser) {
      router.push(`/pos/${encodeURIComponent(selectedBranch.name)}/sign-in`)
      return
    }
  }, [selectedBranch, isLocked, appUser, router])

  // Show loading while checking authentication
  if (!selectedBranch || !isLocked || !appUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading POS System...</h2>
          <p className="text-gray-600">Please wait while we set up your session</p>
        </div>
      </div>
    )
  }

  // Show the main POS interface
  return <POSInterface />
} 
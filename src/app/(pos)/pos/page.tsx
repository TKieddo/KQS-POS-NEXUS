'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { POSInterface } from '@/features/pos/components/POSInterface'

export default function POSPage() {
  const router = useRouter()
  const { appUser, isPOSAuthenticated, getPOSBranchId } = useAuth()
  const { selectedBranch, isLocked, isLoading: branchesLoading } = useBranch()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debug logging (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    console.log('POS Page Debug Info:', {
      appUser: appUser?.email,
      isPOSAuthenticated,
      posBranchId: getPOSBranchId(),
      selectedBranch: selectedBranch?.name,
      isLocked,
      branchesLoading,
      isInitializing,
      currentPath: window.location.pathname
    })
  }, [appUser, isPOSAuthenticated, getPOSBranchId, selectedBranch, isLocked, branchesLoading, isInitializing, isClient])

  // Wait for initial branch restoration to complete
  useEffect(() => {
    if (!isClient) return
    
    if (!branchesLoading) {
      // Give a small delay to ensure branch restoration is complete
      const timer = setTimeout(() => {
        setIsInitializing(false)
      }, 200) // Increased delay to ensure restoration completes
      return () => clearTimeout(timer)
    }
  }, [branchesLoading, isClient])

  useEffect(() => {
    if (!isClient) return
    
    // Don't make routing decisions while still initializing
    if (isInitializing || branchesLoading) {
      console.log('Still initializing, waiting for branch restoration...')
      return
    }

    console.log('Making routing decisions...', {
      selectedBranch: selectedBranch?.name,
      isLocked,
      appUser: appUser?.email,
      isPOSAuthenticated
    })

    // If no branch is selected or locked, redirect to home
    if (!selectedBranch || !isLocked) {
      console.log('No branch selected or locked, redirecting to home...')
      router.push('/')
      return
    }

    // If branch is selected but no user is authenticated, redirect to branch-specific sign-in
    if (!appUser && !isPOSAuthenticated) {
      console.log('No user authenticated, redirecting to sign-in...')
      router.push(`/pos/${encodeURIComponent(selectedBranch.name)}/sign-in`)
      return
    }

    // If POS is authenticated but branch doesn't match, redirect to correct branch
    const posBranchId = getPOSBranchId()
    if (isPOSAuthenticated && posBranchId && posBranchId !== selectedBranch.id) {
      console.log('POS authenticated for different branch, redirecting to correct branch...')
      // This will be handled by the branch-specific page
      router.push(`/pos/${encodeURIComponent(selectedBranch.name)}`)
      return
    }

    console.log('All checks passed, staying on current page')
  }, [selectedBranch, isLocked, appUser, isPOSAuthenticated, getPOSBranchId, router, isInitializing, branchesLoading, isClient])

  // Show loading while checking authentication or initializing
  if (!isClient || isInitializing || branchesLoading || !selectedBranch || !isLocked || (!appUser && !isPOSAuthenticated)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading POS System...</h2>
          <p className="text-gray-600">
            {!isClient ? 'Initializing...' :
             branchesLoading ? 'Loading branches...' : 
             isInitializing ? 'Restoring your session...' : 
             'Please wait while we set up your session'}
          </p>
          
          {/* Show authentication status (client-side only) */}
          {isClient && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                {isPOSAuthenticated ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">POS Session Restored</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">Checking Authentication...</span>
                  </>
                )}
              </div>
              {selectedBranch && (
                <p className="text-xs text-gray-600 mt-1">Branch: {selectedBranch.name}</p>
              )}
              {isPOSAuthenticated && (() => {
                try {
                  const session = JSON.parse(localStorage.getItem('pos.auth.session') || '{}')
                  const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - (session.timestamp || 0))
                  const hoursLeft = Math.max(0, Math.round(timeLeft / (60 * 60 * 1000)))
                  return (
                    <p className="text-xs text-green-600 mt-1">
                      Session expires in {hoursLeft} hours
                    </p>
                  )
                } catch {
                  return null
                }
              })()}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show the main POS interface
  return <POSInterface />
} 
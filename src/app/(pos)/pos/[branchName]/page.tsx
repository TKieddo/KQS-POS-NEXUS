'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Branch {
  id: string
  name: string
  address: string | null
  is_active: boolean
}

interface BranchPOSPageProps {
  params: Promise<{
    branchName: string
  }>
}

export default function BranchPOSPage({ params }: BranchPOSPageProps) {
  const router = useRouter()
  const { user, appUser } = useAuth()
  const { selectedBranch, setSelectedBranch, lockBranchSelection } = useBranch()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use React.use() to unwrap the params promise
  const { branchName } = React.use(params)
  const decodedBranchName = decodeURIComponent(branchName)

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch branch by name
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, address, is_active')
          .eq('name', decodedBranchName)
          .eq('is_active', true)
          .single()

        if (error) {
          console.error('Error fetching branch:', error)
          setError('Branch not found or inactive')
          return
        }

        if (!data) {
          setError('Branch not found')
          return
        }

        setBranch(data)
        
        // Set the branch in context and lock it
        setSelectedBranch(data)
        lockBranchSelection()

      } catch (error) {
        console.error('Error fetching branch:', error)
        setError('Failed to load branch information')
      } finally {
        setLoading(false)
      }
    }

    fetchBranch()
  }, [decodedBranchName, setSelectedBranch, lockBranchSelection])

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && branch && !appUser) {
      router.push(`/pos/${encodeURIComponent(branch.name)}/sign-in`)
    }
  }, [loading, branch, appUser, router])

  // If authenticated and branch is set, redirect to main POS
  useEffect(() => {
    if (!loading && branch && appUser && selectedBranch) {
      router.push('/pos')
    }
  }, [loading, branch, appUser, selectedBranch, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading {decodedBranchName} POS...</h2>
          <p className="text-gray-600">Please wait while we set up your branch</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg mb-4">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900">Branch Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              The branch "{decodedBranchName}" could not be found or is not active.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // This should not render normally as we redirect above
  return null
}

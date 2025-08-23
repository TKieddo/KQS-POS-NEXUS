'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, ArrowLeft, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Branch {
  id: string
  name: string
  address: string | null
  is_active: boolean
}

interface BranchSignInPageProps {
  params: Promise<{
    branchName: string
  }>
}

export default function BranchSignInPage({ params }: BranchSignInPageProps) {
  const router = useRouter()
  const { authenticatePOS } = useAuth()
  const { selectedBranch, setSelectedBranch, unlockBranchSelection } = useBranch()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')

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
        setSelectedBranch(data)

      } catch (error) {
        console.error('Error fetching branch:', error)
        setError('Failed to load branch information')
      } finally {
        setLoading(false)
      }
    }

    fetchBranch()
  }, [decodedBranchName, setSelectedBranch])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!branch) return

    setSigningIn(true)
    setError(null)

    try {
      const result = await authenticatePOS(email, pin, branch.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        // Success - redirect to main POS
        router.push('/pos')
      }
    } catch (error) {
      console.error('Sign-in error:', error)
      setError('An unexpected error occurred')
    } finally {
      setSigningIn(false)
    }
  }

  const handleGoBack = () => {
    unlockBranchSelection()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
            <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></Loader2>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading {decodedBranchName}...</h2>
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
              onClick={handleGoBack}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!branch) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-green-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="absolute -top-16 left-0 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back to Select Branch
        </Button>

        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{branch.name}</h1>
          <p className="text-gray-600">Point of Sale Access</p>
          {branch.address && (
            <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
          )}
        </div>

        {/* Sign In Form */}
        <Card className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">Sign In to POS</CardTitle>
            <p className="text-gray-600">Enter your credentials to access the POS system</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700">
                  PIN Code
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="h-12 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={signingIn}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white font-medium rounded-xl"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In to POS'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 KQS POS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

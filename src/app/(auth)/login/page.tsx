'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Store } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, appUser, loading } = useAuth()

  // Check if user is already authenticated
  const isAuthenticated = !!user || !!appUser

  useEffect(() => {
    // If user is already authenticated, redirect them to the appropriate system
    if (!loading && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || 'admin'
      
      switch (redirectTo) {
        case 'nexus':
          router.push('/nexus')
          break
        case 'pos':
          router.push('/pos')
          break
        case 'admin':
        default:
          router.push('/admin')
          break
      }
    }
  }, [isAuthenticated, loading, router, searchParams])

  const handleLoginSuccess = () => {
    // Check if there's a redirect parameter or determine from referrer
    const redirectTo = searchParams.get('redirect') || 'admin'
    
    // Redirect to the appropriate system
    switch (redirectTo) {
      case 'nexus':
        router.push('/nexus')
        break
      case 'pos':
        router.push('/pos')
        break
      case 'admin':
      default:
        router.push('/admin')
        break
    }
  }

  const handleForgotPassword = () => {
    router.push('/forgot-password')
  }

  // Show loading if checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking session...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KQS POS</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <LoginForm
          onSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
        />

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
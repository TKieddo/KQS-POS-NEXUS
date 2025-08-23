import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, AlertTriangle, CheckCircle } from 'lucide-react'
import { PremiumInput } from '@/components/ui/premium-input'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { useAuth } from '@/context/AuthContext'

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  className
}) => {
  const { signIn } = useAuth()
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Add a timeout to prevent hanging - increased to 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 30000) // 30 second timeout
      })

      const authPromise = signIn(credentials.email, credentials.password)
      
      const result = await Promise.race([authPromise, timeoutPromise]) as any
      
      if (!result.error) {
        setSuccess('Successfully signed in')
        // Remove the delay and call onSuccess immediately
        onSuccess?.()
      } else {
        setError(result.error.message || 'Sign in failed')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.message === 'Authentication timeout') {
        setError('Authentication is taking too long. Please try again or contact support.')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const isFormValid = credentials.email.trim() && credentials.password.trim()

  return (
    <PremiumCard className={`p-8 max-w-md w-full ${className}`}>
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 bg-[#E5FF29] rounded-full flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-gray-900" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Success:</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <PremiumInput
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <PremiumInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-[#E5FF29] hover:text-[#E5FF29]/80 font-medium"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>

        <PremiumButton
          type="submit"
          className="w-full"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </PremiumButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-[#E5FF29] hover:text-[#E5FF29]/80 font-medium"
            disabled={loading}
          >
            Contact your administrator
          </button>
        </p>
      </div>
    </PremiumCard>
  )
} 
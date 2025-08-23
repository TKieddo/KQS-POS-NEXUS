import React, { useState } from 'react'
import { Shield, Lock, Clock, AlertTriangle, Users, Activity, Eye, Key, RefreshCw } from 'lucide-react'
import { SecurityToggle } from '@/components/ui/security-toggle'
import { SecurityNumberInput } from '@/components/ui/security-number-input'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { useSecuritySettings } from '../hooks/useSecuritySettings'
import { SecuritySettings } from '@/lib/user-management-service'

export const SecuritySettingsForm: React.FC = () => {
  const {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults,
    validateSettings
  } = useSecuritySettings()

  const [updating, setUpdating] = useState<string | null>(null)
  const [localSettings, setLocalSettings] = useState<SecuritySettings | null>(null)

  // Initialize local settings when settings load
  React.useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings)
    }
  }, [settings, localSettings])

  const handleToggleChange = async (key: keyof SecuritySettings, value: boolean) => {
    if (!localSettings) return

    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)

    setUpdating(key)
    const success = await updateSettings({ [key]: value })
    setUpdating(null)

    if (!success) {
      // Revert on failure
      setLocalSettings(settings)
    }
  }

  const handleNumberChange = async (key: keyof SecuritySettings, value: number) => {
    if (!localSettings) return

    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)

    setUpdating(key)
    const success = await updateSettings({ [key]: value })
    setUpdating(null)

    if (!success) {
      // Revert on failure
      setLocalSettings(settings)
    }
  }

  const handleResetToDefaults = async () => {
    if (confirm('Are you sure you want to reset all security settings to defaults?')) {
      await resetToDefaults()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
      </div>
    )
  }

  if (!localSettings) {
    return (
      <div className="text-center text-gray-500">
        Failed to load security settings
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <p className="text-gray-600 mt-1">
            Configure authentication and security policies for your system
          </p>
        </div>
        <PremiumButton
          onClick={handleResetToDefaults}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset to Defaults</span>
        </PremiumButton>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Password Settings */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Key className="h-5 w-5 text-[#E5FF29]" />
          <span>Password Policies</span>
        </h3>
        
        <div className="space-y-4">
          <SecurityNumberInput
            title="Password Minimum Length"
            description="Minimum required length for user passwords"
            value={localSettings.password_min_length}
            onChange={(value) => handleNumberChange('password_min_length', value)}
            min={6}
            max={50}
            unit="characters"
            icon={<Key className="h-5 w-5" />}
            loading={updating === 'password_min_length'}
            variant={localSettings.password_min_length >= 12 ? 'success' : 'default'}
          />

          <SecurityToggle
            title="Require Password Complexity"
            description="Enforce strong password requirements (uppercase, lowercase, numbers, special characters)"
            enabled={localSettings.password_complexity}
            onToggle={(value) => handleToggleChange('password_complexity', value)}
            icon={<Shield className="h-5 w-5" />}
            loading={updating === 'password_complexity'}
            variant={localSettings.password_complexity ? 'success' : 'warning'}
          />

          <SecurityNumberInput
            title="Password Expiry"
            description="Days before password expires and requires change"
            value={localSettings.password_expiry_days}
            onChange={(value) => handleNumberChange('password_expiry_days', value)}
            min={1}
            max={365}
            unit="days"
            icon={<Clock className="h-5 w-5" />}
            loading={updating === 'password_expiry_days'}
            variant={localSettings.password_expiry_days <= 90 ? 'success' : 'warning'}
          />
        </div>
      </PremiumCard>

      {/* Session & Login Settings */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="h-5 w-5 text-[#E5FF29]" />
          <span>Session & Login Management</span>
        </h3>
        
        <div className="space-y-4">
          <SecurityNumberInput
            title="Session Timeout"
            description="How long before user sessions expire"
            value={localSettings.session_timeout}
            onChange={(value) => handleNumberChange('session_timeout', value)}
            min={15}
            max={1440}
            unit="minutes"
            icon={<Clock className="h-5 w-5" />}
            loading={updating === 'session_timeout'}
            variant={localSettings.session_timeout <= 480 ? 'success' : 'warning'}
          />

          <SecurityNumberInput
            title="Max Login Attempts"
            description="Maximum failed login attempts before lockout"
            value={localSettings.max_login_attempts}
            onChange={(value) => handleNumberChange('max_login_attempts', value)}
            min={1}
            max={20}
            unit="attempts"
            icon={<Lock className="h-5 w-5" />}
            loading={updating === 'max_login_attempts'}
            variant={localSettings.max_login_attempts <= 5 ? 'success' : 'warning'}
          />

          <SecurityNumberInput
            title="Lockout Duration"
            description="How long to lock account after failed attempts"
            value={localSettings.lockout_duration}
            onChange={(value) => handleNumberChange('lockout_duration', value)}
            min={5}
            max={1440}
            unit="minutes"
            icon={<Lock className="h-5 w-5" />}
            loading={updating === 'lockout_duration'}
            variant={localSettings.lockout_duration >= 15 ? 'success' : 'warning'}
          />
        </div>
      </PremiumCard>

      {/* Security Features */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-[#E5FF29]" />
          <span>Security Features</span>
        </h3>
        
        <div className="space-y-4">
          <SecurityToggle
            title="Enable Two-Factor Authentication"
            description="Require 2FA for all users (requires additional setup)"
            enabled={localSettings.two_factor_auth}
            onToggle={(value) => handleToggleChange('two_factor_auth', value)}
            icon={<Shield className="h-5 w-5" />}
            loading={updating === 'two_factor_auth'}
            variant="warning"
            disabled={true} // TODO: Implement 2FA
          />

          <SecurityToggle
            title="Account Lockout After Failed Attempts"
            description="Lock accounts after multiple failed logins"
            enabled={localSettings.account_lockout}
            onToggle={(value) => handleToggleChange('account_lockout', value)}
            icon={<Lock className="h-5 w-5" />}
            loading={updating === 'account_lockout'}
            variant={localSettings.account_lockout ? 'success' : 'warning'}
          />

          <SecurityToggle
            title="Require Password Change"
            description="Force password change on first login"
            enabled={localSettings.require_password_change}
            onToggle={(value) => handleToggleChange('require_password_change', value)}
            icon={<Key className="h-5 w-5" />}
            loading={updating === 'require_password_change'}
            variant={localSettings.require_password_change ? 'success' : 'default'}
          />

          <SecurityToggle
            title="Allow Audit Log Access"
            description="Allow users to view audit logs"
            enabled={localSettings.audit_log_access}
            onToggle={(value) => handleToggleChange('audit_log_access', value)}
            icon={<Eye className="h-5 w-5" />}
            loading={updating === 'audit_log_access'}
            variant="warning"
          />

          <SecurityToggle
            title="Enable User Activity Logging"
            description="Log all user activities for audit"
            enabled={localSettings.enable_user_activity_logging}
            onToggle={(value) => handleToggleChange('enable_user_activity_logging', value)}
            icon={<Activity className="h-5 w-5" />}
            loading={updating === 'enable_user_activity_logging'}
            variant={localSettings.enable_user_activity_logging ? 'success' : 'warning'}
          />
        </div>
      </PremiumCard>

      {/* User Management */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5 text-[#E5FF29]" />
          <span>User Management</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">
                Default User Role
              </h4>
              <p className="text-sm text-gray-600">
                Default role assigned to new users
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
              {localSettings.default_user_role}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Security Status */}
      <PremiumCard className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span>Security Status</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              Password Policy: {localSettings.password_complexity ? 'Strong' : 'Basic'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              Account Lockout: {localSettings.account_lockout ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              Session Timeout: {localSettings.session_timeout} minutes
            </span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              Activity Logging: {localSettings.enable_user_activity_logging ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </PremiumCard>
    </div>
  )
} 
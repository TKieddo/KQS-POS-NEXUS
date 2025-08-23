import { useState, useEffect, useCallback } from 'react'
import { SecuritySettings } from '@/lib/user-management-service'

interface UseSecuritySettingsReturn {
  settings: SecuritySettings | null
  loading: boolean
  error: string | null
  updateSettings: (updates: Partial<SecuritySettings>) => Promise<boolean>
  resetToDefaults: () => Promise<void>
  validateSettings: (settings: Partial<SecuritySettings>) => { valid: boolean; errors: string[] }
}

export const useSecuritySettings = (): UseSecuritySettingsReturn => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load security settings
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings/security', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load security settings')
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update security settings
  const updateSettings = useCallback(async (updates: Partial<SecuritySettings>): Promise<boolean> => {
    try {
      setError(null)
      
      // Validate the updates
      const validation = validateSettings(updates)
      if (!validation.valid) {
        setError(validation.errors.join(', '))
        return false
      }

      const response = await fetch('/api/settings/security', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update security settings')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update security settings')
      return false
    }
  }, [])

  // Reset to default settings
  const resetToDefaults = useCallback(async () => {
    // Get the cashier role ID for default settings
    const response = await fetch('/api/settings/security', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let defaultSettings: SecuritySettings
    if (response.ok) {
      defaultSettings = await response.json()
    } else {
      // Fallback default settings
      defaultSettings = {
        password_min_length: 8,
        password_complexity: true,
        session_timeout: 480,
        max_login_attempts: 5,
        lockout_duration: 30,
        password_expiry_days: 90,
        two_factor_auth: false,
        account_lockout: true,
        audit_log_access: false,
        require_password_change: true,
        enable_user_activity_logging: true,
        default_user_role: ''
      }
    }

    await updateSettings(defaultSettings)
  }, [updateSettings])

  // Validate settings
  const validateSettings = useCallback((settings: Partial<SecuritySettings>): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (settings.password_min_length !== undefined) {
      if (settings.password_min_length < 6) {
        errors.push('Password minimum length must be at least 6 characters')
      }
      if (settings.password_min_length > 50) {
        errors.push('Password minimum length cannot exceed 50 characters')
      }
    }

    if (settings.session_timeout !== undefined) {
      if (settings.session_timeout < 15) {
        errors.push('Session timeout must be at least 15 minutes')
      }
      if (settings.session_timeout > 1440) {
        errors.push('Session timeout cannot exceed 24 hours (1440 minutes)')
      }
    }

    if (settings.max_login_attempts !== undefined) {
      if (settings.max_login_attempts < 1) {
        errors.push('Maximum login attempts must be at least 1')
      }
      if (settings.max_login_attempts > 20) {
        errors.push('Maximum login attempts cannot exceed 20')
      }
    }

    if (settings.lockout_duration !== undefined) {
      if (settings.lockout_duration < 5) {
        errors.push('Lockout duration must be at least 5 minutes')
      }
      if (settings.lockout_duration > 1440) {
        errors.push('Lockout duration cannot exceed 24 hours (1440 minutes)')
      }
    }

    if (settings.password_expiry_days !== undefined) {
      if (settings.password_expiry_days < 1) {
        errors.push('Password expiry must be at least 1 day')
      }
      if (settings.password_expiry_days > 365) {
        errors.push('Password expiry cannot exceed 1 year (365 days)')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetToDefaults,
    validateSettings
  }
} 
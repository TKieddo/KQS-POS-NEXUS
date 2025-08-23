import { useState, useEffect, useCallback } from 'react'
import { getTillSettings, updateTillSetting, updateTillSettings, type TillSettings } from '@/lib/till-settings-service'

interface UseTillSettingsReturn {
  settings: TillSettings | null
  loading: boolean
  saving: boolean
  error: string | null
  updateSetting: (key: keyof TillSettings, value: any) => Promise<void>
  updateSettings: (updates: Partial<TillSettings>) => Promise<void>
  refreshSettings: () => Promise<void>
}

export const useTillSettings = (branchId: string | undefined): UseTillSettingsReturn => {
  const [settings, setSettings] = useState<TillSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    if (!branchId || branchId === 'global') {
      setSettings(null)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const settingsData = await getTillSettings(branchId)
      setSettings(settingsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load till settings'
      setError(errorMessage)
      console.error('Error loading till settings:', err)
    } finally {
      setLoading(false)
    }
  }, [branchId])

  const updateSetting = useCallback(async (key: keyof TillSettings, value: any) => {
    if (!branchId || branchId === 'global') {
      setError('Please select a branch to update settings')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const updatedSettings = await updateTillSetting(branchId, key, value)
      setSettings(updatedSettings)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update setting'
      setError(errorMessage)
      console.error('Error updating till setting:', err)
    } finally {
      setSaving(false)
    }
  }, [branchId])

  const updateSettings = useCallback(async (updates: Partial<TillSettings>) => {
    if (!branchId || branchId === 'global') {
      setError('Please select a branch to update settings')
      return
    }

    setSaving(true)
    setError(null)
    
    try {
      const updatedSettings = await updateTillSettings(branchId, updates)
      setSettings(updatedSettings)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      setError(errorMessage)
      console.error('Error updating till settings:', err)
    } finally {
      setSaving(false)
    }
  }, [branchId])

  const refreshSettings = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  // Load settings when branchId changes
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    updateSettings,
    refreshSettings
  }
} 
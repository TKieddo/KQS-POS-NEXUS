'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { loadSettings, saveSettings, clearSettingsCache, verifySettings } from '@/lib/remaining-settings-service'
import type {
  TillCashSettings,
  UserManagementSettings,
  PrintingSettings,
  NotificationsSettings,
  ReportsSettings,
  DataManagementSettings,
  AdvancedSettings
} from '@/lib/remaining-settings-service'

interface SettingsState<T> {
  settings: T
  originalSettings: T
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean
  error: string | null
}

export function useRemainingSettings<T>(category: string) {
  const { selectedBranch } = useBranch()
  const [state, setState] = useState<SettingsState<T>>({
    settings: {} as T,
    originalSettings: {} as T,
    isLoading: true,
    isSaving: false,
    hasChanges: false,
    error: null
  })

  // Load settings from database
  const loadSettingsFromDB = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // If no branch selected (Central Warehouse), load global settings
      // If branch selected, load branch-specific settings
      const settings = await loadSettings(category, selectedBranch?.id)
      
      setState(prev => ({
        ...prev,
        settings,
        originalSettings: settings,
        isLoading: false,
        hasChanges: false
      }))
    } catch (error: any) {
      console.error(`Error loading ${category} settings:`, error)
      setState(prev => ({
        ...prev,
        error: error.message || `Failed to load ${category} settings`,
        isLoading: false
      }))
    }
  }

  // Save settings to database
  const saveSettingsToDB = async () => {
    setState(prev => ({ ...prev, isSaving: true, error: null }))
    
    try {
      // If no branch selected (Central Warehouse), save to global settings
      // If branch selected, save to branch-specific settings
      const success = await saveSettings(category, state.settings, selectedBranch?.id)
      
      if (success) {
        // Verify what was saved
        await verifySettings(category, selectedBranch?.id)
        
        setState(prev => ({
          ...prev,
          originalSettings: prev.settings,
          isSaving: false,
          hasChanges: false
        }))
        return { success: true }
      } else {
        throw new Error(`Failed to save ${category} settings`)
      }
    } catch (error: any) {
      console.error(`Error saving ${category} settings:`, error)
      setState(prev => ({
        ...prev,
        error: error.message || `Failed to save ${category} settings`,
        isSaving: false
      }))
      return { success: false, error: error.message }
    }
  }

  // Reset settings to original values
  const resetSettings = () => {
    setState(prev => ({
      ...prev,
      settings: prev.originalSettings,
      hasChanges: false,
      error: null
    }))
  }

  // Update a specific setting
  const updateSetting = (key: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
      hasChanges: JSON.stringify({ ...prev.settings, [key]: value }) !== JSON.stringify(prev.originalSettings),
      error: null
    }))
  }

  // Update multiple settings at once
  const updateSettings = (updates: Partial<T>) => {
    setState(prev => {
      const newSettings = { ...prev.settings, ...updates }
      return {
        ...prev,
        settings: newSettings,
        hasChanges: JSON.stringify(newSettings) !== JSON.stringify(prev.originalSettings),
        error: null
      }
    })
  }

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  // Refresh settings from database
  const refreshSettings = async () => {
    clearSettingsCache()
    await loadSettingsFromDB()
  }

  // Load settings when component mounts or branch changes
  useEffect(() => {
    loadSettingsFromDB()
  }, [selectedBranch?.id, category]) // Use selectedBranch?.id to handle null case

  return {
    // State
    settings: state.settings,
    originalSettings: state.originalSettings,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    hasChanges: state.hasChanges,
    error: state.error,
    
    // Actions
    updateSetting,
    updateSettings,
    saveSettings: saveSettingsToDB,
    resetSettings,
    clearError,
    refreshSettings
  }
}

// Specific hooks for each settings category
export function useTillCashSettings() {
  return useRemainingSettings<TillCashSettings>('till')
}

export function useUserManagementSettings() {
  return useRemainingSettings<UserManagementSettings>('user')
}

export function usePrintingSettings() {
  return useRemainingSettings<PrintingSettings>('printing')
}

export function useNotificationsSettings() {
  return useRemainingSettings<NotificationsSettings>('notifications')
}

export function useReportsSettings() {
  return useRemainingSettings<ReportsSettings>('system')
}

export function useDataManagementSettings() {
  return useRemainingSettings<DataManagementSettings>('data')
}

export function useAdvancedSettings() {
  return useRemainingSettings<AdvancedSettings>('advanced')
} 
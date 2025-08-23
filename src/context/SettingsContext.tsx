'use client'

// Settings Context
// Provides settings state and operations throughout the application

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useBranch } from './BranchContext'
import { settingsService, type BusinessSettings } from '@/lib/settings-service'

// ========================================
// STATE TYPES
// ========================================

interface SettingsState {
  // Business settings
  businessSettings: BusinessSettings | null
  settingsLoading: boolean
  settingsError: string | null
  
  // Update states
  isUpdating: boolean
  updateError: string | null
  
  // Cache
  lastUpdated: number
}

// ========================================
// ACTION TYPES
// ========================================

type SettingsAction =
  | { type: 'SET_SETTINGS_LOADING'; payload: boolean }
  | { type: 'SET_SETTINGS'; payload: BusinessSettings | null }
  | { type: 'SET_SETTINGS_ERROR'; payload: string | null }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_UPDATE_ERROR'; payload: string | null }
  | { type: 'UPDATE_SETTING'; payload: Partial<BusinessSettings> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'REFRESH_TIMESTAMP' }

// ========================================
// INITIAL STATE
// ========================================

const initialState: SettingsState = {
  businessSettings: null,
  settingsLoading: false,
  settingsError: null,
  
  isUpdating: false,
  updateError: null,
  
  lastUpdated: 0
}

// ========================================
// REDUCER
// ========================================

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_SETTINGS_LOADING':
      return { ...state, settingsLoading: action.payload }
    
    case 'SET_SETTINGS':
      return { 
        ...state, 
        businessSettings: action.payload,
        settingsError: null,
        lastUpdated: Date.now()
      }
    
    case 'SET_SETTINGS_ERROR':
      return { ...state, settingsError: action.payload }
    
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload }
    
    case 'SET_UPDATE_ERROR':
      return { ...state, updateError: action.payload }
    
    case 'UPDATE_SETTING':
      return {
        ...state,
        businessSettings: state.businessSettings ? {
          ...state.businessSettings,
          ...action.payload,
          updated_at: new Date().toISOString()
        } : null,
        lastUpdated: Date.now()
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        settingsError: null,
        updateError: null
      }
    
    case 'REFRESH_TIMESTAMP':
      return {
        ...state,
        lastUpdated: Date.now()
      }
    
    default:
      return state
  }
}

// ========================================
// CONTEXT
// ========================================

interface SettingsContextValue {
  // State
  businessSettings: BusinessSettings | null
  settingsLoading: boolean
  settingsError: string | null
  isUpdating: boolean
  updateError: string | null
  lastUpdated: number
  
  // Actions
  loadSettings: () => Promise<void>
  updateSetting: (key: keyof BusinessSettings, value: any) => Promise<boolean>
  refreshSettings: () => Promise<void>
  clearErrors: () => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

// ========================================
// PROVIDER
// ========================================

interface SettingsProviderProps {
  children: React.ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [state, dispatch] = useReducer(settingsReducer, initialState)
  const { selectedBranch } = useBranch()

  // Load settings
  const loadSettings = useCallback(async () => {
    dispatch({ type: 'SET_SETTINGS_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERRORS' })
    
    try {
      const settings = await settingsService.loadSettings()
      dispatch({ type: 'SET_SETTINGS', payload: settings })
    } catch (error) {
      console.error('Error loading settings:', error)
      dispatch({ 
        type: 'SET_SETTINGS_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load settings' 
      })
    } finally {
      dispatch({ type: 'SET_SETTINGS_LOADING', payload: false })
    }
  }, [])

  // Update setting
  const updateSetting = useCallback(async (key: keyof BusinessSettings, value: any) => {
    dispatch({ type: 'SET_UPDATING', payload: true })
    dispatch({ type: 'SET_UPDATE_ERROR', payload: null })
    
    try {
      const success = await settingsService.updateSetting(key, value)
      if (success) {
        dispatch({ type: 'UPDATE_SETTING', payload: { [key]: value } })
        return true
      } else {
        throw new Error('Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      dispatch({ 
        type: 'SET_UPDATE_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to update setting' 
      })
      return false
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false })
    }
  }, [])

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    try {
      await settingsService.refreshSettings()
      await loadSettings()
    } catch (error) {
      console.error('Error refreshing settings:', error)
    }
  }, [loadSettings])

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Refresh settings when branch changes
  useEffect(() => {
    if (selectedBranch) {
      refreshSettings()
    }
  }, [selectedBranch, refreshSettings])

  const value: SettingsContextValue = {
    // State
    businessSettings: state.businessSettings,
    settingsLoading: state.settingsLoading,
    settingsError: state.settingsError,
    isUpdating: state.isUpdating,
    updateError: state.updateError,
    lastUpdated: state.lastUpdated,
    
    // Actions
    loadSettings,
    updateSetting,
    refreshSettings,
    clearErrors
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

// ========================================
// HOOKS
// ========================================

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export function useBusinessSettings() {
  const { businessSettings, settingsLoading, settingsError } = useSettings()
  return { businessSettings, settingsLoading, settingsError }
}

export function useSetting<T>(key: keyof BusinessSettings): T | undefined {
  const { businessSettings } = useSettings()
  return businessSettings?.[key] as T | undefined
}

export function useCurrencySettings() {
  const { businessSettings } = useSettings()
  return {
    currency: businessSettings?.currency || 'ZAR',
    currencySymbol: businessSettings?.currency_symbol || 'R',
    decimalPlaces: businessSettings?.decimal_places || 2
  }
}

export function useTaxSettings() {
  const { businessSettings } = useSettings()
  return {
    taxRate: businessSettings?.tax_rate || 15.0,
    taxName: businessSettings?.tax_name || 'VAT'
  }
}

export function useLocalizationSettings() {
  const { businessSettings } = useSettings()
  return {
    language: businessSettings?.language || 'en',
    timezone: businessSettings?.timezone || 'Africa/Johannesburg',
    dateFormat: businessSettings?.date_format || 'DD/MM/YYYY',
    timeFormat: businessSettings?.time_format || '24'
  }
}

export function useBusinessInfo() {
  const { businessSettings } = useSettings()
  return {
    businessName: businessSettings?.business_name || 'My Business',
    businessAddress: businessSettings?.business_address || '',
    businessPhone: businessSettings?.business_phone || '',
    businessEmail: businessSettings?.business_email || '',
    businessWebsite: businessSettings?.business_website || '',
    logoUrl: businessSettings?.logo_url || ''
  }
} 
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface DayHours {
  open: string
  close: string
  closed: boolean
}

interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

interface BusinessInfoData {
  business_name: string
  business_address: string
  business_phone: string
  business_email: string
  business_website: string
  logo_url: string
  business_hours: BusinessHours
}

interface GeneralSettingsData {
  currency: string
  currency_symbol: string
  timezone: string
  language: string
  date_format: string
  time_format: string
  decimal_places: string
  tax_rate: string
  tax_name: string
  auto_backup: boolean
  backup_frequency: string
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
}

interface SettingsState {
  businessInfo: BusinessInfoData
  generalSettings: GeneralSettingsData
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean
  errors: Record<string, string>
}

const defaultBusinessHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '15:00', closed: false },
  sunday: { open: '', close: '', closed: true }
}

const defaultBusinessInfo: BusinessInfoData = {
  business_name: '',
  business_address: '',
  business_phone: '',
  business_email: '',
  business_website: '',
  logo_url: '',
  business_hours: defaultBusinessHours
}

const defaultGeneralSettings: GeneralSettingsData = {
  currency: 'ZAR',
  currency_symbol: 'R',
  timezone: 'Africa/Johannesburg',
  language: 'en',
  date_format: 'DD/MM/YYYY',
  time_format: '24',
  decimal_places: '2',
  tax_rate: '15.00',
  tax_name: 'VAT',
  auto_backup: true,
  backup_frequency: 'daily',
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false
}

export const useSettings = () => {
  const [state, setState] = useState<SettingsState>({
    businessInfo: defaultBusinessInfo,
    generalSettings: defaultGeneralSettings,
    isLoading: true,
    isSaving: false,
    hasChanges: false,
    errors: {}
  })

  // Load settings from database
  const loadSettings = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        // Parse business hours from JSON string if it exists
        let businessHours = defaultBusinessHours
        if (data.business_hours) {
          try {
            businessHours = typeof data.business_hours === 'string' 
              ? JSON.parse(data.business_hours) 
              : data.business_hours
          } catch (e) {
            console.error('Error parsing business hours:', e)
          }
        }

        const businessInfo: BusinessInfoData = {
          business_name: data.business_name || '',
          business_address: data.business_address || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          business_website: data.business_website || '',
          logo_url: data.logo_url || '',
          business_hours: businessHours
        }

        const generalSettings: GeneralSettingsData = {
          currency: data.currency || 'ZAR',
          currency_symbol: data.currency_symbol || 'R',
          timezone: data.timezone || 'Africa/Johannesburg',
          language: data.language || 'en',
          date_format: data.date_format || 'DD/MM/YYYY',
          time_format: data.time_format || '24',
          decimal_places: data.decimal_places?.toString() || '2',
          tax_rate: data.tax_rate?.toString() || '15.00',
          tax_name: data.tax_name || 'VAT',
          auto_backup: data.auto_backup ?? true,
          backup_frequency: data.backup_frequency || 'daily',
          notifications_enabled: data.notifications_enabled ?? true,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false
        }

        setState(prev => ({
          ...prev,
          businessInfo,
          generalSettings,
          isLoading: false,
          hasChanges: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setState(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }

  // Update business info
  const updateBusinessInfo = (businessInfo: BusinessInfoData) => {
    setState(prev => ({
      ...prev,
      businessInfo,
      hasChanges: true
    }))
  }

  // Update general settings
  const updateGeneralSettings = (generalSettings: GeneralSettingsData) => {
    setState(prev => ({
      ...prev,
      generalSettings,
      hasChanges: true
    }))
  }

  // Save all settings
  const saveSettings = async () => {
    setState(prev => ({ ...prev, isSaving: true }))
    
    try {
      const { data: existingSettings } = await supabase
        .from('business_settings')
        .select('id')
        .limit(1)
        .single()

      const settingsData = {
        // Business info
        business_name: state.businessInfo.business_name,
        business_address: state.businessInfo.business_address,
        business_phone: state.businessInfo.business_phone,
        business_email: state.businessInfo.business_email,
        business_website: state.businessInfo.business_website,
        logo_url: state.businessInfo.logo_url,
        business_hours: JSON.stringify(state.businessInfo.business_hours),
        
        // General settings
        currency: state.generalSettings.currency,
        currency_symbol: state.generalSettings.currency_symbol,
        timezone: state.generalSettings.timezone,
        language: state.generalSettings.language,
        date_format: state.generalSettings.date_format,
        time_format: state.generalSettings.time_format,
        decimal_places: parseInt(state.generalSettings.decimal_places),
        tax_rate: parseFloat(state.generalSettings.tax_rate),
        tax_name: state.generalSettings.tax_name,
        auto_backup: state.generalSettings.auto_backup,
        backup_frequency: state.generalSettings.backup_frequency,
        notifications_enabled: state.generalSettings.notifications_enabled,
        email_notifications: state.generalSettings.email_notifications,
        sms_notifications: state.generalSettings.sms_notifications,
        
        updated_at: new Date().toISOString()
      }

      let result
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('business_settings')
          .update(settingsData)
          .eq('id', existingSettings.id)
      } else {
        // Create new settings
        result = await supabase
          .from('business_settings')
          .insert({
            ...settingsData,
            created_at: new Date().toISOString()
          })
      }

      if (result.error) {
        throw result.error
      }

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasChanges: false
      }))

      return { success: true }
    } catch (error) {
      console.error('Error saving settings:', error)
      setState(prev => ({
        ...prev,
        isSaving: false
      }))
      return { success: false, error }
    }
  }

  // Reset to original values
  const resetSettings = () => {
    loadSettings()
  }

  // Validate business info
  const validateBusinessInfo = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!state.businessInfo.business_name.trim()) {
      errors.business_name = 'Business name is required'
    }

    if (state.businessInfo.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.businessInfo.business_email)) {
      errors.business_email = 'Please enter a valid email address'
    }

    if (state.businessInfo.business_website && !/^https?:\/\/.+/.test(state.businessInfo.business_website)) {
      errors.business_website = 'Please enter a valid website URL starting with http:// or https://'
    }

    return errors
  }

  // Validate general settings
  const validateGeneralSettings = (): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!state.generalSettings.currency) {
      errors.currency = 'Currency is required'
    }

    if (!state.generalSettings.timezone) {
      errors.timezone = 'Timezone is required'
    }

    if (!state.generalSettings.language) {
      errors.language = 'Language is required'
    }

    if (parseFloat(state.generalSettings.tax_rate) < 0 || parseFloat(state.generalSettings.tax_rate) > 100) {
      errors.tax_rate = 'Tax rate must be between 0 and 100'
    }

    return errors
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  return {
    // State
    businessInfo: state.businessInfo,
    generalSettings: state.generalSettings,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    hasChanges: state.hasChanges,
    errors: state.errors,
    
    // Actions
    updateBusinessInfo,
    updateGeneralSettings,
    saveSettings,
    resetSettings,
    loadSettings,
    validateBusinessInfo,
    validateGeneralSettings
  }
} 
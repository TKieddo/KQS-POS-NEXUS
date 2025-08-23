// Settings Service
// Handles all database operations for global and branch-specific settings

import { supabase } from './supabase'

export interface BusinessSettings {
  id?: string
  business_name?: string
  business_address?: string
  business_phone?: string
  business_email?: string
  business_website?: string
  logo_url?: string
  business_hours?: string | object
  currency?: string
  currency_symbol?: string
  timezone?: string
  language?: string
  date_format?: string
  time_format?: string
  decimal_places?: number
  tax_rate?: number
  tax_name?: string
  auto_backup?: boolean
  backup_frequency?: string
  notifications_enabled?: boolean
  email_notifications?: boolean
  sms_notifications?: boolean
  created_at?: string
  updated_at?: string
}

export interface ParsedBusinessHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

class SettingsService {
  private static instance: SettingsService
  private settings: BusinessSettings | null = null
  private loadingPromise: Promise<BusinessSettings | null> | null = null

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  /**
   * Load business settings from the database
   */
  async loadSettings(): Promise<BusinessSettings | null> {
    // If already loading, return the existing promise
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // If already loaded, return cached settings
    if (this.settings) {
      return this.settings
    }

    this.loadingPromise = this.fetchSettingsFromDatabase()
    try {
      this.settings = await this.loadingPromise
      return this.settings
    } finally {
      this.loadingPromise = null
  }
}

/**
   * Fetch settings from the database
 */
  private async fetchSettingsFromDatabase(): Promise<BusinessSettings | null> {
  try {
    const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
      .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading business settings:', error)
        return null
      }

      return data || null
  } catch (error) {
      console.error('Error fetching business settings:', error)
      return null
  }
}

/**
   * Get a specific setting value
   */
  async getSetting<T>(key: keyof BusinessSettings, defaultValue?: T): Promise<T | undefined> {
    const settings = await this.loadSettings()
    return (settings?.[key] as T) ?? defaultValue
  }

  /**
   * Get business hours as parsed object
   */
  async getBusinessHours(): Promise<ParsedBusinessHours | null> {
    const hoursData = await this.getSetting('business_hours')
    if (!hoursData) return null

    try {
      if (typeof hoursData === 'string') {
        return JSON.parse(hoursData)
      }
      return hoursData as ParsedBusinessHours
  } catch (error) {
      console.error('Error parsing business hours:', error)
      return null
  }
}

/**
   * Get currency settings
   */
  async getCurrencySettings() {
    const currency = await this.getSetting('currency', 'ZAR')
    const symbol = await this.getSetting('currency_symbol', 'R')
    const decimalPlaces = await this.getSetting('decimal_places', 2)
    
    return { currency, symbol, decimalPlaces }
  }

  /**
   * Get tax settings
   */
  async getTaxSettings() {
    const taxRate = await this.getSetting('tax_rate', 15.0)
    const taxName = await this.getSetting('tax_name', 'VAT')
    
    return { taxRate, taxName }
  }

  /**
   * Get localization settings
   */
  async getLocalizationSettings() {
    const language = await this.getSetting('language', 'en')
    const timezone = await this.getSetting('timezone', 'Africa/Johannesburg')
    const dateFormat = await this.getSetting('date_format', 'DD/MM/YYYY')
    const timeFormat = await this.getSetting('time_format', '24')
    
    return { language, timezone, dateFormat, timeFormat }
  }

  /**
   * Format currency amount
   */
  async formatCurrency(amount: number): Promise<string> {
    const { symbol, decimalPlaces } = await this.getCurrencySettings()
    
    if (decimalPlaces === 0) {
      return `${symbol}${Math.round(amount)}`
    }
    
    return `${symbol}${amount.toFixed(decimalPlaces)}`
  }

  /**
   * Calculate tax amount
   */
  async calculateTax(amount: number): Promise<number> {
    const { taxRate } = await this.getTaxSettings()
    return (amount * taxRate) / 100
  }

  /**
   * Calculate total with tax
   */
  async calculateTotalWithTax(amount: number): Promise<number> {
    const tax = await this.calculateTax(amount)
    return amount + tax
  }

  /**
   * Refresh settings from database
   */
  async refreshSettings(): Promise<BusinessSettings | null> {
    this.settings = null
    this.loadingPromise = null
    return this.loadSettings()
  }

  /**
   * Update a specific setting
   */
  async updateSetting(key: keyof BusinessSettings, value: any): Promise<boolean> {
    try {
      const { data: existingSettings } = await supabase
        .from('business_settings')
        .select('id')
        .limit(1)
        .single()

      const updateData = {
        [key]: value,
        updated_at: new Date().toISOString()
      }

      let result
      if (existingSettings) {
        result = await supabase
          .from('business_settings')
          .update(updateData)
          .eq('id', existingSettings.id)
      } else {
        result = await supabase
          .from('business_settings')
          .insert({
            ...updateData,
            business_name: 'My Business',
            created_at: new Date().toISOString()
          })
      }

      if (result.error) {
        throw result.error
      }

      // Refresh cached settings
      await this.refreshSettings()
      return true
  } catch (error) {
      console.error('Error updating setting:', error)
      return false
  }
}

/**
   * Get business information
   */
  async getBusinessInfo() {
    const businessName = await this.getSetting('business_name', 'My Business')
    const businessAddress = await this.getSetting('business_address', '')
    const businessPhone = await this.getSetting('business_phone', '')
    const businessEmail = await this.getSetting('business_email', '')
    const businessWebsite = await this.getSetting('business_website', '')
    const logoUrl = await this.getSetting('logo_url', '')
    
    return {
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      logoUrl
    }
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance()

// Export convenience functions
export const getSetting = (key: keyof BusinessSettings, defaultValue?: any) => 
  settingsService.getSetting(key, defaultValue)

export const getCurrencySettings = () => settingsService.getCurrencySettings()
export const getTaxSettings = () => settingsService.getTaxSettings()
export const getLocalizationSettings = () => settingsService.getLocalizationSettings()
export const getBusinessHours = () => settingsService.getBusinessHours()
export const getBusinessInfo = () => settingsService.getBusinessInfo()
export const formatCurrency = (amount: number) => settingsService.formatCurrency(amount)
export const calculateTax = (amount: number) => settingsService.calculateTax(amount)
export const calculateTotalWithTax = (amount: number) => settingsService.calculateTotalWithTax(amount)
export const updateSetting = (key: keyof BusinessSettings, value: any) => 
  settingsService.updateSetting(key, value)
export const refreshSettings = () => settingsService.refreshSettings() 
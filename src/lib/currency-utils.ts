// Currency formatting utilities using global settings
import { supabase } from './supabase'

export interface CurrencySettings {
  currency: string
  currencySymbol: string
  decimalPlaces: number
}

// Cache for currency settings to avoid repeated database calls
let currencySettingsCache: CurrencySettings | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get currency settings from global settings
 */
export async function getCurrencySettings(): Promise<CurrencySettings> {
  const now = Date.now()
  
  // Return cached settings if still valid
  if (currencySettingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return currencySettingsCache
  }

  try {
    // Get currency settings from global_settings table
    const { data: currencyData } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'currency')
      .single()

    const { data: symbolData } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'currency_symbol')
      .single()

    const { data: decimalData } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'decimal_places')
      .single()

    const settings: CurrencySettings = {
      currency: currencyData?.setting_value || 'ZAR',
      currencySymbol: symbolData?.setting_value || 'R',
      decimalPlaces: parseInt(decimalData?.setting_value || '2')
    }

    // Cache the settings
    currencySettingsCache = settings
    cacheTimestamp = now

    return settings
  } catch (error) {
    console.error('Error fetching currency settings:', error)
    // Return default settings if database query fails
    return {
      currency: 'ZAR',
      currencySymbol: 'R',
      decimalPlaces: 2
    }
  }
}

/**
 * Format a number as currency using global settings
 */
export async function formatCurrency(amount: number): Promise<string> {
  const settings = await getCurrencySettings()
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.decimalPlaces,
    maximumFractionDigits: settings.decimalPlaces
  }).format(amount)
}

/**
 * Format a number as currency using provided settings (for synchronous use)
 */
export function formatCurrencyWithSettings(amount: number, settings: CurrencySettings): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.decimalPlaces,
    maximumFractionDigits: settings.decimalPlaces
  }).format(amount)
}

/**
 * Clear the currency settings cache (useful when settings are updated)
 */
export function clearCurrencyCache(): void {
  currencySettingsCache = null
  cacheTimestamp = 0
}

/**
 * Get currency symbol only
 */
export async function getCurrencySymbol(): Promise<string> {
  const settings = await getCurrencySettings()
  return settings.currencySymbol
}

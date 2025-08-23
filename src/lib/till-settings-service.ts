import { supabase } from './supabase'

export interface TillSettings {
  id?: string
  branch_id: string
  till_cash_management_enabled: boolean
  auto_cash_drops_enabled: boolean
  till_count_reminders_enabled: boolean
  variance_alerts_enabled: boolean
  max_till_amount: number
  min_till_amount: number
  variance_threshold: number
  created_at?: string
  updated_at?: string
}

class TillSettingsService {
  private static instance: TillSettingsService
  private cache: Map<string, TillSettings> = new Map()

  private constructor() {}

  public static getInstance(): TillSettingsService {
    if (!TillSettingsService.instance) {
      TillSettingsService.instance = new TillSettingsService()
    }
    return TillSettingsService.instance
  }

  /**
   * Get till settings for a branch
   */
  async getSettings(branchId: string): Promise<TillSettings> {
    const cacheKey = `till_settings_${branchId}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      const { data, error } = await supabase
        .from('till_settings')
        .select('*')
        .eq('branch_id', branchId)
        .limit(1)

      if (error) {
        console.error('Error fetching till settings:', error)
        return this.getDefaultSettings(branchId)
      }

      if (data && data.length > 0) {
        const settings = data[0] as TillSettings
        this.cache.set(cacheKey, settings)
        return settings
      }

      // If no settings exist, create default settings
      const defaultSettings = this.getDefaultSettings(branchId)
      const createdSettings = await this.createSettings(defaultSettings)
      this.cache.set(cacheKey, createdSettings)
      return createdSettings
    } catch (error) {
      console.error('Error getting till settings:', error)
      return this.getDefaultSettings(branchId)
    }
  }

  /**
   * Update a specific setting
   */
  async updateSetting(branchId: string, key: keyof TillSettings, value: any): Promise<TillSettings> {
    try {
      const currentSettings = await this.getSettings(branchId)
      
      const { data, error } = await supabase
        .from('till_settings')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('branch_id', branchId)
        .select()
        .single()

      if (error) {
        console.error('Error updating till setting:', error)
        throw error
      }

      const updatedSettings = data as TillSettings
      this.cache.set(`till_settings_${branchId}`, updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Error updating till setting:', error)
      throw error
    }
  }

  /**
   * Update multiple settings at once
   */
  async updateSettings(branchId: string, updates: Partial<TillSettings>): Promise<TillSettings> {
    try {
      const { data, error } = await supabase
        .from('till_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('branch_id', branchId)
        .select()
        .single()

      if (error) {
        console.error('Error updating till settings:', error)
        throw error
      }

      const updatedSettings = data as TillSettings
      this.cache.set(`till_settings_${branchId}`, updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Error updating till settings:', error)
      throw error
    }
  }

  /**
   * Create new settings for a branch
   */
  private async createSettings(settings: TillSettings): Promise<TillSettings> {
    try {
      const { data, error } = await supabase
        .from('till_settings')
        .insert(settings)
        .select()
        .single()

      if (error) {
        console.error('Error creating till settings:', error)
        throw error
      }

      return data as TillSettings
    } catch (error) {
      console.error('Error creating till settings:', error)
      throw error
    }
  }

  /**
   * Get default settings for a branch
   */
  private getDefaultSettings(branchId: string): TillSettings {
    return {
      branch_id: branchId,
      till_cash_management_enabled: true,
      auto_cash_drops_enabled: false,
      till_count_reminders_enabled: true,
      variance_alerts_enabled: true,
      max_till_amount: 5000,
      min_till_amount: 500,
      variance_threshold: 100
    }
  }

  /**
   * Clear cache for a specific branch
   */
  clearCacheForBranch(branchId: string): void {
    this.cache.delete(`till_settings_${branchId}`)
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Create singleton instance
const tillSettingsService = TillSettingsService.getInstance()

// Export functions for easy use
export const getTillSettings = (branchId: string) => 
  tillSettingsService.getSettings(branchId)

export const updateTillSetting = (branchId: string, key: keyof TillSettings, value: any) => 
  tillSettingsService.updateSetting(branchId, key, value)

export const updateTillSettings = (branchId: string, updates: Partial<TillSettings>) => 
  tillSettingsService.updateSettings(branchId, updates)

export const clearTillSettingsCache = () => 
  tillSettingsService.clearCache()

 
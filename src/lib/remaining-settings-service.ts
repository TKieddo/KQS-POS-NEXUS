// Remaining Settings Service
// Handles database operations for Till & Cash, User Management, Printing, Notifications, Reports, Data Management, and Advanced settings

import { supabase } from './supabase'
import { useBranch } from '@/context/BranchContext'

// Till & Cash Settings Interface
export interface TillCashSettings {
  default_float_amount: number
  cash_drop_threshold: number
  auto_cash_drop: boolean
  cash_counting_required: boolean
  till_session_timeout: number
  enable_cashup_reminders: boolean
  max_cash_in_till: number
  cash_drop_frequency: string
  cash_counting_method: string
  till_reconciliation_required: boolean
  cash_shortage_tolerance: number
  enable_cash_flow_tracking: boolean
}

// User Management Settings Interface
export interface UserManagementSettings {
  default_user_role: string
  password_min_length: number
  password_complexity: boolean
  two_factor_auth: boolean
  session_timeout: number
  account_lockout: boolean
  audit_log_access: boolean
  max_login_attempts: number
  lockout_duration: number
  require_password_change: boolean
  password_expiry_days: number
  enable_user_activity_logging: boolean
}

// Printing Settings Interface
export interface PrintingSettings {
  receipt_header: string
  receipt_footer: string
  receipt_show_logo: boolean
  receipt_show_tax_breakdown: boolean
  receipt_paper_width: number
  receipt_font_size: number
  receipt_show_barcode: boolean
  receipt_show_cashier: boolean
  receipt_show_date_time: boolean
  receipt_show_store_info: boolean
  receipt_copies: number
  auto_print_receipts: boolean
  printer_name: string
  label_printer_enabled: boolean
  label_template: string
}

// Notifications Settings Interface
export interface NotificationsSettings {
  email_notifications: boolean
  sms_notifications: boolean
  low_stock_alerts: boolean
  daily_sales_report: boolean
  email_smtp_server: string
  email_smtp_port: number
  email_username: string
  email_password: string
  email_from_address: string
  sms_provider: string
  sms_api_key: string
  sms_phone_number: string
  push_notifications: boolean
  notification_sound: boolean
  notification_desktop: boolean
}

// Reports Settings Interface
export interface ReportsSettings {
  reports_auto_generate: boolean
  reports_schedule: string
  reports_email_recipients: string[]
  reports_include_charts: boolean
  reports_format: string
  reports_retention_days: number
  export_include_headers: boolean
  export_date_format: string
  export_timezone: string
  export_compression: boolean
  export_batch_size: number
  reports_include_summary: boolean
}

// Data Management Settings Interface
export interface DataManagementSettings {
  auto_backup: boolean
  backup_frequency: string
  data_retention_days: number
  export_format: string
  backup_location: string
  backup_encryption: boolean
  backup_compression: boolean
  data_cleanup_enabled: boolean
  data_cleanup_frequency: string
  data_cleanup_older_than: number
  data_validation_enabled: boolean
  data_repair_enabled: boolean
}

// Advanced Settings Interface
export interface AdvancedSettings {
  debug_mode: boolean
  api_rate_limit: number
  cache_ttl: number
  maintenance_mode: boolean
  performance_monitoring: boolean
  error_reporting: boolean
  log_level: string
  log_retention_days: number
  auto_update_enabled: boolean
  update_channel: string
  security_scan_enabled: boolean
  backup_verification: boolean
  system_health_checks: boolean
  optimization_enabled: boolean
  resource_monitoring: boolean
}

class RemainingSettingsService {
  private static instance: RemainingSettingsService
  private settingsCache: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): RemainingSettingsService {
    if (!RemainingSettingsService.instance) {
      RemainingSettingsService.instance = new RemainingSettingsService()
    }
    return RemainingSettingsService.instance
  }

  /**
   * Load settings for a specific category
   */
  async loadSettings(category: string, branchId?: string): Promise<any> {
    const cacheKey = `${category}_${branchId || 'global'}`
    
    if (this.settingsCache.has(cacheKey)) {
      console.log(`Using cached settings for ${category}`) // Debug log
      return this.settingsCache.get(cacheKey)
    }

    try {
      console.log(`Loading ${category} settings for branch: ${branchId || 'global'}`) // Debug log
      
      // Load global settings for the category
      const { data: globalSettings, error: globalError } = await supabase
        .from('global_settings')
        .select('setting_key, setting_value, setting_type')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order')

      if (globalError) throw globalError

      console.log(`Loaded ${globalSettings?.length || 0} global settings for ${category}:`, globalSettings) // Debug log

      // Load branch-specific overrides if branchId is provided
      let branchSettings: any[] = []
      if (branchId) {
        const { data: branchData, error: branchError } = await supabase
          .from('branch_settings')
          .select('setting_key, setting_value, is_override')
          .eq('branch_id', branchId)

        if (branchError) throw branchError
        branchSettings = branchData || []
        console.log(`Loaded ${branchSettings.length} branch settings for ${category}:`, branchSettings) // Debug log
      }

      // Merge global and branch settings
      const mergedSettings = this.mergeSettings(globalSettings, branchSettings, category)
      console.log(`Merged settings for ${category}:`, mergedSettings) // Debug log
      
      this.settingsCache.set(cacheKey, mergedSettings)
      return mergedSettings
    } catch (error) {
      console.error(`Error loading ${category} settings:`, error)
      return this.getDefaultSettings(category)
    }
  }

  /**
   * Save settings for a specific category
   */
  async saveSettings(category: string, settings: any, branchId?: string): Promise<boolean> {
    try {
      console.log(`Saving ${category} settings:`, settings) // Debug log
      console.log(`Branch ID: ${branchId || 'global'}`) // Debug log
      
      if (branchId) {
        // Save branch-specific settings as overrides
        const settingsToSave = Object.entries(settings).map(([key, value]) => {
          const stringValue = typeof value === 'boolean' ? value.toString() : String(value)
          console.log(`Converting ${key}: ${value} (${typeof value}) -> ${stringValue}`) // Debug log
          return {
            branch_id: branchId,
            setting_key: key,
            setting_value: stringValue,
            is_override: true
          }
        })

        console.log('Settings to save to branch_settings:', settingsToSave) // Debug log

        // Use upsert to handle both insert and update
        const { error: upsertError } = await supabase
          .from('branch_settings')
          .upsert(settingsToSave, { onConflict: 'branch_id,setting_key' })

        if (upsertError) {
          console.error('Upsert error:', upsertError) // Debug log
          throw upsertError
        }
      } else {
        // Save global settings
        console.log('Saving to global_settings table') // Debug log
        for (const [key, value] of Object.entries(settings)) {
          const stringValue = typeof value === 'boolean' ? value.toString() : String(value)
          console.log(`Updating global setting ${key}: ${value} -> ${stringValue}`) // Debug log
          
          const { error: updateError } = await supabase
            .from('global_settings')
            .update({ setting_value: stringValue })
            .eq('setting_key', key)
            .eq('category', category)

          if (updateError) {
            console.error(`Error updating ${key}:`, updateError) // Debug log
            throw updateError
          }
        }
      }

      // Clear cache for this category and all related caches
      this.clearCacheForCategory(category, branchId)
      console.log(`Successfully saved ${category} settings`) // Debug log
      return true
    } catch (error) {
      console.error(`Error saving ${category} settings:`, error)
      return false
    }
  }

  /**
   * Merge global and branch settings
   */
  private mergeSettings(globalSettings: any[], branchSettings: any[], category: string): any {
    const defaultSettings = this.getDefaultSettings(category)
    const mergedSettings = { ...defaultSettings }

    console.log(`Default settings for ${category}:`, defaultSettings) // Debug log

    // Apply global settings
    globalSettings?.forEach(setting => {
      if (setting.setting_key in mergedSettings) {
        const value = this.parseSettingValue(setting.setting_value, setting.setting_type)
        console.log(`Global setting ${setting.setting_key}: "${setting.setting_value}" (${setting.setting_type}) -> ${value} (${typeof value})`) // Debug log
        mergedSettings[setting.setting_key] = value
      }
    })

    // Apply branch overrides - these should override global settings
    branchSettings?.forEach(setting => {
      if (setting.setting_key in mergedSettings) {
        // For branch settings, we need to determine the type from global settings
        const globalSetting = globalSettings?.find(gs => gs.setting_key === setting.setting_key)
        const settingType = globalSetting?.setting_type || 'string'
        const value = this.parseSettingValue(setting.setting_value, settingType)
        console.log(`Branch override ${setting.setting_key}: "${setting.setting_value}" (${settingType}) -> ${value} (${typeof value})`) // Debug log
        mergedSettings[setting.setting_key] = value
      }
    })

    console.log(`Final merged settings for ${category}:`, mergedSettings) // Debug log
    return mergedSettings
  }

  /**
   * Parse setting value based on type
   */
  private parseSettingValue(value: string, type: string): any {
    if (!value) return null

    switch (type) {
      case 'number':
        return parseFloat(value) || 0
      case 'boolean':
        // Handle various boolean string representations
        const lowerValue = value.toLowerCase().trim()
        return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'on'
      case 'json':
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      default:
        return value
    }
  }

  /**
   * Get default settings for a category
   */
  private getDefaultSettings(category: string): any {
    switch (category) {
      case 'till':
        return {
          default_float_amount: 1000.00,
          cash_drop_threshold: 5000.00,
          auto_cash_drop: false,
          cash_counting_required: true,
          till_session_timeout: 30,
          enable_cashup_reminders: true,
          max_cash_in_till: 10000.00,
          cash_drop_frequency: 'daily',
          cash_counting_method: 'manual',
          till_reconciliation_required: true,
          cash_shortage_tolerance: 50.00,
          enable_cash_flow_tracking: true
        }
      case 'user':
        return {
          default_user_role: 'cashier',
          password_min_length: 8,
          password_complexity: true,
          two_factor_auth: false,
          session_timeout: 480,
          account_lockout: true,
          audit_log_access: true,
          max_login_attempts: 5,
          lockout_duration: 30,
          require_password_change: false,
          password_expiry_days: 90,
          enable_user_activity_logging: true
        }
      case 'printing':
        return {
          receipt_header: 'KQS POS',
          receipt_footer: 'Thank you for shopping with us!',
          receipt_show_logo: true,
          receipt_show_tax_breakdown: true,
          receipt_paper_width: 80,
          receipt_font_size: 12,
          receipt_show_barcode: true,
          receipt_show_cashier: true,
          receipt_show_date_time: true,
          receipt_show_store_info: true,
          receipt_copies: 1,
          auto_print_receipts: true,
          printer_name: '',
          label_printer_enabled: false,
          label_template: 'default'
        }
      case 'notifications':
        return {
          email_notifications: false,
          sms_notifications: false,
          low_stock_alerts: true,
          daily_sales_report: false,
          email_smtp_server: '',
          email_smtp_port: 587,
          email_username: '',
          email_password: '',
          email_from_address: '',
          sms_provider: '',
          sms_api_key: '',
          sms_phone_number: '',
          push_notifications: false,
          notification_sound: true,
          notification_desktop: true
        }
      case 'system':
        return {
          reports_auto_generate: false,
          reports_schedule: 'daily',
          reports_email_recipients: [],
          reports_include_charts: true,
          reports_format: 'pdf',
          reports_retention_days: 365,
          export_include_headers: true,
          export_date_format: 'DD/MM/YYYY',
          export_timezone: 'Africa/Johannesburg',
          export_compression: false,
          export_batch_size: 1000,
          reports_include_summary: true
        }
      case 'data':
        return {
          auto_backup: true,
          backup_frequency: 'daily',
          data_retention_days: 365,
          export_format: 'csv',
          backup_location: 'local',
          backup_encryption: false,
          backup_compression: true,
          data_cleanup_enabled: false,
          data_cleanup_frequency: 'monthly',
          data_cleanup_older_than: 730,
          data_validation_enabled: true,
          data_repair_enabled: false
        }
      case 'advanced':
        return {
          debug_mode: false,
          api_rate_limit: 1000,
          cache_ttl: 3600,
          maintenance_mode: false,
          performance_monitoring: true,
          error_reporting: true,
          log_level: 'info',
          log_retention_days: 30,
          auto_update_enabled: false,
          update_channel: 'stable',
          security_scan_enabled: true,
          backup_verification: true,
          system_health_checks: true,
          optimization_enabled: true,
          resource_monitoring: true
        }
      default:
        return {}
    }
  }

  /**
   * Clear cache for a specific category
   */
  private clearCacheForCategory(category: string, branchId?: string): void {
    // Clear specific cache
    const cacheKey = `${category}_${branchId || 'global'}`
    this.settingsCache.delete(cacheKey)
    
    // Also clear global cache for this category
    const globalCacheKey = `${category}_global`
    this.settingsCache.delete(globalCacheKey)
    
    console.log(`Cleared cache for ${category} (${cacheKey}, ${globalCacheKey})`) // Debug log
  }

  /**
   * Clear settings cache
   */
  clearCache(): void {
    this.settingsCache.clear()
  }

  /**
   * Verify settings in database (for debugging)
   */
  async verifySettings(category: string, branchId?: string): Promise<any> {
    try {
      console.log(`Verifying settings for ${category}, branch: ${branchId || 'global'}`)
      
      if (branchId) {
        const { data: branchData, error: branchError } = await supabase
          .from('branch_settings')
          .select('*')
          .eq('branch_id', branchId)
        
        if (branchError) throw branchError
        console.log('Branch settings in database:', branchData)
        return branchData
      } else {
        const { data: globalData, error: globalError } = await supabase
          .from('global_settings')
          .select('*')
          .eq('category', category)
        
        if (globalError) throw globalError
        console.log('Global settings in database:', globalData)
        return globalData
      }
    } catch (error) {
      console.error('Error verifying settings:', error)
      return null
    }
  }
}

// Create singleton instance
const remainingSettingsService = RemainingSettingsService.getInstance()

// Export functions for easy use
export const loadSettings = (category: string, branchId?: string) => 
  remainingSettingsService.loadSettings(category, branchId)

export const saveSettings = (category: string, settings: any, branchId?: string) => 
  remainingSettingsService.saveSettings(category, settings, branchId)

export const clearSettingsCache = () => remainingSettingsService.clearCache()

export const verifySettings = (category: string, branchId?: string) => 
  remainingSettingsService.verifySettings(category, branchId)

// Export the service instance for advanced usage
export { remainingSettingsService }

// Export types are already exported above 
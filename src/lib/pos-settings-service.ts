import { supabase } from './supabase'

// Types
export interface POSSettings {
  id?: string
  branch_id: string
  // Laybye Settings
  laybye_duration_months: number
  laybye_duration_days: number
  require_customer_for_laybye: boolean
  min_laybye_deposit_percentage: number
  max_laybye_duration_months: number
  allow_laybye_extensions: boolean
  laybye_reminder_days: number
  // Payment Settings
  auto_print_receipts: boolean
  default_payment_method: string
  max_discount_percentage: number
  allow_cash_rounding: boolean
  require_receipt_printing: boolean
  // Customer Settings
  show_customer_selection: boolean
  require_customer_for_credit: boolean
  auto_create_loyalty_account: boolean
  // Inventory Settings
  allow_negative_inventory: boolean
  show_stock_warnings: boolean
  low_stock_threshold: number
  created_at?: string
  updated_at?: string
}

export interface CreatePOSSettingsData {
  branch_id: string
  // Laybye Settings
  laybye_duration_months: number
  laybye_duration_days: number
  require_customer_for_laybye: boolean
  min_laybye_deposit_percentage: number
  max_laybye_duration_months: number
  allow_laybye_extensions: boolean
  laybye_reminder_days: number
  // Payment Settings
  auto_print_receipts: boolean
  default_payment_method: string
  max_discount_percentage: number
  allow_cash_rounding: boolean
  require_receipt_printing: boolean
  // Customer Settings
  show_customer_selection: boolean
  require_customer_for_credit: boolean
  auto_create_loyalty_account: boolean
  // Inventory Settings
  allow_negative_inventory: boolean
  show_stock_warnings: boolean
  low_stock_threshold: number
}

// Default POS settings
export const defaultPOSSettings: Omit<CreatePOSSettingsData, 'branch_id'> = {
  // Laybye Settings
  laybye_duration_months: 3,
  laybye_duration_days: 0,
  require_customer_for_laybye: true,
  min_laybye_deposit_percentage: 20,
  max_laybye_duration_months: 6,
  allow_laybye_extensions: true,
  laybye_reminder_days: 7,
  // Payment Settings
  auto_print_receipts: true,
  default_payment_method: 'cash',
  max_discount_percentage: 20,
  allow_cash_rounding: true,
  require_receipt_printing: false,
  // Customer Settings
  show_customer_selection: true,
  require_customer_for_credit: true,
  auto_create_loyalty_account: false,
  // Inventory Settings
  allow_negative_inventory: false,
  show_stock_warnings: true,
  low_stock_threshold: 5
}

// Get POS settings for a branch
export const getPOSSettings = async (branchId: string): Promise<{ success: boolean; data?: POSSettings; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('pos_settings')
      .select('*')
      .eq('branch_id', branchId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default settings
        const defaultSettings: POSSettings = {
          ...defaultPOSSettings,
          branch_id: branchId
        }
        return { success: true, data: defaultSettings }
      }
      console.error('Error fetching POS settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching POS settings:', error)
    return { success: false, error: 'Failed to fetch POS settings' }
  }
}

// Save or update POS settings
export const savePOSSettings = async (settingsData: CreatePOSSettingsData): Promise<{ success: boolean; data?: POSSettings; error?: string }> => {
  try {
    // Check if settings already exist for this branch
    const { data: existingSettings } = await supabase
      .from('pos_settings')
      .select('id')
      .eq('branch_id', settingsData.branch_id)
      .single()

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('pos_settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('branch_id', settingsData.branch_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating POS settings:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('pos_settings')
        .insert([settingsData])
        .select()
        .single()

      if (error) {
        console.error('Error creating POS settings:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    }
  } catch (error) {
    console.error('Error saving POS settings:', error)
    return { success: false, error: 'Failed to save POS settings' }
  }
}

// Get all POS settings (for system admin)
export const getAllPOSSettings = async (): Promise<{ success: boolean; data?: POSSettings[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('pos_settings')
      .select(`
        *,
        branches:branch_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all POS settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching all POS settings:', error)
    return { success: false, error: 'Failed to fetch POS settings' }
  }
}

// Calculate laybye due date based on settings
export const calculateLaybyeDueDate = (settings: POSSettings, startDate?: Date): Date => {
  const baseDate = startDate || new Date()
  const dueDate = new Date(baseDate)
  
  // Add months
  dueDate.setMonth(dueDate.getMonth() + settings.laybye_duration_months)
  
  // Add additional days
  dueDate.setDate(dueDate.getDate() + settings.laybye_duration_days)
  
  return dueDate
}

// Format due date for display
export const formatDueDate = (settings: POSSettings, startDate?: Date): string => {
  const dueDate = calculateLaybyeDueDate(settings, startDate)
  return dueDate.toISOString().split('T')[0] // Returns YYYY-MM-DD format
}

// Get laybye duration display text
export const getLaybyeDurationText = (settings: POSSettings): string => {
  const parts = []
  
  if (settings.laybye_duration_months > 0) {
    parts.push(`${settings.laybye_duration_months} month${settings.laybye_duration_months !== 1 ? 's' : ''}`)
  }
  
  if (settings.laybye_duration_days > 0) {
    parts.push(`${settings.laybye_duration_days} day${settings.laybye_duration_days !== 1 ? 's' : ''}`)
  }
  
  return parts.length > 0 ? parts.join(' and ') : '0 days'
}

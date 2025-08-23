import { supabase } from './supabase'

export interface PrinterSettings {
  paperWidth: number
  paperLength: number
  topMargin: number
  bottomMargin: number
  leftMargin: number
  rightMargin: number
  lineSpacing: number
  printDensity: 'light' | 'normal' | 'dark'
  printSpeed: 'slow' | 'normal' | 'fast'
  autoCut: boolean
  cutLength: number
  characterSize: 'small' | 'normal' | 'large'
  printDirection: 'normal' | 'reverse'
}

export const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  paperWidth: 80,
  paperLength: 500,
  topMargin: 0,
  bottomMargin: 30,
  leftMargin: 2,
  rightMargin: 2,
  lineSpacing: 1,
  printDensity: 'normal',
  printSpeed: 'normal',
  autoCut: true,
  cutLength: 50,
  characterSize: 'normal',
  printDirection: 'normal'
}

export interface PrinterSettingsRecord {
  id: string
  user_id: string
  branch_id: string
  printer_name: string
  settings: PrinterSettings
  created_at: string
  updated_at: string
}

/**
 * Save printer settings to database
 */
export async function savePrinterSettings(
  printerName: string,
  settings: PrinterSettings,
  branchId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get branch ID if not provided
    let finalBranchId = branchId
    if (!finalBranchId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', user.id)
        .single()
      
      finalBranchId = userProfile?.branch_id
    }

    // If no branch ID found, try to get the first available branch
    if (!finalBranchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        return { success: false, error: 'No active branches found. Cannot save printer settings.' }
      }
      
      finalBranchId = firstBranch.id
      console.log('Using first available branch for printer settings:', finalBranchId)
    }

    // Check if settings already exist for this printer
    const { data: existingSettings } = await supabase
      .from('printer_settings')
      .select('id')
      .eq('user_id', user.id)
      .eq('branch_id', finalBranchId)
      .eq('printer_name', printerName)
      .single()

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('printer_settings')
        .update({
          settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)

      if (error) {
        console.error('Error updating printer settings:', error)
        return { success: false, error: error.message }
      }
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('printer_settings')
        .insert({
          user_id: user.id,
          branch_id: finalBranchId,
          printer_name: printerName,
          settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating printer settings:', error)
        return { success: false, error: error.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving printer settings:', error)
    return { success: false, error: 'Failed to save printer settings' }
  }
}

/**
 * Load printer settings from database
 */
export async function loadPrinterSettings(
  printerName: string,
  branchId?: string
): Promise<{ settings: PrinterSettings | null; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { settings: null, error: 'User not authenticated' }
    }

    // Get branch ID if not provided
    let finalBranchId = branchId
    if (!finalBranchId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', user.id)
        .single()
      
      finalBranchId = userProfile?.branch_id
    }

    // If no branch ID found, try to get the first available branch
    if (!finalBranchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        return { settings: DEFAULT_PRINTER_SETTINGS, error: 'No active branches found. Using default settings.' }
      }
      
      finalBranchId = firstBranch.id
      console.log('Using first available branch for loading printer settings:', finalBranchId)
    }

    // Load settings from database
    const { data, error } = await supabase
      .from('printer_settings')
      .select('settings')
      .eq('user_id', user.id)
      .eq('branch_id', finalBranchId)
      .eq('printer_name', printerName)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default
        return { settings: DEFAULT_PRINTER_SETTINGS }
      }
      console.error('Error loading printer settings:', error)
      return { settings: null, error: error.message }
    }

    return { settings: data.settings }
  } catch (error) {
    console.error('Error loading printer settings:', error)
    return { settings: null, error: 'Failed to load printer settings' }
  }
}

/**
 * Load all printer settings for current user/branch
 */
export async function loadAllPrinterSettings(
  branchId?: string
): Promise<{ settings: Record<string, PrinterSettings>; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { settings: {}, error: 'User not authenticated' }
    }

    // Get branch ID if not provided
    let finalBranchId = branchId
    if (!finalBranchId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('branch_id')
        .eq('id', user.id)
        .single()
      
      finalBranchId = userProfile?.branch_id
    }

    // If no branch ID found, try to get the first available branch
    if (!finalBranchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        console.warn('No active branches found. Using default settings.')
        return { settings: {} }
      }
      
      finalBranchId = firstBranch.id
      console.log('Using first available branch for loading all printer settings:', finalBranchId)
    }

    // Load all settings from database
    const { data, error } = await supabase
      .from('printer_settings')
      .select('printer_name, settings')
      .eq('user_id', user.id)
      .eq('branch_id', finalBranchId)

    if (error) {
      console.error('Error loading all printer settings:', error)
      return { settings: {}, error: error.message }
    }

    // Convert to Record format
    const settingsRecord: Record<string, PrinterSettings> = {}
    data?.forEach(item => {
      settingsRecord[item.printer_name] = item.settings
    })

    return { settings: settingsRecord }
  } catch (error) {
    console.error('Error loading all printer settings:', error)
    return { settings: {}, error: 'Failed to load printer settings' }
  }
}

/**
 * Delete printer settings
 */
export async function deletePrinterSettings(
  printerName: string,
  branchId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get branch ID if not provided
    let finalBranchId = branchId
    if (!finalBranchId) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('branch_id')
        .eq('user_id', user.id)
        .single()
      
      finalBranchId = userProfile?.branch_id
    }

    if (!finalBranchId) {
      return { success: false, error: 'Branch ID not found' }
    }

    // Delete settings
    const { error } = await supabase
      .from('printer_settings')
      .delete()
      .eq('user_id', user.id)
      .eq('branch_id', finalBranchId)
      .eq('printer_name', printerName)

    if (error) {
      console.error('Error deleting printer settings:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting printer settings:', error)
    return { success: false, error: 'Failed to delete printer settings' }
  }
} 
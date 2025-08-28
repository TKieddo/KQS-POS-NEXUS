import { supabase } from './supabase'

export interface PrinterSettings {
  id: string
  branch_id: string
  default_printer: string
  qz_tray_enabled: boolean
  auto_print_receipts: boolean
  print_copies: number
  paper_width: number
  created_at: string
  updated_at: string
}

export interface PrinterSettingsFormData {
  default_printer: string
  qz_tray_enabled: boolean
  auto_print_receipts: boolean
  print_copies: number
  paper_width: number
}

// Save printer settings to database
export const savePrinterSettings = async (
  branchId: string, 
  settings: PrinterSettingsFormData
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: `printer_settings_${branchId}`,
        value: JSON.stringify(settings),
        category: 'printer_settings',
        description: 'Printer settings for branch',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key' // Explicitly specify the conflict resolution
      })

    if (error) {
      console.error('Error saving printer settings:', error)
      return false
    }

    console.log('✅ Printer settings saved to database')
    return true
  } catch (error) {
    console.error('Error saving printer settings:', error)
    return false
  }
}

// Load printer settings from database
export const loadPrinterSettings = async (branchId: string): Promise<PrinterSettingsFormData | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', `printer_settings_${branchId}`)
      .eq('category', 'printer_settings')
      .maybeSingle() // Use maybeSingle() instead of single() to handle 0 rows gracefully

    if (error) {
      console.error('Error loading printer settings:', error)
      return null
    }

    if (data?.value) {
      const settings = JSON.parse(data.value) as PrinterSettingsFormData
      console.log('✅ Printer settings loaded from database')
      return settings
    }

    return null
  } catch (error) {
    console.error('Error loading printer settings:', error)
    return null
  }
}

// Get printer settings with default fallback
export const getPrinterSettings = async (branchId: string): Promise<PrinterSettingsFormData> => {
  try {
    // First try to load from database
    const dbSettings = await loadPrinterSettings(branchId)
    if (dbSettings) {
      return dbSettings
    }

    // If no settings in database, create default and save it
    const defaultSettings: PrinterSettingsFormData = {
      default_printer: '',
      qz_tray_enabled: true,
      auto_print_receipts: true,
      print_copies: 1,
      paper_width: 80
    }

    // Try to save the default settings to database
    await savePrinterSettings(branchId, defaultSettings)
    
    console.log('✅ Created and saved default printer settings to database')
    return defaultSettings
  } catch (error) {
    console.error('Error in getPrinterSettings:', error)
    
    // Return hardcoded settings as ultimate fallback
    return {
      default_printer: '',
      qz_tray_enabled: true,
      auto_print_receipts: true,
      print_copies: 1,
      paper_width: 80
    }
  }
}

// Update specific printer setting
export const updatePrinterSetting = async (
  branchId: string, 
  key: keyof PrinterSettingsFormData, 
  value: string | boolean | number
): Promise<boolean> => {
  try {
    const currentSettings = await getPrinterSettings(branchId)
    const updatedSettings = { ...currentSettings, [key]: value }
    
    return await savePrinterSettings(branchId, updatedSettings)
  } catch (error) {
    console.error('Error updating printer setting:', error)
    return false
  }
}

// Set default printer
export const setDefaultPrinter = async (branchId: string, printerName: string): Promise<boolean> => {
  return await updatePrinterSetting(branchId, 'default_printer', printerName)
}

// Get default printer
export const getDefaultPrinter = async (branchId: string): Promise<string> => {
  console.log('🔍 Getting default printer for branch:', branchId)
  const settings = await getPrinterSettings(branchId)
  console.log('🔍 Default printer:', settings.default_printer)
  return settings.default_printer
}

// Check if auto-print is enabled
export const isAutoPrintEnabled = async (branchId: string): Promise<boolean> => {
  console.log('🔍 Checking auto-print for branch:', branchId)
  const settings = await getPrinterSettings(branchId)
  console.log('🔍 Printer settings:', settings)
  const isEnabled = settings.auto_print_receipts && settings.qz_tray_enabled
  console.log('🔍 Auto-print enabled:', isEnabled, '(auto_print_receipts:', settings.auto_print_receipts, ', qz_tray_enabled:', settings.qz_tray_enabled, ')')
  return isEnabled
}

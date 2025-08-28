// Simple Printer Settings
// This handles only QZ Tray connection and default printer selection
// No database complexity - just localStorage for persistence

export interface SimplePrinterSettings {
  default_printer: string
  qz_tray_enabled: boolean
  auto_print_receipts: boolean
}

const STORAGE_KEY = 'kqs_printer_settings'

// Get printer settings from localStorage
export const getPrinterSettings = (branchId: string): SimplePrinterSettings => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${branchId}`)
    if (stored) {
      const settings = JSON.parse(stored) as SimplePrinterSettings
      console.log('✅ Printer settings loaded from localStorage:', settings)
      return settings
    }
  } catch (error) {
    console.error('Error loading printer settings from localStorage:', error)
  }
  
  // Return default settings
  const defaultSettings: SimplePrinterSettings = {
    default_printer: '',
    qz_tray_enabled: true,
    auto_print_receipts: true
  }
  
  // Save default settings
  savePrinterSettings(branchId, defaultSettings)
  return defaultSettings
}

// Save printer settings to localStorage
export const savePrinterSettings = (branchId: string, settings: SimplePrinterSettings): boolean => {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${branchId}`, JSON.stringify(settings))
    console.log('✅ Printer settings saved to localStorage:', settings)
    return true
  } catch (error) {
    console.error('Error saving printer settings to localStorage:', error)
    return false
  }
}

// Update specific printer setting
export const updatePrinterSetting = (
  branchId: string, 
  key: keyof SimplePrinterSettings, 
  value: string | boolean
): boolean => {
  try {
    const currentSettings = getPrinterSettings(branchId)
    const updatedSettings = { ...currentSettings, [key]: value }
    return savePrinterSettings(branchId, updatedSettings)
  } catch (error) {
    console.error('Error updating printer setting:', error)
    return false
  }
}

// Set default printer
export const setDefaultPrinter = (branchId: string, printerName: string): boolean => {
  return updatePrinterSetting(branchId, 'default_printer', printerName)
}

// Get default printer
export const getDefaultPrinter = (branchId: string): string => {
  console.log('🔍 Getting default printer for branch:', branchId)
  const settings = getPrinterSettings(branchId)
  console.log('🔍 Default printer:', settings.default_printer)
  return settings.default_printer
}

// Check if auto-print is enabled
export const isAutoPrintEnabled = (branchId: string): boolean => {
  console.log('🔍 Checking auto-print for branch:', branchId)
  const settings = getPrinterSettings(branchId)
  console.log('🔍 Printer settings:', settings)
  const isEnabled = settings.auto_print_receipts && settings.qz_tray_enabled
  console.log('🔍 Auto-print enabled:', isEnabled, '(auto_print_receipts:', settings.auto_print_receipts, ', qz_tray_enabled:', settings.qz_tray_enabled, ')')
  return isEnabled
}

// Enable/disable auto-print
export const setAutoPrintEnabled = (branchId: string, enabled: boolean): boolean => {
  return updatePrinterSetting(branchId, 'auto_print_receipts', enabled)
}

// Enable/disable QZ Tray
export const setQzTrayEnabled = (branchId: string, enabled: boolean): boolean => {
  return updatePrinterSetting(branchId, 'qz_tray_enabled', enabled)
}

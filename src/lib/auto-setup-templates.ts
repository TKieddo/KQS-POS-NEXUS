import { supabase } from './supabase'
import { saveReceiptTemplateToDB, DEFAULT_RECEIPT_TEMPLATE } from './receipt-template-storage'

export const autoSetupReceiptTemplates = async (branchId: string, branchName?: string): Promise<string[]> => {
  const errors: string[] = []
  
  try {
    console.log('🔄 Setting up receipt templates for branch:', branchId)
    
    // Use the new JSON-based approach instead of the problematic receipt_templates table
    const defaultTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
    if (branchName) {
      defaultTemplate.business_name = branchName
    }
    
    // Save template as JSON to app_settings table
    const success = await saveReceiptTemplateToDB(defaultTemplate, branchId)
    
    if (success) {
      console.log('✅ Default receipt template saved as JSON for branch:', branchId)
    } else {
      errors.push('Failed to save default receipt template as JSON')
    }
    
  } catch (error) {
    console.error('❌ Error in autoSetupReceiptTemplates:', error)
    errors.push(`Template setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return errors
}

/**
 * Verify that a default template exists for printing
 */
export const verifyPrintingTemplates = async (branchId: string): Promise<{
  ready: boolean
  missing: string[]
  total: number
}> => {
  try {
    const { data: template, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_default', true)
      .single()

    if (error || !template) {
      return {
        ready: false,
        missing: ['Default receipt template'],
        total: 0
      }
    }

    return {
      ready: true,
      missing: [],
      total: 1
    }

  } catch (error) {
    console.error('Error verifying templates:', error)
    return {
      ready: false,
      missing: ['Error checking templates'],
      total: 0
    }
  }
}

/**
 * Get template status for a branch
 */
export const getTemplateStatus = async (branchId: string): Promise<{
  total: number
  active: number
  default: number
  ready: boolean
  missing: string[]
}> => {
  try {
    const { data: templates, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branchId)

    if (error) {
      console.error('Error getting templates:', error)
      return {
        total: 0,
        active: 0,
        default: 0,
        ready: false,
        missing: ['Error loading templates']
      }
    }

    const activeTemplates = templates?.filter(t => t.is_active) || []
    const defaultTemplates = templates?.filter(t => t.is_default) || []
    
    const verification = await verifyPrintingTemplates(branchId)
    
    return {
      total: templates?.length || 0,
      active: activeTemplates.length,
      default: defaultTemplates.length,
      ready: verification.ready,
      missing: verification.missing
    }
    
  } catch (error) {
    console.error('Error getting template status:', error)
    return {
      total: 0,
      active: 0,
      default: 0,
      ready: false,
      missing: ['Error checking status']
    }
  }
}

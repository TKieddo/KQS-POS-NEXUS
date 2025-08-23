import { supabase } from './supabase'

// Receipt template interface that matches the database schema
export interface ReceiptTemplate {
  id?: string
  branch_id?: string
  name: string
  description?: string
  template_type: 'standard' | 'compact' | 'detailed' | 'custom'
  layout?: any
  business_name: string
  business_address: string
  business_phone: string
  business_website: string
  business_facebook: string
  business_tagline: string
  return_policy_english: string
  return_policy_sesotho: string
  thank_you_message: string
  footer_text: string
  show_qr_section: boolean
  show_policy_section: boolean
  show_points_section: boolean
  show_tagline: boolean
  template_settings?: any
  is_active?: boolean
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

// Default template for fallback
const defaultTemplate: ReceiptTemplate = {
  name: 'Default Template',
  description: 'Default receipt template',
  template_type: 'standard',
  business_name: 'KQS POS',
  business_address: '123 Main Street, Johannesburg, South Africa',
  business_phone: '+27 11 123 4567',
  business_website: 'www.kqspos.com',
  business_facebook: '@kqspos',
  business_tagline: 'Quality Service, Every Time',
  return_policy_english: 'Returns accepted within 30 days with original receipt',
  return_policy_sesotho: 'Ho khutlisetsoa ha theko e amoheloa ka har\'a matsatsi a 30 ka resiti ya mantlha',
  thank_you_message: 'Thank you for your purchase!',
  footer_text: 'Visit us again soon!',
  show_qr_section: true,
  show_policy_section: true,
  show_points_section: true,
  show_tagline: true,
  is_active: true,
  is_default: true
}

/**
 * Load receipt templates for a specific branch
 */
export const loadReceiptTemplates = async (branchId?: string): Promise<ReceiptTemplate[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('User not authenticated, returning default template')
      return [defaultTemplate]
    }

    // If no branchId provided, try to get user's branch
    let targetBranchId = branchId
    
    if (!targetBranchId) {
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

      targetBranchId = userData?.branch_id
    }
    
    // If still no branchId, try to get the first available branch
    if (!targetBranchId) {
      console.warn('No branch_id provided or found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        console.warn('No active branches found. Returning default template.')
        return [defaultTemplate]
      }
      
      targetBranchId = firstBranch.id
      console.log('Using first available branch for templates:', targetBranchId)
    }

    // Load templates for the specific branch
    const { data, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', targetBranchId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('name')

    if (error) {
      console.error('Error loading receipt templates:', error)
      return [defaultTemplate]
    }

    // If no templates found, return default
    if (!data || data.length === 0) {
      console.warn('No templates found for branch. Returning default template.')
      return [defaultTemplate]
    }

    return data
  } catch (error) {
    console.error('Error loading receipt templates:', error)
    return [defaultTemplate]
  }
}

/**
 * Load a specific receipt template by ID
 */
export const loadReceiptTemplate = async (templateId: string): Promise<ReceiptTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error loading receipt template:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error loading receipt template:', error)
    return null
  }
}

/**
 * Save a receipt template (create or update) for a specific branch
 */
export const saveReceiptTemplate = async (template: ReceiptTemplate, branchId?: string): Promise<{ success: boolean; template?: ReceiptTemplate; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // If no branchId provided, try to get user's branch
    let targetBranchId = branchId
    
    if (!targetBranchId) {
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

      targetBranchId = userData?.branch_id
    }
    
    // If still no branchId, try to get the first available branch
    if (!targetBranchId) {
      console.warn('No branch_id provided or found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        return { success: false, error: 'No active branches found. Cannot save receipt template.' }
      }
      
      targetBranchId = firstBranch.id
      console.log('Using first available branch for saving template:', targetBranchId)
    }

    const templateData = {
      ...template,
      branch_id: targetBranchId,
      updated_at: new Date().toISOString()
    }

    // If this template is being set as default, first unset all other defaults for this branch
    if (template.is_default) {
      const { error: unsetError } = await supabase
        .from('receipt_templates')
        .update({ is_default: false })
        .eq('branch_id', targetBranchId)
        .neq('id', template.id || '00000000-0000-0000-0000-000000000000')

      if (unsetError) {
        console.error('Error unsetting other default templates:', unsetError)
        return { success: false, error: unsetError.message }
      }
    }

    if (template.id) {
      // Update existing template
      const { data, error } = await supabase
        .from('receipt_templates')
        .update(templateData)
        .eq('id', template.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating receipt template:', error)
        return { success: false, error: error.message }
      }

      return { success: true, template: data }
    } else {
      // Create new template
      const { data, error } = await supabase
        .from('receipt_templates')
        .insert(templateData)
        .select()
        .single()

      if (error) {
        console.error('Error creating receipt template:', error)
        return { success: false, error: error.message }
      }

      return { success: true, template: data }
    }
  } catch (error) {
    console.error('Error saving receipt template:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a receipt template
 */
export const deleteReceiptTemplate = async (templateId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if this is the default template
    const { data: template } = await supabase
      .from('receipt_templates')
      .select('is_default')
      .eq('id', templateId)
      .single()

    if (template?.is_default) {
      return { success: false, error: 'Cannot delete the default template' }
    }

    const { error } = await supabase
      .from('receipt_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Error deleting receipt template:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting receipt template:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Set a template as default for a specific branch
 */
export const setDefaultTemplate = async (templateId: string, branchId?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // If no branchId provided, try to get user's branch
    let targetBranchId = branchId
    
    if (!targetBranchId) {
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

      targetBranchId = userData?.branch_id
    }
    
    if (!targetBranchId) {
      const { data: firstBranch } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      targetBranchId = firstBranch?.id
    }

    if (!targetBranchId) {
      return { success: false, error: 'No branch found' }
    }

    // First, unset all default templates for this branch
    const { error: unsetError } = await supabase
      .from('receipt_templates')
      .update({ is_default: false })
      .eq('branch_id', targetBranchId)

    if (unsetError) {
      console.error('Error unsetting default templates:', unsetError)
      return { success: false, error: unsetError.message }
    }

    // Then set the specified template as default
    const { error } = await supabase
      .from('receipt_templates')
      .update({ is_default: true })
      .eq('id', templateId)
      .eq('branch_id', targetBranchId)

    if (error) {
      console.error('Error setting default template:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error setting default template:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Duplicate a receipt template
 */
export const duplicateReceiptTemplate = async (templateId: string): Promise<{ success: boolean; template?: ReceiptTemplate; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Load the original template
    const originalTemplate = await loadReceiptTemplate(templateId)
    if (!originalTemplate) {
      return { success: false, error: 'Template not found' }
    }

    // Create a copy with a new name
    const duplicatedTemplate: ReceiptTemplate = {
      ...originalTemplate,
      id: undefined, // Remove ID to create new record
      name: `${originalTemplate.name} (Copy)`,
      is_default: false,
      created_at: undefined,
      updated_at: undefined
    }

    return await saveReceiptTemplate(duplicatedTemplate)
  } catch (error) {
    console.error('Error duplicating receipt template:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Export templates for a specific branch
 */
export const exportTemplates = async (branchId?: string): Promise<{ success: boolean; data?: string; error?: string }> => {
  try {
    const templates = await loadReceiptTemplates(branchId)
    const exportData = {
      exportDate: new Date().toISOString(),
      templates: templates
    }
    
    return { 
      success: true, 
      data: JSON.stringify(exportData, null, 2) 
    }
  } catch (error) {
    console.error('Error exporting templates:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Import templates from JSON for a specific branch
 */
export const importTemplates = async (jsonData: string, branchId?: string): Promise<{ success: boolean; importedCount?: number; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const importData = JSON.parse(jsonData)
    const templates = importData.templates || []

    if (!Array.isArray(templates)) {
      return { success: false, error: 'Invalid template data format' }
    }

    let importedCount = 0
    const errors: string[] = []

    for (const template of templates) {
      try {
        // Remove ID and timestamps to create new records
        const { id, created_at, updated_at, ...templateData } = template
        const newTemplate: ReceiptTemplate = {
          ...templateData,
          name: `${templateData.name} (Imported)`,
          is_default: false
        }

        const result = await saveReceiptTemplate(newTemplate, branchId)
        if (result.success) {
          importedCount++
        } else {
          errors.push(`Failed to import ${templateData.name}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`Failed to import template: ${error}`)
      }
    }

    if (errors.length > 0) {
      console.warn('Import completed with errors:', errors)
    }

    return { 
      success: true, 
      importedCount,
      error: errors.length > 0 ? `Imported ${importedCount} templates with ${errors.length} errors` : undefined
    }
  } catch (error) {
    console.error('Error importing templates:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get the default template for a specific branch
 */
export const getDefaultTemplate = async (branchId?: string): Promise<ReceiptTemplate> => {
  try {
    const templates = await loadReceiptTemplates(branchId)
    const defaultTemplate = templates.find(t => t.is_default)
    
    if (defaultTemplate) {
      return defaultTemplate
    }

    // If no default template found, return the first active template
    const activeTemplate = templates.find(t => t.is_active)
    if (activeTemplate) {
      return activeTemplate
    }

    // Fallback to the hardcoded default
    return {
      name: 'Default Template',
      description: 'Default receipt template',
      template_type: 'standard',
      business_name: 'KQS POS',
      business_address: '123 Main Street, Johannesburg, South Africa',
      business_phone: '+27 11 123 4567',
      business_website: 'www.kqspos.com',
      business_facebook: '@kqspos',
      business_tagline: 'Quality Service, Every Time',
      return_policy_english: 'Returns accepted within 30 days with original receipt',
      return_policy_sesotho: 'Ho khutlisetsoa ha theko e amoheloa ka har\'a matsatsi a 30 ka resiti ya mantlha',
      thank_you_message: 'Thank you for your purchase!',
      footer_text: 'Visit us again soon!',
      show_qr_section: true,
      show_policy_section: true,
      show_points_section: true,
      show_tagline: true,
      is_active: true,
      is_default: true
    }
  } catch (error) {
    console.error('Error getting default template:', error)
    return {
      name: 'Default Template',
      description: 'Default receipt template',
      template_type: 'standard',
      business_name: 'KQS POS',
      business_address: '123 Main Street, Johannesburg, South Africa',
      business_phone: '+27 11 123 4567',
      business_website: 'www.kqspos.com',
      business_facebook: '@kqspos',
      business_tagline: 'Quality Service, Every Time',
      return_policy_english: 'Returns accepted within 30 days with original receipt',
      return_policy_sesotho: 'Ho khutlisetsoa ha theko e amoheloa ka har\'a matsatsi a 30 ka resiti ya mantlha',
      thank_you_message: 'Thank you for your purchase!',
      footer_text: 'Visit us again soon!',
      show_qr_section: true,
      show_policy_section: true,
      show_points_section: true,
      show_tagline: true,
      is_active: true,
      is_default: true
    }
  }
} 
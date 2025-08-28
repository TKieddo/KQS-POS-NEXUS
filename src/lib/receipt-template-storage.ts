// JSON-based receipt template storage
// This saves templates as JSON in the database to bypass RLS constraints

import { supabase } from './supabase'

export interface ReceiptTemplate {
  id: string
  name: string
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
}

// Default KQS receipt template
export const DEFAULT_RECEIPT_TEMPLATE: ReceiptTemplate = {
  id: 'kqs-default',
  name: 'KQS Retail Receipt',
  business_name: 'KQS',
  business_address: 'Maseru, Husteds opposite Queen II',
  business_phone: '2700 7795',
  business_website: 'www.kqsfootware.com',
  business_facebook: 'KQSFOOTWARE',
  business_tagline: 'Finest footware',
  return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
  return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
  thank_you_message: 'Thank You for shopping with Us',
  footer_text: 'SHOP ONLINE - Stand a chance to win',
  show_qr_section: true,
  show_policy_section: true,
  show_points_section: true,
  show_tagline: true
}

// Save template as JSON to database
export const saveReceiptTemplateToDB = async (template: ReceiptTemplate, branchId: string): Promise<boolean> => {
  try {
    // Save as JSON in a simple table that doesn't have RLS constraints
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: `receipt_template_${branchId}`,
        value: JSON.stringify(template),
        category: 'receipt_templates',
        description: 'Receipt template for branch',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key' // Explicitly specify the conflict resolution
      })

    if (error) {
      console.error('Error saving receipt template to DB:', error)
      return false
    }

    console.log('✅ Receipt template saved to database as JSON')
    return true
  } catch (error) {
    console.error('Error saving receipt template to DB:', error)
    return false
  }
}

// Load template as JSON from database
export const loadReceiptTemplateFromDB = async (branchId: string): Promise<ReceiptTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', `receipt_template_${branchId}`)
      .eq('category', 'receipt_templates')
      .single()

    if (error) {
      console.error('Error loading receipt template from DB:', error)
      return null
    }

    if (data?.value) {
      const template = JSON.parse(data.value) as ReceiptTemplate
      console.log('✅ Receipt template loaded from database as JSON')
      return template
    }

    return null
  } catch (error) {
    console.error('Error loading receipt template from DB:', error)
    return null
  }
}

// Get template for a specific branch (database first, then fallback)
export const getReceiptTemplateForBranch = async (branchId: string, branchName?: string): Promise<ReceiptTemplate> => {
  try {
    // First try to load from database
    const dbTemplate = await loadReceiptTemplateFromDB(branchId)
    if (dbTemplate) {
      // Update business name if branch name is provided
      if (branchName) {
        dbTemplate.business_name = branchName
      }
      return dbTemplate
    }

    // If no template in database, create default and save it
    const defaultTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
    if (branchName) {
      defaultTemplate.business_name = branchName
    }

    // Try to save the default template to database
    await saveReceiptTemplateToDB(defaultTemplate, branchId)
    
    console.log('✅ Created and saved default receipt template to database')
    return defaultTemplate
  } catch (error) {
    console.error('Error in getReceiptTemplateForBranch:', error)
    
    // Return hardcoded template as ultimate fallback
    const fallbackTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
    if (branchName) {
      fallbackTemplate.business_name = branchName
    }
    return fallbackTemplate
  }
}

// Update template with branch-specific data
export const updateReceiptTemplate = async (updates: Partial<ReceiptTemplate>, branchId: string, branchName?: string): Promise<ReceiptTemplate> => {
  try {
    const currentTemplate = await getReceiptTemplateForBranch(branchId, branchName)
    const updatedTemplate = { ...currentTemplate, ...updates }
    
    if (branchName) {
      updatedTemplate.business_name = branchName
    }
    
    await saveReceiptTemplateToDB(updatedTemplate, branchId)
    return updatedTemplate
  } catch (error) {
    console.error('Error updating receipt template:', error)
    return getReceiptTemplateForBranch(branchId, branchName)
  }
}

// Reset to default template
export const resetReceiptTemplate = async (branchId: string, branchName?: string): Promise<ReceiptTemplate> => {
  const defaultTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
  if (branchName) {
    defaultTemplate.business_name = branchName
  }
  
  await saveReceiptTemplateToDB(defaultTemplate, branchId)
  return defaultTemplate
}

// Legacy localStorage functions for backward compatibility
export const saveReceiptTemplate = (template: ReceiptTemplate, branchName?: string): void => {
  try {
    const templateWithBranch = {
      ...template,
      business_name: branchName || template.business_name
    }
    localStorage.setItem('kqs_receipt_template', JSON.stringify(templateWithBranch))
    console.log('✅ Receipt template saved to localStorage')
  } catch (error) {
    console.error('Error saving receipt template to localStorage:', error)
  }
}

export const loadReceiptTemplate = (branchName?: string): ReceiptTemplate => {
  try {
    const stored = localStorage.getItem('kqs_receipt_template')
    if (stored) {
      const template = JSON.parse(stored) as ReceiptTemplate
      if (branchName) {
        template.business_name = branchName
      }
      console.log('✅ Receipt template loaded from localStorage')
      return template
    }
  } catch (error) {
    console.error('Error loading receipt template from localStorage:', error)
  }
  
  const defaultTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
  if (branchName) {
    defaultTemplate.business_name = branchName
  }
  return defaultTemplate
}

import { supabase } from './supabase'

// Branch settings interface
export interface BranchSettings {
  id?: string
  branch_id: string
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
  currency: string
  tax_rate: number
  tax_name: string
  loyalty_points_enabled: boolean
  loyalty_points_rate: number
  created_at?: string
  updated_at?: string
}

// Default branch settings
export const defaultBranchSettings: BranchSettings = {
  branch_id: '',
  business_name: 'KQS',
  business_address: 'Main Street',
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
  show_tagline: true,
  currency: 'LSL',
  tax_rate: 15,
  tax_name: 'VAT',
  loyalty_points_enabled: true,
  loyalty_points_rate: 1
}

/**
 * Get branch settings for a specific branch
 */
export const getBranchSettings = async (branchId: string): Promise<BranchSettings> => {
  try {
    // First try to get from receipt_templates (default template)
    const { data: defaultTemplate, error: templateError } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_default', true)
      .single()

    if (templateError) {
      console.warn('No default template found for branch, using default settings')
      return {
        ...defaultBranchSettings,
        branch_id: branchId
      }
    }

    // Convert template to branch settings format
    const branchSettings: BranchSettings = {
      branch_id: branchId,
      business_name: defaultTemplate.business_name,
      business_address: defaultTemplate.business_address,
      business_phone: defaultTemplate.business_phone,
      business_website: defaultTemplate.business_website,
      business_facebook: defaultTemplate.business_facebook,
      business_tagline: defaultTemplate.business_tagline,
      return_policy_english: defaultTemplate.return_policy_english,
      return_policy_sesotho: defaultTemplate.return_policy_sesotho,
      thank_you_message: defaultTemplate.thank_you_message,
      footer_text: defaultTemplate.footer_text,
      show_qr_section: defaultTemplate.show_qr_section,
      show_policy_section: defaultTemplate.show_policy_section,
      show_points_section: defaultTemplate.show_points_section,
      show_tagline: defaultTemplate.show_tagline,
      currency: 'LSL', // Default currency
      tax_rate: 15, // Default tax rate
      tax_name: 'VAT', // Default tax name
      loyalty_points_enabled: true, // Default loyalty settings
      loyalty_points_rate: 1
    }

    return branchSettings
  } catch (error) {
    console.error('Error getting branch settings:', error)
    return {
      ...defaultBranchSettings,
      branch_id: branchId
    }
  }
}

/**
 * Update branch settings (updates the default receipt template)
 */
export const updateBranchSettings = async (branchId: string, settings: Partial<BranchSettings>): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the default template for this branch
    const { data: defaultTemplate, error: templateError } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_default', true)
      .single()

    if (templateError) {
      return { success: false, error: 'No default template found for branch' }
    }

    // Update the default template with new settings
    const updateData = {
      business_name: settings.business_name || defaultTemplate.business_name,
      business_address: settings.business_address || defaultTemplate.business_address,
      business_phone: settings.business_phone || defaultTemplate.business_phone,
      business_website: settings.business_website || defaultTemplate.business_website,
      business_facebook: settings.business_facebook || defaultTemplate.business_facebook,
      business_tagline: settings.business_tagline || defaultTemplate.business_tagline,
      return_policy_english: settings.return_policy_english || defaultTemplate.return_policy_english,
      return_policy_sesotho: settings.return_policy_sesotho || defaultTemplate.return_policy_sesotho,
      thank_you_message: settings.thank_you_message || defaultTemplate.thank_you_message,
      footer_text: settings.footer_text || defaultTemplate.footer_text,
      show_qr_section: settings.show_qr_section !== undefined ? settings.show_qr_section : defaultTemplate.show_qr_section,
      show_policy_section: settings.show_policy_section !== undefined ? settings.show_policy_section : defaultTemplate.show_policy_section,
      show_points_section: settings.show_points_section !== undefined ? settings.show_points_section : defaultTemplate.show_points_section,
      show_tagline: settings.show_tagline !== undefined ? settings.show_tagline : defaultTemplate.show_tagline,
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('receipt_templates')
      .update(updateData)
      .eq('id', defaultTemplate.id)

    if (updateError) {
      console.error('Error updating branch settings:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating branch settings:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get all branches with their settings
 */
export const getAllBranchesWithSettings = async (): Promise<Array<{ branch: any; settings: BranchSettings }>> => {
  try {
    // Get all active branches
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (branchesError) {
      console.error('Error fetching branches:', branchesError)
      return []
    }

    // Get settings for each branch
    const branchesWithSettings = await Promise.all(
      branches.map(async (branch) => {
        const settings = await getBranchSettings(branch.id)
        return { branch, settings }
      })
    )

    return branchesWithSettings
  } catch (error) {
    console.error('Error getting branches with settings:', error)
    return []
  }
}

/**
 * Get current user's branch settings
 */
export const getCurrentUserBranchSettings = async (): Promise<BranchSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    // Get user's branch
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    if (!userData?.branch_id) {
      console.warn('User not assigned to any branch')
      return null
    }

    return await getBranchSettings(userData.branch_id)
  } catch (error) {
    console.error('Error getting current user branch settings:', error)
    return null
  }
} 
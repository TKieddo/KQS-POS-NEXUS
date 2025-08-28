// Hardcoded Receipt Templates
// This eliminates all database complexity and ensures templates always work

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

// Branch-specific templates
export const BRANCH_TEMPLATES: Record<string, ReceiptTemplate> = {
  // Main Branch
  'main-branch': {
    ...DEFAULT_RECEIPT_TEMPLATE,
    id: 'main-branch',
    business_name: 'KQS Main Branch',
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
  },
  
  // Add more branches as needed
  'branch-2': {
    ...DEFAULT_RECEIPT_TEMPLATE,
    id: 'branch-2',
    business_name: 'KQS Branch 2',
    business_address: 'Maseru, City Center',
    business_phone: '2700 7796',
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
}

// Get template for a branch (with fallback to default)
export const getReceiptTemplateForBranch = (branchId: string, branchName?: string): ReceiptTemplate => {
  // Try to get branch-specific template
  const branchTemplate = BRANCH_TEMPLATES[branchId]
  if (branchTemplate) {
    // Update business name if provided
    if (branchName) {
      branchTemplate.business_name = branchName
    }
    return branchTemplate
  }
  
  // Fallback to default template
  const defaultTemplate = { ...DEFAULT_RECEIPT_TEMPLATE }
  if (branchName) {
    defaultTemplate.business_name = branchName
  }
  
  return defaultTemplate
}

// Get all available templates
export const getAllTemplates = (): ReceiptTemplate[] => {
  return Object.values(BRANCH_TEMPLATES)
}

// Update template for a branch (this would be used if you want to customize)
export const updateBranchTemplate = (branchId: string, updates: Partial<ReceiptTemplate>): void => {
  if (BRANCH_TEMPLATES[branchId]) {
    BRANCH_TEMPLATES[branchId] = { ...BRANCH_TEMPLATES[branchId], ...updates }
  }
}

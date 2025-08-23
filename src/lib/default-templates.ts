import type { ReceiptTemplate } from './receipt-template-service'

// Base template with common settings
const baseTemplate: Partial<ReceiptTemplate> = {
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
  show_tagline: true,
  is_active: true,
  layout: {}, // Add empty layout object to satisfy NOT NULL constraint
  template_settings: {} // Add empty template_settings object
}

// Generate default templates for all receipt types
export const generateDefaultTemplates = (): ReceiptTemplate[] => {
  return [
    {
      ...baseTemplate,
      name: 'KQS Retail Receipt',
      description: 'Standard retail receipt template with business information and policies',
      template_type: 'standard',
      is_default: true
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Final Laybye Payment',
      description: 'Final laybye payment receipt with balance tracking and progress display',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Laybye Payment Receipt',
      description: 'Laybye payment receipt with balance tracking and progress display',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Quotation Slip',
      description: 'Quotation slip template for price estimates and proposals',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Delivery Slip',
      description: 'Delivery slip template for order fulfillment and tracking',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Refund Slip',
      description: 'Refund slip template for returns and exchanges',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Cash Drop Receipt',
      description: 'Cash drop receipt template for till management',
      template_type: 'standard',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Order Slip',
      description: 'Order slip template for pending orders and reservations',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Cash Up Report',
      description: 'Cash up report template for end-of-day reconciliation',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Till Session Report',
      description: 'Till session report template for shift summaries',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Intermediate Bill',
      description: 'Intermediate bill template for partial payments',
      template_type: 'standard',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Account Payment Receipt',
      description: 'Account payment receipt template for credit customers',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Laybye Reserve Slip',
      description: 'Laybye reserve slip template for initial deposits',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Laybye Cancellation Receipt',
      description: 'Laybye cancellation receipt template for refunds',
      template_type: 'standard',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Returns & Exchange Slip',
      description: 'Returns and exchange slip template for customer service',
      template_type: 'compact',
      is_default: false
    } as ReceiptTemplate,
    
    {
      ...baseTemplate,
      name: 'KQS Customer Statement',
      description: 'Customer statement template for account summaries',
      template_type: 'detailed',
      is_default: false
    } as ReceiptTemplate
  ]
}

// Get template by name (since we can't use custom template types)
export const getTemplateByName = (name: string): ReceiptTemplate | null => {
  const templates = generateDefaultTemplates()
  return templates.find(t => t.name.toLowerCase().includes(name.toLowerCase())) || null
}

// Get all template names
export const getTemplateNames = (): string[] => {
  return generateDefaultTemplates().map(t => t.name)
} 
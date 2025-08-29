import { supabase } from './supabase'
import { printReceipt } from './qz-printing'
import type { ReceiptTemplate } from './receipt-template-service'

export interface PrintReceiptData {
  transactionType: 'sale' | 'laybye_payment' | 'laybye_final' | 'laybye_reserve' | 'refund' | 'account_payment' | 'cash_up' | 'till_session' | 'cash_drop' | 'delivery' | 'quotation' | 'order' | 'returns_exchange' | 'laybye_cancellation' | 'customer_statement' | 'intermediate_bill'
  branchId: string
  transactionData: any
  printerName?: string
}

export interface TransactionData {
  // Common fields
  transactionNumber: string
  date: string
  time: string
  cashier: string
  customer?: string
  
  // Sale specific
  items?: Array<{
    name: string
    quantity: number
    price: number
    total: number
    category?: string
  }>
  subtotal?: number
  tax?: number
  discount?: number
  total?: number
  paymentMethod?: string
  amountPaid?: number
  change?: number
  splitPayments?: Array<{
    method: string
    amount: number
  }>
  
  // Laybye specific
  laybyeId?: string
  paymentId?: string
  paymentAmount?: number
  balanceRemaining?: number
  totalPaid?: number
  
  // Laybye completion specific
  laybyeStartDate?: string
  completionDate?: string
  totalDaysTaken?: number
  daysEarly?: number
  
  // Refund specific
  refundAmount?: number
  refundReason?: string
  originalSaleNumber?: string
  
  // Account specific
  accountNumber?: string
  accountBalance?: number
  previousBalance?: number
  newBalance?: number
  
  // Cash up specific
  openingFloat?: number
  cashSales?: number
  cardSales?: number
  cashDrops?: number
  cashPayouts?: number
  closingBalance?: number
  countedCash?: number
  variance?: number
  notes?: string
  
  // Till session specific
  laybyePayments?: number
  sessionTotal?: number
  
  // Cash drop specific
  sessionNumber?: string
  amountDropped?: number
  reason?: string
  tillBalanceBefore?: number
  tillBalanceAfter?: number
  
  // Delivery specific
  address?: string
  phone?: string
  deliveryInstructions?: string
  
  // Quotation specific
  validUntil?: string
  
  // Order specific
  expectedDelivery?: string
  depositRequired?: number
  balanceOnDelivery?: number
  
  // Returns & Exchange specific
  returnedItems?: Array<{
    name: string
    size?: string
    reason: string
  }>
  exchangedItems?: Array<{
    name: string
    size?: string
  }>
  
  // Customer statement specific
  
  // Loyalty points
  pointsEarned?: number
  pointsUsed?: number
  transactions?: Array<{
    date: string
    description: string
    debit: number
    credit: number
    balance: number
  }>
  currentBalance?: number
  creditLimit?: number
  availableCredit?: number
}

// Printer connection status
let qzConnected = false
let qzPrinters: string[] = []

// Initialize QZ Tray connection
export const initializeQZTray = async (): Promise<{ connected: boolean; printers: string[] }> => {
  try {
    // Check if QZ Tray is available
    if (typeof window !== 'undefined' && (window as any).qz) {
      const qz = (window as any).qz
      
      // Check if already connected
      if (qz.websocket.isActive()) {
        qzConnected = true
        const printers = await qz.printers.get()
        qzPrinters = printers
        return { connected: true, printers }
      }
      
      // Try to connect
      await qz.websocket.connect()
      qzConnected = true
      const printers = await qz.printers.get()
      qzPrinters = printers
      return { connected: true, printers }
    }
    
    return { connected: false, printers: [] }
  } catch (error) {
    console.warn('QZ Tray not available:', error)
    return { connected: false, printers: [] }
  }
}

// Get available printers
export const getAvailablePrinters = async (): Promise<string[]> => {
  if (qzConnected) {
    return qzPrinters
  }
  
  const result = await initializeQZTray()
  return result.printers
}

// Browser printing fallback
const printToBrowser = (receiptHtml: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const printWindow = window.open('', '_blank', 'width=600,height=800')
      if (!printWindow) {
        resolve(false)
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
                         @media print {
            body {
              margin: 0;
                 padding: 0; 
                 font-size: 20px;
                 line-height: 1.3;
                 font-weight: 600;
            }
            .receipt {
                 width: calc(100% - 50px); 
                 margin: 0 25px 0 25px; 
                 page-break-after: always;
                 max-height: 100vh;
               }
               @page { 
                 margin: 0; 
                 size: 80mm auto; 
               }
             }
             body {
               font-family: 'Bahnschrift SemiBold', 'Segoe UI', sans-serif;
               font-size: 20px;
               line-height: 1.3;
               font-weight: 600;
               margin: 0;
               padding: 1px;
               background: white;
             }
                         .receipt {
               width: calc(100% - 50px);
               margin: 0 25px 0 25px;
               background: white;
               border: none;
               padding: 1px;
             }
            .header {
              text-align: center;
              margin-bottom: 1px;
            }
                         .logo {
               width: 100%;
               height: auto;
               margin: 0 auto 1px;
               display: block;
             }
                         .business-name {
               font-size: 22px;
               font-weight: 800;
               margin-bottom: 1px;
             }
             .receipt-type {
               font-size: 21px;
               font-weight: 800;
             }
            .info-section {
              margin-bottom: 1px;
            }
                         .info-line {
               margin: 0.3px 0;
               font-weight: 400;
               font-size: 18px;
             }
            .divider {
              text-align: center;
              color: #999;
              margin: 1px 0;
            }
            .items-table {
              margin-bottom: 1px;
            }
                                      .table-header {
               display: grid;
               grid-template-columns: 1fr auto;
               gap: 1px;
               font-weight: 800;
               margin-bottom: 0.5px;
             }
             .item-row {
               display: grid;
               grid-template-columns: 1fr auto;
               gap: 1px;
               padding: 0.5px 0;
              word-wrap: break-word;
               overflow-wrap: break-word;
             }
            .item-row:nth-child(even) {
              background-color: #f5f5f5;
            }
                         .item-details {
               display: flex;
               align-items: flex-start;
               gap: 1px;
               flex-wrap: wrap;
               max-width: 100%;
               word-wrap: break-word;
               overflow-wrap: break-word;
             }
            .category-icon {
              width: 8px;
              height: 8px;
            }
                         .item-quantity {
               color: #666;
               margin-left: 1px;
               font-weight: 800;
             }
            .totals-section {
              margin-bottom: 1px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin: 0.3px 0;
            }
                         .total-line.final {
               font-weight: 800;
               border-top: 1px solid #ccc;
               padding-top: 1px;
             }
            .payment-section {
              margin-bottom: 1px;
            }
                         .points-section {
               text-align: center;
               margin-bottom: 1px;
               font-size: 19px;
             }
             .tagline {
               text-align: center;
               font-style: italic;
               font-weight: 600;
               margin-bottom: 1px;
               color: #666;
               font-size: 19px;
             }
            .policy-section {
              margin-bottom: 1px;
            }
                         .policy-title {
               text-align: center;
               font-weight: 800;
               margin-bottom: 0.5px;
               font-size: 19px;
             }
             .policy-content {
               background-color: #f9f9f9;
               padding: 1px;
               border-radius: 1px;
               font-size: 18px;
               line-height: 1.2;
             }
            .qr-section {
              margin-bottom: 1px;
            }
                         .promo-text {
               text-align: center;
               font-weight: 600;
               font-size: 19px;
               margin-bottom: 0.5px;
             }
            .qr-container {
              display: flex;
              align-items: center;
              background-color: #f9f9f9;
              padding: 1px;
              border-radius: 1px;
            }
            .qr-code {
              width: 20px;
              height: 20px;
              background: black;
              border-radius: 2px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 3px;
            }
            .qr-pattern {
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 1px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(3, 1fr);
              gap: 0.5px;
              padding: 0.5px;
            }
            .qr-dot {
              width: 100%;
              height: 100%;
              border-radius: 0.5px;
            }
            .qr-dot.black { background: black; }
            .qr-dot.white { background: white; }
            .contact-info {
              flex: 1;
            }
                         .contact-line {
               margin: 0.3px 0;
               font-size: 18px;
             }
             .contact-label {
               font-weight: 600;
             }
             .thank-you {
               text-align: center;
               font-weight: 600;
               margin-bottom: 1px;
               font-size: 19px;
            }
          </style>
        </head>
        <body>
          <div class="receipt">${receiptHtml}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
        </html>
      `)
      
      printWindow.document.close()
      resolve(true)
    } catch (error) {
      console.error('Browser printing failed:', error)
      resolve(false)
    }
  })
}

// Convert ESC/POS data to HTML for browser printing
const convertEscPosToHtml = (escPosData: string[]): string => {
  let html = ''
  
  escPosData.forEach(line => {
    // Handle ESC/POS commands
    if (line.includes('\x1B\x61\x01')) {
      html += '<div style="text-align: center;">'
    } else if (line.includes('\x1B\x61\x00')) {
      html += '</div>'
    } else if (line.includes('\x1B\x45\x01')) {
      html += '<strong>'
    } else if (line.includes('\x1B\x45\x00')) {
      html += '</strong>'
    } else if (line.includes('\x1B\x40')) {
      // Initialize printer - ignore
    } else if (line.includes('\x1B\x69') || line.includes('\x1B\x6D')) {
      // Cut paper - add page break
      html += '<div style="page-break-after: always;"></div>'
    } else if (line.includes('\x0A')) {
      // New line
      html += '<br>'
    } else {
      // Regular text
      html += line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') + '<br>'
    }
  })
  
  return html
}

/**
 * Create a new receipt template in the database
 */
const createReceiptTemplate = async (
  branchId: string,
  templateName: string,
  category: string,
  templateType: 'standard' | 'compact' | 'detailed' | 'custom' = 'standard'
): Promise<ReceiptTemplate | null> => {
  try {
    // Get branch info to populate template data
    const { data: branch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single()

    const templateData = {
      business_name: branch?.name || 'KQS',
      business_address: branch?.address || 'Maseru, Husteds opposite Queen II',
      business_phone: branch?.phone || '2700 7795',
      business_website: 'www.kqsfootware.com',
      business_facebook: 'KQSFOOTWARE',
      business_tagline: 'Finest footware',
      return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt.',
      return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa.',
      thank_you_message: 'Thank You for shopping with Us',
      footer_text: 'SHOP ONLINE - Stand a chance to win',
      show_qr_section: true,
      show_policy_section: true,
      show_points_section: true,
      show_tagline: true,
      template_type: templateType
    }

    const { data: newTemplate, error } = await supabase
      .from('report_templates')
      .insert({
        branch_id: branchId,
        name: templateName,
        description: `${templateName} template for ${branch?.name || 'KQS'}`,
        category: category,
        template_data: templateData,
        is_default: false,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return null
    }

    console.log(`✅ Created new template: ${templateName}`)
    
    // Convert to ReceiptTemplate format
    return {
      id: newTemplate.id,
      name: newTemplate.name,
      description: newTemplate.description || '',
      template_type: templateData.template_type,
      business_name: templateData.business_name,
      business_address: templateData.business_address,
      business_phone: templateData.business_phone,
      business_website: templateData.business_website,
      business_facebook: templateData.business_facebook,
      business_tagline: templateData.business_tagline,
      return_policy_english: templateData.return_policy_english,
      return_policy_sesotho: templateData.return_policy_sesotho,
      thank_you_message: templateData.thank_you_message,
      footer_text: templateData.footer_text,
      show_qr_section: templateData.show_qr_section,
      show_policy_section: templateData.show_policy_section,
      show_points_section: templateData.show_points_section,
      show_tagline: templateData.show_tagline,
      is_active: newTemplate.is_active !== false,
      is_default: newTemplate.is_default || false,
      branch_id: newTemplate.branch_id,
      layout: {},
      template_settings: {},
      created_at: newTemplate.created_at,
      updated_at: newTemplate.updated_at
    }
  } catch (error) {
    console.error('Error creating receipt template:', error)
    return null
  }
}

/**
 * Get the appropriate receipt template for a transaction type and branch
 */
export const getReceiptTemplateForTransaction = async (
  transactionType: string,
  branchId: string
): Promise<ReceiptTemplate | null> => {
  try {
    // Map transaction types to template names and categories
    const templateConfig: Record<string, { name: string; category: string; type: 'standard' | 'compact' | 'detailed' | 'custom' }> = {
      'sale': { name: 'KQS Retail Receipt', category: 'sales', type: 'standard' },
      'laybye_payment': { name: 'KQS Laybye Payment Receipt', category: 'sales', type: 'detailed' },
      'laybye_final': { name: 'KQS Final Laybye Payment Receipt', category: 'sales', type: 'detailed' },
      'laybye_final_payment': { name: 'KQS Final Laybye Payment Receipt', category: 'sales', type: 'detailed' },
      'laybye_reserve': { name: 'KQS Laybye Reserve Slip', category: 'sales', type: 'compact' },
      'refund': { name: 'KQS Refund Slip', category: 'sales', type: 'compact' },
      'account_payment': { name: 'KQS Account Payment Receipt', category: 'customers', type: 'detailed' },
      'cash_up': { name: 'KQS Cash Up Report', category: 'financial', type: 'detailed' },
      'till_session': { name: 'KQS Till Session Report', category: 'financial', type: 'detailed' },
      'cash_drop': { name: 'KQS Cash Drop Receipt', category: 'financial', type: 'standard' },
      'delivery': { name: 'KQS Delivery Slip', category: 'sales', type: 'compact' },
      'quotation': { name: 'KQS Quotation Slip', category: 'sales', type: 'compact' },
      'order': { name: 'KQS Order Slip', category: 'sales', type: 'compact' },
      'returns_exchange': { name: 'KQS Returns & Exchange Slip', category: 'sales', type: 'compact' },
      'laybye_cancellation': { name: 'KQS Laybye Cancellation Receipt', category: 'sales', type: 'standard' },
      'customer_statement': { name: 'KQS Customer Statement', category: 'customers', type: 'detailed' },
      'intermediate_bill': { name: 'KQS Intermediate Bill', category: 'sales', type: 'standard' }
    }

    const config = templateConfig[transactionType] || templateConfig['sale']
    const templateName = config.name

    // First try to find the specific template for this transaction type
    let { data: template, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('branch_id', branchId)
      .eq('name', templateName)
      .single()

    if (error || !template) {
      console.log(`Template ${templateName} not found, attempting to create it...`)
      
      // Try to create the missing template
      const newTemplate = await createReceiptTemplate(branchId, templateName, config.category, config.type)
      
      if (newTemplate) {
        template = {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description,
          category: config.category,
          template_data: {
            business_name: newTemplate.business_name,
            business_address: newTemplate.business_address,
            business_phone: newTemplate.business_phone,
            business_website: newTemplate.business_website,
            business_facebook: newTemplate.business_facebook,
            business_tagline: newTemplate.business_tagline,
            return_policy_english: newTemplate.return_policy_english,
            return_policy_sesotho: newTemplate.return_policy_sesotho,
            thank_you_message: newTemplate.thank_you_message,
            footer_text: newTemplate.footer_text,
            show_qr_section: newTemplate.show_qr_section,
            show_policy_section: newTemplate.show_policy_section,
            show_points_section: newTemplate.show_points_section,
            show_tagline: newTemplate.show_tagline,
            template_type: newTemplate.template_type
          },
          is_default: newTemplate.is_default,
          is_active: newTemplate.is_active,
          branch_id: newTemplate.branch_id,
          created_at: newTemplate.created_at,
          updated_at: newTemplate.updated_at
        }
      } else {
        console.log(`Failed to create template ${templateName}, trying default template`)
        
        // If creation failed, try to get the appropriate default template based on transaction type
        let defaultTemplateName = 'KQS Retail Receipt' // Default for sales
        
        // Set appropriate default based on transaction type
        if (transactionType === 'laybye_payment' || transactionType === 'laybye_reserve' || transactionType === 'laybye_final') {
          defaultTemplateName = 'KQS Laybye Payment Receipt'
        } else if (transactionType === 'account_payment' || transactionType === 'customer_statement') {
          defaultTemplateName = 'KQS Account Payment Receipt'
        } else if (transactionType === 'cash_up' || transactionType === 'till_session' || transactionType === 'cash_drop') {
          defaultTemplateName = 'KQS Cash Up Report'
        }
        
        const { data: defaultTemplate, error: defaultError } = await supabase
          .from('report_templates')
          .select('*')
          .eq('branch_id', branchId)
          .eq('name', defaultTemplateName)
          .single()

        if (defaultError || !defaultTemplate) {
          console.warn(`No ${defaultTemplateName} template found for branch, using fallback settings`)
          // Return a fallback template with basic settings
      return {
            id: 'fallback',
            name: 'Fallback Template',
            description: 'Fallback receipt template',
        template_type: 'standard',
        business_name: 'KQS',
        business_address: 'Maseru, Husteds opposite Queen II',
        business_phone: '2700 7795',
        business_website: 'www.kqsfootware.com',
        business_facebook: 'KQSFOOTWARE',
        business_tagline: 'Finest footware',
        return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt.',
        return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa.',
        thank_you_message: 'Thank You for shopping with Us',
        footer_text: 'SHOP ONLINE - Stand a chance to win',
        show_qr_section: true,
        show_policy_section: true,
        show_points_section: true,
        show_tagline: true,
        is_active: true,
        is_default: true,
        branch_id: branchId,
        layout: {},
        template_settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

        template = defaultTemplate
      }
    }

    // Convert report_template to ReceiptTemplate format
    const templateData = template.template_data || {}
    
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      template_type: templateData.template_type || 'standard',
      business_name: templateData.business_name || 'KQS',
      business_address: templateData.business_address || 'Maseru, Husteds opposite Queen II',
      business_phone: templateData.business_phone || '2700 7795',
      business_website: templateData.business_website || 'www.kqsfootware.com',
      business_facebook: templateData.business_facebook || 'KQSFOOTWARE',
      business_tagline: templateData.business_tagline || 'Finest footware',
      return_policy_english: templateData.return_policy_english || 'Returns and exchanges accepted within 7 days of purchase with a valid receipt.',
      return_policy_sesotho: templateData.return_policy_sesotho || 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa.',
      thank_you_message: templateData.thank_you_message || 'Thank You for shopping with Us',
      footer_text: templateData.footer_text || 'SHOP ONLINE - Stand a chance to win',
      show_qr_section: templateData.show_qr_section !== false,
      show_policy_section: templateData.show_policy_section !== false,
      show_points_section: templateData.show_points_section !== false,
      show_tagline: templateData.show_tagline !== false,
      is_active: template.is_active !== false,
      is_default: template.is_default || false,
      branch_id: template.branch_id,
      layout: {},
      template_settings: {},
      created_at: template.created_at,
      updated_at: template.updated_at
    }

  } catch (error) {
    console.error('Error getting receipt template:', error)
    return null
  }
}

/**
 * Main function to print transaction receipts using QZ Tray
 */
export const printTransactionReceipt = async (data: PrintReceiptData): Promise<{
  success: boolean
  method: 'qz_tray' | 'browser' | 'none'
  error?: string
}> => {
  try {
    console.log('Starting receipt printing for transaction type:', data.transactionType)
    
    // Get the appropriate template for this transaction type
    const template = await getReceiptTemplateForTransaction(data.transactionType, data.branchId)
    
    if (!template) {
      console.error('No template found for transaction type:', data.transactionType)
      return {
        success: false,
        method: 'none',
        error: 'No receipt template found'
      }
    }

    console.log('Using template:', template.name)

    // Generate ESC/POS data using the template from receipts page
    const escPosData = await createPrintData(template, data.transactionData, data.transactionType)
    
    if (!escPosData || escPosData.length === 0) {
      console.error('Failed to generate ESC/POS data')
      return {
        success: false,
        method: 'none',
        error: 'Failed to generate receipt data'
      }
    }

    // Try QZ Tray printing first
    try {
      const qzResult = await initializeQZTray()
      
      if (qzResult.connected && qzResult.printers.length > 0) {
        const printerName = data.printerName || qzResult.printers[0]
        
        console.log('Printing via QZ Tray to printer:', printerName)
        
        // Use the printReceipt function from qz-printing
        await printReceipt(printerName, escPosData)
        
        return {
          success: true,
          method: 'qz_tray'
        }
      }
    } catch (qzError) {
      console.warn('QZ Tray printing failed, falling back to browser:', qzError)
    }

    // Fallback to browser printing with beautiful receipt
    try {
      let receiptHtml: string
      
      if (data.transactionType === 'laybye_payment') {
        receiptHtml = await createBeautifulLaybyePaymentReceiptHtml(data.transactionData, data.branchId)
      } else if (data.transactionType === 'laybye_final') {
        receiptHtml = await createBeautifulLaybyeFinalReceiptHtml(data.transactionData, data.branchId)
      } else if (data.transactionType === 'laybye_reserve') {
        receiptHtml = await createBeautifulLaybyeReserveReceiptHtml(data.transactionData, data.branchId)
      } else {
        receiptHtml = await createBeautifulRetailReceiptHtml(data.transactionData, data.branchId)
      }
      
      const browserResult = await printToBrowser(receiptHtml)
      
      if (browserResult) {
        return {
          success: true,
          method: 'browser'
        }
      }
    } catch (browserError) {
      console.error('Browser printing failed:', browserError)
    }

    return {
      success: false,
      method: 'none',
      error: 'All printing methods failed'
    }

  } catch (error) {
    console.error('Error in printTransactionReceipt:', error)
    return {
      success: false,
      method: 'none',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create print data using the same logic as the receipts page
 */
const createPrintData = async (template: ReceiptTemplate, transactionData: TransactionData, transactionType: string): Promise<string[]> => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  const data: string[] = []
  
  data.push(ESC + "@") // Initialize printer

  // Get template type and generate appropriate content
  const templateName = template.name.toLowerCase()
  
  // Check if this is an internal receipt type that shouldn't have a logo
  const isInternalReceipt = templateName.includes('cash up') || 
                           templateName.includes('laybye reserve') ||
                           templateName.includes('till session') ||
                           templateName.includes('cash drop')

  // Only add logo for non-internal receipts
  if (!isInternalReceipt) {
    // Logo (centered)
    data.push(ESC + "a" + "\x01")
    data.push(ESC + "!" + "\x08")
    data.push(ESC + "E" + "\x01")
    data.push(template.business_name + NEWLINE)
    data.push(ESC + "E" + "\x00")
    data.push(ESC + "!" + "\x00")
  }

  // Generate content based on transaction type using the same logic as receipts page
  switch (transactionType) {
    case 'sale':
      return createSaleReceiptData(template, transactionData, data)
    case 'laybye_payment':
      return createLaybyePaymentReceiptData(template, transactionData, data)
    case 'laybye_final':
      return createLaybyeFinalReceiptData(template, transactionData, data)
    case 'laybye_reserve':
      return createLaybyeReserveReceiptData(template, transactionData, data)
    case 'refund':
      return createRefundReceiptData(template, transactionData, data)
    case 'account_payment':
      return createAccountPaymentReceiptData(template, transactionData, data)
    case 'cash_up':
      return createCashUpReceiptData(template, transactionData, data)
    case 'till_session':
      return createTillSessionReceiptData(template, transactionData, data)
    case 'cash_drop':
      return createCashDropReceiptData(template, transactionData, data)
    case 'delivery':
      return createDeliveryReceiptData(template, transactionData, data)
    case 'quotation':
      return createQuotationReceiptData(template, transactionData, data)
    case 'order':
      return createOrderReceiptData(template, transactionData, data)
    case 'returns_exchange':
      return createReturnsExchangeReceiptData(template, transactionData, data)
    case 'laybye_cancellation':
      return createLaybyeCancellationReceiptData(template, transactionData, data)
    case 'customer_statement':
      return createCustomerStatementReceiptData(template, transactionData, data)
    case 'intermediate_bill':
      return createIntermediateBillReceiptData(template, transactionData, data)
    default:
      return createSaleReceiptData(template, transactionData, data) // Default to sale receipt
  }
}

// Helper functions for different receipt types (using the same logic as receipts page)
const createSaleReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  // Header with logo and business name
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push(template.business_name + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("Retail Receipt" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  // Transaction info
  receiptData.push(`Receipt #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Items with compact formatting
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
    
    data.items.forEach(item => {
       // Truncate long item names to fit on receipt
       const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
       const quantity = `x${item.quantity}`
       const total = item.total.toFixed(2)
       
       // Format: Item Name xQty                    Total
       const line = `${itemName} ${quantity.padStart(25 - itemName.length)}${total.padStart(12)}`
       receiptData.push(line + NEWLINE)
     })
  }
  
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
     // Totals with compact spacing
  if (data.subtotal !== undefined) {
     receiptData.push(`Subtotal                    ${data.subtotal.toFixed(2)}` + NEWLINE)
  }
   if (data.tax !== undefined && data.tax > 0) {
     receiptData.push(`Tax                         ${data.tax.toFixed(2)}` + NEWLINE)
  }
  if (data.discount !== undefined && data.discount > 0) {
     receiptData.push(`Discount                    -${data.discount.toFixed(2)}` + NEWLINE)
  }
  
  receiptData.push("==========================================" + NEWLINE)
   receiptData.push(ESC + "E" + "\x01") // Bold on
   receiptData.push(`TOTAL                       ${data.total?.toFixed(2) || '0.00'}` + NEWLINE)
   receiptData.push(ESC + "E" + "\x00") // Bold off
   
   // Payment details
  if (data.splitPayments && data.splitPayments.length > 0) {
     console.log('🎯 Thermal Receipt - Processing split payments:', data.splitPayments)
     // Show split payments without header
     data.splitPayments.forEach((payment, index) => {
       // Ensure payment method name fits within 20 characters, truncate if needed
       const methodName = payment.method.length > 20 ? payment.method.substring(0, 17) + '...' : payment.method
       console.log(`🎯 Thermal Receipt - Adding payment ${index + 1}:`, methodName, payment.amount)
       receiptData.push(`${methodName.padEnd(20)}${payment.amount.toFixed(2).padStart(20)}` + NEWLINE)
     })
     
     receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
     receiptData.push(ESC + "E" + "\x01") // Bold on
     receiptData.push(`TOTAL PAID                  ${data.amountPaid?.toFixed(2) || '0.00'}` + NEWLINE)
     receiptData.push(ESC + "E" + "\x00") // Bold off
   } else if (data.paymentMethod) {
     // Single payment method
     receiptData.push(`${data.paymentMethod}                       ${data.amountPaid?.toFixed(2) || '0.00'}` + NEWLINE)
   }
   console.log('🎯 Thermal Receipt - Change amount:', data.change)
   if (data.change !== undefined && data.change > 0) {
     receiptData.push(`Change                      ${data.change.toFixed(2)}` + NEWLINE)
   }
  
  // Business tagline
  if (template.show_tagline) {
    receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push(template.business_tagline + NEWLINE)
    receiptData.push(ESC + "a" + "\x00") // Left alignment
  }
  
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Add template policies (compact)
  if (template.show_policy_section) {
    receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Return & Exchange Policy" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push(ESC + "a" + "\x00") // Left alignment
    
    // Compact policy text
    const policyEnglish = template.return_policy_english.length > 40 
      ? template.return_policy_english.substring(0, 37) + '...'
      : template.return_policy_english
    receiptData.push(policyEnglish + NEWLINE)
    
    const policySesotho = template.return_policy_sesotho.length > 40
      ? template.return_policy_sesotho.substring(0, 37) + '...'
      : template.return_policy_sesotho
    receiptData.push(policySesotho + NEWLINE)
  }
  
  // QR section with contact info
  if (template.show_qr_section) {
    receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(template.footer_text + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push(ESC + "a" + "\x00") // Left alignment
    
    receiptData.push(`Address: ${template.business_address}` + NEWLINE)
    receiptData.push(`Phone: ${template.business_phone}` + NEWLINE)
    receiptData.push(`Website: ${template.business_website}` + NEWLINE)
    receiptData.push(`Facebook: ${template.business_facebook}` + NEWLINE)
  }
  
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Thank you message
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push(template.thank_you_message + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  // Add minimal spacing and cut
  receiptData.push(NEWLINE)
  receiptData.push(NEWLINE)
  receiptData.push(ESC + "J" + String.fromCharCode(20)) // Feed paper
  receiptData.push(ESC + "m") // Cut paper
  
  return receiptData
}

const createLaybyePaymentReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  // Header with logo and business name
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push(template.business_name + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("Laybye Payment Receipt" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  // Transaction info
  receiptData.push(`Receipt #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Laybye ID: ${data.laybyeId}` + NEWLINE)
  receiptData.push(`Payment ID: ${data.paymentId}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Items with compact formatting
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
    
    data.items.forEach(item => {
      // Truncate long item names to fit on receipt
      const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
      const quantity = `x${item.quantity}`
      const total = item.total.toFixed(2)
      
      // Format: Item Name xQty                    Total
      const line = `${itemName} ${quantity.padStart(25 - itemName.length)}${total.padStart(12)}`
      receiptData.push(line + NEWLINE)
    })
    
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  }
  
  // Payment and balance details
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("Payment Details" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  if (data.total) {
    receiptData.push(`Total Laybye Amount           ${data.total.toFixed(2)}` + NEWLINE)
  }
  if (data.paymentAmount) {
    receiptData.push(`This Payment Amount           ${data.paymentAmount.toFixed(2)}` + NEWLINE)
  }
  if (data.totalPaid) {
    receiptData.push(`Total Already Paid            ${data.totalPaid.toFixed(2)}` + NEWLINE)
  }
  if (data.balanceRemaining) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Balance Remaining             ${data.balanceRemaining.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Payment method
  if (data.paymentMethod) {
    receiptData.push(`Payment Method: ${data.paymentMethod.toUpperCase()}` + NEWLINE)
  }
  
  // Lay-bye Policy
    receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("Lay-bye Policy" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push(ESC + "a" + "\x00") // Left alignment
  receiptData.push("NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size." + NEWLINE)
  receiptData.push("(Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle Le ha ese felletsoe ke nako." + NEWLINE)
  
  // Footer
  receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  receiptData.push("Thank you for your payment!" + NEWLINE)
  receiptData.push("Please keep this receipt for your records." + NEWLINE)
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  return receiptData
}

const createLaybyeFinalReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  // Header with logo and business name
    receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push(template.business_name + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("LAYBYE FINAL RECEIPT" + NEWLINE)
    receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  // Transaction info
  receiptData.push(`Receipt #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Laybye ID: ${data.laybyeId}` + NEWLINE)
  receiptData.push(`Final Payment ID: ${data.paymentId}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Items with compact formatting
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
    
    data.items.forEach(item => {
      // Truncate long item names to fit on receipt
      const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
      const quantity = `x${item.quantity}`
      const total = item.total.toFixed(2)
      
      // Format: Item Name xQty                    Total
      const line = `${itemName} ${quantity.padStart(25 - itemName.length)}${total.padStart(12)}`
      receiptData.push(line + NEWLINE)
    })
    
    receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  }
  
  // Final payment details
    receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("FINAL PAYMENT DETAILS" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  if (data.total) {
    receiptData.push(`Total Laybye Amount           ${data.total.toFixed(2)}` + NEWLINE)
  }
  if (data.paymentAmount) {
    receiptData.push(`Final Payment Amount          ${data.paymentAmount.toFixed(2)}` + NEWLINE)
  }
  if (data.totalPaid) {
    receiptData.push(`Total Paid                    ${data.totalPaid.toFixed(2)}` + NEWLINE)
  }
  
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("LAYBYE COMPLETED!" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  
  // Payment method
  if (data.paymentMethod) {
    receiptData.push(`Payment Method: ${data.paymentMethod.toUpperCase()}` + NEWLINE)
  }
  
  // Final completion message
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("CONGRATULATIONS!" + NEWLINE)
  receiptData.push("Your laybye is now complete!" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("You can now collect your items." + NEWLINE)
  receiptData.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + NEWLINE)
  receiptData.push("Thank you for choosing us!" + NEWLINE)
  receiptData.push("Please keep this receipt for your records." + NEWLINE)
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  
  return receiptData
}

const createRefundReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Refund Slip" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Refund #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Original Sale: ${data.originalSaleNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  // Items
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01")
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00")
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name} x${item.quantity}            R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  receiptData.push(`Refund Amount                 R${data.refundAmount?.toFixed(2)}` + NEWLINE)
  if (data.refundReason) {
    receiptData.push(`Reason: ${data.refundReason}` + NEWLINE)
  }
  
  return addReceiptFooter(template, receiptData)
}

const createCashUpReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push(ESC + "a" + "\x01")
  receiptData.push(ESC + "E" + "\x01")
  receiptData.push("KQS" + NEWLINE)
  receiptData.push("Cash Up Report" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00")
  receiptData.push(ESC + "a" + "\x00")
  
  receiptData.push(`Report #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push("------------------------------------------" + NEWLINE)
  
  receiptData.push(ESC + "E" + "\x01")
  receiptData.push("Detail                    Amount" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00")
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.openingFloat) receiptData.push(`Opening Float                R${data.openingFloat.toFixed(2)}` + NEWLINE)
  if (data.cashSales) receiptData.push(`Cash Sales                   R${data.cashSales.toFixed(2)}` + NEWLINE)
  if (data.cardSales) receiptData.push(`Card Sales                   R${data.cardSales.toFixed(2)}` + NEWLINE)
  if (data.cashDrops) receiptData.push(`Cash Drops                   -R${data.cashDrops.toFixed(2)}` + NEWLINE)
  if (data.cashPayouts) receiptData.push(`Cash Payouts                 -R${data.cashPayouts.toFixed(2)}` + NEWLINE)
  
  receiptData.push(ESC + "E" + "\x01")
  receiptData.push(`Closing Balance              R${data.closingBalance?.toFixed(2)}` + NEWLINE)
  receiptData.push(ESC + "E" + "\x00")
  
  if (data.countedCash) receiptData.push(`Counted Cash                 R${data.countedCash.toFixed(2)}` + NEWLINE)
  if (data.variance) {
    const varianceColor = data.variance < 0 ? 'red' : 'green'
    receiptData.push(`Variance                     R${data.variance.toFixed(2)}` + NEWLINE)
  }
  
  if (data.notes) {
    receiptData.push("------------------------------------------" + NEWLINE)
    receiptData.push(`Notes: ${data.notes}` + NEWLINE)
  }
  
  return receiptData
}

// Add other receipt type functions as needed...
const createLaybyeReserveReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("LAY-BYE RESERVE SLIP" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("KEEP WITH GOODS" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  receiptData.push("------------------------------------------" + NEWLINE)
  
  // Lay-bye Number
  receiptData.push(ESC + "a" + "\x01") // Center alignment
  receiptData.push("LAY-BYE NUMBER" + NEWLINE)
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push(data.laybyeId || "LB-2024-001" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push(ESC + "a" + "\x00") // Left alignment
  receiptData.push("------------------------------------------" + NEWLINE)
  
  // Customer Details
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  receiptData.push("------------------------------------------" + NEWLINE)
  
  // Product Details
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name} x${item.quantity}            R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  // Financial Details
  if (data.total) receiptData.push(`Total Amount:             R${data.total.toFixed(2)}` + NEWLINE)
  if (data.paymentAmount) receiptData.push(`Amount Paid:              R${data.paymentAmount.toFixed(2)}` + NEWLINE)
  if (data.balanceRemaining) receiptData.push(`Remaining Balance:        R${data.balanceRemaining.toFixed(2)}` + NEWLINE)
  
  return addReceiptFooter(template, receiptData)
}

const createAccountPaymentReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Account Payment Receipt" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Payment #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  if (data.accountNumber) {
    receiptData.push(`Account #: ${data.accountNumber}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("Payment Details               Amount" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.paymentAmount) receiptData.push(`Payment Amount                R${data.paymentAmount.toFixed(2)}` + NEWLINE)
  if (data.previousBalance) receiptData.push(`Previous Balance              R${data.previousBalance.toFixed(2)}` + NEWLINE)
  if (data.newBalance) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`New Balance                   R${data.newBalance.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.paymentMethod) {
    receiptData.push(`Payment Method: ${data.paymentMethod}` + NEWLINE)
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  return addReceiptFooter(template, receiptData)
}

const createTillSessionReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Till Session Report" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Session #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  receiptData.push(`Date: ${data.date}` + NEWLINE)
  receiptData.push("------------------------------------------" + NEWLINE)
  
  receiptData.push(ESC + "E" + "\x01") // Bold on
  receiptData.push("Transaction Type              Amount" + NEWLINE)
  receiptData.push(ESC + "E" + "\x00") // Bold off
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.cashSales) receiptData.push(`Cash Sales                    R${data.cashSales.toFixed(2)}` + NEWLINE)
  if (data.cardSales) receiptData.push(`Card Sales                    R${data.cardSales.toFixed(2)}` + NEWLINE)
  if (data.laybyePayments) receiptData.push(`Laybye Payments               R${data.laybyePayments.toFixed(2)}` + NEWLINE)
  if (data.cashDrops) receiptData.push(`Cash Drops                    -R${data.cashDrops.toFixed(2)}` + NEWLINE)
  if (data.cashPayouts) receiptData.push(`Cash Payouts                  -R${data.cashPayouts.toFixed(2)}` + NEWLINE)
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.sessionTotal) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Session Total                 R${data.sessionTotal.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  if (data.openingFloat) receiptData.push(`Opening Float                 R${data.openingFloat.toFixed(2)}` + NEWLINE)
  if (data.closingBalance) receiptData.push(`Closing Balance               R${data.closingBalance.toFixed(2)}` + NEWLINE)
  
  return receiptData
}

const createCashDropReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Cash Drop Receipt" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Drop #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.sessionNumber) {
    receiptData.push(`Session: ${data.sessionNumber}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.amountDropped) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Amount Dropped                R${data.amountDropped.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  if (data.reason) {
    receiptData.push(`Reason: ${data.reason}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.tillBalanceBefore) receiptData.push(`Till Balance Before Drop      R${data.tillBalanceBefore.toFixed(2)}` + NEWLINE)
  if (data.tillBalanceAfter) receiptData.push(`Till Balance After Drop       R${data.tillBalanceAfter.toFixed(2)}` + NEWLINE)
  
  return addReceiptFooter(template, receiptData)
}

const createDeliveryReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Delivery Slip" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Delivery #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  if (data.address) {
    receiptData.push(`Address: ${data.address}` + NEWLINE)
  }
  if (data.phone) {
    receiptData.push(`Phone: ${data.phone}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Qty" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name}               x${item.quantity}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.deliveryInstructions) {
    receiptData.push(ESC + "a" + "\x01") // Center alignment
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Delivery Instructions" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push(ESC + "a" + "\x00") // Left alignment
    receiptData.push(data.deliveryInstructions + NEWLINE)
  }
  
  return addReceiptFooter(template, receiptData)
}

const createQuotationReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Quotation Slip" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Quotation #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  if (data.validUntil) {
    receiptData.push(`Valid Until: ${data.validUntil}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Price" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name} x${item.quantity}            R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.subtotal) receiptData.push(`Subtotal                      R${data.subtotal.toFixed(2)}` + NEWLINE)
  if (data.discount) receiptData.push(`Bulk Discount (10%)           -R${data.discount.toFixed(2)}` + NEWLINE)
  if (data.total) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Total                         R${data.total.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  
  return addReceiptFooter(template, receiptData)
}

const createOrderReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Order Slip" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Order #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  if (data.expectedDelivery) {
    receiptData.push(`Expected Delivery: ${data.expectedDelivery}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Price" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name}        R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.depositRequired) receiptData.push(`Deposit Required               R${data.depositRequired.toFixed(2)}` + NEWLINE)
  if (data.balanceOnDelivery) receiptData.push(`Balance on Delivery            R${data.balanceOnDelivery.toFixed(2)}` + NEWLINE)
  
  return addReceiptFooter(template, receiptData)
}

const createReturnsExchangeReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Returns & Exchange Slip" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Exchange #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.returnedItems && data.returnedItems.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Returned Item                 Exchange" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.returnedItems.forEach((item, index) => {
      const exchangeItem = data.exchangedItems?.[index]
      if (exchangeItem) {
        receiptData.push(`${item.name} (${item.size || 'N/A'})      ${exchangeItem.name} (${exchangeItem.size || 'N/A'})` + NEWLINE)
      } else {
        receiptData.push(`${item.name} (${item.size || 'N/A'})      No exchange` + NEWLINE)
      }
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.refundReason) {
    receiptData.push(`Reason: ${data.refundReason}` + NEWLINE)
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  return addReceiptFooter(template, receiptData)
}

const createLaybyeCancellationReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Lay-bye Cancellation" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Cancellation #: ${data.transactionNumber}` + NEWLINE)
  if (data.laybyeId) {
    receiptData.push(`Laybye ID: ${data.laybyeId}` + NEWLINE)
  }
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name} x${item.quantity}            R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.refundAmount) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Refund Amount                 R${data.refundAmount.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  if (data.refundReason) {
    receiptData.push(`Reason: ${data.refundReason}` + NEWLINE)
  }
  
  return addReceiptFooter(template, receiptData)
}

const createCustomerStatementReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Customer Statement" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Statement #: ${data.transactionNumber}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  if (data.accountNumber) {
    receiptData.push(`Account #: ${data.accountNumber}` + NEWLINE)
  }
  receiptData.push(`Date: ${data.date}` + NEWLINE)
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.transactions && data.transactions.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Date        Description       Debit    Credit   Balance" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.transactions.forEach(transaction => {
      receiptData.push(`${transaction.date}   ${transaction.description}          ${transaction.debit.toFixed(2)}          ${transaction.credit.toFixed(2)}  ${transaction.balance.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.currentBalance) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`Current Balance               R${data.currentBalance.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  if (data.creditLimit) receiptData.push(`Credit Limit                  R${data.creditLimit.toFixed(2)}` + NEWLINE)
  if (data.availableCredit) receiptData.push(`Available Credit              R${data.availableCredit.toFixed(2)}` + NEWLINE)
  
  return addReceiptFooter(template, receiptData)
}

const createIntermediateBillReceiptData = (template: ReceiptTemplate, data: TransactionData, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  receiptData.push("Intermediate Bill" + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")
  receiptData.push(`Bill #: ${data.transactionNumber}` + NEWLINE)
  receiptData.push(`Date: ${data.date} • Time: ${data.time}` + NEWLINE)
  receiptData.push(`Cashier: ${data.cashier}` + NEWLINE)
  if (data.customer) {
    receiptData.push(`Customer: ${data.customer}` + NEWLINE)
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  if (data.items && data.items.length > 0) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push("Description                    Total" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
    receiptData.push("------------------------------------------" + NEWLINE)
    
    data.items.forEach(item => {
      receiptData.push(`${item.name} x${item.quantity}            R${item.total.toFixed(2)}` + NEWLINE)
    })
    
    receiptData.push("------------------------------------------" + NEWLINE)
  }
  
  if (data.subtotal) receiptData.push(`Subtotal                      R${data.subtotal.toFixed(2)}` + NEWLINE)
  if (data.tax) receiptData.push(`Tax                           R${data.tax.toFixed(2)}` + NEWLINE)
  if (data.total) {
    receiptData.push(ESC + "E" + "\x01") // Bold on
    receiptData.push(`TOTAL                         R${data.total.toFixed(2)}` + NEWLINE)
    receiptData.push(ESC + "E" + "\x00") // Bold off
  }
  receiptData.push("------------------------------------------" + NEWLINE)
  
  receiptData.push("NOTE: This is an intermediate bill. Final payment required." + NEWLINE)
  receiptData.push("Tlhokomeliso: Sena ke bill ea pakeng. Chelete ea ho qetela e hlokahala." + NEWLINE)
  
  return addReceiptFooter(template, receiptData)
}

const addReceiptFooter = (template: ReceiptTemplate, receiptData: string[]): string[] => {
  const ESC = "\x1B"
  const NEWLINE = "\x0A"
  
  // QR/Promo section
  if (template.show_qr_section) {
    if (template.footer_text) {
      receiptData.push(ESC + "a" + "\x01")
      receiptData.push(ESC + "E" + "\x01")
      receiptData.push(template.footer_text + NEWLINE)
      receiptData.push(ESC + "E" + "\x00")
      receiptData.push(ESC + "a" + "\x00")
    }

    receiptData.push(ESC + "a" + "\x01")
    receiptData.push(template.business_website + NEWLINE)
    receiptData.push(ESC + "a" + "\x00")
    receiptData.push(NEWLINE)

    receiptData.push(ESC + "E" + "\x01")
    receiptData.push("Address:")
    receiptData.push(ESC + "E" + "\x00")
    receiptData.push(" " + template.business_address + NEWLINE)
    
    receiptData.push(ESC + "E" + "\x01")
    receiptData.push("Phone:")
    receiptData.push(ESC + "E" + "\x00")
    receiptData.push(" " + template.business_phone + NEWLINE)
    
    receiptData.push(ESC + "E" + "\x01")
    receiptData.push("Facebook:")
    receiptData.push(ESC + "E" + "\x00")
    receiptData.push(" " + template.business_facebook + NEWLINE)
    
    receiptData.push("==========================================" + NEWLINE)
  }

  // Policy section
  if (template.show_policy_section) {
    receiptData.push(ESC + "a" + "\x01")
    receiptData.push(ESC + "E" + "\x01")
    receiptData.push("Return Policy" + NEWLINE)
    receiptData.push(ESC + "E" + "\x00")
    receiptData.push(ESC + "a" + "\x00")
    receiptData.push(template.return_policy_english + NEWLINE)
    receiptData.push(template.return_policy_sesotho + NEWLINE)
    receiptData.push("------------------------------------------" + NEWLINE)
  }

  // Thank you message
  receiptData.push(ESC + "a" + "\x01")
  receiptData.push(template.thank_you_message + NEWLINE)
  receiptData.push(ESC + "a" + "\x00")

  // Add spacing and cut
  receiptData.push(NEWLINE)
  receiptData.push(NEWLINE)
  receiptData.push(NEWLINE)
  receiptData.push(ESC + "J" + String.fromCharCode(50))
  receiptData.push(ESC + "m")

  return receiptData
}

/**
 * Create beautiful retail receipt HTML for browser printing
 */
const createBeautifulRetailReceiptHtml = async (transactionData: TransactionData, branchId: string): Promise<string> => {
  // Get the receipt template for the branch from the database
  const template = await getReceiptTemplateForTransaction('sale', branchId)
  
  if (!template) {
    throw new Error('No receipt template found for branch')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Shoes': '/images/receipts/SHOES ICON.png',
      'Clothing': '/images/receipts/CLOTHING ICON.png',
      'Accessories': '/images/receipts/ACCESSORIES ICON.png'
    }
    return icons[category] || '/images/receipts/ACCESSORIES ICON.png'
  }

  // Create the HTML for the beautiful retail receipt
  const html = `
        <!-- Header -->
        <div class="header">
          <img src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" alt="KQS Logo" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div class="business-name" style="display: none;">${template.business_name}</div>
          <div class="receipt-type">Retail Receipt</div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-line">Receipt #: ${transactionData.transactionNumber}</div>
          <div class="info-line">Date: ${transactionData.date} • Time: ${transactionData.time}</div>
          <div class="info-line">Cashier: ${transactionData.cashier}</div>
          ${transactionData.customer ? `<div class="info-line">Customer: ${transactionData.customer}</div>` : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="table-header">
            <div>Description</div>
            <div>Total</div>
          </div>
          ${transactionData.items ? transactionData.items.map(item => `
            <div class="item-row">
              <div class="item-details">
                <img src="${getCategoryIcon(item.category || 'Accessories')}" alt="${item.category || 'Accessories'}" class="category-icon">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-meta">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
              </div>
              </div>
              <div class="item-total">${formatCurrency(item.total)}</div>
            </div>
          `).join('') : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Totals Section -->
        <div class="totals-section">
          <div class="total-line">
            <span>Subtotal</span>
            <span style="font-weight: bold;">${formatCurrency(transactionData.subtotal || 0)}</span>
          </div>
          <div class="total-line">
            <span>Tax</span>
            <span style="font-weight: bold;">${formatCurrency(transactionData.tax || 0)}</span>
          </div>
          ${transactionData.discount && transactionData.discount > 0 ? `
            <div class="total-line">
              <span>Discount</span>
              <span style="font-weight: bold;">-${formatCurrency(transactionData.discount)}</span>
            </div>
          ` : ''}
          <div class="total-line final">
            <span>TOTAL</span>
            <span>${formatCurrency(transactionData.total || 0)}</span>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-section">
           ${transactionData.splitPayments && transactionData.splitPayments.length > 0 ? `
             ${transactionData.splitPayments.map((payment, index) => `
               <div class="total-line">
                 <span>${payment.method}</span>
                 <span style="font-weight: bold;">${formatCurrency(payment.amount)}</span>
               </div>
             `).join('')}
            <div class="total-line final">
              <span>TOTAL PAID</span>
              <span style="font-weight: bold;">${formatCurrency(transactionData.amountPaid || 0)}</span>
            </div>
          ` : `
          <div class="total-line">
            <span style="font-weight: bold;">${transactionData.paymentMethod || 'Payment'}</span>
            <span style="font-weight: bold;">${formatCurrency(transactionData.amountPaid || 0)}</span>
          </div>
          `}
          ${(() => {
            console.log('🎯 HTML Receipt - Change amount:', transactionData.change);
            return transactionData.change && transactionData.change > 0 ? `
          <div class="total-line">
            <span>Change</span>
              <span style="font-weight: bold;">${formatCurrency(transactionData.change)}</span>
          </div>
          ` : '';
          })()}
        </div>

        <!-- Business Tagline -->
        ${template.show_tagline ? `
          <div class="tagline">${template.business_tagline}</div>
        ` : ''}

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Return & Exchange Policy -->
        ${template.show_policy_section ? `
          <div class="policy-section">
            <div class="policy-title">Return & Exchange Policy</div>
            <div class="policy-content">
              ${template.return_policy_english}
              <br><br>
                ${template.return_policy_sesotho}
               <br><br>
            </div>
          </div>
        ` : ''}

        <!-- QR Code Section -->
        ${template.show_qr_section ? `
          <div class="qr-section">
            <div class="promo-text">${template.footer_text}</div>
            <div class="qr-container">
              <div class="qr-code">
                <div class="qr-pattern">
                  <div class="qr-dot white"></div>
                  <div class="qr-dot black"></div>
                  <div class="qr-dot white"></div>
                  <div class="qr-dot black"></div>
                  <div class="qr-dot white"></div>
                  <div class="qr-dot black"></div>
                  <div class="qr-dot white"></div>
                  <div class="qr-dot black"></div>
                  <div class="qr-dot white"></div>
                </div>
              </div>
              <div class="contact-info">
                <div class="contact-line">
                  <span class="contact-label">Address:</span>
                  <span>${template.business_address}</span>
                </div>
                <div class="contact-line">
                  <span class="contact-label">Phone:</span>
                  <span>${template.business_phone}</span>
                </div>
                <div class="contact-line">
                  <span class="contact-label">Website:</span>
                  <span>${template.business_website}</span>
                </div>
                <div class="contact-line">
                  <span class="contact-label">Facebook:</span>
                  <span>${template.business_facebook}</span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Thank You -->
        <div class="thank-you">${template.thank_you_message}</div>
  `

  return html
}

/**
 * Create beautiful laybye reserve slip HTML for browser printing
 */
const createBeautifulLaybyeReserveReceiptHtml = async (transactionData: TransactionData, branchId: string): Promise<string> => {
  // Get the receipt template for the branch from the database
  const template = await getReceiptTemplateForTransaction('laybye_reserve', branchId)
  
  if (!template) {
    throw new Error('No receipt template found for branch')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Shoes': '/images/receipts/SHOES ICON.png',
      'Clothing': '/images/receipts/CLOTHING ICON.png',
      'Accessories': '/images/receipts/ACCESSORIES ICON.png'
    }
    return icons[category] || '/images/receipts/ACCESSORIES ICON.png'
  }

  // Create the HTML for the compact laybye reserve slip (internal use only)
  const html = `
        <!-- Header -->
        <div class="header">
          <div class="receipt-type">LAY-BYE RESERVE SLIP</div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-line">Laybye #: ${transactionData.laybyeId}</div>
          <div class="info-line">Date: ${transactionData.date} • Time: ${transactionData.time}</div>
          <div class="info-line">Cashier: ${transactionData.cashier}</div>
          ${transactionData.customer ? `<div class="info-line">Customer: ${transactionData.customer}</div>` : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="table-header">
            <div>Description</div>
            <div>Total</div>
          </div>
          ${transactionData.items ? transactionData.items.map(item => `
            <div class="item-row">
              <div class="item-details">
                <img src="${getCategoryIcon(item.category || 'Accessories')}" alt="${item.category || 'Accessories'}" class="category-icon">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-meta">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
              </div>
              </div>
              <div class="item-total">${formatCurrency(item.total)}</div>
            </div>
          `).join('') : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Financial Details -->
        <div class="totals-section">
          ${transactionData.total ? `
            <div class="total-line">
              <span>Total Amount</span>
              <span style="font-weight: bold;">${formatCurrency(transactionData.total)}</span>
            </div>
          ` : ''}
          ${transactionData.paymentAmount ? `
            <div class="total-line">
              <span>Amount Paid</span>
              <span style="font-weight: bold;">${formatCurrency(transactionData.paymentAmount)}</span>
            </div>
          ` : ''}
          ${transactionData.balanceRemaining ? `
            <div class="total-line final">
              <span>Remaining Balance</span>
              <span style="font-weight: bold;">${formatCurrency(transactionData.balanceRemaining)}</span>
            </div>
          ` : ''}
        </div>
  `

  return html
}

/**
 * Create beautiful laybye payment receipt HTML for browser printing
 */
const createBeautifulLaybyePaymentReceiptHtml = async (transactionData: TransactionData, branchId: string): Promise<string> => {
  // Get the receipt template for the branch from the database
  const template = await getReceiptTemplateForTransaction('laybye_payment', branchId)
  
  if (!template) {
    throw new Error('No receipt template found for branch')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Shoes': '/images/receipts/SHOES ICON.png',
      'Clothing': '/images/receipts/CLOTHING ICON.png',
      'Accessories': '/images/receipts/ACCESSORIES ICON.png'
    }
    return icons[category] || '/images/receipts/ACCESSORIES ICON.png'
  }

  // Calculate progress percentage
  const progressPercentage = transactionData.total && transactionData.totalPaid 
    ? Math.round((transactionData.totalPaid / transactionData.total) * 100) 
    : 0

  // Create the HTML for the beautiful laybye payment receipt
  const html = `
        <!-- Header -->
        <div class="header">
          <img src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" alt="KQS Logo" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div class="business-name" style="display: none;">
          <div class="receipt-type">Laybye Payment Receipt</div>
      </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-line">Receipt #: ${transactionData.transactionNumber}</div>
          <div class="info-line">Laybye ID: ${transactionData.laybyeId}</div>
          <div class="info-line">Payment ID: ${transactionData.paymentId}</div>
          <div class="info-line">Date: ${transactionData.date} • Time: ${transactionData.time}</div>
          <div class="info-line">Cashier: ${transactionData.cashier}</div>
          ${transactionData.customer ? `<div class="info-line">Customer: ${transactionData.customer}</div>` : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="table-header">
            <div>Description</div>
            <div>Total</div>
          </div>
          ${transactionData.items ? transactionData.items.map(item => `
            <div class="item-row">
              <div class="item-details">
                <img src="${getCategoryIcon(item.category || 'Accessories')}" alt="${item.category || 'Accessories'}" class="category-icon">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-meta">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
              </div>
              </div>
              <div class="item-total">${formatCurrency(item.total)}</div>
            </div>
          `).join('') : ''}
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Payment Details -->
        <div class="payment-details">
          <h3>Payment Details</h3>
          <div class="payment-line">
            <span>Total Laybye Amount:</span>
            <span>${formatCurrency(transactionData.total || 0)}</span>
            </div>
          <div class="payment-line">
            <span>This Payment Amount:</span>
            <span>${formatCurrency(transactionData.paymentAmount || 0)}</span>
            </div>
          <div class="payment-line">
            <span>Total Already Paid:</span>
            <span>${formatCurrency(transactionData.totalPaid || 0)}</span>
            </div>
          <div class="payment-line highlight">
            <span>Balance Remaining:</span>
            <span>${formatCurrency(transactionData.balanceRemaining || 0)}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section">
          <div class="progress-info">
            <span>Progress: ${progressPercentage}% Complete</span>
            </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
          </div>
        </div>

          <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Payment Method -->
        <div class="payment-method">
          <span>Payment Method: ${transactionData.paymentMethod?.toUpperCase() || 'CASH'}</span>
            </div>

        <!-- Policy Section -->
        <div class="policy-section">
          <h3>Lay-bye Policy</h3>
          <p>NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size.</p>
          <p>(Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle Le ha ese felletsoe ke nako.</p>
          </div>

        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>Please keep this receipt for your records.</p>
          </div>
      `

  return html
}

/**
 * Create beautiful laybye final receipt HTML for browser printing
 */
export const createBeautifulLaybyeFinalReceiptHtml = async (transactionData: TransactionData, branchId: string): Promise<string> => {
  // Get the receipt template for the branch from the database
  const template = await getReceiptTemplateForTransaction('laybye_final', branchId)
  
  if (!template) {
    throw new Error('No receipt template found for branch')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Shoes': '/images/receipts/SHOES ICON.png',
      'Clothing': '/images/receipts/CLOTHING ICON.png',
      'Accessories': '/images/receipts/ACCESSORIES ICON.png'
    }
    return icons[category] || '/images/receipts/ACCESSORIES ICON.png'
  }

  // Create the HTML for the beautiful laybye final receipt
  const html = `
        <!-- Header -->
        <div class="header">
          <img src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" alt="KQS Logo" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
          <div class="business-name" style="display: none;">${template.business_name}</div>
          <div class="receipt-type">LAYBYE FINAL RECEIPT</div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-line">Receipt #: ${transactionData.transactionNumber}</div>
          <div class="info-line">Laybye ID: ${transactionData.laybyeId}</div>
          <div class="info-line">Final Payment ID: ${transactionData.paymentId}</div>
          <div class="info-line">Date: ${transactionData.date} • Time: ${transactionData.time}</div>
          <div class="info-line">Cashier: ${transactionData.cashier}</div>
          ${transactionData.customer ? `<div class="info-line">Customer: ${transactionData.customer}</div>` : ''}
          </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Items Table -->
        <div class="items-table">
          <div class="table-header">
            <div>Description</div>
            <div>Total</div>
                </div>
          ${transactionData.items ? transactionData.items.map(item => `
            <div class="item-row">
              <div class="item-details">
                                 <img src="${getCategoryIcon(item.category || 'Accessories')}" alt="${item.category || 'Accessories'}" class="category-icon">
                <div class="item-info">
                  <div class="item-name">${item.name}</div>
                  <div class="item-meta">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
              </div>
                </div>
              <div class="item-total">${formatCurrency(item.total)}</div>
                </div>
          `).join('') : ''}
                </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Final Payment Details -->
        <div class="payment-details final">
          <h3>FINAL PAYMENT DETAILS</h3>
          <div class="payment-line">
            <span>Total Laybye Amount:</span>
            <span>${formatCurrency(transactionData.total || 0)}</span>
                </div>
          <div class="payment-line">
            <span>Final Payment Amount:</span>
            <span>${formatCurrency(transactionData.paymentAmount || 0)}</span>
              </div>
          <div class="payment-line">
            <span>Total Paid:</span>
            <span>${formatCurrency(transactionData.totalPaid || 0)}</span>
            </div>
          <div class="payment-line completed">
            <span>LAYBYE COMPLETED!</span>
          </div>
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Laybye Completion Details -->
        ${transactionData.laybyeStartDate && transactionData.completionDate ? `
        <div class="laybye-completion-details">
          <h3>LAYBYE COMPLETION DETAILS</h3>
          <div class="completion-line">
            <span>Start Date:</span>
            <span>${new Date(transactionData.laybyeStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          <div class="completion-line">
            <span>Completion Date:</span>
            <span>${new Date(transactionData.completionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
          ${transactionData.totalDaysTaken ? `
          <div class="completion-line">
            <span>Time Taken:</span>
            <span>${transactionData.totalDaysTaken} days</span>
          </div>
          ` : ''}
          ${transactionData.daysEarly !== undefined ? `
          <div class="completion-line">
            <span>Status:</span>
            <span>${transactionData.daysEarly > 0 ? `Completed ${transactionData.daysEarly} days early` : transactionData.daysEarly === 0 ? 'Completed on time' : 'Completed after deadline'}</span>
          </div>
          ` : ''}
          <div class="completion-line">
            <span>Progress:</span>
            <span>100% Complete</span>
          </div>
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        ` : ''}

        <!-- Collection Notice -->
        <div class="collection-notice">
          <h3 class="collection-title">📦 READY FOR COLLECTION</h3>
          <p class="collection-message">Your items are now ready for collection! Please bring this receipt and valid ID to collect your items within 30 days.</p>
        </div>

        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        <!-- Payment Method -->
        <div class="payment-method">
          <span>Payment Method: ${transactionData.paymentMethod?.toUpperCase() || 'CASH'}</span>
        </div>

        <!-- Completion Message -->
        <div class="completion-section">
          <h3 class="congratulations">CONGRATULATIONS!</h3>
          <p class="completion-message">Your laybye is now complete!</p>
          <p class="collection-message">You can now collect your items.</p>
        </div>
  `

  return html
}


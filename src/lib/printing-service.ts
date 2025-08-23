import { supabase } from './supabase'

// =====================================================
// TYPES AND INTERFACES
// =====================================================

export interface PrintingSettings {
  id?: string
  branch_id?: string
  receipt_template: string
  receipt_header: string
  receipt_footer: string
  default_printer: string
  paper_size: string
  paper_width: number
  print_logo: boolean
  print_barcode: boolean
  print_tax_breakdown: boolean
  print_customer_info: boolean
  print_cashier_info: boolean
  print_time_date: boolean
  print_receipt_number: boolean
  auto_print: boolean
  print_copies: number
  slip_types: Record<string, boolean>
  custom_layouts: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface Printer {
  id: string
  name: string
  type: 'thermal' | 'inkjet' | 'laser' | 'dot_matrix'
  connection: 'usb' | 'network' | 'bluetooth' | 'serial'
  status: 'online' | 'offline' | 'error'
  paper_size: string
  is_default: boolean
  branch_id?: string
}

export interface ReceiptTemplate {
  id: string
  name: string
  description: string
  template_type: 'standard' | 'compact' | 'detailed' | 'custom'
  layout: ReceiptLayout
  is_active: boolean
  branch_id?: string
  created_at?: string
  updated_at?: string
}

export interface ReceiptLayout {
  header: ReceiptElement[]
  body: ReceiptElement[]
  footer: ReceiptElement[]
  styling: ReceiptStyling
}

export interface ReceiptElement {
  id: string
  type: 'text' | 'logo' | 'barcode' | 'qr_code' | 'divider' | 'table' | 'total' | 'tax_breakdown' | 'image'
  content: string
  alignment: 'left' | 'center' | 'right'
  font_size?: 'small' | 'medium' | 'large'
  font_weight?: 'normal' | 'bold'
  position: number
  width?: string
  height?: string
  conditions?: ReceiptCondition[]
}

export interface ReceiptCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export interface ReceiptStyling {
  font_family: string
  line_height: number
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export interface PrintJob {
  id: string
  printer_id: string
  template_id: string
  data: any
  status: 'pending' | 'printing' | 'completed' | 'failed'
  copies: number
  created_at: string
  completed_at?: string
  error_message?: string
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

export const loadPrintingSettings = async (): Promise<PrintingSettings | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('No authenticated user found. Using default settings.')
      return {
        receipt_template: 'standard',
        receipt_header: 'Thank you for shopping with us!',
        receipt_footer: 'No refunds after 7 days. T&Cs apply.',
        default_printer: '',
        paper_size: '80mm',
        paper_width: 80,
        print_logo: false,
        print_barcode: true,
        print_tax_breakdown: true,
        print_customer_info: true,
        print_cashier_info: true,
        print_time_date: true,
        print_receipt_number: true,
        auto_print: true,
        print_copies: 1,
        slip_types: {},
        custom_layouts: {}
      }
    }

    // Get user's branch - use maybeSingle() to handle cases where user might not exist
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return {
        receipt_template: 'standard',
        receipt_header: 'Thank you for shopping with us!',
        receipt_footer: 'No refunds after 7 days. T&Cs apply.',
        default_printer: '',
        paper_size: '80mm',
        paper_width: 80,
        print_logo: false,
        print_barcode: true,
        print_tax_breakdown: true,
        print_customer_info: true,
        print_cashier_info: true,
        print_time_date: true,
        print_receipt_number: true,
        auto_print: true,
        print_copies: 1,
        slip_types: {},
        custom_layouts: {}
      }
    }

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        console.warn('No active branches found. Using default settings without branch context.')
        return {
          receipt_template: 'standard',
          receipt_header: 'Thank you for shopping with us!',
          receipt_footer: 'No refunds after 7 days. T&Cs apply.',
          default_printer: '',
          paper_size: '80mm',
          paper_width: 80,
          print_logo: false,
          print_barcode: true,
          print_tax_breakdown: true,
          print_customer_info: true,
          print_cashier_info: true,
          print_time_date: true,
          print_receipt_number: true,
          auto_print: true,
          print_copies: 1,
          slip_types: {},
          custom_layouts: {}
        }
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch:', branchId)
    }

    // Load printing settings for the branch (no information_schema check)
    const { data, error } = await supabase
      .from('printing_settings')
      .select('*')
      .eq('branch_id', branchId)
      .maybeSingle()

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('Printing settings table does not exist yet. Using default settings.')
        return {
          receipt_template: 'standard',
          receipt_header: 'Thank you for shopping with us!',
          receipt_footer: 'No refunds after 7 days. T&Cs apply.',
          default_printer: '',
          paper_size: '80mm',
          paper_width: 80,
          print_logo: false,
          print_barcode: true,
          print_tax_breakdown: true,
          print_customer_info: true,
          print_cashier_info: true,
          print_time_date: true,
          print_receipt_number: true,
          auto_print: true,
          print_copies: 1,
          slip_types: {},
          custom_layouts: {}
        }
      }
      console.error('Error loading printing settings:', error)
      return {
        receipt_template: 'standard',
        receipt_header: 'Thank you for shopping with us!',
        receipt_footer: 'No refunds after 7 days. T&Cs apply.',
        default_printer: '',
        paper_size: '80mm',
        paper_width: 80,
        print_logo: false,
        print_barcode: true,
        print_tax_breakdown: true,
        print_customer_info: true,
        print_cashier_info: true,
        print_time_date: true,
        print_receipt_number: true,
        auto_print: true,
        print_copies: 1,
        slip_types: {},
        custom_layouts: {}
      }
    }

    if (data) {
      return {
        id: data.id,
        branch_id: data.branch_id,
        receipt_template: data.receipt_template || 'standard',
        receipt_header: data.receipt_header || 'Thank you for shopping with us!',
        receipt_footer: data.receipt_footer || 'No refunds after 7 days. T&Cs apply.',
        default_printer: data.default_printer || '',
        paper_size: data.paper_size || '80mm',
        paper_width: data.paper_width || 80,
        print_logo: data.print_logo ?? false,
        print_barcode: data.print_barcode ?? true,
        print_tax_breakdown: data.print_tax_breakdown ?? true,
        print_customer_info: data.print_customer_info ?? true,
        print_cashier_info: data.print_cashier_info ?? true,
        print_time_date: data.print_time_date ?? true,
        print_receipt_number: data.print_receipt_number ?? true,
        auto_print: data.auto_print ?? true,
        print_copies: data.print_copies || 1,
        slip_types: data.slip_types || {},
        custom_layouts: data.custom_layouts || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }
    return {
      receipt_template: 'standard',
      receipt_header: 'Thank you for shopping with us!',
      receipt_footer: 'No refunds after 7 days. T&Cs apply.',
      default_printer: '',
      paper_size: '80mm',
      paper_width: 80,
      print_logo: false,
      print_barcode: true,
      print_tax_breakdown: true,
      print_customer_info: true,
      print_cashier_info: true,
      print_time_date: true,
      print_receipt_number: true,
      auto_print: true,
      print_copies: 1,
      slip_types: {},
      custom_layouts: {}
    }
  } catch (error) {
    console.error('Error loading printing settings:', error)
    return {
      receipt_template: 'standard',
      receipt_header: 'Thank you for shopping with us!',
      receipt_footer: 'No refunds after 7 days. T&Cs apply.',
      default_printer: '',
      paper_size: '80mm',
      paper_width: 80,
      print_logo: false,
      print_barcode: true,
      print_tax_breakdown: true,
      print_customer_info: true,
      print_cashier_info: true,
      print_time_date: true,
      print_receipt_number: true,
      auto_print: true,
      print_copies: 1,
      slip_types: {},
      custom_layouts: {}
    }
  }
}

export const updatePrintingSettings = async (settings: PrintingSettings): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user's branch
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        throw new Error('No active branches found. Cannot save printing settings.')
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch for saving settings:', branchId)
    }

    if (settings.id) {
      // Update existing settings
      const { error } = await supabase
        .from('printing_settings')
        .update({
          receipt_template: settings.receipt_template,
          receipt_header: settings.receipt_header,
          receipt_footer: settings.receipt_footer,
          default_printer: settings.default_printer,
          paper_size: settings.paper_size,
          paper_width: settings.paper_width,
          print_logo: settings.print_logo,
          print_barcode: settings.print_barcode,
          print_tax_breakdown: settings.print_tax_breakdown,
          print_customer_info: settings.print_customer_info,
          print_cashier_info: settings.print_cashier_info,
          print_time_date: settings.print_time_date,
          print_receipt_number: settings.print_receipt_number,
          auto_print: settings.auto_print,
          print_copies: settings.print_copies,
          slip_types: settings.slip_types,
          custom_layouts: settings.custom_layouts,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) {
        console.error('Error updating printing settings:', error)
        return false
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('printing_settings')
        .insert({
          branch_id: branchId,
          receipt_template: settings.receipt_template,
          receipt_header: settings.receipt_header,
          receipt_footer: settings.receipt_footer,
          default_printer: settings.default_printer,
          paper_size: settings.paper_size,
          paper_width: settings.paper_width,
          print_logo: settings.print_logo,
          print_barcode: settings.print_barcode,
          print_tax_breakdown: settings.print_tax_breakdown,
          print_customer_info: settings.print_customer_info,
          print_cashier_info: settings.print_cashier_info,
          print_time_date: settings.print_time_date,
          print_receipt_number: settings.print_receipt_number,
          auto_print: settings.auto_print,
          print_copies: settings.print_copies,
          slip_types: settings.slip_types,
          custom_layouts: settings.custom_layouts
        })

      if (error) {
        console.error('Error creating printing settings:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error saving printing settings:', error)
    return false
  }
}

export const loadPrinters = async (): Promise<Printer[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('No authenticated user found. Returning empty printer list.')
      return []
    }

    // Get user's branch - use maybeSingle() to handle cases where user might not exist
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return []
    }

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        console.warn('No active branches found. Returning empty printer list.')
        return []
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch for printers:', branchId)
    }

    // Load printers for the branch (no information_schema check)
    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .eq('branch_id', branchId)
      .order('name')

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('Printers table does not exist yet. Returning empty list.')
        return []
      }
      console.error('Error loading printers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error loading printers:', error)
    return []
  }
}

export const loadReceiptTemplates = async (): Promise<ReceiptTemplate[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('No authenticated user found. Returning default templates.')
      return getDefaultTemplates()
    }

    // Get user's branch - use maybeSingle() to handle cases where user might not exist
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return getDefaultTemplates()
    }

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        console.warn('No active branches found. Using default templates.')
        return getDefaultTemplates()
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch for templates:', branchId)
    }

    // Load templates for the branch (no information_schema check)
    const { data, error } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branchId)
      .order('name')

    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('Receipt templates table does not exist yet. Returning default templates.')
        return getDefaultTemplates()
      }
      console.error('Error loading receipt templates:', error)
      return getDefaultTemplates()
    }

    return data || getDefaultTemplates()
  } catch (error) {
    console.error('Error loading receipt templates:', error)
    return getDefaultTemplates()
  }
}

export const saveReceiptTemplate = async (template: ReceiptTemplate): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user's branch
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        throw new Error('No active branches found. Cannot save receipt template.')
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch for saving template:', branchId)
    }

    if (template.id) {
      // Update existing template
      const { error } = await supabase
        .from('receipt_templates')
        .update({
          name: template.name,
          description: template.description,
          template_type: template.template_type,
          layout: template.layout,
          is_active: template.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', template.id)

      if (error) {
        console.error('Error updating receipt template:', error)
        return false
      }
    } else {
      // Create new template
      const { error } = await supabase
        .from('receipt_templates')
        .insert({
          branch_id: branchId,
          name: template.name,
          description: template.description,
          template_type: template.template_type,
          layout: template.layout,
          is_active: template.is_active
        })

      if (error) {
        console.error('Error creating receipt template:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error saving receipt template:', error)
    return false
  }
}

export const deleteReceiptTemplate = async (templateId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user's branch
    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    let branchId = userData?.branch_id
    
    // If user doesn't have a branch_id, try to get the first available branch
    if (!branchId) {
      console.warn('No branch_id found for user. Attempting to get first available branch...')
      
      const { data: firstBranch, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()
      
      if (branchError || !firstBranch) {
        throw new Error('No active branches found. Cannot delete receipt template.')
      }
      
      branchId = firstBranch.id
      console.log('Using first available branch for deleting template:', branchId)
    }

    // Delete the template (branch filtering is handled by RLS policies)
    const { error } = await supabase
      .from('receipt_templates')
      .delete()
      .eq('id', templateId)

    if (error) {
      console.error('Error deleting receipt template:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting receipt template:', error)
    return false
  }
}

// =====================================================
// PRINTING OPERATIONS
// =====================================================

export const testPrinter = async (printerId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would communicate with the printer
    // For now, we'll simulate a printer test
    console.log(`Testing printer: ${printerId}`)
    
    // Simulate printer test delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate 90% success rate
    return Math.random() > 0.1
  } catch (error) {
    console.error('Error testing printer:', error)
    return false
  }
}

export const printTestReceipt = async (printerId: string, templateId: string): Promise<boolean> => {
  try {
    // In a real implementation, this would generate and print a test receipt
    console.log(`Printing test receipt on printer: ${printerId} with template: ${templateId}`)
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate 95% success rate
    return Math.random() > 0.05
  } catch (error) {
    console.error('Error printing test receipt:', error)
    return false
  }
}

export const printReceipt = async (
  printerId: string, 
  templateId: string, 
  data: any, 
  copies: number = 1
): Promise<boolean> => {
  try {
    // Create print job
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: userData } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .single()

    const branchId = userData?.branch_id

    // Insert print job
    const { data: printJob, error: jobError } = await supabase
      .from('print_jobs')
      .insert({
        branch_id: branchId,
        printer_id: printerId,
        template_id: templateId,
        data: data,
        status: 'pending',
        copies: copies
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating print job:', jobError)
      return false
    }

    // In a real implementation, this would send the job to the printer
    console.log(`Printing receipt: ${printJob.id}`)
    
    // Simulate printing process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update job status
    const { error: updateError } = await supabase
      .from('print_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', printJob.id)

    if (updateError) {
      console.error('Error updating print job:', updateError)
    }

    return true
  } catch (error) {
    console.error('Error printing receipt:', error)
    return false
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const generateReceiptNumber = (): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `R${timestamp}${random.toString().padStart(3, '0')}`
}

export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatDate = (date: Date, format: string = 'DD/MM/YYYY'): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year.toString())
}

export const formatTime = (date: Date, format: string = '24'): string => {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  if (format === '24') {
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes} ${ampm}`
  }
} 

// Add this luxury boutique template to the default templates
export const getDefaultTemplates = (): ReceiptTemplate[] => {
  return [
    {
      id: 'laybye-final-payment',
      name: 'KQS Enhanced Receipt Design',
      description: 'Beautiful 2-column layout with QR code integration',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'Laybye Final Payment',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'receipt_info',
            type: 'text',
            content: 'Receipt #{{receipt_number}} • Laybye ID: {{laybye_id}} • Payment ID: {{payment_id}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'payment_details',
            type: 'text',
            content: '{{payment_method}}: {{amount_paid}} • Paid: {{amount_paid}} • Change: {{change}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'total_already_paid',
            type: 'text',
            content: 'Total Already Paid: {{total_already_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 9
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'laybye_policy',
            type: 'text',
            content: 'Lay-bye Policy: NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size. (Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 15
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'laybye-payment',
      name: 'KQS Laybye Payment',
      description: 'Installment payment receipt with balance tracking and progress display',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'Laybye Payment',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'receipt_info',
            type: 'text',
            content: 'Receipt #{{receipt_number}} • Laybye ID: {{laybye_id}} • Payment ID: {{payment_id}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'payment_details',
            type: 'text',
            content: '{{payment_method}}: {{amount_paid}} • Paid Today: {{amount_paid}} • Change: {{change}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'laybye_progress_header',
            type: 'text',
            content: 'Laybye Progress',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 8
          },
          {
            id: 'total_already_paid',
            type: 'text',
            content: 'Total Already Paid: {{total_already_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'remaining_balance',
            type: 'text',
            content: 'Remaining Balance: {{remaining_balance}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'payment_progress',
            type: 'text',
            content: 'Payment {{payment_number}} of {{total_payments}} • {{completion_percentage}}% Complete',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'laybye_policy',
            type: 'text',
            content: 'Lay-bye Policy: NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size. (Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 15
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 16
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 17
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 18
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'standard',
      name: 'Standard Receipt',
      description: 'Basic receipt template with essential information',
      template_type: 'standard',
      layout: {
        header: [
          {
            id: 'business_name',
            type: 'text',
            content: '{{business_name}}',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1
          },
          {
            id: 'business_address',
            type: 'text',
            content: '{{business_address}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'divider',
            type: 'divider',
            content: '----------------------------------------',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          }
        ],
        body: [
          {
            id: 'receipt_number',
            type: 'text',
            content: 'Receipt #{{receipt_number}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'total',
            type: 'total',
            content: 'TOTAL: {{total}}',
            alignment: 'right',
            font_size: 'large',
            font_weight: 'bold',
            position: 4
          }
        ],
        footer: [
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank you for your purchase!',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          }
        ],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'luxury-boutique-kqs',
      name: 'KQS Luxury Boutique',
      description: 'Premium boutique receipt with category icons and luxury styling',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/logos/KQS LOGO.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '80%',
            height: 'auto'
          },
          {
            id: 'tagline',
            type: 'text',
            content: 'LUXURY BOUTIQUE',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'divider_luxury',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'business_info',
            type: 'text',
            content: '{{business_address}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'contact_info',
            type: 'text',
            content: '{{business_phone}} • {{business_email}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_thin',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          }
        ],
        body: [
          {
            id: 'receipt_header',
            type: 'text',
            content: 'PURCHASE RECEIPT',
            alignment: 'center',
            font_size: 'medium',
            font_weight: 'bold',
            position: 1
          },
          {
            id: 'receipt_number',
            type: 'text',
            content: 'Receipt #{{receipt_number}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Stylist: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Client: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_items',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'items_header',
            type: 'text',
            content: 'ITEMS PURCHASED',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 7
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'divider_total',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'subtotal',
            type: 'total',
            content: 'Subtotal: {{subtotal}}',
            alignment: 'right',
            font_size: 'medium',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'tax_breakdown',
            type: 'tax_breakdown',
            content: 'Tax ({{tax_rate}}%): {{tax_amount}}',
            alignment: 'right',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'discount',
            type: 'text',
            content: 'Discount: {{discount}}',
            alignment: 'right',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'total_luxury',
            type: 'total',
            content: 'TOTAL: {{total}}',
            alignment: 'right',
            font_size: 'large',
            font_weight: 'bold',
            position: 13
          },
          {
            id: 'payment_method',
            type: 'text',
            content: 'Payment: {{payment_method}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'change_amount',
            type: 'text',
            content: 'Change: {{change}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          }
        ],
        footer: [
          {
            id: 'divider_footer',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN POLICY: 14 days with original receipt',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'exchange_policy',
            type: 'text',
            content: 'Exchanges available within 30 days',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'loyalty_info',
            type: 'text',
            content: 'Earn points on every purchase • Join our VIP program',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'social_media',
            type: 'text',
            content: 'Follow us: @KQSBoutique',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'website',
            type: 'text',
            content: 'www.kqs-boutique.com',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'divider_bottom',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'THANK YOU FOR CHOOSING KQS',
            alignment: 'center',
            font_size: 'medium',
            font_weight: 'bold',
            position: 8
          },
          {
            id: 'come_back',
            type: 'text',
            content: 'We look forward to styling you again!',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'qr_code',
            type: 'qr_code',
            content: '{{receipt_url}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'barcode',
            type: 'barcode',
            content: '{{receipt_number}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          }
        ],
        styling: {
          font_family: 'monospace',
          line_height: 1.3,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'retail-receipt',
      name: 'KQS Retail Receipt',
      description: 'Comprehensive retail receipt with customer info, points, and premium design',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'RETAIL RECEIPT',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          },
          {
            id: 'tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          }
        ],
        body: [
          {
            id: 'receipt_info',
            type: 'text',
            content: 'Receipt #{{receipt_number}} • {{date}} • {{time}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'customer_info',
            type: 'text',
            content: '{{customer_info}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'totals_section',
            type: 'text',
            content: 'Subtotal: {{subtotal}} • Tax ({{tax_rate}}%): {{tax_amount}} • Discount: {{discount_amount}} • Points Used: {{points_used}} • TOTAL: {{total}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'payment_details',
            type: 'text',
            content: '{{payment_method}}: {{amount_paid}} • Change: {{change}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'points_earned',
            type: 'text',
            content: 'LOYALTY POINTS • Points Earned: {{points_earned}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 9
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN POLICY: 14 days with original receipt • Exchanges available within 30 days',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 15
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'laybye-reserve-slip',
      name: 'Laybye Reserve Slip',
      description: 'Slip to attach to remaining goods for identification',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/logos/KQS LOGO.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'slip_title',
            type: 'text',
            content: 'LAY-BYE RESERVE SLIP',
            alignment: 'center',
            font_size: 'medium',
            font_weight: 'bold',
            position: 2
          },
          {
            id: 'keep_with_goods',
            type: 'text',
            content: 'KEEP WITH GOODS',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          }
        ],
        body: [
          {
            id: 'laybye_number_section',
            type: 'text',
            content: 'LAY-BYE NUMBER: {{laybye_number}}',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_section',
            type: 'text',
            content: 'CUSTOMER DETAILS',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 3
          },
          {
            id: 'customer_name',
            type: 'text',
            content: 'Name: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'customer_phone',
            type: 'text',
            content: 'Phone: {{customer_phone}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'customer_id',
            type: 'text',
            content: 'Customer ID: {{customer_id}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'product_section',
            type: 'text',
            content: 'PRODUCT DETAILS',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 8
          },
          {
            id: 'product_name',
            type: 'text',
            content: 'Product: {{product_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'product_sku',
            type: 'text',
            content: 'SKU: {{product_sku}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'financial_section',
            type: 'text',
            content: 'LAY-BYE DETAILS',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'total_amount',
            type: 'text',
            content: 'Total Amount: {{total_amount}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'amount_paid',
            type: 'text',
            content: 'Amount Paid: {{amount_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'remaining_balance',
            type: 'text',
            content: 'Remaining Balance: {{remaining_balance}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 16
          },
          {
            id: 'dates_section',
            type: 'text',
            content: 'IMPORTANT DATES',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 17
          },
          {
            id: 'laybye_date',
            type: 'text',
            content: 'Lay-bye Date: {{laybye_date}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 18
          },
          {
            id: 'expiry_date',
            type: 'text',
            content: 'Expiry Date: {{expiry_date}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 19
          },
          {
            id: 'divider_5',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 20
          },
          {
            id: 'branch_section',
            type: 'text',
            content: 'BRANCH DETAILS',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 21
          },
          {
            id: 'branch_name',
            type: 'text',
            content: '{{branch_name}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 22
          },
          {
            id: 'branch_address',
            type: 'text',
            content: '{{branch_address}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 23
          },
          {
            id: 'branch_phone',
            type: 'text',
            content: '{{branch_phone}}',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 24
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 25
          }
        ],
        footer: [
          {
            id: 'important_notice',
            type: 'text',
            content: 'IMPORTANT NOTICE',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 1
          },
          {
            id: 'notice_text',
            type: 'text',
            content: '• This slip must remain attached to the goods\n• Goods will be held for 3 months from lay-bye date\n• Contact us for payment arrangements\n• Unclaimed goods may be forfeited after expiry',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'contact_info',
            type: 'text',
            content: 'CONTACT US\nPhone: {{branch_phone}}\nFor payment arrangements and queries',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          }
        ],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'account-payment',
      name: 'Account Payment Receipt',
      description: 'Receipt for payments made towards customer accounts, showing previous and new balance.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'ACCOUNT PAYMENT',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'receipt_info',
            type: 'text',
            content: 'Receipt #{{receipt_number}} • Account ID: {{account_id}} • Payment ID: {{payment_id}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'previous_balance',
            type: 'text',
            content: 'Previous Balance: {{previous_balance}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'payment_amount',
            type: 'text',
            content: 'Payment: {{payment_amount}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'new_balance',
            type: 'text',
            content: 'New Balance: {{new_balance}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'payment_method',
            type: 'text',
            content: 'Payment Method: {{payment_method}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'amount_paid',
            type: 'text',
            content: 'Amount Paid: {{amount_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'change',
            type: 'text',
            content: 'Change: {{change}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 13
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN & EXCHANGE POLICY: Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds. Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 16
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 17
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 18
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 19
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'intermediate-bill',
      name: 'Intermediate Bill',
      description: 'Non-final bill for customer review before payment.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'INTERMEDIATE BILL',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'bill_info',
            type: 'text',
            content: 'Bill #{{bill_number}} • {{date}} • {{time}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'customer_info',
            type: 'text',
            content: '{{customer_info}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'totals_section',
            type: 'text',
            content: 'Subtotal: {{subtotal}} • Tax: {{tax}} • Discount: {{discount}} • TOTAL: {{total}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 7
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN & EXCHANGE POLICY: Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds. Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 10
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 13
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'till-session-report',
      name: 'Till Session Report',
      description: 'Summary of till session cash movements and closing balance.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'TILL SESSION REPORT',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'session_info',
            type: 'text',
            content: 'Session #{{session_id}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'open_time',
            type: 'text',
            content: 'Open: {{open_time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'close_time',
            type: 'text',
            content: 'Close: {{close_time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'cash_movements',
            type: 'table',
            content: '{{cash_movements_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'closing_balance',
            type: 'text',
            content: 'Closing Balance: {{closing_balance}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 7
          },
          {
            id: 'notes',
            type: 'text',
            content: 'Notes: {{notes}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 9
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN & EXCHANGE POLICY: Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds. Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 15
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'laybye-cancellation',
      name: 'Lay-bye Cancellation',
      description: 'Receipt for cancelled lay-bye and refund details.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'LAY-BYE CANCELLATION',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'receipt_info',
            type: 'text',
            content: 'Receipt #{{receipt_number}} • Lay-bye ID: {{laybye_id}} • {{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'total_paid',
            type: 'text',
            content: 'Total Paid: {{total_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'cancellation_fee',
            type: 'text',
            content: 'Cancellation Fee: -{{cancellation_fee}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'refund_amount',
            type: 'text',
            content: 'Refund Amount: {{refund_amount}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 9
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 10
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'cancellation_policy',
            type: 'text',
            content: 'CANCELLATION POLICY: Cancellation fee applies. Refunds are only for the amount paid minus the cancellation fee. Chelete e khutlisetsoa feela kamora ho ntsha cancellation fee. Thepa e khutlisitsoe ha e sa le teng.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 13
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 16
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'returns-exchange-slip',
      name: 'Returns/Exchange Slip',
      description: 'Slip for returned or exchanged items.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'RETURNS/EXCHANGE SLIP',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'slip_info',
            type: 'text',
            content: 'Slip #{{slip_number}} • {{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'reason',
            type: 'text',
            content: 'Reason: {{reason}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 8
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'return_policy',
            type: 'text',
            content: 'RETURN & EXCHANGE POLICY: Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds. Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 11
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 14
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'refund-slip',
      name: 'Refund Slip',
      description: 'Slip for refunded items and amount.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'REFUND SLIP',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'refund_info',
            type: 'text',
            content: 'Refund #{{refund_number}} • {{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'refund_amount',
            type: 'text',
            content: 'Refund Amount: {{refund_amount}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 7
          },
          {
            id: 'reason',
            type: 'text',
            content: 'Reason: {{reason}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 9
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'refund_policy',
            type: 'text',
            content: 'REFUND POLICY: Refunds are processed for valid reasons only and require original receipt. Chelete e khutlisetsoa feela haeba ho na le lebaka le utloahalang le invoice ea pele.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 12
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 15
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'cash-up-report',
      name: 'Cash Up Report',
      description: 'Summary of end-of-day cash up and reconciliation.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'CASH UP REPORT',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'report_info',
            type: 'text',
            content: 'Report #{{report_number}} • Session #{{session_id}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'cash_up_details',
            type: 'table',
            content: '{{cash_up_details_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'notes',
            type: 'text',
            content: 'Notes: {{notes}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 7
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'cash_up_policy',
            type: 'text',
            content: 'CASH UP POLICY: All cash up reports must be verified and signed by a supervisor. Litlaleho tsa cash up li tlameha ho netefatsoa ke mookameli pele li saenngoa.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 10
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 13
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'order-slip',
      name: 'Order Slip',
      description: 'Special order slip for items not in stock, with deposit and balance.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'ORDER SLIP',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'order_info',
            type: 'text',
            content: 'Order #{{order_number}} • {{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'expected_arrival',
            type: 'text',
            content: 'Expected Arrival: {{expected_arrival}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'subtotal',
            type: 'text',
            content: 'Subtotal: {{subtotal}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'deposit_paid',
            type: 'text',
            content: 'Deposit Paid: {{deposit_paid}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'balance_due',
            type: 'text',
            content: 'Balance Due: {{balance_due}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'bold',
            position: 10
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 11
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'order_policy',
            type: 'text',
            content: 'ORDER POLICY: Orders require a deposit. Balance is due on collection. Items must be collected within 14 days of arrival. Litaelo li hloka deposit. Chelete e setseng e lefshoa ha thepa e tlisoa. Thepa e tlameha ho nkuoa pele ho matsatsi a 14 kamora ho fihla.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 14
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 16
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 17
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'cash-drop-withdraw',
      name: 'Cash Drop/Withdraw',
      description: 'Receipt for cash drop or withdrawal from till, with authorization and reason.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'CASH DROP/WITHDRAW',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'drop_info',
            type: 'text',
            content: 'Drop #{{drop_number}} • Session #{{session_id}} • Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'authorized_by',
            type: 'text',
            content: 'Authorized By: {{authorized_by}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'date_time',
            type: 'text',
            content: '{{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'drop_details',
            type: 'table',
            content: '{{drop_details_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'reason',
            type: 'text',
            content: 'Reason: {{reason}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 8
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'cash_drop_policy',
            type: 'text',
            content: 'CASH DROP POLICY: All cash drops/withdrawals must be authorized and recorded. Lichelete tsohle tse tlosoang ka har\'a till li tlameha ho ngoloa le ho amoheloa ke mookameli.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 10
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 11
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 13
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 14
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'delivery-slip',
      name: 'Delivery Slip',
      description: 'Slip for goods delivered to customer, with delivery details.',
      template_type: 'custom',
      layout: {
        header: [
          {
            id: 'logo_section',
            type: 'image',
            content: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
            alignment: 'center',
            font_size: 'large',
            font_weight: 'bold',
            position: 1,
            width: '60%',
            height: 'auto'
          },
          {
            id: 'receipt_type',
            type: 'text',
            content: 'DELIVERY SLIP',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 2
          }
        ],
        body: [
          {
            id: 'slip_info',
            type: 'text',
            content: 'Slip #{{slip_number}} • {{date}} • {{time}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 1
          },
          {
            id: 'cashier_info',
            type: 'text',
            content: 'Cashier: {{cashier_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 2
          },
          {
            id: 'customer_info',
            type: 'text',
            content: 'Customer: {{customer_name}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 3
          },
          {
            id: 'delivery_person',
            type: 'text',
            content: 'Delivery Person: {{delivery_person}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 4
          },
          {
            id: 'delivery_contact',
            type: 'text',
            content: 'Delivery Contact: {{delivery_contact}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 5
          },
          {
            id: 'delivery_address',
            type: 'text',
            content: 'Delivery Address: {{delivery_address}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 6
          },
          {
            id: 'divider_1',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 7
          },
          {
            id: 'items_table',
            type: 'table',
            content: '{{items_table}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 8
          },
          {
            id: 'divider_2',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 9
          },
          {
            id: 'business_tagline',
            type: 'text',
            content: 'Finest footware',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 10
          },
          {
            id: 'divider_3',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 11
          },
          {
            id: 'delivery_policy',
            type: 'text',
            content: 'DELIVERY POLICY: Goods must be checked and signed for upon delivery. KQS is not responsible for loss after handover. Thepa e tlameha ho hlahlojoa le ho saenngoa ha e tlisoa. KQS ha e ikarabelle ka tahlehelo kamora ho fana ka thepa.',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 12
          },
          {
            id: 'promotional_text',
            type: 'text',
            content: 'SHOP ONLINE • Stand a chance to win',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 13
          },
          {
            id: 'qr_contact_section',
            type: 'qr_code',
            content: '{{qr_code_data}}',
            alignment: 'left',
            font_size: 'small',
            font_weight: 'normal',
            position: 14
          },
          {
            id: 'divider_4',
            type: 'divider',
            content: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'normal',
            position: 15
          },
          {
            id: 'thank_you',
            type: 'text',
            content: 'Thank You for shopping with Us',
            alignment: 'center',
            font_size: 'small',
            font_weight: 'bold',
            position: 16
          }
        ],
        footer: [],
        styling: {
          font_family: 'monospace',
          line_height: 1.2,
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          colors: { 
            primary: '#000000', 
            secondary: '#666666', 
            accent: '#E5FF29' 
          }
        }
      },
      is_active: true
    },
    {
      id: 'quotation-slip',
      name: 'Quotation Slip',
      description: 'Quotation for bulk/group/company purchases, valid until expiry date.',
      template_type: 'custom',
      layout: {
        header: {
          title: 'KQS Quotation Slip',
          subtitle: 'Quotation for bulk/group/company purchases',
          logo: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
        },
        info: [
          { label: 'Quote #', value: 'quote_number' },
          { label: 'Date', value: 'date' },
          { label: 'Time', value: 'time' },
          { label: 'Cashier', value: 'cashier_name' },
          { label: 'Customer', value: 'customer_name' },
          { label: 'Company', value: 'company_name' },
          { label: 'Valid Until', value: 'expiry_date' },
        ],
        items: {
          columns: [
            { label: 'Description', value: 'name' },
            { label: 'Qty', value: 'quantity' },
            { label: 'Unit Price', value: 'price', format: 'currency' },
            { label: 'Total', value: 'total', format: 'currency' },
          ],
          value: 'items',
        },
        totals: [
          { label: 'Subtotal', value: 'subtotal', format: 'currency' },
          { label: 'Discount', value: 'discount', format: 'currency', negative: true },
          { label: 'Total', value: 'total', format: 'currency', bold: true },
        ],
        tagline: 'Finest footware',
        policy: {
          title: 'Quotation Policy',
          content: 'Quotation is valid until the expiry date. Prices and availability may change after expiry.\nQuote ena e sebetsa ho fihlela letsatsi la ho felloa ke nako. Litheko le fumaneho li ka fetoha kamora letsatsi leo.'
        },
        qr: {
          website: 'business_website',
          address: 'business_address',
          phone: 'business_phone',
          facebook: 'KQSFOOTWARE',
        },
        thank_you: 'Thank You for shopping with Us',
      },
      is_active: true
    },
    {
      id: 'customer-statement',
      name: 'Customer Statement',
      description: 'Account statement for customer, showing all transactions and balances.',
      template_type: 'custom',
      layout: {
        header: {
          title: 'KQS Customer Statement',
          subtitle: 'Account Statement for Customer',
          logo: '/images/receipts/KQS RECEIPT LOGO-Photoroom.png',
        },
        info: [
          { label: 'Statement #', value: 'statement_number' },
          { label: 'Date', value: 'date' },
          { label: 'Customer', value: 'customer_name' },
          { label: 'Account ID', value: 'account_id' },
          { label: 'Period', value: 'period' },
        ],
        opening_balance: { label: 'Opening Balance', value: 'opening_balance', format: 'currency' },
        transactions: {
          columns: [
            { label: 'Date', value: 'date' },
            { label: 'Description', value: 'description' },
            { label: 'Debit', value: 'debit', format: 'currency' },
            { label: 'Credit', value: 'credit', format: 'currency' }
          ],
          value: 'transactions',
        },
        closing_balance: { label: 'Closing Balance', value: 'closing_balance', format: 'currency' },
        tagline: 'Finest footware',
        policy: {
          title: 'Statement Policy',
          content: 'Please verify all transactions. Contact us within 7 days for any discrepancies.\nKa kopo netefatsa liketsahalo tsohle. Ikopanye le rona nakong ea matsatsi a 7 haeba ho na le phoso.'
        },
        qr: {
          website: 'business_website',
          address: 'business_address',
          phone: 'business_phone',
          facebook: 'KQSFOOTWARE',
        },
        thank_you: 'Thank You for shopping with Us',
      },
      is_active: true
    }
  ]
} 
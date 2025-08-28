import { supabase } from './supabase'

/**
 * Create laybye receipt templates in the database
 */
export const createLaybyeTemplates = async (branchId: string) => {
  try {
    console.log('Creating laybye receipt templates for branch:', branchId)

    // Get branch info to populate template data
    const { data: branch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single()

    if (!branch) {
      throw new Error('Branch not found')
    }

    // Template data for both laybye templates
    const templateData = {
      business_name: branch.name || 'KQS',
      business_address: branch.address || 'Maseru, Husteds opposite Queen II',
      business_phone: branch.phone || '2700 7795',
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
      template_type: 'detailed'
    }

    // Create Laybye Payment Receipt template
    const { data: paymentTemplate, error: paymentError } = await supabase
      .from('report_templates')
      .upsert({
        branch_id: branchId,
        name: 'KQS Laybye Payment Receipt',
        description: 'Laybye payment receipt with balance tracking and progress display',
        category: 'sales',
        template_data: {
          ...templateData,
          template_type: 'detailed'
        },
        is_default: false,
        is_active: true
      }, {
        onConflict: 'branch_id,name'
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating laybye payment template:', paymentError)
    } else {
      console.log('✅ Created KQS Laybye Payment Receipt template')
    }

    // Create Laybye Reserve Slip template
    const { data: reserveTemplate, error: reserveError } = await supabase
      .from('report_templates')
      .upsert({
        branch_id: branchId,
        name: 'KQS Laybye Reserve Slip',
        description: 'Laybye reserve slip for customer to keep with goods',
        category: 'sales',
        template_data: {
          ...templateData,
          template_type: 'compact'
        },
        is_default: false,
        is_active: true
      }, {
        onConflict: 'branch_id,name'
      })
      .select()
      .single()

    if (reserveError) {
      console.error('Error creating laybye reserve template:', reserveError)
    } else {
      console.log('✅ Created KQS Laybye Reserve Slip template')
    }

    return {
      success: true,
      paymentTemplate,
      reserveTemplate
    }

  } catch (error) {
    console.error('Error creating laybye templates:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create all receipt templates for a branch
 */
export const createAllReceiptTemplates = async (branchId: string) => {
  try {
    console.log('Creating all receipt templates for branch:', branchId)

    // Get branch info
    const { data: branch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', branchId)
      .single()

    if (!branch) {
      throw new Error('Branch not found')
    }

    // Base template data
    const baseTemplateData = {
      business_name: branch.name || 'KQS',
      business_address: branch.address || 'Maseru, Husteds opposite Queen II',
      business_phone: branch.phone || '2700 7795',
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
      show_tagline: true
    }

    // All template definitions
    const templates = [
      {
        name: 'KQS Retail Receipt',
        description: 'Standard retail receipt for sales',
        category: 'sales',
        template_type: 'standard'
      },
      {
        name: 'KQS Laybye Payment Receipt',
        description: 'Laybye payment receipt with balance tracking and progress display',
        category: 'sales',
        template_type: 'detailed'
      },
      {
        name: 'KQS Laybye Reserve Slip',
        description: 'Laybye reserve slip for customer to keep with goods',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Refund Slip',
        description: 'Refund receipt for returned items',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Account Payment Receipt',
        description: 'Account payment receipt for credit customers',
        category: 'customers',
        template_type: 'detailed'
      },
      {
        name: 'KQS Cash Up Report',
        description: 'End of day cash up report',
        category: 'financial',
        template_type: 'detailed'
      },
      {
        name: 'KQS Till Session Report',
        description: 'Till session summary report',
        category: 'financial',
        template_type: 'detailed'
      },
      {
        name: 'KQS Cash Drop Receipt',
        description: 'Cash drop receipt for security',
        category: 'financial',
        template_type: 'standard'
      },
      {
        name: 'KQS Delivery Slip',
        description: 'Delivery slip for customer orders',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Quotation Slip',
        description: 'Price quotation for customers',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Order Slip',
        description: 'Order slip for special orders',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Returns & Exchange Slip',
        description: 'Returns and exchange documentation',
        category: 'sales',
        template_type: 'compact'
      },
      {
        name: 'KQS Laybye Cancellation Receipt',
        description: 'Laybye cancellation receipt',
        category: 'sales',
        template_type: 'standard'
      },
      {
        name: 'KQS Customer Statement',
        description: 'Customer account statement',
        category: 'customers',
        template_type: 'detailed'
      },
      {
        name: 'KQS Intermediate Bill',
        description: 'Intermediate bill for partial payments',
        category: 'sales',
        template_type: 'standard'
      }
    ]

    // Create all templates
    const results = []
    for (const template of templates) {
      const { data, error } = await supabase
        .from('report_templates')
        .upsert({
          branch_id: branchId,
          name: template.name,
          description: template.description,
          category: template.category,
          template_data: {
            ...baseTemplateData,
            template_type: template.template_type
          },
                     is_default: template.name === 'KQS Retail Receipt', // Make retail receipt default for sales
          is_active: true
        }, {
          onConflict: 'branch_id,name'
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating template ${template.name}:`, error)
        results.push({ name: template.name, success: false, error })
      } else {
        console.log(`✅ Created template: ${template.name}`)
        results.push({ name: template.name, success: true, data })
      }
    }

    return {
      success: true,
      results
    }

  } catch (error) {
    console.error('Error creating all templates:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

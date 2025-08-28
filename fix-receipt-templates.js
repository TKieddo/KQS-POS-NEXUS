const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixReceiptTemplates() {
  try {
    console.log('🔧 Fixing receipt_templates RLS issues...')
    
    // First, let's try to create a default template directly
    console.log('📝 Creating default receipt template...')
    
    // Get the first branch
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)
    
    if (branchError) {
      console.error('Error fetching branches:', branchError)
      return
    }
    
    if (!branches || branches.length === 0) {
      console.error('No active branches found')
      return
    }
    
    const branch = branches[0]
    console.log(`Using branch: ${branch.name} (${branch.id})`)
    
    // Check if template already exists
    const { data: existingTemplate, error: checkError } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('branch_id', branch.id)
      .eq('template_type', 'retail_receipt')
      .single()
    
    if (existingTemplate) {
      console.log('✅ Default template already exists')
      console.log('Template ID:', existingTemplate.id)
      return
    }
    
    // Create default template
    const defaultTemplate = {
      name: 'KQS Retail Receipt',
      description: 'Default retail receipt template',
      template_type: 'retail_receipt',
      business_name: branch.name || 'KQS',
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
      is_default: true,
      branch_id: branch.id,
      layout: {},
      template_settings: {}
    }
    
    const { data: newTemplate, error: insertError } = await supabase
      .from('receipt_templates')
      .insert([defaultTemplate])
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Error creating template:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      })
      
      if (insertError.code === '42501') {
        console.log('\n🔧 RLS Policy Error Detected!')
        console.log('Please run the following SQL in your Supabase SQL Editor:')
        console.log('\n--- START SQL ---')
        console.log('ALTER TABLE receipt_templates DISABLE ROW LEVEL SECURITY;')
        console.log('GRANT ALL ON receipt_templates TO authenticated;')
        console.log('--- END SQL ---')
        console.log('\nThen run this script again.')
      }
      return
    }
    
    console.log('✅ Default template created successfully!')
    console.log('Template ID:', newTemplate.id)
    
    // Verify the template can be read
    const { data: verifyTemplate, error: verifyError } = await supabase
      .from('receipt_templates')
      .select('*')
      .eq('id', newTemplate.id)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying template:', verifyError)
    } else {
      console.log('✅ Template verification successful')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the fix
fixReceiptTemplates()

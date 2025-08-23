require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Branch-specific business information
const branchInfo = {
  'Botha Bothe': {
    business_name: 'KQS Botha Bothe',
    business_address: 'Botha Bothe, Main Street',
    business_phone: '2700 7795',
    business_website: 'www.kqsfootware.com',
    business_facebook: 'KQSFOOTWARE',
    business_tagline: 'Finest footware in Botha Bothe'
  },
  'Mafeteng': {
    business_name: 'KQS Mafeteng',
    business_address: 'Mafeteng, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'www.kqsfootware.com',
    business_facebook: 'KQSFOOTWARE',
    business_tagline: 'Finest footware in Mafeteng'
  },
  'Mokhotlong': {
    business_name: 'KQS Mokhotlong',
    business_address: 'Mokhotlong, Central District',
    business_phone: '2700 7795',
    business_website: 'www.kqsfootware.com',
    business_facebook: 'KQSFOOTWARE',
    business_tagline: 'Finest footware in Mokhotlong'
  }
}

// Default template structure
const defaultTemplates = [
  {
    name: 'KQS Retail Receipt',
    description: 'Standard retail receipt template with business information and policies',
    template_type: 'standard',
    is_default: true
  },
  {
    name: 'KQS Luxury Receipt',
    description: 'Enhanced luxury receipt design with premium styling and QR code',
    template_type: 'detailed',
    is_default: false
  },
  {
    name: 'KQS Laybye Payment Receipt',
    description: 'Laybye payment receipt with balance tracking and progress display',
    template_type: 'detailed',
    is_default: false
  },
  {
    name: 'KQS Quotation Slip',
    description: 'Quotation slip template for price estimates and proposals',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Delivery Slip',
    description: 'Delivery slip template for order fulfillment and tracking',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Refund Slip',
    description: 'Refund slip template for returns and exchanges',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Cash Drop Receipt',
    description: 'Cash drop receipt template for till management',
    template_type: 'standard',
    is_default: false
  },
  {
    name: 'KQS Order Slip',
    description: 'Order slip template for pending orders and reservations',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Cash Up Report',
    description: 'Cash up report template for end-of-day reconciliation',
    template_type: 'detailed',
    is_default: false
  },
  {
    name: 'KQS Till Session Report',
    description: 'Till session report template for shift summaries',
    template_type: 'detailed',
    is_default: false
  },
  {
    name: 'KQS Intermediate Bill',
    description: 'Intermediate bill template for partial payments',
    template_type: 'standard',
    is_default: false
  },
  {
    name: 'KQS Account Payment Receipt',
    description: 'Account payment receipt template for credit sales',
    template_type: 'detailed',
    is_default: false
  },
  {
    name: 'KQS Laybye Reserve Slip',
    description: 'Laybye reserve slip template for item reservations',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Laybye Cancellation Receipt',
    description: 'Laybye cancellation receipt template',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Returns & Exchange Slip',
    description: 'Returns and exchange slip template',
    template_type: 'compact',
    is_default: false
  },
  {
    name: 'KQS Customer Statement',
    description: 'Customer statement template for account summaries',
    template_type: 'detailed',
    is_default: false
  }
]

async function createBranchTemplates() {
  console.log('🚀 Creating Branch-Specific Receipt Templates...\n')

  try {
    // Get all active branches
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (branchesError) {
      console.error('❌ Error fetching branches:', branchesError)
      return
    }

    console.log(`📋 Processing ${branches.length} branches...`)

    for (const branch of branches) {
      console.log(`\n🏢 Processing branch: ${branch.name}`)
      
      // Get branch-specific business info
      const branchBusinessInfo = branchInfo[branch.name] || {
        business_name: `KQS ${branch.name}`,
        business_address: `${branch.name}, Main Street`,
        business_phone: '2700 7795',
        business_website: 'www.kqsfootware.com',
        business_facebook: 'KQSFOOTWARE',
        business_tagline: `Finest footware in ${branch.name}`
      }

      // Check existing templates for this branch
      const { data: existingTemplates, error: existingError } = await supabase
        .from('receipt_templates')
        .select('name')
        .eq('branch_id', branch.id)

      if (existingError) {
        console.error(`❌ Error checking existing templates for ${branch.name}:`, existingError)
        continue
      }

      const existingTemplateNames = existingTemplates.map(t => t.name)
      console.log(`   Found ${existingTemplates.length} existing templates`)

      // Create missing templates
      let createdCount = 0
      for (const template of defaultTemplates) {
        if (!existingTemplateNames.includes(template.name)) {
          const templateData = {
            ...template,
            ...branchBusinessInfo,
            branch_id: branch.id,
            return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
            return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
            thank_you_message: 'Thank You for shopping with Us',
            footer_text: 'SHOP ONLINE - Stand a chance to win',
            show_qr_section: true,
            show_policy_section: true,
            show_points_section: true,
            show_tagline: true,
            layout: {},
            template_settings: {},
            is_active: true
          }

          const { error: insertError } = await supabase
            .from('receipt_templates')
            .insert(templateData)

          if (insertError) {
            console.error(`❌ Error creating template ${template.name} for ${branch.name}:`, insertError)
          } else {
            console.log(`   ✅ Created: ${template.name}`)
            createdCount++
          }
        } else {
          console.log(`   ⏭️  Skipped: ${template.name} (already exists)`)
        }
      }

      console.log(`   📊 Summary: Created ${createdCount} new templates for ${branch.name}`)
    }

    console.log('\n🎉 Branch template creation completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. Go to Settings > Branch Receipts')
    console.log('   2. Select your branch from the sidebar')
    console.log('   3. Customize business information for each branch')
    console.log('   4. Test receipt printing for each branch')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createBranchTemplates() 
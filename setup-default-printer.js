// Setup Default Printer Settings
// Run this script to set up default printer settings for testing

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDefaultPrinterSettings() {
  try {
    console.log('🔧 Setting up default printer settings...')
    
    // Get the first branch (assuming you have at least one branch)
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, name')
      .limit(1)
    
    if (branchError) {
      console.error('❌ Error fetching branches:', branchError)
      return
    }
    
    if (!branches || branches.length === 0) {
      console.error('❌ No branches found. Please create a branch first.')
      return
    }
    
    const branch = branches[0]
    console.log('📍 Using branch:', branch.name, '(ID:', branch.id, ')')
    
    // Default printer settings
    const defaultSettings = {
      default_printer: '', // Will be set when user selects a printer
      qz_tray_enabled: true,
      auto_print_receipts: true,
      print_copies: 1,
      paper_width: 80
    }
    
    // Save to app_settings table
    const { error: saveError } = await supabase
      .from('app_settings')
      .upsert({
        key: `printer_settings_${branch.id}`,
        value: JSON.stringify(defaultSettings),
        category: 'printer_settings',
        description: 'Default printer settings for auto-print testing',
        updated_at: new Date().toISOString()
      })
    
    if (saveError) {
      console.error('❌ Error saving printer settings:', saveError)
      return
    }
    
    console.log('✅ Default printer settings saved successfully!')
    console.log('📋 Settings:', defaultSettings)
    console.log('')
    console.log('🎯 Next steps:')
    console.log('1. Go to Settings > Printers')
    console.log('2. Connect QZ Tray')
    console.log('3. Select a default printer')
    console.log('4. Test auto-print by creating a sale')
    
  } catch (error) {
    console.error('❌ Error setting up printer settings:', error)
  }
}

// Run the setup
setupDefaultPrinterSettings()

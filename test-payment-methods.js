const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkPaymentMethods() {
  try {
    console.log('Checking payment settings...')
    
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .eq('category', 'payment')
      .order('sort_order')

    if (error) {
      console.error('Error fetching payment settings:', error)
      return
    }

    console.log('Payment settings found:', data.length)
    
    // Check enabled payment methods
    const enabledMethods = []
    
    for (const setting of data) {
      if (setting.setting_key.endsWith('_enabled') && setting.setting_value === 'true') {
        const method = setting.setting_key.replace('_enabled', '')
        enabledMethods.push(method)
        console.log(`✓ ${method} is enabled`)
      }
    }

    console.log('\nEnabled payment methods:', enabledMethods)
    
    // Check specific mobile money settings
    const mobileMoneySettings = data.filter(s => 
      s.setting_key.includes('mpesa') || 
      s.setting_key.includes('ecocash') || 
      s.setting_key.includes('airtel') || 
      s.setting_key.includes('orange')
    )
    
    console.log('\nMobile money settings:')
    mobileMoneySettings.forEach(s => {
      console.log(`${s.setting_key}: ${s.setting_value}`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkPaymentMethods()

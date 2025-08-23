const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyReceiptTemplates() {
  try {
    console.log('🔍 Verifying Receipt Templates Database...\n')

    // Check if table exists
    console.log('1. Checking table structure...')
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'receipt_templates')

    if (tableError || !tables || tables.length === 0) {
      console.log('❌ receipt_templates table not found')
      return
    }
    console.log('✅ receipt_templates table exists')

    // Check table columns
    console.log('\n2. Checking table columns...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'receipt_templates')
      .order('ordinal_position')

    if (columnError) {
      console.log('❌ Error checking columns:', columnError.message)
    } else {
      console.log('✅ Table columns:')
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
      })
    }

    // Check templates count
    console.log('\n3. Checking template data...')
    const { data: templates, error: templateError } = await supabase
      .from('receipt_templates')
      .select('*')

    if (templateError) {
      console.log('❌ Error loading templates:', templateError.message)
    } else {
      console.log(`✅ Found ${templates.length} templates:`)
      templates.forEach(template => {
        console.log(`   - ${template.name} (${template.is_default ? 'DEFAULT' : 'custom'})`)
        console.log(`     Branch: ${template.branch_id || 'No branch'}`)
        console.log(`     Active: ${template.is_active ? 'Yes' : 'No'}`)
        console.log(`     Created: ${template.created_at}`)
        console.log('')
      })
    }

    // Check branches
    console.log('4. Checking branches...')
    const { data: branches, error: branchError } = await supabase
      .from('branches')
      .select('id, name, is_active')

    if (branchError) {
      console.log('❌ Error loading branches:', branchError.message)
    } else {
      console.log(`✅ Found ${branches.length} branches:`)
      branches.forEach(branch => {
        console.log(`   - ${branch.name} (${branch.is_active ? 'Active' : 'Inactive'})`)
      })
    }

    // Check RLS policies
    console.log('\n5. Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, permissive, roles, cmd')
      .eq('table_schema', 'public')
      .eq('table_name', 'receipt_templates')

    if (policyError) {
      console.log('❌ Error checking policies:', policyError.message)
    } else {
      console.log(`✅ Found ${policies.length} RLS policies:`)
      policies.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`)
      })
    }

    console.log('\n🎉 Verification completed successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - Table exists: ✅`)
    console.log(`   - Templates: ${templates?.length || 0}`)
    console.log(`   - Branches: ${branches?.length || 0}`)
    console.log(`   - RLS Policies: ${policies?.length || 0}`)

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Run verification
verifyReceiptTemplates() 
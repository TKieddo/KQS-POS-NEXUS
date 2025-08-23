require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkBranches() {
  console.log('🔍 Checking Branches and Receipt Templates...\n')

  try {
    // Get all branches
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (branchesError) {
      console.error('❌ Error fetching branches:', branchesError)
      return
    }

    console.log(`📋 Found ${branches.length} active branches:`)
    branches.forEach(branch => {
      console.log(`   - ${branch.name} (ID: ${branch.id})`)
    })

    // Check receipt templates for each branch
    console.log('\n📄 Checking receipt templates per branch:')
    
    for (const branch of branches) {
      const { data: templates, error: templatesError } = await supabase
        .from('receipt_templates')
        .select('*')
        .eq('branch_id', branch.id)

      if (templatesError) {
        console.error(`❌ Error fetching templates for ${branch.name}:`, templatesError)
        continue
      }

      console.log(`   ${branch.name}: ${templates.length} templates`)
      
      if (templates.length === 0) {
        console.log(`   ⚠️  No templates found for ${branch.name}`)
      } else {
        templates.forEach(template => {
          console.log(`     - ${template.name} (${template.is_default ? 'Default' : 'Custom'})`)
        })
      }
    }

    // Check users and their branch assignments
    console.log('\n👥 Checking user branch assignments:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, branch_id')
      .order('email')

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      users.forEach(user => {
        const branch = branches.find(b => b.id === user.branch_id)
        console.log(`   ${user.email}: ${branch ? branch.name : 'No branch assigned'}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkBranches() 
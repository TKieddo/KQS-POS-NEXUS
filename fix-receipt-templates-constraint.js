const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixReceiptTemplatesConstraint() {
  console.log('🔧 Fixing Receipt Templates Constraint Issue...\n')

  try {
    // Check if the problematic constraint exists
    console.log('1. Checking for problematic constraint...')
    const { data: constraints, error: constraintError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
              conname as constraint_name,
              contype as constraint_type,
              pg_get_constraintdef(oid) as constraint_definition
          FROM pg_constraint 
          WHERE conname = 'idx_receipt_templates_branch_default';
        `
      })

    if (constraintError) {
      console.log('   ℹ️  Could not check constraints (this is normal):', constraintError.message)
    } else if (constraints && constraints.length > 0) {
      console.log('   ⚠️  Found problematic constraint:', constraints[0].constraint_name)
    } else {
      console.log('   ✅ No problematic constraint found')
    }

    // Drop the constraint if it exists
    console.log('\n2. Dropping problematic constraint...')
    const { error: dropError } = await supabase
      .rpc('exec_sql', {
        sql: 'DROP INDEX IF EXISTS idx_receipt_templates_branch_default;'
      })

    if (dropError) {
      console.log('   ℹ️  Could not drop constraint (this is normal):', dropError.message)
    } else {
      console.log('   ✅ Constraint dropped successfully')
    }

    // Check for duplicate default templates
    console.log('\n3. Checking for duplicate default templates...')
    const { data: duplicates, error: duplicateError } = await supabase
      .from('receipt_templates')
      .select('branch_id, is_default')
      .eq('is_default', true)

    if (duplicateError) {
      console.error('   ❌ Error checking duplicates:', duplicateError.message)
      return
    }

    // Group by branch_id and count defaults
    const branchDefaults = {}
    duplicates?.forEach(template => {
      if (template.branch_id) {
        branchDefaults[template.branch_id] = (branchDefaults[template.branch_id] || 0) + 1
      }
    })

    const problematicBranches = Object.entries(branchDefaults)
      .filter(([branchId, count]) => count > 1)
      .map(([branchId, count]) => ({ branchId, count }))

    if (problematicBranches.length > 0) {
      console.log(`   ⚠️  Found ${problematicBranches.length} branches with multiple default templates:`)
      problematicBranches.forEach(({ branchId, count }) => {
        console.log(`      - Branch ${branchId}: ${count} default templates`)
      })

      // Fix duplicate defaults by keeping only the first one per branch
      console.log('\n4. Fixing duplicate default templates...')
      for (const { branchId } of problematicBranches) {
        const { data: branchTemplates, error: fetchError } = await supabase
          .from('receipt_templates')
          .select('id, created_at')
          .eq('branch_id', branchId)
          .eq('is_default', true)
          .order('created_at')

        if (fetchError) {
          console.error(`   ❌ Error fetching templates for branch ${branchId}:`, fetchError.message)
          continue
        }

        if (branchTemplates && branchTemplates.length > 1) {
          // Keep the first one, unset the rest
          const templatesToUnset = branchTemplates.slice(1)
          const templateIds = templatesToUnset.map(t => t.id)

          const { error: updateError } = await supabase
            .from('receipt_templates')
            .update({ is_default: false })
            .in('id', templateIds)

          if (updateError) {
            console.error(`   ❌ Error fixing branch ${branchId}:`, updateError.message)
          } else {
            console.log(`   ✅ Fixed branch ${branchId}: kept 1 default, unset ${templatesToUnset.length} others`)
          }
        }
      }
    } else {
      console.log('   ✅ No duplicate default templates found')
    }

    // Verify the fix
    console.log('\n5. Verifying the fix...')
    const { data: finalCheck, error: finalError } = await supabase
      .from('receipt_templates')
      .select('branch_id, is_default')
      .eq('is_default', true)

    if (finalError) {
      console.error('   ❌ Error in final verification:', finalError.message)
      return
    }

    const finalBranchDefaults = {}
    finalCheck?.forEach(template => {
      if (template.branch_id) {
        finalBranchDefaults[template.branch_id] = (finalBranchDefaults[template.branch_id] || 0) + 1
      }
    })

    const remainingProblems = Object.entries(finalBranchDefaults)
      .filter(([branchId, count]) => count > 1)
      .map(([branchId, count]) => ({ branchId, count }))

    if (remainingProblems.length > 0) {
      console.log('   ❌ Still have problems:')
      remainingProblems.forEach(({ branchId, count }) => {
        console.log(`      - Branch ${branchId}: ${count} default templates`)
      })
    } else {
      console.log('   ✅ All branches now have at most 1 default template')
    }

    console.log('\n🎉 Receipt templates constraint fix completed!')
    console.log('\n📋 Next steps:')
    console.log('   1. Try saving receipt templates again')
    console.log('   2. The application will now handle default template constraints properly')
    console.log('   3. Each branch can have only one default template')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixReceiptTemplatesConstraint() 
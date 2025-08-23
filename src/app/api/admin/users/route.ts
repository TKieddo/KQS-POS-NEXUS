import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all users with their roles and branch assignments
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        role:user_roles(
          id,
          name,
          display_name,
          permissions,
          can_access_admin,
          can_access_pos
        )
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get branch assignments for each user
    const usersWithBranches = await Promise.all(
      (users || []).map(async (user) => {
        const { data: branchData } = await supabaseAdmin
          .from('user_branches')
          .select(`
            branch_id,
            is_primary,
            branches(id, name)
          `)
          .eq('user_id', user.id)

        const branches = (branchData || []).map((item: any) => ({
          id: item.branches.id,
          name: item.branches.name,
          is_primary: item.is_primary
        }))

        return {
          ...user,
          branches
        }
      })
    )

    return NextResponse.json(usersWithBranches)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, full_name, password, role_name, pos_pin, branch_ids } = body

    // Validate required fields
    if (!email || !full_name || !password || !role_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. Get the role ID
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('name', role_name)
      .single()

    if (roleError || !roleData) {
      // Clean up the auth user if role lookup fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
    }

    // 3. Create user profile in our users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id, // Use the Supabase Auth user ID
        email,
        full_name,
        role_id: roleData.id,
        is_active: true,
        pos_pin
      })
      .select(`
        *,
        role:user_roles(
          id,
          name,
          display_name,
          permissions,
          can_access_admin,
          can_access_pos
        )
      `)
      .single()

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 4. Assign branches
    if (branch_ids && branch_ids.length > 0) {
      const branchAssignments = branch_ids.map((branchId: string, index: number) => ({
        user_id: userProfile.id,
        branch_id: branchId,
        is_primary: index === 0 // First branch is primary
      }))

      const { error: branchError } = await supabaseAdmin
        .from('user_branches')
        .insert(branchAssignments)

      if (branchError) {
        console.error('Error assigning branches:', branchError)
        // Don't fail the entire operation, just log the error
      }
    }

    // 5. Get the complete user data with branches
    const { data: branchData } = await supabaseAdmin
      .from('user_branches')
      .select(`
        branch_id,
        is_primary,
        branches(id, name)
      `)
      .eq('user_id', userProfile.id)

    const branches = (branchData || []).map((item: any) => ({
      id: item.branches.id,
      name: item.branches.name,
      is_primary: item.is_primary
    }))

    const completeUser = {
      ...userProfile,
      branches
    }

    return NextResponse.json({ success: true, user: completeUser })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

















































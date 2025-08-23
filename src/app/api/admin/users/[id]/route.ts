import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    const { full_name, role_name, is_active, pos_pin, branch_ids } = body

    const updateFields: any = {}

    if (full_name !== undefined) updateFields.full_name = full_name
    if (is_active !== undefined) updateFields.is_active = is_active
    if (pos_pin !== undefined) updateFields.pos_pin = pos_pin

    // Update role if specified
    if (role_name) {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('name', role_name)
        .single()

      if (roleError || !roleData) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 })
      }

      updateFields.role_id = roleData.id
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateFields)
      .eq('id', userId)
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

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update branch assignments if specified
    if (branch_ids !== undefined) {
      // Remove existing assignments
      await supabaseAdmin
        .from('user_branches')
        .delete()
        .eq('user_id', userId)

      // Add new assignments
      if (branch_ids.length > 0) {
        const branchAssignments = branch_ids.map((branchId: string, index: number) => ({
          user_id: userId,
          branch_id: branchId,
          is_primary: index === 0
        }))

        const { error: branchError } = await supabaseAdmin
          .from('user_branches')
          .insert(branchAssignments)

        if (branchError) {
          console.error('Error updating branch assignments:', branchError)
        }
      }
    }

    // Get the complete updated user data with branches
    const { data: branchData } = await supabaseAdmin
      .from('user_branches')
      .select(`
        branch_id,
        is_primary,
        branches(id, name)
      `)
      .eq('user_id', userId)

    const branches = (branchData || []).map((item: any) => ({
      id: item.branches.id,
      name: item.branches.name,
      is_primary: item.is_primary
    }))

    const completeUser = {
      ...updatedUser,
      branches
    }

    return NextResponse.json({ success: true, user: completeUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // 1. Delete branch assignments
    await supabaseAdmin
      .from('user_branches')
      .delete()
      .eq('user_id', userId)

    // 2. Delete user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 3. Delete Supabase Auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Don't fail the operation if auth deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const body = await request.json()
    const { is_active } = body

    if (is_active === undefined) {
      return NextResponse.json({ error: 'is_active field is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_active })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}

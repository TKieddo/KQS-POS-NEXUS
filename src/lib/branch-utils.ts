import { supabase } from './supabase'

/**
 * Get the first available active branch
 */
export const getFirstAvailableBranch = async () => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .limit(1)
      .single()

    if (error) {
      console.error('Error getting first available branch:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting first available branch:', error)
    return null
  }
}

/**
 * Assign current user to a branch
 */
export const assignUserToBranch = async (branchId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('users')
      .update({ branch_id: branchId })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error assigning user to branch:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to assign user to branch' 
    }
  }
}

/**
 * Get current user's branch assignment
 */
export const getCurrentUserBranch = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        branch_id,
        branches!inner(id, name, is_active)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error getting user branch:', error)
      return null
    }

    return data.branches
  } catch (error) {
    console.error('Error getting user branch:', error)
    return null
  }
}

/**
 * Check if user needs branch assignment
 */
export const checkUserBranchAssignment = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { needsAssignment: false, reason: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('users')
      .select('branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error checking user branch assignment:', error)
      return { needsAssignment: false, reason: 'Database error' }
    }

    // If user doesn't exist in users table, they need assignment
    if (!data) {
      return { needsAssignment: true, reason: 'User not found in database' }
    }

    if (!data.branch_id) {
      return { needsAssignment: true, reason: 'No branch assigned' }
    }

    return { needsAssignment: false, reason: 'Branch assigned' }
  } catch (error) {
    console.error('Error checking user branch assignment:', error)
    return { needsAssignment: false, reason: 'Error occurred' }
  }
}

/**
 * Auto-assign user to first available branch
 */
export const autoAssignUserToBranch = async () => {
  try {
    const firstBranch = await getFirstAvailableBranch()
    if (!firstBranch) {
      return { 
        success: false, 
        error: 'No active branches available for assignment' 
      }
    }

    const result = await assignUserToBranch(firstBranch.id)
    if (result.success) {
      return { 
        success: true, 
        branch: firstBranch,
        message: `Assigned to ${firstBranch.name}` 
      }
    }

    return result
  } catch (error) {
    console.error('Error auto-assigning user to branch:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to auto-assign user to branch' 
    }
  }
} 
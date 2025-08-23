import { supabase } from './supabase'

export interface BranchAccess {
  branchId: string
  userId: string
  role: 'admin' | 'manager' | 'cashier' | 'viewer'
  permissions: string[]
  isActive: boolean
}

export interface BranchPermissions {
  canViewProducts: boolean
  canEditProducts: boolean
  canCreateSales: boolean
  canViewSales: boolean
  canManageCustomers: boolean
  canManageLaybye: boolean
  canViewReports: boolean
  canManageInventory: boolean
  canAccessAdmin: boolean
}

// Get user's branch access
export const getUserBranchAccess = async (userId: string): Promise<{ success: boolean; data?: BranchAccess[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('branch_access')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user branch access:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching user branch access:', error)
    return { success: false, error: 'Failed to fetch branch access' }
  }
}

// Check if user has access to a specific branch
export const checkBranchAccess = async (
  userId: string, 
  branchId: string, 
  requiredPermission?: string
): Promise<{ success: boolean; hasAccess: boolean; role?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('branch_access')
      .select('*')
      .eq('user_id', userId)
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error checking branch access:', error)
      return { success: false, hasAccess: false, error: error.message }
    }

    if (!data) {
      return { success: true, hasAccess: false }
    }

    // Check specific permission if required
    if (requiredPermission && !data.permissions.includes(requiredPermission)) {
      return { success: true, hasAccess: false, role: data.role }
    }

    return { success: true, hasAccess: true, role: data.role }
  } catch (error) {
    console.error('Error checking branch access:', error)
    return { success: false, hasAccess: false, error: 'Failed to check branch access' }
  }
}

// Get user permissions for a specific branch
export const getUserBranchPermissions = async (
  userId: string, 
  branchId: string
): Promise<{ success: boolean; data?: BranchPermissions; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('branch_access')
      .select('role, permissions')
      .eq('user_id', userId)
      .eq('branch_id', branchId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching user permissions:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: true, data: getDefaultPermissions() }
    }

    const permissions = getPermissionsByRole(data.role, data.permissions)
    return { success: true, data: permissions }
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return { success: false, error: 'Failed to fetch user permissions' }
  }
}

// Get permissions based on role
const getPermissionsByRole = (role: string, customPermissions: string[] = []): BranchPermissions => {
  const basePermissions = getDefaultPermissions()

  switch (role) {
    case 'admin':
      return {
        canViewProducts: true,
        canEditProducts: true,
        canCreateSales: true,
        canViewSales: true,
        canManageCustomers: true,
        canManageLaybye: true,
        canViewReports: true,
        canManageInventory: true,
        canAccessAdmin: true
      }
    
    case 'manager':
      return {
        canViewProducts: true,
        canEditProducts: true,
        canCreateSales: true,
        canViewSales: true,
        canManageCustomers: true,
        canManageLaybye: true,
        canViewReports: true,
        canManageInventory: true,
        canAccessAdmin: false
      }
    
    case 'cashier':
      return {
        canViewProducts: true,
        canEditProducts: false,
        canCreateSales: true,
        canViewSales: true,
        canManageCustomers: true,
        canManageLaybye: true,
        canViewReports: false,
        canManageInventory: false,
        canAccessAdmin: false
      }
    
    case 'viewer':
      return {
        canViewProducts: true,
        canEditProducts: false,
        canCreateSales: false,
        canViewSales: true,
        canManageCustomers: false,
        canManageLaybye: false,
        canViewReports: true,
        canManageInventory: false,
        canAccessAdmin: false
      }
    
    default:
      return basePermissions
  }
}

const getDefaultPermissions = (): BranchPermissions => ({
  canViewProducts: false,
  canEditProducts: false,
  canCreateSales: false,
  canViewSales: false,
  canManageCustomers: false,
  canManageLaybye: false,
  canViewReports: false,
  canManageInventory: false,
  canAccessAdmin: false
})

// Filter products by branch access
export const getProductsByBranch = async (branchId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // If central warehouse, get all products from all branches
    if (branchId === '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            color
          ),
          branch_allocations (
            id,
            allocated_quantity,
            notes,
            branches (
              id,
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching all products:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    }

    // For specific branch, get products allocated to that branch
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name,
          color
        ),
        branch_allocations!inner (
          id,
          allocated_quantity,
          notes
        )
      `)
      .eq('is_active', true)
      .eq('branch_allocations.branch_id', branchId)
      .gt('branch_allocations.allocated_quantity', 0)
      .order('name')

    if (error) {
      console.error('Error fetching products by branch:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching products by branch:', error)
    return { success: false, error: 'Failed to fetch products by branch' }
  }
}

// Filter customers by branch
export const getCustomersByBranch = async (branchId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // If central warehouse, get all customers from all branches
    if (branchId === '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          branches (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('first_name')

      if (error) {
        console.error('Error fetching all customers:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    }

    // For specific branch, get customers from that branch
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .eq('branch_id', branchId)
      .order('first_name')

    if (error) {
      console.error('Error fetching customers by branch:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching customers by branch:', error)
    return { success: false, error: 'Failed to fetch customers by branch' }
  }
}

// Filter sales by branch
export const getSalesByBranch = async (branchId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // If central warehouse, get all sales from all branches
    if (branchId === '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email
          ),
          sale_items (
            *,
            products (
              id,
              name,
              sku
            )
          ),
          branches (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all sales:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    }

    // For specific branch, get sales from that branch
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        sale_items (
          *,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sales by branch:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching sales by branch:', error)
    return { success: false, error: 'Failed to fetch sales by branch' }
  }
}

// Filter laybye orders by branch
export const getLaybyeOrdersByBranch = async (branchId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // If central warehouse, get all laybye orders from all branches
    if (branchId === '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('laybye_orders')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          laybye_items (
            *,
            products (
              id,
              name,
              sku
            )
          ),
          laybye_payments (
            id,
            amount,
            payment_method,
            payment_date,
            notes
          ),
          branches (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all laybye orders:', error)
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    }

    // For specific branch, get laybye orders from that branch
    const { data, error } = await supabase
      .from('laybye_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        laybye_items (
          *,
          products (
            id,
            name,
            sku
          )
        ),
        laybye_payments (
          id,
          amount,
          payment_method,
          payment_date,
          notes
        )
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching laybye orders by branch:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching laybye orders by branch:', error)
    return { success: false, error: 'Failed to fetch laybye orders by branch' }
  }
}

// Create branch access for a user
export const createBranchAccess = async (
  userId: string,
  branchId: string,
  role: string,
  permissions: string[] = []
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('branch_access')
      .insert({
        user_id: userId,
        branch_id: branchId,
        role,
        permissions,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating branch access:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating branch access:', error)
    return { success: false, error: 'Failed to create branch access' }
  }
}

// Update branch access
export const updateBranchAccess = async (
  accessId: string,
  updates: Partial<BranchAccess>
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('branch_access')
      .update(updates)
      .eq('id', accessId)
      .select()
      .single()

    if (error) {
      console.error('Error updating branch access:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating branch access:', error)
    return { success: false, error: 'Failed to update branch access' }
  }
}

// Remove branch access
export const removeBranchAccess = async (accessId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('branch_access')
      .delete()
      .eq('id', accessId)

    if (error) {
      console.error('Error removing branch access:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing branch access:', error)
    return { success: false, error: 'Failed to remove branch access' }
  }
} 
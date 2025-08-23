import { supabase } from './supabase'

export interface UnifiedUser {
  id: string
  email: string
  full_name: string
  role_id: string
  is_active: boolean
  pos_pin?: string
  last_login?: string
  last_pos_login?: string
  created_at: string
  updated_at: string
  role: {
    id: string
    name: string
    display_name: string
    permissions: Record<string, string>
    can_access_admin: boolean
    can_access_pos: boolean
  }
  branches?: Array<{ id: string; name: string; is_primary: boolean }>
}

export interface CreateUserData {
  email: string
  full_name: string
  password: string
  role_name: string
  pos_pin?: string
  branch_ids: string[]
}

export interface UpdateUserData {
  full_name?: string
  role_name?: string
  is_active?: boolean
  pos_pin?: string
  branch_ids?: string[]
}

export interface UserRole {
  id: string
  name: string
  display_name: string
  description?: string
  permissions: Record<string, string>
  can_access_admin: boolean
  can_access_pos: boolean
  is_system_role: boolean
}

class UnifiedUserManagementService {
  private static instance: UnifiedUserManagementService

  private constructor() {}

  public static getInstance(): UnifiedUserManagementService {
    if (!UnifiedUserManagementService.instance) {
      UnifiedUserManagementService.instance = new UnifiedUserManagementService()
    }
    return UnifiedUserManagementService.instance
  }

  /**
   * Get all users with their roles and branch assignments
   */
  async getAllUsers(): Promise<UnifiedUser[]> {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<UserRole[]> {
    try {
      const response = await fetch('/api/admin/roles')
      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch('/api/admin/branches')
      if (!response.ok) {
        throw new Error('Failed to fetch branches')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching branches:', error)
      throw error
    }
  }

  /**
   * Create a new user with role and branch assignments
   */
  async createUser(userData: CreateUserData): Promise<{ success: boolean; user?: UnifiedUser; error?: string }> {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create user' }
      }

      return result
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: 'Failed to create user' }
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<{ success: boolean; user?: UnifiedUser; error?: string }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update user' }
      }

      return result
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: 'Failed to update user' }
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to delete user' }
      }

      return result
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: 'Failed to delete user' }
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserActive(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update user status' }
      }

      return result
    } catch (error) {
      console.error('Error toggling user status:', error)
      return { success: false, error: 'Failed to update user status' }
    }
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(userId: string): Promise<UnifiedUser | null> {
    try {
      const users = await this.getAllUsers()
      return users.find(user => user.id === userId) || null
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
  }

  /**
   * Get user's branch assignments
   */
  async getUserBranches(userId: string): Promise<Array<{ id: string; name: string; is_primary: boolean }>> {
    try {
      const user = await this.getUserById(userId)
      return user?.branches || []
    } catch (error) {
      console.error('Error fetching user branches:', error)
      return []
    }
  }

  /**
   * Update user's branch assignments
   */
  async updateUserBranches(userId: string, branchIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch_ids: branchIds }),
      })

      const result = await response.json()

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update branch assignments' }
      }

      return result
    } catch (error) {
      console.error('Error updating user branches:', error)
      return { success: false, error: 'Failed to update branch assignments' }
    }
  }
}

// Create singleton instance
const unifiedUserManagementService = UnifiedUserManagementService.getInstance()

// Export functions for easy use
export const getAllUsers = () => unifiedUserManagementService.getAllUsers()
export const getRoles = () => unifiedUserManagementService.getRoles()
export const getBranches = () => unifiedUserManagementService.getBranches()
export const createUser = (userData: CreateUserData) => unifiedUserManagementService.createUser(userData)
export const updateUser = (userId: string, updateData: UpdateUserData) => unifiedUserManagementService.updateUser(userId, updateData)
export const deleteUser = (userId: string) => unifiedUserManagementService.deleteUser(userId)
export const toggleUserActive = (userId: string, isActive: boolean) => unifiedUserManagementService.toggleUserActive(userId, isActive)
export const getUserById = (userId: string) => unifiedUserManagementService.getUserById(userId)
export const getUserBranches = (userId: string) => unifiedUserManagementService.getUserBranches(userId)
export const updateUserBranches = (userId: string, branchIds: string[]) => unifiedUserManagementService.updateUserBranches(userId, branchIds)

// Export the service instance
export { unifiedUserManagementService }
export default unifiedUserManagementService

import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  full_name: string
  role_id?: string
  role?: UserRole // For joined data
  branch_id?: string | null
  is_active: boolean
  last_login?: string
  failed_login_attempts?: number
  locked_until?: string
  password_changed_at?: string
  last_password_reset?: string
  two_factor_secret?: string
  two_factor_enabled?: boolean
  force_password_change?: boolean
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface UserRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
  is_system_role: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  created_at: string
}

export interface SecuritySettings {
  id?: string
  branch_id?: string | null
  password_min_length: number
  password_complexity: boolean
  session_timeout: number
  max_login_attempts: number
  lockout_duration: number
  password_expiry_days: number
  two_factor_auth: boolean
  account_lockout: boolean
  audit_log_access: boolean
  require_password_change: boolean
  enable_user_activity_logging: boolean
  default_user_role: string | null
  created_at?: string
  updated_at?: string
}

export interface UserActivity {
  id: string
  user_id: string | null
  action: string
  resource: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export type UserRoleType = 'admin' | 'manager' | 'cashier' | 'viewer' | 'custom'

class UserManagementService {
  private static instance: UserManagementService
  private cache: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService()
    }
    return UserManagementService.instance
  }

  // ===== USER MANAGEMENT =====

  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      console.log('getUserById called with id:', id)
      
      // Validate user ID
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.log('Invalid user ID provided:', id)
        return null
      }
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .eq('id', id.trim())
        .maybeSingle()

      console.log('getUserById result:', { data, error })

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  /**
   * Check if email already exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1)

      if (error) throw error
      return data && data.length > 0
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Check if email already exists
      if (userData.email) {
        const emailExists = await this.checkEmailExists(userData.email)
        if (emailExists) {
          throw new Error('A user with this email address already exists')
        }
      }

      // Extract role_id from userData.role if it's an object, or use userData.role_id
      const { role, ...userDataWithoutRole } = userData
      let role_id = typeof role === 'string' ? role : (role as any)?.id || userData.role_id
      
      // Validate role_id - if it's empty or invalid, set it to null
      if (!role_id || role_id === '' || role_id.trim() === '') {
        role_id = null
      }
      
      const insertData = {
        ...userDataWithoutRole,
        ...(role_id && { role_id }) // Only include role_id if it's not null
      }

      console.log('Creating user with data:', insertData)

      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .single()

      if (error) throw error
      this.clearCache()
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      console.log('=== UPDATE USER DEBUG ===')
      console.log('User ID:', id)
      console.log('Updates:', updates)
      console.log('User ID type:', typeof id)
      console.log('User ID length:', id?.length)
      
      // Validate user ID
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Invalid user ID provided')
      }
      
      // First, let's check if the user exists with a simple query
      console.log('Checking if user exists...')
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', id.trim())
        .maybeSingle()
      
      console.log('User check result:', { userCheck, userCheckError })
      
      if (userCheckError) {
        console.error('User check failed:', userCheckError)
        throw new Error(`Database error: ${userCheckError.message}`)
      }
      
      if (!userCheck) {
        throw new Error(`User with ID ${id} not found in database`)
      }
      
      // Extract role_id from updates.role if it's an object, or use updates.role_id
      const { role, ...updatesWithoutRole } = updates
      const role_id = typeof role === 'string' ? role : (role as any)?.id || updates.role_id
      
      const updateData = {
        ...updatesWithoutRole,
        ...(role_id !== undefined && { role_id }),
        updated_at: new Date().toISOString()
      }

      console.log('Update data prepared:', updateData)

      // Perform the update
      console.log('Performing user update...')
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id.trim())
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .maybeSingle()

      console.log('Update result:', { data, error })

      if (error) {
        console.error('Supabase update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        throw new Error(`Update failed: ${error.message}`)
      }
      
      if (!data) {
        throw new Error('User update completed but no data returned')
      }
      
      this.clearCache()
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) throw error
      this.clearCache()
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(id: string): Promise<User> {
    try {
      const user = await this.getUserById(id)
      if (!user) throw new Error('User not found')

      return await this.updateUser(id, { is_active: !user.is_active })
    } catch (error) {
      console.error('Error toggling user status:', error)
      throw error
    }
  }

  // ===== ROLE MANAGEMENT =====

  /**
   * Get all roles
   */
  async getRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching roles:', error)
      throw error
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: Partial<UserRole>): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert(roleData)
        .select()
        .single()

      if (error) throw error
      this.clearCache()
      return data
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  }

  /**
   * Update role
   */
  async updateRole(id: string, updates: Partial<UserRole>): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      this.clearCache()
      return data
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id)

      if (error) throw error
      this.clearCache()
      return true
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  }

  // ===== SECURITY SETTINGS =====

  /**
   * Get security settings for a specific branch
   */
  async getSecuritySettings(branchId?: string | null): Promise<SecuritySettings> {
    const cacheKey = `security_settings_${branchId || 'global'}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      let query = supabase
        .from('security_settings')
        .select('*')

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        query = query.is('branch_id', null)
      }

      const { data, error } = await query.limit(1)

      if (error) {
        console.error('Error fetching security settings:', error)
        return this.getDefaultSecuritySettings()
      }

      if (data && data.length > 0) {
        const settings = data[0] as SecuritySettings
        this.cache.set(cacheKey, settings)
        return settings
      }

      // Create default settings if none exist for this branch (idempotent)
      const defaultSettings = this.getDefaultSecuritySettings()
      defaultSettings.branch_id = branchId || null
      try {
        const createdSettings = await this.createSecuritySettings(defaultSettings)
        this.cache.set(cacheKey, createdSettings)
        return createdSettings
      } catch (createErr: any) {
        // If duplicate, read existing one
        if (createErr?.code === '23505') {
          let readQuery = supabase
            .from('security_settings')
            .select('*')
            .limit(1)

          readQuery = branchId ? readQuery.eq('branch_id', branchId) : readQuery.is('branch_id', null)

          const { data: existing } = await readQuery.single()
          if (existing) {
            this.cache.set(cacheKey, existing)
            return existing as SecuritySettings
          }
        }
        throw createErr
      }
    } catch (error) {
      console.error('Error getting security settings:', error)
      return this.getDefaultSecuritySettings()
    }
  }

  /**
   * Update security settings for a specific branch
   */
  async updateSecuritySettings(updates: Partial<SecuritySettings>, branchId?: string | null): Promise<SecuritySettings> {
    try {
      // First, get the existing security settings for this branch to get the ID
      const existingSettings = await this.getSecuritySettings(branchId)
      
      if (!existingSettings.id) {
        throw new Error('Security settings not found or missing ID')
      }

      const { data, error } = await supabase
        .from('security_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) throw error

      const updatedSettings = data as SecuritySettings
      const cacheKey = `security_settings_${branchId || 'global'}`
      this.cache.set(cacheKey, updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Error updating security settings:', error)
      throw error
    }
  }

  /**
   * Create security settings
   */
  private async createSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    try {
      // If default_user_role is null, try to get the cashier role ID
      let settingsToInsert = { ...settings }
      if (!settingsToInsert.default_user_role) {
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('id')
            .eq('name', 'cashier')
            .single()
          
          if (roleData) {
            settingsToInsert.default_user_role = roleData.id
          }
        } catch (roleError) {
          console.warn('Could not find cashier role, leaving default_user_role as null:', roleError)
        }
      }

      // Use upsert to avoid duplicate key errors on unique (branch_id)
      const { data, error } = await supabase
        .from('security_settings')
        .upsert(settingsToInsert as any, { onConflict: 'branch_id' })
        .select()
        .single()

      if (error) {
        // If duplicate (23505) was still thrown for any reason, try to read existing row
        if ((error as any)?.code === '23505') {
          try {
            let readQuery = supabase
              .from('security_settings')
              .select('*')

            readQuery = settingsToInsert.branch_id
              ? readQuery.eq('branch_id', settingsToInsert.branch_id)
              : readQuery.is('branch_id', null)

            const { data: existing } = await readQuery.maybeSingle()
            if (existing) return existing as SecuritySettings
          } catch {}
        }
        throw error
      }
      return data as SecuritySettings
    } catch (error) {
      console.error('Error creating security settings:', error)
      throw error
    }
  }

  /**
   * Get default security settings
   */
  private getDefaultSecuritySettings(): SecuritySettings {
    return {
      branch_id: null,
      password_min_length: 8,
      password_complexity: true,
      session_timeout: 480, // 8 hours
      max_login_attempts: 5,
      lockout_duration: 30, // 30 minutes
      password_expiry_days: 90,
      two_factor_auth: false,
      account_lockout: true,
      audit_log_access: false,
      require_password_change: true,
      enable_user_activity_logging: true,
      default_user_role: null // Will be set to actual role ID when creating
    }
  }

  // ===== USER ACTIVITY LOGGING =====

  /**
   * Log user activity
   */
  async logUserActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<void> {
    try {
      // Validate user_id - if it's "system" or invalid, set it to null
      const activityData = {
        ...activity,
        user_id: activity.user_id === 'system' || !activity.user_id ? null : activity.user_id,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_activity_logs')
        .insert(activityData)

      if (error) {
        console.error('Error logging user activity:', error)
      }
    } catch (error) {
      console.error('Error logging user activity:', error)
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(userId?: string, limit = 100): Promise<UserActivity[]> {
    try {
      let query = supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user activity logs:', error)
      return []
    }
  }

  // ===== PERMISSION CHECKING =====

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      if (!user || !user.is_active) return false

      const roleId = user.role_id || user.role?.id
      if (!roleId) return false

      const role = await this.getRoleById(roleId)
      if (!role) return false

      // Ensure permissions array exists and is valid
      if (!role.permissions || !Array.isArray(role.permissions)) {
        console.warn('Role has no permissions or invalid permissions array:', role)
        return false
      }

      return role.permissions.some(
        permission => permission && permission.resource === resource && permission.action === action
      )
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Get role by ID
   */
  private async getRoleById(roleId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          permissions:role_permissions(
            permission:permissions(id, name, description, resource, action)
          )
        `)
        .eq('id', roleId)
        .single()

      if (error) throw error
      
      // Transform the data to match the UserRole interface
      if (data) {
        const transformedRole = {
          ...data,
          permissions: data.permissions?.map((rp: any) => rp.permission).filter(Boolean) || []
        }
        return transformedRole
      }
      
      return data
    } catch (error) {
      console.error('Error fetching role:', error)
      return null
    }
  }

  // ===== CACHE MANAGEMENT =====

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Clear cache for specific key
   */
  clearCacheFor(key: string): void {
    this.cache.delete(key)
  }
}

// Create singleton instance
const userManagementService = UserManagementService.getInstance()

// Export functions for easy use
export const getUsers = () => userManagementService.getUsers()
export const getUserById = (id: string) => userManagementService.getUserById(id)
export const createUser = (userData: Partial<User>) => userManagementService.createUser(userData)
export const checkEmailExists = (email: string) => userManagementService.checkEmailExists(email)
export const updateUser = (id: string, updates: Partial<User>) => userManagementService.updateUser(id, updates)
export const deleteUser = (id: string) => userManagementService.deleteUser(id)
export const toggleUserStatus = (id: string) => userManagementService.toggleUserStatus(id)

export const getRoles = () => userManagementService.getRoles()
export const createRole = (roleData: Partial<UserRole>) => userManagementService.createRole(roleData)
export const updateRole = (id: string, updates: Partial<UserRole>) => userManagementService.updateRole(id, updates)
export const deleteRole = (id: string) => userManagementService.deleteRole(id)

export const getSecuritySettings = (branchId?: string | null) => userManagementService.getSecuritySettings(branchId)
export const updateSecuritySettings = (updates: Partial<SecuritySettings>, branchId?: string | null) => userManagementService.updateSecuritySettings(updates, branchId)

export const logUserActivity = (activity: Omit<UserActivity, 'id' | 'created_at'>) => userManagementService.logUserActivity(activity)
export const getUserActivityLogs = (userId?: string, limit?: number) => userManagementService.getUserActivityLogs(userId, limit)
export const hasPermission = (userId: string, resource: string, action: string) => userManagementService.hasPermission(userId, resource, action)

export const clearUserManagementCache = () => userManagementService.clearCache() 
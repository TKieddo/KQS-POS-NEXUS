'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getSecuritySettings,
  updateSecuritySettings,
  logUserActivity,
  getUserActivityLogs,
  hasPermission,
  type User,
  type UserRole,
  type SecuritySettings,
  type UserActivity
} from '@/lib/user-management-service'

interface UseUserManagementReturn {
  // Users
  users: User[]
  isLoadingUsers: boolean
  error: string | null
  createNewUser: (userData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>
  updateExistingUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>
  deleteExistingUser: (id: string) => Promise<{ success: boolean; error?: string }>
  toggleUserActiveStatus: (id: string) => Promise<{ success: boolean; user?: User; error?: string }>
  
  // Roles
  roles: UserRole[]
  isLoadingRoles: boolean
  createNewRole: (roleData: Partial<UserRole>) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  updateExistingRole: (id: string, updates: Partial<UserRole>) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  deleteExistingRole: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Security Settings
  securitySettings: SecuritySettings | null
  isLoadingSettings: boolean
  updateSecuritySettings: (updates: Partial<SecuritySettings>) => Promise<{ success: boolean; settings?: SecuritySettings; error?: string }>
  
  // Activity Logs
  activityLogs: UserActivity[]
  isLoadingActivity: boolean
  loadActivityLogs: (userId?: string, limit?: number) => Promise<void>
  
  // Permissions
  checkPermission: (userId: string, resource: string, action: string) => Promise<boolean>
  
  // Utilities
  clearError: () => void
  refreshUsers: () => Promise<void>
  refreshRoles: () => Promise<void>
}

export const useUserManagement = (): UseUserManagementReturn => {
  const { selectedBranch } = useBranch()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<UserRole[]>([])
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [activityLogs, setActivityLogs] = useState<UserActivity[]>([])
  
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  
  const [error, setError] = useState<string | null>(null)

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    setError(null)
    
    try {
      const usersData = await getUsers()
      setUsers(usersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  // Load roles
  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true)
    setError(null)
    
    try {
      const rolesData = await getRoles()
      setRoles(rolesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setIsLoadingRoles(false)
    }
  }, [])

  // Load security settings
  const loadSecuritySettings = useCallback(async () => {
    setIsLoadingSettings(true)
    setError(null)
    
    try {
      const settings = await getSecuritySettings(selectedBranch?.id)
      setSecuritySettings(settings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings')
    } finally {
      setIsLoadingSettings(false)
    }
  }, [selectedBranch?.id])

  // Load activity logs
  const loadActivityLogs = useCallback(async (userId?: string, limit = 100) => {
    setIsLoadingActivity(true)
    setError(null)
    
    try {
      const logs = await getUserActivityLogs(userId, limit)
      setActivityLogs(logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity logs')
    } finally {
      setIsLoadingActivity(false)
    }
  }, [])

  // Create new user
  const createNewUser = useCallback(async (userData: Partial<User>) => {
    setError(null)
    
    try {
      const newUser = await createUser(userData)
      setUsers(prev => [newUser, ...prev])
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'create',
        resource: 'users',
        resource_id: newUser.id,
        details: { email: newUser.email, role: newUser.role }
      })
      
      return { success: true, user: newUser }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Update existing user
  const updateExistingUser = useCallback(async (id: string, updates: Partial<User>) => {
    setError(null)
    
    try {
      const updatedUser = await updateUser(id, updates)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'update',
        resource: 'users',
        resource_id: id,
        details: { changes: Object.keys(updates) }
      })
      
      return { success: true, user: updatedUser }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      console.error('Update user error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Delete existing user
  const deleteExistingUser = useCallback(async (id: string) => {
    setError(null)
    
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'delete',
        resource: 'users',
        resource_id: id
      })
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Toggle user active status
  const toggleUserActiveStatus = useCallback(async (id: string) => {
    setError(null)
    
    try {
      const updatedUser = await toggleUserStatus(id)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'toggle_status',
        resource: 'users',
        resource_id: id,
        details: { new_status: updatedUser.is_active }
      })
      
      return { success: true, user: updatedUser }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle user status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Create new role
  const createNewRole = useCallback(async (roleData: Partial<UserRole>) => {
    setError(null)
    
    try {
      const newRole = await createRole(roleData)
      setRoles(prev => [newRole, ...prev])
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'create',
        resource: 'roles',
        resource_id: newRole.id,
        details: { name: newRole.name }
      })
      
      return { success: true, role: newRole }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Update existing role
  const updateExistingRole = useCallback(async (id: string, updates: Partial<UserRole>) => {
    setError(null)
    
    try {
      const updatedRole = await updateRole(id, updates)
      setRoles(prev => prev.map(role => role.id === id ? updatedRole : role))
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'update',
        resource: 'roles',
        resource_id: id,
        details: { changes: Object.keys(updates) }
      })
      
      return { success: true, role: updatedRole }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update role'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Delete existing role
  const deleteExistingRole = useCallback(async (id: string) => {
    setError(null)
    
    try {
      await deleteRole(id)
      setRoles(prev => prev.filter(role => role.id !== id))
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'delete',
        resource: 'roles',
        resource_id: id
      })
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete role'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Update security settings
  const updateSecuritySettingsHandler = useCallback(async (updates: Partial<SecuritySettings>) => {
    setError(null)
    
    try {
      const updatedSettings = await updateSecuritySettings(updates, selectedBranch?.id)
      setSecuritySettings(updatedSettings)
      
      // Log activity
      await logUserActivity({
        user_id: null, // TODO: Get current user ID from auth context
        action: 'update',
        resource: 'security_settings',
        details: { changes: Object.keys(updates), branch_id: selectedBranch?.id }
      })
      
      return { success: true, settings: updatedSettings }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update security settings'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [selectedBranch?.id])

  // Check permission
  const checkPermission = useCallback(async (userId: string, resource: string, action: string) => {
    try {
      return await hasPermission(userId, resource, action)
    } catch (err) {
      console.error('Error checking permission:', err)
      return false
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh functions
  const refreshUsers = useCallback(() => loadUsers(), [loadUsers])
  const refreshRoles = useCallback(() => loadRoles(), [loadRoles])

  // Load initial data
  useEffect(() => {
    loadUsers()
    loadRoles()
    loadSecuritySettings()
  }, [loadUsers, loadRoles, loadSecuritySettings])

  // Reload security settings when branch changes
  useEffect(() => {
    loadSecuritySettings()
  }, [selectedBranch?.id, loadSecuritySettings])

  return {
    // Users
    users,
    isLoadingUsers,
    error,
    createNewUser,
    updateExistingUser,
    deleteExistingUser,
    toggleUserActiveStatus,
    
    // Roles
    roles,
    isLoadingRoles,
    createNewRole,
    updateExistingRole,
    deleteExistingRole,
    
    // Security Settings
    securitySettings,
    isLoadingSettings,
    updateSecuritySettings: updateSecuritySettingsHandler,
    
    // Activity Logs
    activityLogs,
    isLoadingActivity,
    loadActivityLogs,
    
    // Permissions
    checkPermission,
    
    // Utilities
    clearError,
    refreshUsers,
    refreshRoles
  }
} 
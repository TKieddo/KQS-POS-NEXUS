import { supabase } from './supabase'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role_id: string
  branch_id?: string
  is_active: boolean
  pos_pin?: string
  last_login?: string
  last_pos_login?: string
  role: {
    id: string
    name: string
    display_name: string
    permissions: Record<string, string>
    can_access_admin: boolean
    can_access_pos: boolean
  }
  branches?: Array<{ id: string; name: string }>
}

export interface LoginCredentials {
  email: string
  password: string
  pin?: string // For POS authentication
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
  message?: string
}

class UnifiedAuthService {
  private static instance: UnifiedAuthService

  private constructor() {}

  public static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService()
    }
    return UnifiedAuthService.instance
  }

  /**
   * Get current authenticated user with full role information
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('Getting current user...')
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      
      if (!supabaseUser) {
        console.log('No Supabase user found')
        return null
      }

      console.log('Supabase user found, fetching user data directly...')

      // Add timeout for database query with retry logic
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 15000)
      })

      const queryPromise = supabase
        .from('users')
        .select(`
          *,
          role:user_roles(id, name, display_name, permissions, can_access_admin, can_access_pos)
        `)
        .eq('email', supabaseUser.email)
        .single()

      const { data: user, error: userError } = await Promise.race([queryPromise, timeoutPromise]) as any

      if (userError) {
        console.error('Error fetching user data:', userError)
        
        // If it's a network error, try one more time
        if (userError.code === 'PGRST301' || userError.message?.includes('network')) {
          console.log('Network error detected, retrying once...')
          try {
            const retryResult = await supabase
              .from('users')
              .select(`
                *,
                role:user_roles(id, name, display_name, permissions, can_access_admin, can_access_pos)
              `)
              .eq('email', supabaseUser.email)
              .single()
            
            if (retryResult.error) {
              console.error('Retry also failed:', retryResult.error)
              return null
            }
            
            console.log('User data retrieved successfully on retry')
            return retryResult.data as AuthUser
          } catch (retryError) {
            console.error('Retry failed:', retryError)
            return null
          }
        }
        
        return null
      }

      console.log('User data retrieved successfully')
      return user as AuthUser
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Sign in with email and password (for admin and regular users)
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Starting sign in process...')
      
      // Attempt Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        return { success: false, error: 'Invalid email or password' }
      }

      console.log('Supabase auth successful, getting user data...')

      // Get full user data with role information
      let user = await this.getCurrentUser()
      
      console.log('User data retrieved:', user ? 'success' : 'not found')
      
      // If user doesn't exist in our table, create a default profile
      if (!user && authData.user) {
        console.log('Creating default user profile...')
        user = await this.createDefaultUserProfile(authData.user.email!)
        console.log('Default profile created:', user ? 'success' : 'failed')
      }
      
      if (!user) {
        console.error('No user profile available, signing out...')
        await supabase.auth.signOut()
        return { success: false, error: 'Unable to create user profile. Contact admin.' }
      }

      if (!user.is_active) {
        console.error('User account is deactivated')
        await supabase.auth.signOut()
        return { success: false, error: 'Account is deactivated' }
      }

      console.log('Sign in successful for user:', user.email)
      return { 
        success: true, 
        user,
        message: 'Successfully signed in' 
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Create a default user profile for Supabase Auth users
   */
  private async createDefaultUserProfile(email: string): Promise<AuthUser | null> {
    try {
      console.log('Creating default user profile for:', email)
      
      // Get the default role (super_admin or admin)
      console.log('Fetching default role...')
      const { data: defaultRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', 'super_admin')
        .single()

      if (!defaultRole) {
        console.error('No default role found')
        return null
      }

      console.log('Default role found, creating user profile...')

      // Create user profile using service role to bypass RLS
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email,
          full_name: email.split('@')[0], // Use email prefix as name
          role_id: defaultRole.id,
          is_active: true
        })
        .select(`
          *,
          role:user_roles(id, name, display_name, permissions, can_access_admin, can_access_pos)
        `)
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      console.log('User profile created successfully')
      return newUser as AuthUser
    } catch (error) {
      console.error('Error creating default user profile:', error)
      return null
    }
  }

  /**
   * POS Authentication with PIN support
   */
  async authenticatePOSUser(email: string, pin: string, branchId: string): Promise<AuthResponse> {
    try {
      // Try POS authentication function first
      const { data: posData, error: posError } = await supabase.rpc('authenticate_pos_user', {
        user_email: email,
        user_pin: pin,
        branch_id: branchId
      })

      if (posError || !posData) {
        return { success: false, error: 'Invalid credentials or access not allowed for this branch' }
      }

      // For POS-only users, they might not have Supabase Auth accounts
      // Try to sign them in, but don't fail if it doesn't work
      try {
        await supabase.auth.signInWithPassword({
          email: email,
          password: pin // PIN as password for POS users
        })
      } catch (authError) {
        // For POS-only users without Supabase Auth, that's OK
        console.log('No Supabase auth for POS user (this is normal for POS-only accounts)')
      }

      return {
        success: true,
        user: posData as AuthUser,
        message: 'POS authentication successful'
      }
    } catch (error) {
      console.error('POS authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  /**
   * Check if user can access admin dashboard
   */
  canAccessAdmin(user: AuthUser | null): boolean {
    return user?.role?.can_access_admin === true && user?.is_active === true
  }

  /**
   * Check if user can access POS
   */
  canAccessPOS(user: AuthUser | null): boolean {
    return user?.role?.can_access_pos === true && user?.is_active === true
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: AuthUser | null, permission: string): boolean {
    if (!user?.role?.permissions) return false
    return user.role.permissions[permission] === 'true'
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      return { success: false, error: 'Failed to send reset email' }
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      return { success: false, error: 'Failed to update password' }
    }
  }
}

// Export both named and default exports
export const unifiedAuthService = UnifiedAuthService.getInstance()
export default unifiedAuthService

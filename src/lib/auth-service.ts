import { supabase } from './supabase'
import { User, SecuritySettings } from './user-management-service'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role_id?: string
  role?: any
  branch_id?: string | null
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  role_id?: string
  branch_id?: string | null
}

export interface AuthResponse {
  success: boolean
  user?: AuthUser
  error?: string
  message?: string
}

class AuthService {
  private static instance: AuthService
  private securitySettings: SecuritySettings | null = null

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Get current authenticated user from custom users table
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      
      if (!supabaseUser) return null

      // Get user from our custom users table
      const { data: customUser, error } = await supabase
        .from('users')
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .eq('email', supabaseUser.email)
        .single()

      if (error || !customUser) return null

      return customUser as AuthUser
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Attempt Supabase authentication first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      // On auth failure, increment failed attempts if a user exists, then return error
      if (signInError) {
        const securitySettings = await this.getSecuritySettings()
        await this.incrementFailedLoginAttempts(credentials.email, securitySettings)
        return { success: false, error: 'Invalid email or password' }
      }

      // We are authenticated; now load or create the app user in our users table
      const securitySettings = await this.getSecuritySettings()

      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, is_active, locked_until')
        .eq('email', credentials.email)
        .single()

      // If custom user not found, create with defaults
      if (!existingUser) {
        let roleId = undefined as string | undefined
        if (securitySettings.default_user_role) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('id')
            .eq('name', securitySettings.default_user_role)
            .single()
          if (roleData) roleId = roleData.id
        }

        const { error: createError } = await supabase
          .from('users')
          .insert({
            email: credentials.email,
            full_name: credentials.email.split('@')[0],
            role_id: roleId,
            is_active: true
          })
        if (createError) {
          // If we fail to create an app user, sign out and surface the error
          await supabase.auth.signOut()
          return { success: false, error: 'Unable to create user profile. Contact admin.' }
        }
      } else {
        // Enforce is_active and lockout after auth
        if (existingUser.is_active === false) {
          await supabase.auth.signOut()
          return { success: false, error: 'Account is deactivated' }
        }
        if (existingUser.locked_until && new Date(existingUser.locked_until) > new Date()) {
          await supabase.auth.signOut()
          return { success: false, error: 'Account is temporarily locked due to failed login attempts' }
        }
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(credentials.email)

      // Update last login
      await this.updateLastLogin(credentials.email)

      // Log successful login if activity logging is enabled
      if (securitySettings.enable_user_activity_logging) {
        try {
          const { data: { user: supabaseUser } } = await supabase.auth.getUser()
          if (supabaseUser) {
            await supabase.rpc('log_user_activity_new', {
              p_user_id: supabaseUser.id,
              p_activity_type: 'login',
              p_description: 'User logged in successfully',
              p_metadata: { method: 'email', success: true }
            })
          }
        } catch (error) {
          console.error('Error logging user activity:', error)
        }
      }

      // Get full user data
      const user = await this.getCurrentUser()
      return { success: true, user: user || undefined, message: 'Successfully signed in' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign up new user
   */
  async signUp(userData: SignupData): Promise<AuthResponse> {
    try {
      const securitySettings = await this.getSecuritySettings()
      
      // Validate password against security settings
      const passwordValidation = this.validatePassword(userData.password, securitySettings)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error }
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      // Get the default role ID if not provided
      let roleId = userData.role_id
      if (!roleId && securitySettings.default_user_role) {
        // Get the role ID from the role name
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', securitySettings.default_user_role)
          .single()
        
        if (roleData) {
          roleId = roleData.id
        }
      }

      // Create user in our custom users table
      const { data: customUser, error: customError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          full_name: userData.full_name,
          role_id: roleId,
          branch_id: userData.branch_id,
          is_active: true
        })
        .select(`
          *,
          role:user_roles(id, name, description, is_system_role)
        `)
        .single()

      if (customError) {
        // Clean up auth user if custom user creation fails
        await supabase.auth.admin.deleteUser(authData.user?.id || '')
        return { success: false, error: customError.message }
      }

      return { 
        success: true, 
        user: customUser as AuthUser,
        message: 'Account created successfully'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<AuthResponse> {
    try {
      // Log sign out activity before signing out
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const securitySettings = await this.getSecuritySettings()
          if (securitySettings.enable_user_activity_logging) {
            await supabase.rpc('log_user_activity_new', {
              p_user_id: user.id,
              p_activity_type: 'logout',
              p_description: 'User signed out',
              p_metadata: { method: 'manual' }
            })
          }
        }
      } catch (error) {
        console.error('Error logging sign out activity:', error)
      }

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Successfully signed out' }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'An unexpected error occurred' }
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
      console.error('Reset password error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<AuthResponse> {
    try {
      const securitySettings = await this.getSecuritySettings()
      
      // Validate new password
      const passwordValidation = this.validatePassword(password, securitySettings)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error }
      }

      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update password_changed_at in custom users table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('users')
          .update({ password_changed_at: new Date().toISOString() })
          .eq('email', user.email)
      }

      return { success: true, message: 'Password updated successfully' }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Validate password against security settings
   */
  private validatePassword(password: string, settings: SecuritySettings): { valid: boolean; error?: string } {
    if (password.length < settings.password_min_length) {
      return { 
        valid: false, 
        error: `Password must be at least ${settings.password_min_length} characters long` 
      }
    }

    if (settings.password_complexity) {
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        return { 
          valid: false, 
          error: 'Password must contain uppercase, lowercase, number, and special character' 
        }
      }
    }

    return { valid: true }
  }

  /**
   * Get security settings
   */
  private async getSecuritySettings(): Promise<SecuritySettings> {
    if (this.securitySettings) {
      return this.securitySettings
    }

    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .limit(1)
        .single()

      if (error || !data) {
        // Return default settings if none exist
        return {
          password_min_length: 8,
          password_complexity: true,
          session_timeout: 480,
          max_login_attempts: 5,
          lockout_duration: 30,
          password_expiry_days: 90,
          two_factor_auth: false,
          account_lockout: true,
          audit_log_access: false,
          require_password_change: true,
          enable_user_activity_logging: true,
          default_user_role: 'cashier'
        }
      }

      this.securitySettings = data
      return data
    } catch (error) {
      console.error('Error getting security settings:', error)
      return {
        password_min_length: 8,
        password_complexity: true,
        session_timeout: 480,
        max_login_attempts: 5,
        lockout_duration: 30,
        password_expiry_days: 90,
        two_factor_auth: false,
        account_lockout: true,
        audit_log_access: false,
        require_password_change: true,
        enable_user_activity_logging: true,
        default_user_role: 'cashier'
      }
    }
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedLoginAttempts(email: string, settings: SecuritySettings): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('failed_login_attempts')
        .eq('email', email)
        .single()

      if (!user) return

      const newAttempts = (user.failed_login_attempts || 0) + 1
      const updateData: any = { failed_login_attempts: newAttempts }

      // Lock account if max attempts reached
      if (settings.account_lockout && newAttempts >= settings.max_login_attempts) {
        const lockoutUntil = new Date()
        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + settings.lockout_duration)
        updateData.locked_until = lockoutUntil.toISOString()
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
    } catch (error) {
      console.error('Error incrementing failed login attempts:', error)
    }
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedLoginAttempts(email: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ 
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('email', email)
    } catch (error) {
      console.error('Error resetting failed login attempts:', error)
    }
  }

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(email: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }
}

// Create singleton instance
const authService = AuthService.getInstance()

// Export functions for easy use
export const getCurrentUser = () => authService.getCurrentUser()
export const signIn = (credentials: LoginCredentials) => authService.signIn(credentials)
export const signUp = (userData: SignupData) => authService.signUp(userData)
export const signOut = () => authService.signOut()
export const resetPassword = (email: string) => authService.resetPassword(email)
export const updatePassword = (password: string) => authService.updatePassword(password) 
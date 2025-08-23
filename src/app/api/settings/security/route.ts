import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SecuritySettings } from '@/lib/user-management-service'

// GET /api/settings/security
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('security_settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      // If no settings exist, return default settings
      if (error.code === 'PGRST116') {
        // Get the cashier role ID for default settings
        const { data: cashierRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', 'cashier')
          .single()

        const defaultSettings: SecuritySettings = {
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
          default_user_role: cashierRole?.id || ''
        }
        return NextResponse.json(defaultSettings)
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    )
  }
}

// PATCH /api/settings/security
export async function PATCH(request: NextRequest) {
  try {
    const updates: Partial<SecuritySettings> = await request.json()

    // Validate the updates
    const validation = validateSecuritySettings(updates)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // First, check if settings exist
    const { data: existingSettings } = await supabase
      .from('security_settings')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('security_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings.id)
        .select('*')
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('security_settings')
        .insert({
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    )
  }
}

// POST /api/settings/security (for creating initial settings)
export async function POST(request: NextRequest) {
  try {
    const settings: SecuritySettings = await request.json()

    // Validate the settings
    const validation = validateSecuritySettings(settings)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('security_settings')
      .insert({
        ...settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating security settings:', error)
    return NextResponse.json(
      { error: 'Failed to create security settings' },
      { status: 500 }
    )
  }
}

// Validation function
function validateSecuritySettings(settings: Partial<SecuritySettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (settings.password_min_length !== undefined) {
    if (settings.password_min_length < 6) {
      errors.push('Password minimum length must be at least 6 characters')
    }
    if (settings.password_min_length > 50) {
      errors.push('Password minimum length cannot exceed 50 characters')
    }
  }

  if (settings.session_timeout !== undefined) {
    if (settings.session_timeout < 15) {
      errors.push('Session timeout must be at least 15 minutes')
    }
    if (settings.session_timeout > 1440) {
      errors.push('Session timeout cannot exceed 24 hours (1440 minutes)')
    }
  }

  if (settings.max_login_attempts !== undefined) {
    if (settings.max_login_attempts < 1) {
      errors.push('Maximum login attempts must be at least 1')
    }
    if (settings.max_login_attempts > 20) {
      errors.push('Maximum login attempts cannot exceed 20')
    }
  }

  if (settings.lockout_duration !== undefined) {
    if (settings.lockout_duration < 5) {
      errors.push('Lockout duration must be at least 5 minutes')
    }
    if (settings.lockout_duration > 1440) {
      errors.push('Lockout duration cannot exceed 24 hours (1440 minutes)')
    }
  }

  if (settings.password_expiry_days !== undefined) {
    if (settings.password_expiry_days < 1) {
      errors.push('Password expiry must be at least 1 day')
    }
    if (settings.password_expiry_days > 365) {
      errors.push('Password expiry cannot exceed 1 year (365 days)')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
} 
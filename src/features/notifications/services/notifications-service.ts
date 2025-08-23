import { supabase } from '@/lib/supabase'
import { 
  NotificationRule, 
  IntegrationSettings, 
  NotificationLog,
  NotificationRuleFormData,
  IntegrationSettingsFormData
} from '../types'

// ========================================
// NOTIFICATION RULES SERVICE
// ========================================

export class NotificationRulesService {
  // Get all notification rules for current branch
  static async getNotificationRules(branchId?: string): Promise<NotificationRule[]> {
    try {
      let query = supabase
        .from('notification_rules')
        .select('*')
        .order('created_at', { ascending: false })

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        // If no branch ID, get all rules (both global and branch-specific)
        // This is a fallback for when branch context is not available
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notification rules:', error)
        // Return empty array instead of throwing to prevent UI crashes
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getNotificationRules:', error)
      // Return empty array instead of throwing to prevent UI crashes
      return []
    }
  }

  // Create a new notification rule
  static async createNotificationRule(rule: NotificationRuleFormData, branchId?: string): Promise<NotificationRule> {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .insert({
          ...rule,
          branch_id: branchId || null,
          recipients: rule.recipients || []
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification rule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createNotificationRule:', error)
      throw error
    }
  }

  // Update a notification rule
  static async updateNotificationRule(id: string, updates: Partial<NotificationRuleFormData>): Promise<NotificationRule> {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification rule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateNotificationRule:', error)
      throw error
    }
  }

  // Delete a notification rule
  static async deleteNotificationRule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_rules')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting notification rule:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteNotificationRule:', error)
      throw error
    }
  }

  // Toggle notification rule active status
  static async toggleNotificationRule(id: string, isActive: boolean): Promise<NotificationRule> {
    try {
      const { data, error } = await supabase
        .from('notification_rules')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling notification rule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in toggleNotificationRule:', error)
      throw error
    }
  }
}

// ========================================
// INTEGRATION SETTINGS SERVICE
// ========================================

export class IntegrationSettingsService {
  // Get integration settings for current branch
  static async getIntegrationSettings(branchId?: string): Promise<IntegrationSettings | null> {
    try {
      let query = supabase
        .from('integration_settings')
        .select('*')
        .limit(1)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        // If no branch ID, get the first available settings
        // This is a fallback for when branch context is not available
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching integration settings:', error)
        // Return null instead of throwing to prevent UI crashes
        return null
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Error in getIntegrationSettings:', error)
      // Return null instead of throwing to prevent UI crashes
      return null
    }
  }

  // Create or update integration settings
  static async saveIntegrationSettings(settings: IntegrationSettingsFormData, branchId?: string): Promise<IntegrationSettings> {
    try {
      // Check if settings exist
      const existingSettings = await this.getIntegrationSettings(branchId)

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('integration_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating integration settings:', error)
          throw error
        }

        return data
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('integration_settings')
          .insert({
            ...settings,
            branch_id: branchId || null
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating integration settings:', error)
          throw error
        }

        return data
      }
    } catch (error) {
      console.error('Error in saveIntegrationSettings:', error)
      throw error
    }
  }

  // Test email configuration
  static async testEmailConfiguration(settings: IntegrationSettingsFormData): Promise<boolean> {
    try {
      // This would typically call your email service
      // For now, we'll simulate a successful test
      console.log('Testing email configuration:', settings)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Error testing email configuration:', error)
      throw error
    }
  }

  // Test SMS configuration
  static async testSMSConfiguration(settings: IntegrationSettingsFormData): Promise<boolean> {
    try {
      // This would typically call your SMS service
      // For now, we'll simulate a successful test
      console.log('Testing SMS configuration:', settings)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Error testing SMS configuration:', error)
      throw error
    }
  }
}

// ========================================
// NOTIFICATION LOGS SERVICE
// ========================================

export class NotificationLogsService {
  // Get notification logs
  static async getNotificationLogs(limit: number = 50): Promise<NotificationLog[]> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          notification_rules(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching notification logs:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getNotificationLogs:', error)
      throw error
    }
  }

  // Create a notification log entry
  static async createNotificationLog(log: Omit<NotificationLog, 'id' | 'created_at'>): Promise<NotificationLog> {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .insert(log)
        .select()
        .single()

      if (error) {
        console.error('Error creating notification log:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createNotificationLog:', error)
      throw error
    }
  }

  // Update notification log status
  static async updateNotificationLogStatus(id: string, status: 'pending' | 'sent' | 'failed', errorMessage?: string): Promise<NotificationLog> {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString()
      }

      if (errorMessage) {
        updateData.error_message = errorMessage
      }

      const { data, error } = await supabase
        .from('notification_logs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating notification log:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateNotificationLogStatus:', error)
      throw error
    }
  }
} 
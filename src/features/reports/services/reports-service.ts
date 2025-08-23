import { supabase } from '@/lib/supabase'
import { 
  ReportSchedule, 
  ReportTemplate, 
  ExportSettings, 
  DataExport,
  ReportExecution,
  ReportScheduleFormData,
  ExportSettingsFormData,
  DataExportFormData
} from '../types'

// ========================================
// REPORT SCHEDULES SERVICE
// ========================================

export class ReportSchedulesService {
  // Get all report schedules for current branch
  static async getReportSchedules(branchId?: string): Promise<ReportSchedule[]> {
    try {
      let query = supabase
        .from('report_schedules')
        .select('*')
        .order('created_at', { ascending: false })

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        query = query.is('branch_id', null) // Global schedules
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching report schedules:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getReportSchedules:', error)
      return []
    }
  }

  // Create a new report schedule
  static async createReportSchedule(schedule: ReportScheduleFormData, branchId?: string): Promise<ReportSchedule> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert({
          ...schedule,
          branch_id: branchId || null,
          recipients: schedule.recipients || []
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating report schedule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createReportSchedule:', error)
      throw error
    }
  }

  // Update a report schedule
  static async updateReportSchedule(id: string, updates: Partial<ReportScheduleFormData>): Promise<ReportSchedule> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating report schedule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateReportSchedule:', error)
      throw error
    }
  }

  // Delete a report schedule
  static async deleteReportSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting report schedule:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteReportSchedule:', error)
      throw error
    }
  }

  // Toggle report schedule active status
  static async toggleReportSchedule(id: string, isActive: boolean): Promise<ReportSchedule> {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling report schedule:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in toggleReportSchedule:', error)
      throw error
    }
  }
}

// ========================================
// EXPORT SETTINGS SERVICE
// ========================================

export class ExportSettingsService {
  // Get export settings for current branch
  static async getExportSettings(branchId?: string): Promise<ExportSettings | null> {
    try {
      let query = supabase
        .from('export_settings')
        .select('*')
        .limit(1)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        query = query.is('branch_id', null) // Global settings
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching export settings:', error)
        throw error
      }

      return data?.[0] || null
    } catch (error) {
      console.error('Error in getExportSettings:', error)
      return null
    }
  }

  // Save export settings
  static async saveExportSettings(settings: ExportSettingsFormData, branchId?: string): Promise<ExportSettings> {
    try {
      // Check if settings exist
      const existingSettings = await this.getExportSettings(branchId)

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('export_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating export settings:', error)
          throw error
        }

        return data
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('export_settings')
          .insert({
            ...settings,
            branch_id: branchId || null
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating export settings:', error)
          throw error
        }

        return data
      }
    } catch (error) {
      console.error('Error in saveExportSettings:', error)
      throw error
    }
  }
}

// ========================================
// DATA EXPORT SERVICE
// ========================================

export class DataExportService {
  // Get data exports for current branch
  static async getDataExports(branchId?: string, limit: number = 50): Promise<DataExport[]> {
    try {
      let query = supabase
        .from('data_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        query = query.is('branch_id', null) // Global exports
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching data exports:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getDataExports:', error)
      return []
    }
  }

  // Create a new data export
  static async createDataExport(exportData: DataExportFormData, branchId?: string, userId?: string): Promise<DataExport> {
    try {
      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          ...exportData,
          branch_id: branchId || null,
          created_by: userId || 'system',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating data export:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createDataExport:', error)
      throw error
    }
  }

  // Update data export status
  static async updateDataExportStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed', fileUrl?: string, fileSize?: number): Promise<DataExport> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
        if (fileUrl) updateData.file_url = fileUrl
        if (fileSize) updateData.file_size = fileSize
      }

      const { data, error } = await supabase
        .from('data_exports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating data export status:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateDataExportStatus:', error)
      throw error
    }
  }

  // Delete a data export
  static async deleteDataExport(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_exports')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting data export:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteDataExport:', error)
      throw error
    }
  }
}

// ========================================
// REPORT EXECUTIONS SERVICE
// ========================================

export class ReportExecutionsService {
  // Get report executions for current branch
  static async getReportExecutions(branchId?: string, limit: number = 50): Promise<ReportExecution[]> {
    try {
      let query = supabase
        .from('report_executions')
        .select(`
          *,
          report_schedules!inner(branch_id)
        `)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('report_schedules.branch_id', branchId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching report executions:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getReportExecutions:', error)
      return []
    }
  }

  // Create a new report execution
  static async createReportExecution(execution: Omit<ReportExecution, 'id' | 'started_at'>): Promise<ReportExecution> {
    try {
      const { data, error } = await supabase
        .from('report_executions')
        .insert({
          ...execution,
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating report execution:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createReportExecution:', error)
      throw error
    }
  }

  // Update report execution status
  static async updateReportExecutionStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed', fileUrl?: string, fileSize?: number, errorMessage?: string): Promise<ReportExecution> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
        if (fileUrl) updateData.file_url = fileUrl
        if (fileSize) updateData.file_size = fileSize
      }

      if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage
      }

      const { data, error } = await supabase
        .from('report_executions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating report execution status:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateReportExecutionStatus:', error)
      throw error
    }
  }
} 
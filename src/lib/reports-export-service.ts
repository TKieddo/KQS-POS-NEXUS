import { supabase } from './supabase'

export interface ReportSchedule {
  id?: string
  branch_id?: string
  name: string
  report_type: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  format: 'pdf' | 'excel' | 'csv' | 'json'
  recipients: string[]
  schedule_time: string
  is_active: boolean
  last_run?: string
  next_run?: string
  created_at?: string
  updated_at?: string
}

export interface ExportSettings {
  id?: string
  branch_id?: string
  default_format: 'csv' | 'excel' | 'pdf' | 'json'
  date_format: string
  include_headers: boolean
  max_rows: number
  compression_enabled: boolean
  auto_export_enabled: boolean
  export_frequency: 'daily' | 'weekly' | 'monthly'
  export_time: string
  storage_location: 'local' | 'cloud' | 'email'
  retention_days: number
  created_at?: string
  updated_at?: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'sales' | 'inventory' | 'financial' | 'customer' | 'custom'
  template_data: any
  is_default: boolean
  is_active: boolean
}

export interface ExportHistory {
  id: string
  schedule_id?: string
  report_type: string
  format: string
  file_path: string
  file_size: number
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  completed_at?: string
}

// Load report schedules
export const loadReportSchedules = async (branchId?: string): Promise<ReportSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('branch_id', branchId || 'global')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading report schedules:', error)
    return []
  }
}

// Create report schedule
export const createReportSchedule = async (schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_schedules')
      .insert({
        ...schedule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error creating report schedule:', error)
    return false
  }
}

// Update report schedule
export const updateReportSchedule = async (id: string, updates: Partial<ReportSchedule>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating report schedule:', error)
    return false
  }
}

// Delete report schedule
export const deleteReportSchedule = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting report schedule:', error)
    return false
  }
}

// Load export settings
export const loadExportSettings = async (branchId?: string): Promise<ExportSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('export_settings')
      .select('*')
      .eq('branch_id', branchId || 'global')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      // Return default settings if none exist
      return {
        default_format: 'csv',
        date_format: 'YYYY-MM-DD',
        include_headers: true,
        max_rows: 10000,
        compression_enabled: true,
        auto_export_enabled: false,
        export_frequency: 'daily',
        export_time: '02:00:00',
        storage_location: 'local',
        retention_days: 30
      }
    }

    return data
  } catch (error) {
    console.error('Error loading export settings:', error)
    throw error
  }
}

// Update export settings
export const updateExportSettings = async (settings: ExportSettings): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('export_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating export settings:', error)
    return false
  }
}

// Load report templates
export const loadReportTemplates = async (): Promise<ReportTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading report templates:', error)
    return []
  }
}

// Load export history
export const loadExportHistory = async (limit: number = 50): Promise<ExportHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('export_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading export history:', error)
    return []
  }
}

// Generate report
export const generateReport = async (scheduleId: string, options: any): Promise<boolean> => {
  try {
    // This would typically generate the report
    // For now, we'll simulate a successful generation
    console.log('Generating report for schedule:', scheduleId, 'with options:', options)
    return true
  } catch (error) {
    console.error('Error generating report:', error)
    return false
  }
}

// Export data
export const exportData = async (dataType: string, format: string, options: any): Promise<boolean> => {
  try {
    // This would typically export the data
    // For now, we'll simulate a successful export
    console.log('Exporting data:', dataType, 'in format:', format, 'with options:', options)
    return true
  } catch (error) {
    console.error('Error exporting data:', error)
    return false
  }
}

// Download export file
export const downloadExportFile = async (exportId: string): Promise<Blob | null> => {
  try {
    // This would typically download the file from storage
    // For now, we'll simulate a successful download
    console.log('Downloading export file:', exportId)
    return new Blob(['mock export data'], { type: 'text/csv' })
  } catch (error) {
    console.error('Error downloading export file:', error)
    return null
  }
}

// Get report statistics
export const getReportStatistics = async (): Promise<any> => {
  try {
    // This would typically get real statistics
    // For now, we'll return mock data
    return {
      total_reports: 1247,
      active_schedules: 8,
      storage_used: '2.4 GB',
      last_export: '2024-01-15T10:30:00Z'
    }
  } catch (error) {
    console.error('Error getting report statistics:', error)
    return {}
  }
} 
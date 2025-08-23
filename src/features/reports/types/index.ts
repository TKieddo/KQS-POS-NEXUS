// ========================================
// REPORTS & EXPORT TYPES
// ========================================

export interface ReportSchedule {
  id: string
  branch_id?: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  format: 'pdf' | 'excel' | 'csv' | 'json'
  recipients: string[]
  template_id?: string
  is_active: boolean
  last_run?: string
  next_run?: string
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  branch_id?: string
  name: string
  description: string
  category: 'sales' | 'inventory' | 'financial' | 'customers' | 'analytics'
  template_data: any
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExportSettings {
  id: string
  branch_id?: string
  default_format: 'pdf' | 'excel' | 'csv' | 'json'
  include_charts: boolean
  include_summaries: boolean
  compression_enabled: boolean
  auto_backup: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  retention_days: number
  storage_limit_gb: number
  created_at: string
  updated_at: string
}

export interface DataExport {
  id: string
  branch_id?: string
  name: string
  description: string
  tables: string[]
  filters: any
  format: 'csv' | 'excel' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string
  file_size?: number
  created_by: string
  created_at: string
  completed_at?: string
}

export interface ReportExecution {
  id: string
  schedule_id: string
  template_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string
  file_size?: number
  recipients_sent: string[]
  error_message?: string
  started_at: string
  completed_at?: string
}

// Form data types
export interface ReportScheduleFormData {
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  format: 'pdf' | 'excel' | 'csv' | 'json'
  recipients: string[]
  template_id?: string
  is_active: boolean
}

export interface ExportSettingsFormData {
  default_format: 'pdf' | 'excel' | 'csv' | 'json'
  include_charts: boolean
  include_summaries: boolean
  compression_enabled: boolean
  auto_backup: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  retention_days: number
  storage_limit_gb: number
}

export interface DataExportFormData {
  name: string
  description: string
  tables: string[]
  filters: any
  format: 'csv' | 'excel' | 'json'
}

// Constants
export const REPORT_FREQUENCIES = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly'
} as const

export const REPORT_FORMATS = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
  json: 'JSON'
} as const

export const REPORT_CATEGORIES = {
  sales: 'Sales Reports',
  inventory: 'Inventory Reports',
  financial: 'Financial Reports',
  customers: 'Customer Reports',
  analytics: 'Analytics Reports'
} as const

export const BACKUP_FREQUENCIES = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
} as const

export const EXPORT_TABLES = [
  'products',
  'categories',
  'customers',
  'sales',
  'inventory',
  'suppliers',
  'employees',
  'branches',
  'transactions',
  'refunds',
  'laybye',
  'notifications'
] as const 
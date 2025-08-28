export interface DataManagementSettings {
  id?: string
  branch_id?: string | null
  
  // Backup settings
  auto_backup_enabled: boolean
  backup_frequency: 'daily' | 'weekly' | 'monthly'
  backup_time: string // HH:MM:SS format
  backup_retention_days: number
  backup_include_files: boolean
  backup_include_media: boolean
  
  // Export settings
  default_export_format: 'csv' | 'excel' | 'pdf' | 'json'
  export_date_format: string
  export_include_headers: boolean
  export_max_rows: number
  export_compression_enabled: boolean
  
  // Cleanup settings
  auto_cleanup_enabled: boolean
  cleanup_frequency: 'weekly' | 'monthly' | 'quarterly'
  cleanup_retention_days: number
  cleanup_include_logs: boolean
  cleanup_include_temp_files: boolean
  cleanup_include_old_backups: boolean
  
  // Archive settings
  archive_enabled: boolean
  archive_frequency: 'monthly' | 'quarterly' | 'yearly'
  archive_retention_years: number
  archive_compression_enabled: boolean
  
  created_at?: string
  updated_at?: string
}

export interface BackupHistory {
  id: string
  branch_id?: string | null
  user_id?: string | null
  
  backup_type: 'manual' | 'automatic' | 'scheduled'
  backup_size?: number // in bytes
  backup_format: 'sql' | 'zip' | 'tar'
  backup_location?: string
  backup_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  backup_notes?: string
  
  started_at: string
  completed_at?: string
  
  created_at: string
}

export interface ExportHistory {
  id: string
  branch_id?: string | null
  user_id?: string | null
  
  export_type: string // sales, inventory, customers, etc.
  export_format: 'csv' | 'excel' | 'pdf' | 'json'
  export_size?: number // in bytes
  export_location?: string
  export_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  export_filters?: Record<string, string | number | boolean>
  export_notes?: string
  
  started_at: string
  completed_at?: string
  
  created_at: string
}

export interface CleanupHistory {
  id: string
  branch_id?: string | null
  user_id?: string | null
  
  cleanup_type: string // logs, temp_files, old_backups, etc.
  items_processed: number
  items_deleted: number
  space_freed?: number // in bytes
  cleanup_status: 'pending' | 'in_progress' | 'completed' | 'failed'
  cleanup_notes?: string
  
  started_at: string
  completed_at?: string
  
  created_at: string
}

export interface SystemStatus {
  database_status: 'connected' | 'disconnected' | 'error'
  storage_used: number // in bytes
  storage_total: number // in bytes
  last_backup?: string
  last_cleanup?: string
  archived_size: number // in bytes
  active_backups: number
  pending_exports: number
  pending_cleanups: number
}

export interface BackupOptions {
  include_files?: boolean
  include_media?: boolean
  compression?: boolean
  notes?: string
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json'
  date_format?: string
  include_headers?: boolean
  max_rows?: number
  compression?: boolean
  filters?: Record<string, string | number | boolean>
  notes?: string
}

export interface CleanupOptions {
  type: 'logs' | 'temp_files' | 'old_backups' | 'all'
  older_than_days?: number
  include_logs?: boolean
  include_temp_files?: boolean
  include_old_backups?: boolean
  notes?: string
}

export interface ArchiveOptions {
  frequency: 'monthly' | 'quarterly' | 'yearly'
  retention_years?: number
  compression?: boolean
  notes?: string
} 
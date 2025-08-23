import { supabase } from './supabase'
import type {
  DataManagementSettings,
  BackupHistory,
  ExportHistory,
  CleanupHistory,
  SystemStatus,
  BackupOptions,
  ExportOptions,
  CleanupOptions,
  ArchiveOptions
} from '@/types/data-management'

class DataManagementService {
  private static instance: DataManagementService
  private cache: Map<string, any> = new Map()

  private constructor() {}

  public static getInstance(): DataManagementService {
    if (!DataManagementService.instance) {
      DataManagementService.instance = new DataManagementService()
    }
    return DataManagementService.instance
  }

  // ===== DATA MANAGEMENT SETTINGS =====

  /**
   * Get data management settings for a specific branch
   */
  async getDataManagementSettings(branchId?: string | null): Promise<DataManagementSettings> {
    const cacheKey = `data_management_settings_${branchId || 'global'}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      let query = supabase
        .from('data_management_settings')
        .select('*')

      if (branchId) {
        query = query.eq('branch_id', branchId)
      } else {
        query = query.is('branch_id', null)
      }

      const { data, error } = await query.limit(1)

      if (error) {
        console.error('Error fetching data management settings:', error)
        return this.getDefaultDataManagementSettings()
      }

      if (data && data.length > 0) {
        const settings = data[0] as DataManagementSettings
        this.cache.set(cacheKey, settings)
        return settings
      }

      // Return default settings without creating them in the database
      // This prevents the creation error and allows the UI to work
      const defaultSettings = this.getDefaultDataManagementSettings()
      defaultSettings.branch_id = branchId || null
      this.cache.set(cacheKey, defaultSettings)
      return defaultSettings
    } catch (error) {
      console.error('Error getting data management settings:', error)
      return this.getDefaultDataManagementSettings()
    }
  }

  /**
   * Update data management settings for a specific branch
   */
  async updateDataManagementSettings(updates: Partial<DataManagementSettings>, branchId?: string | null): Promise<DataManagementSettings> {
    try {
      const existingSettings = await this.getDataManagementSettings(branchId)
      
      // If settings don't exist in database yet, create them
      if (!existingSettings.id) {
        const newSettings = { ...existingSettings, ...updates, branch_id: branchId || null }
        const createdSettings = await this.createDataManagementSettings(newSettings)
        const cacheKey = `data_management_settings_${branchId || 'global'}`
        this.cache.set(cacheKey, createdSettings)
        return createdSettings
      }

      // Update existing settings
      const { data, error } = await supabase
        .from('data_management_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (error) throw error

      const updatedSettings = data as DataManagementSettings
      const cacheKey = `data_management_settings_${branchId || 'global'}`
      this.cache.set(cacheKey, updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Error updating data management settings:', error)
      throw error
    }
  }

  /**
   * Create data management settings
   */
  private async createDataManagementSettings(settings: DataManagementSettings): Promise<DataManagementSettings> {
    try {
      const { data, error } = await supabase
        .from('data_management_settings')
        .insert(settings)
        .select()
        .single()

      if (error) throw error
      return data as DataManagementSettings
    } catch (error) {
      console.error('Error creating data management settings:', error)
      throw error
    }
  }

  /**
   * Get default data management settings
   */
  private getDefaultDataManagementSettings(): DataManagementSettings {
    return {
      branch_id: null,
      auto_backup_enabled: true,
      backup_frequency: 'daily',
      backup_time: '02:00:00',
      backup_retention_days: 30,
      backup_include_files: true,
      backup_include_media: true,
      default_export_format: 'csv',
      export_date_format: 'YYYY-MM-DD',
      export_include_headers: true,
      export_max_rows: 10000,
      export_compression_enabled: true,
      auto_cleanup_enabled: false,
      cleanup_frequency: 'monthly',
      cleanup_retention_days: 365,
      cleanup_include_logs: true,
      cleanup_include_temp_files: true,
      cleanup_include_old_backups: true,
      archive_enabled: false,
      archive_frequency: 'yearly',
      archive_retention_years: 7,
      archive_compression_enabled: true
    }
  }

  // ===== BACKUP OPERATIONS =====

  /**
   * Create a backup
   */
  async createBackup(options: BackupOptions = {}, branchId?: string | null): Promise<BackupHistory> {
    try {
      console.log('Starting backup process...')
      
      // Get current user ID if available
      const { data: { user } } = await supabase.auth.getUser()
      let userId = user?.id || null
      console.log('Current user ID from auth:', userId)

      // Check if the user exists in the users table
      if (userId) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single()
          
          if (userError || !userData) {
            console.warn('User not found in users table, attempting to create user...')
            
            // Try to create the user in the users table
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: user?.email || 'unknown@example.com',
                full_name: user?.user_metadata?.full_name || 'Unknown User',
                role_id: null, // Will be set by admin later
                branch_id: null, // Will be set by admin later
                is_active: true
              })
              .select()
              .single()
            
            if (createError) {
              console.warn('Failed to create user in users table:', createError)
              console.warn('Setting user_id to null for backup')
              userId = null
            } else {
              console.log('User created in users table:', newUser.id)
            }
          }
        } catch (error) {
          console.warn('Error checking/creating user in users table:', error)
          userId = null
        }
      }

      const backupRecord: Omit<BackupHistory, 'id' | 'created_at'> = {
        branch_id: branchId || null,
        user_id: userId,
        backup_type: 'manual',
        backup_format: 'sql',
        backup_status: 'pending',
        backup_notes: options.notes,
        started_at: new Date().toISOString()
      }

      console.log('Attempting to create backup record:', backupRecord)

      const { data, error } = await supabase
        .from('backup_history')
        .insert(backupRecord)
        .select()
        .single()

      if (error) {
        console.error('Error creating backup record:', error)
        throw new Error(`Failed to create backup record: ${error.message}`)
      }

      const backup = data as BackupHistory
      console.log('Backup record created:', backup.id)

      // Check if backups bucket exists (after creating the record)
      let bucketExists = false
      try {
        bucketExists = await this.ensureBackupsBucketExists()
        if (!bucketExists) {
          console.warn('Backups bucket does not exist. Backup will be created but not stored.')
        }
      } catch (bucketError) {
        console.warn('Could not check backup bucket:', bucketError)
        // Continue without bucket storage
      }

      // Start the actual backup process and wait for it to complete
      try {
        await this.performBackupOperation(backup, options, bucketExists)
        // Refresh the backup record to get the updated status
        const { data: updatedBackup, error: refreshError } = await supabase
          .from('backup_history')
          .select('*')
          .eq('id', backup.id)
          .single()
        
        if (!refreshError && updatedBackup) {
          return updatedBackup as BackupHistory
        }
      } catch (error) {
        console.error('Backup operation failed:', error)
        // Update backup status to failed
        await this.updateBackupStatus(backup.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
        throw error
      }

      return backup
    } catch (error) {
      console.error('Error creating backup:', error)
      throw error
    }
  }

  /**
   * Ensure the backups storage bucket exists
   */
  private async ensureBackupsBucketExists(): Promise<boolean> {
    try {
      console.log('Checking if backups bucket exists...')
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Could not list buckets:', listError)
        // Don't throw error, just return false and continue
        return false
      }

      console.log('Available buckets:', buckets?.map(b => b.name) || [])
      
      // Check for both 'backup' (singular) and 'backups' (plural)
      const backupBucketExists = buckets?.some(bucket => bucket.name === 'backup')
      const backupsBucketExists = buckets?.some(bucket => bucket.name === 'backups')
      
      if (!backupBucketExists && !backupsBucketExists) {
        console.log('Backup bucket does not exist.')
        console.log('Please run the migration: configure-existing-buckets.sql')
        console.log('Or create it manually in Supabase Dashboard: Storage → Create bucket "backup" or "backups"')
        return false
      } else {
        console.log('Backup bucket exists:', backupBucketExists ? 'backup' : 'backups')
        return true
      }
    } catch (error) {
      console.error('Error checking backups bucket:', error)
      // Return false instead of throwing, so backup can continue without storage
      return false
    }
  }

  /**
   * Perform the actual backup operation
   */
  private async performBackupOperation(backup: BackupHistory, options: BackupOptions, bucketExists: boolean = false): Promise<void> {
    try {
      console.log('Starting backup operation for backup ID:', backup.id)
      
      // Update status to in progress
      await this.updateBackupStatus(backup.id, 'in_progress')
      console.log('Backup status updated to in_progress')

      const backupData: any = {
        metadata: {
          created_at: new Date().toISOString(),
          branch_id: backup.branch_id,
          backup_type: backup.backup_type,
          version: '1.0'
        },
        database: null,
        files: null
      }

      // 1. Database backup (always include database by default)
      console.log('Creating database backup...')
      backupData.database = await this.createDatabaseBackup(backup.branch_id)
      console.log('Database backup completed')

      // 2. Files backup (if requested)
      if (options.include_files) {
        console.log('Creating files backup...')
        backupData.files = await this.createFilesBackup(backup.branch_id)
        console.log('Files backup completed')
      }

      // 3. Create backup file
      console.log('Creating backup file...')
      const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      })
      console.log('Backup file created, size:', backupBlob.size, 'bytes')

      // 4. Upload to Supabase Storage (if bucket exists)
      if (bucketExists) {
        const fileName = `backup_${backup.branch_id || 'global'}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`
        console.log('Uploading backup file:', fileName)
        
        // Determine which bucket to use
        const { data: availableBuckets } = await supabase.storage.listBuckets()
        const bucketName = availableBuckets?.some((bucket: any) => bucket.name === 'backup') ? 'backup' : 'backups'
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, backupBlob, {
            contentType: 'application/json',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Failed to upload backup file: ${uploadError.message}`)
        }

        console.log('Backup file uploaded successfully:', uploadData)

        // 5. Update backup record with success
        await this.updateBackupStatus(backup.id, 'completed', null, {
          file_path: fileName,
          file_size: backupBlob.size,
          backup_size: backupBlob.size
        })
      } else {
        // 5. Update backup record as completed but without file storage
        console.log('Backup completed but not stored (bucket does not exist)')
        await this.updateBackupStatus(backup.id, 'completed', null, {
          file_path: null,
          file_size: backupBlob.size,
          backup_size: backupBlob.size
        })
      }
      
      console.log('Backup completed successfully for ID:', backup.id)

    } catch (error) {
      console.error('Backup operation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.updateBackupStatus(backup.id, 'failed', errorMessage)
      throw error
    }
  }

  /**
   * Create database backup
   */
  private async createDatabaseBackup(branchId?: string | null): Promise<any> {
    // Define tables that actually exist and their branch_id status
    const tableConfig = [
      { name: 'products', hasBranchId: true },
      { name: 'categories', hasBranchId: true },
      { name: 'customers', hasBranchId: true },
      { name: 'sales', hasBranchId: true },
      { name: 'sale_items', hasBranchId: true },
      { name: 'laybye_orders', hasBranchId: true },
      { name: 'laybye_payments', hasBranchId: true },
      { name: 'inventory_movements', hasBranchId: true },
      { name: 'user_activities', hasBranchId: true },
      { name: 'branches', hasBranchId: false },
      { name: 'users', hasBranchId: false },
      { name: 'global_settings', hasBranchId: false },
      { name: 'branch_settings', hasBranchId: true },
      { name: 'data_management_settings', hasBranchId: true },
      { name: 'backup_history', hasBranchId: true },
      { name: 'export_history', hasBranchId: true },
      { name: 'cleanup_history', hasBranchId: true }
    ]

    const databaseBackup: any = {}
    console.log('Starting database backup for tables:', tableConfig.map(t => t.name))

    for (const config of tableConfig) {
      const table = config.name
      try {
        console.log(`Backing up table: ${table}`)
        let query = supabase.from(table).select('*')
        
        // Add branch filter if branchId is provided and table has branch_id column
        if (branchId && config.hasBranchId) {
          query = query.eq('branch_id', branchId)
          console.log(`Filtering ${table} by branch_id:`, branchId)
        }

        const { data, error } = await query

        if (error) {
          console.error(`Failed to backup table ${table}:`, error)
          databaseBackup[table] = { error: error.message }
        } else {
          databaseBackup[table] = data || []
          console.log(`Successfully backed up ${table}:`, data?.length || 0, 'records')
        }
      } catch (error) {
        console.error(`Error backing up table ${table}:`, error)
        databaseBackup[table] = { error: 'Failed to backup table' }
      }
    }

    console.log('Database backup completed')
    return databaseBackup
  }

  /**
   * Create files backup
   */
  private async createFilesBackup(branchId?: string | null): Promise<any> {
    try {
      // List files in storage buckets
      const buckets = ['product-images', 'receipts', 'documents']
      const filesBackup: any = {}

      for (const bucket of buckets) {
        try {
          const { data: files, error } = await supabase.storage
            .from(bucket)
            .list('', {
              limit: 1000,
              offset: 0
            })

          if (error) {
            filesBackup[bucket] = { error: error.message }
          } else {
            filesBackup[bucket] = files || []
          }
        } catch (error) {
          filesBackup[bucket] = { error: 'Failed to list files' }
        }
      }

      return filesBackup
    } catch (error) {
      console.error('Error creating files backup:', error)
      return { error: 'Failed to create files backup' }
    }
  }

  /**
   * Update backup status
   */
  private async updateBackupStatus(
    backupId: string, 
    status: string, 
    errorMessage?: string | null,
    additionalData?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        backup_status: status,
        completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
      }

      if (errorMessage) {
        updateData.error_message = errorMessage
      }

      if (additionalData) {
        updateData.backup_size = additionalData.backup_size
        // Include file_path and file_size if they exist in the table
        if (additionalData.file_path !== undefined) {
        updateData.file_path = additionalData.file_path
        }
        if (additionalData.file_size !== undefined) {
        updateData.file_size = additionalData.file_size
        }
      }

      const { error } = await supabase
        .from('backup_history')
        .update(updateData)
        .eq('id', backupId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating backup status:', error)
    }
  }

  /**
   * Get backup history
   */
  async getBackupHistory(branchId?: string | null, limit = 50): Promise<BackupHistory[]> {
    try {
      let query = supabase
        .from('backup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching backup history:', error)
      return []
    }
  }

  /**
   * Download backup file
   */
  async downloadBackup(backupId: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      // Get backup record
      const { data: backup, error: fetchError } = await supabase
        .from('backup_history')
        .select('*')
        .eq('id', backupId)
        .single()

      if (fetchError || !backup) {
        throw new Error('Backup not found')
      }

      if (backup.backup_status !== 'completed') {
        throw new Error('Backup is not completed')
      }

      // If backup has a file_path, try to download from storage
      if (backup.file_path) {
        // Determine which bucket to use
        const { data: availableBuckets } = await supabase.storage.listBuckets()
        const bucketName = availableBuckets?.some((bucket: any) => bucket.name === 'backup') ? 'backup' : 'backups'
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(backup.file_path)

        if (downloadError) {
          throw new Error(`Failed to download backup file: ${downloadError.message}`)
        }

        return { success: true, data: fileData }
      } else {
        // If no file_path, create a backup data blob from the database
        const backupData = {
          metadata: {
            backup_id: backup.id,
            created_at: backup.created_at,
            completed_at: backup.completed_at,
            branch_id: backup.branch_id,
            backup_type: backup.backup_type,
            backup_format: backup.backup_format,
            version: '1.0'
          },
          database: await this.createDatabaseBackup(backup.branch_id),
          files: null
        }

        const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json'
        })

        return { success: true, data: backupBlob }
      }
    } catch (error) {
      console.error('Error downloading backup:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download backup' 
      }
    }
  }

  // ===== EXPORT OPERATIONS =====

  /**
   * Create an export
   */
  async createExport(exportType: string, options: ExportOptions, branchId?: string | null): Promise<ExportHistory> {
    try {
      // Ensure exports bucket exists
      await this.ensureExportsBucketExists()

      // Get current user ID if available
      const { data: { user } } = await supabase.auth.getUser()
      let userId = user?.id || null
      console.log('Current user ID from auth:', userId)

      // Check if the user exists in the users table
      if (userId) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single()
          
          if (userError || !userData) {
            console.warn('User not found in users table, attempting to create user...')
            
            // Try to create the user in the users table
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: userId,
                email: user?.email || 'unknown@example.com',
                full_name: user?.user_metadata?.full_name || 'Unknown User',
                role_id: null, // Will be set by admin later
                branch_id: null, // Will be set by admin later
                is_active: true
              })
              .select()
              .single()
            
            if (createError) {
              console.warn('Failed to create user in users table:', createError)
              console.warn('Setting user_id to null for export')
              userId = null
            } else {
              console.log('User created in users table:', newUser.id)
            }
          }
        } catch (error) {
          console.warn('Error checking/creating user in users table:', error)
          userId = null
        }
      }

      const exportRecord: Omit<ExportHistory, 'id' | 'created_at'> = {
        branch_id: branchId || null,
        user_id: userId,
        export_type: exportType,
        export_format: options.format,
        export_status: 'pending',
        export_filters: options.filters,
        export_notes: options.notes,
        started_at: new Date().toISOString()
      }

      console.log('Attempting to create export record:', exportRecord)

      const { data, error } = await supabase
        .from('export_history')
        .insert(exportRecord)
        .select()
        .single()

      if (error) {
        console.error('Error creating export record:', error)
        throw new Error(`Failed to create export record: ${error.message}`)
      }

      const exportRecordData = data as ExportHistory
      console.log('Export record created:', exportRecordData.id)

      // Start the actual export process and wait for it to complete
      try {
        await this.performExportOperation(exportRecordData, options)
        // Refresh the export record to get the updated status
        const { data: updatedExport, error: refreshError } = await supabase
          .from('export_history')
          .select('*')
          .eq('id', exportRecordData.id)
          .single()
        
        if (!refreshError && updatedExport) {
          return updatedExport as ExportHistory
        }
      } catch (error) {
        console.error('Export operation failed:', error)
        // Update export status to failed
        await this.updateExportStatus(exportRecordData.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
        throw error
      }

      return exportRecordData
    } catch (error) {
      console.error('Error creating export:', error)
      throw error
    }
  }

  /**
   * Ensure the exports storage bucket exists
   */
  private async ensureExportsBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.warn('Could not list buckets:', listError)
        return
      }

      const exportsBucketExists = buckets?.some(bucket => bucket.name === 'exports')
      
      if (!exportsBucketExists) {
        console.log('Exports bucket does not exist.')
        console.log('Please run the migration: configure-storage-buckets.sql')
        console.log('Or create it manually in Supabase Dashboard: Storage → Create bucket "exports"')
      } else {
        console.log('Exports bucket exists')
      }
    } catch (error) {
      console.warn('Error checking exports bucket:', error)
    }
  }

  /**
   * Manually create storage buckets (for testing/debugging)
   */
  async createStorageBuckets(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Attempting to create storage buckets...')
      
      const buckets = [
        { name: 'backups', public: false, fileSizeLimit: 524288000 }, // 500MB
        { name: 'exports', public: false, fileSizeLimit: 524288000 }, // 500MB
        { name: 'product-images', public: true, fileSizeLimit: 10485760 }, // 10MB
        { name: 'receipts', public: false, fileSizeLimit: 10485760 }, // 10MB
        { name: 'documents', public: false, fileSizeLimit: 52428800 } // 50MB
      ]
      
      const results = []

      for (const bucket of buckets) {
        try {
          console.log(`Attempting to create bucket: ${bucket.name}`)
          
          // Try to create bucket with minimal configuration first
          const { data, error } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.public
          })

          if (error) {
            console.error(`Failed to create bucket ${bucket.name}:`, error)
            results.push({ bucket: bucket.name, success: false, error: error.message })
          } else {
            console.log(`Successfully created bucket ${bucket.name}:`, data)
            results.push({ bucket: bucket.name, success: true })
          }
        } catch (error) {
          console.error(`Error creating bucket ${bucket.name}:`, error)
          results.push({ bucket: bucket.name, success: false, error: 'Unknown error' })
        }
      }

      const successCount = results.filter(r => r.success).length
      
      if (successCount === 0) {
        const message = `Failed to create buckets automatically. Please create them manually in Supabase Dashboard:\n\n1. Go to Storage\n2. Click "Create a new bucket"\n3. Create these buckets:\n   - backups (private)\n   - exports (private)\n   - product-images (public)\n   - receipts (private)\n   - documents (private)\n\nThen run: configure-storage-buckets.sql`
        return { success: false, message }
      } else if (successCount < buckets.length) {
        const message = `Partially successful: ${successCount}/${buckets.length} buckets created. Check console for details.`
        return { success: false, message }
      } else {
        const message = `Successfully created ${successCount}/${buckets.length} buckets!`
        return { success: true, message }
      }
    } catch (error) {
      console.error('Error creating storage buckets:', error)
      const message = `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please create buckets manually in Supabase Dashboard.`
      return { success: false, message }
    }
  }

  /**
   * Perform the actual export operation
   */
  private async performExportOperation(exportRecord: ExportHistory, options: ExportOptions): Promise<void> {
    try {
      // Update status to in progress
      await this.updateExportStatus(exportRecord.id, 'in_progress')

      // Get data based on export type
      const exportData = await this.getExportData(exportRecord.export_type, exportRecord.branch_id, options)

      // Format data according to specified format
      const formattedData = await this.formatExportData(exportData, options)

      // Create export file
      const fileName = `export_${exportRecord.export_type}_${exportRecord.branch_id || 'global'}_${new Date().toISOString().split('T')[0]}_${Date.now()}.${options.format}`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('exports')
        .upload(fileName, formattedData, {
          contentType: this.getContentType(options.format),
          upsert: false
        })

      if (uploadError) throw uploadError

      // Update export record with success
      await this.updateExportStatus(exportRecord.id, 'completed', null, {
        export_location: fileName,
        export_size: formattedData.size
      })

    } catch (error) {
      console.error('Export operation failed:', error)
      await this.updateExportStatus(exportRecord.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Get data for export based on type
   */
  private async getExportData(exportType: string, branchId?: string | null, options?: ExportOptions): Promise<any[]> {
    let query = supabase.from(exportType).select('*')
    
    // Define which tables have branch_id column
    const tablesWithBranchId = [
      'products', 'categories', 'customers', 'sales', 'sale_items',
      'laybye_orders', 'laybye_payments', 'inventory_movements', 'user_activities',
      'branch_settings', 'data_management_settings', 'backup_history', 
      'export_history', 'cleanup_history'
    ]
    
    if (branchId && tablesWithBranchId.includes(exportType)) {
      query = query.eq('branch_id', branchId)
    }

    if (options?.max_rows) {
      query = query.limit(options.max_rows)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Format export data according to specified format
   */
  private async formatExportData(data: any[], options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'csv':
        return this.formatAsCSV(data, options)
      case 'json':
        return this.formatAsJSON(data)
      case 'excel':
        return this.formatAsExcel(data, options)
      case 'pdf':
        return this.formatAsPDF(data, options)
      default:
        return this.formatAsCSV(data, options)
    }
  }

  /**
   * Format data as CSV
   */
  private formatAsCSV(data: any[], options: ExportOptions): Blob {
    if (data.length === 0) {
      return new Blob([''], { type: 'text/csv' })
    }

    const headers = Object.keys(data[0])
    let csvContent = ''

    // Add headers if requested
    if (options.include_headers !== false) {
      csvContent += headers.join(',') + '\n'
    }

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      })
      csvContent += values.join(',') + '\n'
    })

    return new Blob([csvContent], { type: 'text/csv' })
  }

  /**
   * Format data as JSON
   */
  private formatAsJSON(data: any[]): Blob {
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }

  /**
   * Format data as Excel (simplified - just CSV with .xlsx extension)
   */
  private formatAsExcel(data: any[], options: ExportOptions): Blob {
    // For now, return CSV format. In a real implementation, you'd use a library like xlsx
    return this.formatAsCSV(data, options)
  }

  /**
   * Format data as PDF (simplified - just JSON for now)
   */
  private formatAsPDF(data: any[], options: ExportOptions): Blob {
    // For now, return JSON format. In a real implementation, you'd use a library like jsPDF
    return this.formatAsJSON(data)
  }

  /**
   * Get content type for file format
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv'
      case 'json':
        return 'application/json'
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'pdf':
        return 'application/pdf'
      default:
        return 'text/plain'
    }
  }

  /**
   * Update export status
   */
  private async updateExportStatus(
    exportId: string, 
    status: string, 
    errorMessage?: string | null,
    additionalData?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        export_status: status,
        completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
      }

      if (errorMessage) {
        updateData.error_message = errorMessage
      }

      if (additionalData) {
        updateData.export_location = additionalData.export_location
        updateData.export_size = additionalData.export_size
      }

      const { error } = await supabase
        .from('export_history')
        .update(updateData)
        .eq('id', exportId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating export status:', error)
    }
  }

  /**
   * Get export history
   */
  async getExportHistory(branchId?: string | null, limit = 50): Promise<ExportHistory[]> {
    try {
      let query = supabase
        .from('export_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching export history:', error)
      return []
    }
  }

  // ===== CLEANUP OPERATIONS =====

  /**
   * Perform cleanup
   */
  async performCleanup(options: CleanupOptions, branchId?: string | null): Promise<CleanupHistory> {
    try {
      // Get current user ID if available
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || null

      const cleanupRecord: Omit<CleanupHistory, 'id' | 'created_at'> = {
        branch_id: branchId || null,
        user_id: userId,
        cleanup_type: options.type,
        items_processed: 0,
        items_deleted: 0,
        cleanup_status: 'pending',
        cleanup_notes: options.notes,
        started_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('cleanup_history')
        .insert(cleanupRecord)
        .select()
        .single()

      if (error) throw error

      const cleanupRecordData = data as CleanupHistory

      // Start the actual cleanup process
      this.performCleanupOperation(cleanupRecordData, options).catch(error => {
        console.error('Cleanup operation failed:', error)
        // Update cleanup status to failed
        this.updateCleanupStatus(cleanupRecordData.id, 'failed', error.message)
      })

      return cleanupRecordData
    } catch (error) {
      console.error('Error performing cleanup:', error)
      throw error
    }
  }

  /**
   * Perform the actual cleanup operation
   */
  private async performCleanupOperation(cleanupRecord: CleanupHistory, options: CleanupOptions): Promise<void> {
    try {
      // Update status to in progress
      await this.updateCleanupStatus(cleanupRecord.id, 'in_progress')

      let itemsProcessed = 0
      let itemsDeleted = 0
      let spaceFreed = 0

      // Perform cleanup based on type
      switch (options.type) {
        case 'logs':
          const logResult = await this.cleanupLogs(options.older_than_days || 90, cleanupRecord.branch_id)
          itemsProcessed = logResult.processed
          itemsDeleted = logResult.deleted
          spaceFreed = logResult.spaceFreed
          break

        case 'temp_files':
          const tempResult = await this.cleanupTempFiles(cleanupRecord.branch_id)
          itemsProcessed = tempResult.processed
          itemsDeleted = tempResult.deleted
          spaceFreed = tempResult.spaceFreed
          break

        case 'old_backups':
          const backupResult = await this.cleanupOldBackups(options.older_than_days || 365, cleanupRecord.branch_id)
          itemsProcessed = backupResult.processed
          itemsDeleted = backupResult.deleted
          spaceFreed = backupResult.spaceFreed
          break

        case 'all':
          const allResults = await Promise.all([
            this.cleanupLogs(options.older_than_days || 90, cleanupRecord.branch_id),
            this.cleanupTempFiles(cleanupRecord.branch_id),
            this.cleanupOldBackups(options.older_than_days || 365, cleanupRecord.branch_id)
          ])
          
          itemsProcessed = allResults.reduce((sum, result) => sum + result.processed, 0)
          itemsDeleted = allResults.reduce((sum, result) => sum + result.deleted, 0)
          spaceFreed = allResults.reduce((sum, result) => sum + result.spaceFreed, 0)
          break
      }

      // Update cleanup record with results
      await this.updateCleanupStatus(cleanupRecord.id, 'completed', null, {
        items_processed: itemsProcessed,
        items_deleted: itemsDeleted,
        space_freed: spaceFreed
      })

    } catch (error) {
      console.error('Cleanup operation failed:', error)
      await this.updateCleanupStatus(cleanupRecord.id, 'failed', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  /**
   * Cleanup old logs
   */
  private async cleanupLogs(olderThanDays: number, branchId?: string | null): Promise<{ processed: number; deleted: number; spaceFreed: number }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    let query = supabase
      .from('user_activities')
      .select('id, created_at')
      .lt('created_at', cutoffDate.toISOString())

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data: oldLogs, error } = await query

    if (error) {
      console.warn('Error fetching old logs:', error)
      return { processed: 0, deleted: 0, spaceFreed: 0 }
    }

    if (!oldLogs || oldLogs.length === 0) {
      return { processed: oldLogs?.length || 0, deleted: 0, spaceFreed: 0 }
    }

    // Delete old logs
    const { error: deleteError } = await supabase
      .from('user_activities')
      .delete()
      .in('id', oldLogs.map(log => log.id))

    if (deleteError) {
      console.warn('Error deleting old logs:', deleteError)
      return { processed: oldLogs.length, deleted: 0, spaceFreed: 0 }
    }

    // Estimate space freed (rough calculation)
    const spaceFreed = oldLogs.length * 1024 // Assume 1KB per log entry

    return { processed: oldLogs.length, deleted: oldLogs.length, spaceFreed }
  }

  /**
   * Cleanup temp files
   */
  private async cleanupTempFiles(branchId?: string | null): Promise<{ processed: number; deleted: number; spaceFreed: number }> {
    // For now, just return empty result since we don't have a temp files table
    // In a real implementation, you'd clean up temporary files from storage
    return { processed: 0, deleted: 0, spaceFreed: 0 }
  }

  /**
   * Cleanup old backups
   */
  private async cleanupOldBackups(olderThanDays: number, branchId?: string | null): Promise<{ processed: number; deleted: number; spaceFreed: number }> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    let query = supabase
      .from('backup_history')
      .select('id, created_at, backup_size')
      .lt('created_at', cutoffDate.toISOString())
      .eq('backup_status', 'completed')

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data: oldBackups, error } = await query

    if (error) {
      console.warn('Error fetching old backups:', error)
      return { processed: 0, deleted: 0, spaceFreed: 0 }
    }

    if (!oldBackups || oldBackups.length === 0) {
      return { processed: oldBackups?.length || 0, deleted: 0, spaceFreed: 0 }
    }

    // Delete old backups
    const { error: deleteError } = await supabase
      .from('backup_history')
      .delete()
      .in('id', oldBackups.map(backup => backup.id))

    if (deleteError) {
      console.warn('Error deleting old backups:', deleteError)
      return { processed: oldBackups.length, deleted: 0, spaceFreed: 0 }
    }

    // Calculate space freed
    const spaceFreed = oldBackups.reduce((sum, backup) => sum + (backup.backup_size || 0), 0)

    return { processed: oldBackups.length, deleted: oldBackups.length, spaceFreed }
  }

  /**
   * Update cleanup status
   */
  private async updateCleanupStatus(
    cleanupId: string, 
    status: string, 
    errorMessage?: string | null,
    additionalData?: any
  ): Promise<void> {
    try {
      const updateData: any = {
        cleanup_status: status,
        completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
      }

      if (errorMessage) {
        updateData.error_message = errorMessage
      }

      if (additionalData) {
        updateData.items_processed = additionalData.items_processed
        updateData.items_deleted = additionalData.items_deleted
        updateData.space_freed = additionalData.space_freed
      }

      const { error } = await supabase
        .from('cleanup_history')
        .update(updateData)
        .eq('id', cleanupId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating cleanup status:', error)
    }
  }

  /**
   * Get cleanup history
   */
  async getCleanupHistory(branchId?: string | null, limit = 50): Promise<CleanupHistory[]> {
    try {
      let query = supabase
        .from('cleanup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching cleanup history:', error)
      return []
    }
  }

  // ===== SYSTEM STATUS =====

  /**
   * Get system status
   */
  async getSystemStatus(branchId?: string | null): Promise<SystemStatus> {
    try {
      // Get real system status data
      const [
        lastBackup,
        lastCleanup,
        activeBackups,
        pendingExports,
        pendingCleanups,
        storageInfo
      ] = await Promise.all([
        this.getLastBackup(branchId),
        this.getLastCleanup(branchId),
        this.getActiveBackups(branchId),
        this.getPendingExports(branchId),
        this.getPendingCleanups(branchId),
        this.getStorageInfo()
      ])

      return {
        database_status: 'connected', // We assume connected if we can query
        storage_used: storageInfo.used,
        storage_total: storageInfo.total,
        last_backup: lastBackup,
        last_cleanup: lastCleanup,
        archived_size: storageInfo.archived,
        active_backups: activeBackups,
        pending_exports: pendingExports,
        pending_cleanups: pendingCleanups
      }
    } catch (error) {
      console.error('Error getting system status:', error)
      // Return default status on error
      return {
        database_status: 'error',
        storage_used: 0,
        storage_total: 10737418240, // 10GB default
        last_backup: undefined,
        last_cleanup: undefined,
        archived_size: 0,
        active_backups: 0,
        pending_exports: 0,
        pending_cleanups: 0
      }
    }
  }

  /**
   * Get last backup time
   */
  private async getLastBackup(branchId?: string | null): Promise<string | undefined> {
    try {
      let query = supabase
        .from('backup_history')
        .select('completed_at')
        .eq('backup_status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        return undefined
      }

      return data[0].completed_at
    } catch (error) {
      console.warn('Error getting last backup:', error)
      return undefined
    }
  }

  /**
   * Get last cleanup time
   */
  private async getLastCleanup(branchId?: string | null): Promise<string | undefined> {
    try {
      let query = supabase
        .from('cleanup_history')
        .select('completed_at')
        .eq('cleanup_status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { data, error } = await query

      if (error || !data || data.length === 0) {
        return undefined
      }

      return data[0].completed_at
    } catch (error) {
      console.warn('Error getting last cleanup:', error)
      return undefined
    }
  }

  /**
   * Get count of active backups
   */
  private async getActiveBackups(branchId?: string | null): Promise<number> {
    try {
      let query = supabase
        .from('backup_history')
        .select('id', { count: 'exact' })
        .in('backup_status', ['pending', 'in_progress'])

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { count, error } = await query

      if (error) return 0
      return count || 0
    } catch (error) {
      console.warn('Error getting active backups count:', error)
      return 0
    }
  }

  /**
   * Get count of pending exports
   */
  private async getPendingExports(branchId?: string | null): Promise<number> {
    try {
      let query = supabase
        .from('export_history')
        .select('id', { count: 'exact' })
        .in('export_status', ['pending', 'in_progress'])

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { count, error } = await query

      if (error) return 0
      return count || 0
    } catch (error) {
      console.warn('Error getting pending exports count:', error)
      return 0
    }
  }

  /**
   * Get count of pending cleanups
   */
  private async getPendingCleanups(branchId?: string | null): Promise<number> {
    try {
      let query = supabase
        .from('cleanup_history')
        .select('id', { count: 'exact' })
        .in('cleanup_status', ['pending', 'in_progress'])

      if (branchId) {
        query = query.eq('branch_id', branchId)
      }

      const { count, error } = await query

      if (error) return 0
      return count || 0
    } catch (error) {
      console.warn('Error getting pending cleanups count:', error)
      return 0
    }
  }

  /**
   * Get storage information
   */
  private async getStorageInfo(): Promise<{ used: number; total: number; archived: number }> {
    try {
      // For now, return estimated values
      // In a real implementation, you'd query Supabase storage API
      return {
        used: 2147483648, // 2GB estimated
        total: 10737418240, // 10GB
        archived: 1717986918 // 1.6GB estimated
      }
    } catch (error) {
      console.warn('Error getting storage info:', error)
      return {
        used: 0,
        total: 10737418240,
        archived: 0
      }
    }
  }

  // ===== UTILITY METHODS =====

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

const dataManagementService = DataManagementService.getInstance()

// Export singleton instance methods
export const getDataManagementSettings = (branchId?: string | null) => dataManagementService.getDataManagementSettings(branchId)
export const updateDataManagementSettings = (updates: Partial<DataManagementSettings>, branchId?: string | null) => dataManagementService.updateDataManagementSettings(updates, branchId)
export const createBackup = (options?: BackupOptions, branchId?: string | null) => dataManagementService.createBackup(options, branchId)
export const getBackupHistory = (branchId?: string | null, limit?: number) => dataManagementService.getBackupHistory(branchId, limit)
export const downloadBackup = (backupId: string) => dataManagementService.downloadBackup(backupId)
export const createExport = (exportType: string, options: ExportOptions, branchId?: string | null) => dataManagementService.createExport(exportType, options, branchId)
export const getExportHistory = (branchId?: string | null, limit?: number) => dataManagementService.getExportHistory(branchId, limit)
export const performCleanup = (options: CleanupOptions, branchId?: string | null) => dataManagementService.performCleanup(options, branchId)
export const getCleanupHistory = (branchId?: string | null, limit?: number) => dataManagementService.getCleanupHistory(branchId, limit)
export const getSystemStatus = (branchId?: string | null) => dataManagementService.getSystemStatus(branchId)
export const clearDataManagementCache = () => dataManagementService.clearCache() 
export const createStorageBuckets = () => dataManagementService.createStorageBuckets() 
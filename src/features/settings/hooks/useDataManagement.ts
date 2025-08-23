'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { 
  getDataManagementSettings,
  updateDataManagementSettings,
  createBackup,
  getBackupHistory,
  downloadBackup,
  createExport,
  getExportHistory,
  performCleanup,
  getCleanupHistory,
  getSystemStatus
} from '@/lib/data-management-service'
import type {
  DataManagementSettings,
  BackupHistory,
  ExportHistory,
  CleanupHistory,
  SystemStatus,
  BackupOptions,
  ExportOptions,
  CleanupOptions
} from '@/types/data-management'

interface UseDataManagementReturn {
  // Settings
  settings: DataManagementSettings | null
  isLoadingSettings: boolean
  updateSettings: (updates: Partial<DataManagementSettings>) => Promise<{ success: boolean; settings?: DataManagementSettings; error?: string }>
  
  // Backup operations
  backupHistory: BackupHistory[]
  isLoadingBackupHistory: boolean
  createBackupOperation: (options?: BackupOptions) => Promise<{ success: boolean; backup?: BackupHistory; error?: string }>
  downloadBackupOperation: (backupId: string) => Promise<{ success: boolean; data?: Blob; error?: string }>
  
  // Export operations
  exportHistory: ExportHistory[]
  isLoadingExportHistory: boolean
  createExportOperation: (exportType: string, options: ExportOptions) => Promise<{ success: boolean; export?: ExportHistory; error?: string }>
  
  // Cleanup operations
  cleanupHistory: CleanupHistory[]
  isLoadingCleanupHistory: boolean
  performCleanupOperation: (options: CleanupOptions) => Promise<{ success: boolean; cleanup?: CleanupHistory; error?: string }>
  
  // System status
  systemStatus: SystemStatus | null
  isLoadingSystemStatus: boolean
  
  // Utilities
  error: string | null
  clearError: () => void
  refreshData: () => Promise<void>
}

export const useDataManagement = (): UseDataManagementReturn => {
  const { selectedBranch } = useBranch()
  
  const [settings, setSettings] = useState<DataManagementSettings | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([])
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [cleanupHistory, setCleanupHistory] = useState<CleanupHistory[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isLoadingBackupHistory, setIsLoadingBackupHistory] = useState(false)
  const [isLoadingExportHistory, setIsLoadingExportHistory] = useState(false)
  const [isLoadingCleanupHistory, setIsLoadingCleanupHistory] = useState(false)
  const [isLoadingSystemStatus, setIsLoadingSystemStatus] = useState(false)
  
  const [error, setError] = useState<string | null>(null)

  // Load settings
  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true)
    setError(null)
    
    try {
      const settingsData = await getDataManagementSettings(selectedBranch?.id)
      setSettings(settingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data management settings')
    } finally {
      setIsLoadingSettings(false)
    }
  }, [selectedBranch?.id])

  // Load backup history
  const loadBackupHistory = useCallback(async () => {
    setIsLoadingBackupHistory(true)
    setError(null)
    
    try {
      const history = await getBackupHistory(selectedBranch?.id, 50)
      setBackupHistory(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load backup history')
    } finally {
      setIsLoadingBackupHistory(false)
    }
  }, [selectedBranch?.id])

  // Load export history
  const loadExportHistory = useCallback(async () => {
    setIsLoadingExportHistory(true)
    setError(null)
    
    try {
      const history = await getExportHistory(selectedBranch?.id, 50)
      setExportHistory(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load export history')
    } finally {
      setIsLoadingExportHistory(false)
    }
  }, [selectedBranch?.id])

  // Load cleanup history
  const loadCleanupHistory = useCallback(async () => {
    setIsLoadingCleanupHistory(true)
    setError(null)
    
    try {
      const history = await getCleanupHistory(selectedBranch?.id, 50)
      setCleanupHistory(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cleanup history')
    } finally {
      setIsLoadingCleanupHistory(false)
    }
  }, [selectedBranch?.id])

  // Load system status
  const loadSystemStatus = useCallback(async () => {
    setIsLoadingSystemStatus(true)
    setError(null)
    
    try {
      const status = await getSystemStatus(selectedBranch?.id)
      setSystemStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system status')
    } finally {
      setIsLoadingSystemStatus(false)
    }
  }, [selectedBranch?.id])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<DataManagementSettings>) => {
    setError(null)
    
    try {
      const updatedSettings = await updateDataManagementSettings(updates, selectedBranch?.id)
      setSettings(updatedSettings)
      return { success: true, settings: updatedSettings }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [selectedBranch?.id])

  // Create backup
  const createBackupOperation = useCallback(async (options?: BackupOptions) => {
    setError(null)
    
    try {
      const backup = await createBackup(options, selectedBranch?.id)
      setBackupHistory(prev => [backup, ...prev])
      return { success: true, backup }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [selectedBranch?.id])

  // Download backup
  const downloadBackupOperation = useCallback(async (backupId: string) => {
    setError(null)
    
    try {
      const result = await downloadBackup(backupId)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download backup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Create export
  const createExportOperation = useCallback(async (exportType: string, options: ExportOptions) => {
    setError(null)
    
    try {
      const exportRecord = await createExport(exportType, options, selectedBranch?.id)
      setExportHistory(prev => [exportRecord, ...prev])
      return { success: true, export: exportRecord }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create export'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [selectedBranch?.id])

  // Perform cleanup
  const performCleanupOperation = useCallback(async (options: CleanupOptions) => {
    setError(null)
    
    try {
      const cleanup = await performCleanup(options, selectedBranch?.id)
      setCleanupHistory(prev => [cleanup, ...prev])
      return { success: true, cleanup }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to perform cleanup'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [selectedBranch?.id])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadSettings(),
      loadBackupHistory(),
      loadExportHistory(),
      loadCleanupHistory(),
      loadSystemStatus()
    ])
  }, [loadSettings, loadBackupHistory, loadExportHistory, loadCleanupHistory, loadSystemStatus])

  // Load initial data
  useEffect(() => {
    loadSettings()
    loadBackupHistory()
    loadExportHistory()
    loadCleanupHistory()
    loadSystemStatus()
  }, [loadSettings, loadBackupHistory, loadExportHistory, loadCleanupHistory, loadSystemStatus])

  // Reload data when branch changes
  useEffect(() => {
    refreshData()
  }, [selectedBranch?.id, refreshData])

  return {
    // Settings
    settings,
    isLoadingSettings,
    updateSettings,
    
    // Backup operations
    backupHistory,
    isLoadingBackupHistory,
    createBackupOperation,
    downloadBackupOperation,
    
    // Export operations
    exportHistory,
    isLoadingExportHistory,
    createExportOperation,
    
    // Cleanup operations
    cleanupHistory,
    isLoadingCleanupHistory,
    performCleanupOperation,
    
    // System status
    systemStatus,
    isLoadingSystemStatus,
    
    // Utilities
    error,
    clearError,
    refreshData
  }
} 
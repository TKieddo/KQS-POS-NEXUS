'use client'

import React, { useState } from 'react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw
} from 'lucide-react'
import { DataBackupCard } from '@/features/data-management/components/DataBackupCard'
import { DataExportCard } from '@/features/data-management/components/DataExportCard'
import { DataCleanupCard } from '@/features/data-management/components/DataCleanupCard'
import { useDataManagement } from '@/features/settings/hooks/useDataManagement'
import { createStorageBuckets, createBackup } from '@/lib/data-management-service'

const DataManagementPage = () => {
  const {
    settings,
    isLoadingSettings,
    updateSettings,
    backupHistory,
    isLoadingBackupHistory,
    createBackupOperation,
    downloadBackupOperation,
    exportHistory,
    isLoadingExportHistory,
    createExportOperation,
    cleanupHistory,
    isLoadingCleanupHistory,
    performCleanupOperation,
    systemStatus,
    isLoadingSystemStatus,
    error,
    clearError,
    refreshData
  } = useDataManagement()

  const handleBackup = async () => {
    const result = await createBackupOperation()
    if (result.success) {
      console.log('Backup completed:', result.backup)
      // Refresh the backup history to show updated status
      await refreshData()
    } else {
      console.error('Backup failed:', result.error)
    }
  }

  const handleRestore = async () => {
    // TODO: Implement restore functionality
    console.log('Restore initiated')
  }

  const handleScheduleBackup = (schedule: any) => {
    updateSettings({ backup_frequency: schedule.frequency, backup_time: schedule.time })
  }

  const handleExport = async (options: any) => {
    const result = await createExportOperation(options.type, {
      format: options.format || 'csv',
      include_headers: options.includeHeaders !== false,
      max_rows: options.maxRows || 10000,
      compression: options.compression !== false
    })
    if (result.success) {
      console.log('Export completed:', result.export)
    } else {
      console.error('Export failed:', result.error)
    }
  }

  const handleDownloadBackup = async (backupId: string) => {
    const result = await downloadBackupOperation(backupId)
    if (result.success && result.data) {
      // Create download link
      const url = URL.createObjectURL(result.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_${backupId}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      console.error('Download failed:', result.error)
    }
  }

  const handleCleanup = async (options: any) => {
    const result = await performCleanupOperation({
      type: options.type || 'logs',
      older_than_days: options.olderThanDays || 90,
      include_logs: options.includeLogs !== false,
      include_temp_files: options.includeTempFiles !== false,
      include_old_backups: options.includeOldBackups !== false
    })
    if (result.success) {
      console.log('Cleanup completed:', result.cleanup)
    } else {
      console.error('Cleanup failed:', result.error)
    }
  }

  const handleArchive = async (options: any) => {
    // TODO: Implement archive functionality
    console.log('Archive initiated:', options)
  }

  const handleCreateBuckets = async () => {
    try {
      const result = await createStorageBuckets()
      if (result.success) {
        alert('Storage buckets created successfully!')
        refreshData()
      } else {
        alert(`Failed to create buckets: ${result.message}`)
      }
    } catch (error) {
      console.error('Error creating buckets:', error)
      alert('Error creating storage buckets')
    }
  }

  const handleTestBackup = async () => {
    try {
      console.log('Testing backup creation...')
      const result = await createBackup({ include_files: true })
      console.log('Backup test result:', result)
      alert('Backup test initiated! Check console for details.')
      refreshData()
    } catch (error) {
      console.error('Backup test failed:', error)
      alert(`Backup test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (isLoadingSettings || isLoadingSystemStatus) {
    return (
      <SettingsPageLayout
        title="Data Management"
        description="Backup, export, and manage your data"
        icon={Database}
        showSaveButton={false}
        showResetButton={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data management settings...</p>
          </div>
        </div>
      </SettingsPageLayout>
    )
  }

  return (
    <SettingsPageLayout
      title="Data Management"
      description="Backup, export, and manage your data"
      icon={Database}
      showSaveButton={false}
      showResetButton={false}
    >
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Data Backup Card */}
      <DataBackupCard
        settings={settings}
        backupHistory={backupHistory}
        isLoadingBackupHistory={isLoadingBackupHistory}
        onBackup={handleBackup}
        onRestore={handleRestore}
        onScheduleBackup={handleScheduleBackup}
        onDownloadBackup={handleDownloadBackup}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <PremiumButton
          variant="outline"
          onClick={handleCreateBuckets}
          className="bg-white border-gray-200 hover:bg-gray-50"
        >
          <Database className="h-4 w-4 mr-2" />
          Create Storage Buckets
        </PremiumButton>
        <PremiumButton
          variant="outline"
          onClick={handleTestBackup}
          className="bg-white border-gray-200 hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Test Backup
        </PremiumButton>
        <PremiumButton
          variant="outline"
          onClick={refreshData}
          disabled={isLoadingSettings || isLoadingBackupHistory || isLoadingExportHistory || isLoadingCleanupHistory}
          className="bg-white border-gray-200 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </PremiumButton>
      </div>

      {/* Data Export Card */}
      <DataExportCard 
        settings={settings}
        exportHistory={exportHistory}
        isLoadingExportHistory={isLoadingExportHistory}
        onExport={handleExport} 
      />

      {/* Data Cleanup Card */}
      <DataCleanupCard
        settings={settings}
        cleanupHistory={cleanupHistory}
        isLoadingCleanupHistory={isLoadingCleanupHistory}
        onCleanup={handleCleanup}
        onArchive={handleArchive}
      />

      {/* System Status */}
      <PremiumCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-[#E5FF29]" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Database</p>
              <p className="text-sm text-green-700">
                {systemStatus?.database_status === 'connected' ? 'Connected & Healthy' : 'Disconnected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Storage</p>
              <p className="text-sm text-blue-700">
                {systemStatus ? `${(systemStatus.storage_used / 1024 / 1024 / 1024).toFixed(1)} GB / ${(systemStatus.storage_total / 1024 / 1024 / 1024).toFixed(1)} GB` : 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Last Backup</p>
              <p className="text-sm text-yellow-700">
                {systemStatus?.last_backup ? new Date(systemStatus.last_backup).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Archive className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Archived</p>
              <p className="text-sm text-purple-700">
                {systemStatus ? `${(systemStatus.archived_size / 1024 / 1024 / 1024).toFixed(1)} GB` : '0 GB'}
              </p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Quick Actions */}
      <PremiumCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-[#E5FF29]" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumButton 
            variant="outline"
            onClick={handleBackup}
            disabled={isLoadingBackupHistory}
            className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
          >
            <Download className="h-6 w-6 text-blue-600" />
            <span className="font-medium">Quick Backup</span>
            <span className="text-xs text-gray-500">Create backup now</span>
          </PremiumButton>
          
          <PremiumButton 
            variant="outline"
            onClick={() => handleExport({ type: 'all', format: 'csv' })}
            disabled={isLoadingExportHistory}
            className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
          >
            <Database className="h-6 w-6 text-green-600" />
            <span className="font-medium">Export All</span>
            <span className="text-xs text-gray-500">CSV format</span>
          </PremiumButton>
          
          <PremiumButton 
            variant="outline"
            onClick={() => handleCleanup({ type: 'logs', older_than_days: 90 })}
            disabled={isLoadingCleanupHistory}
            className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
          >
            <Trash2 className="h-6 w-6 text-red-600" />
            <span className="font-medium">Clean Logs</span>
            <span className="text-xs text-gray-500">Remove old logs</span>
          </PremiumButton>
          
          <PremiumButton 
            variant="outline"
            onClick={() => handleArchive({ before: 365 })}
            className="bg-white border-gray-200 hover:bg-gray-50 h-auto p-4 flex flex-col items-center gap-2"
          >
            <Archive className="h-6 w-6 text-orange-600" />
            <span className="font-medium">Archive Old</span>
            <span className="text-xs text-gray-500">1+ year old data</span>
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* Important Notes */}
      <PremiumCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-[#E5FF29]" />
          <h3 className="text-lg font-semibold text-gray-900">Important Notes</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Backup Recommendations</h4>
              <p className="text-sm text-blue-700 mt-1">
                We recommend creating daily backups and testing restore procedures regularly. 
                Keep multiple backup copies in different locations for maximum security.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900">Data Retention</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Ensure compliance with local data retention laws. Some data may need to be 
                kept for specific periods for tax or legal purposes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Security</h4>
              <p className="text-sm text-green-700 mt-1">
                All data exports and backups are encrypted. Access to sensitive data is 
                logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </div>
      </PremiumCard>
    </SettingsPageLayout>
  )
}

export default DataManagementPage 
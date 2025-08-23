import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Download, 
  Upload, 
  Clock, 
  Calendar,
  HardDrive,
  Cloud,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import type { DataManagementSettings, BackupHistory } from "@/types/data-management"

export interface DataBackupCardProps {
  settings: DataManagementSettings | null
  backupHistory: BackupHistory[]
  isLoadingBackupHistory: boolean
  onBackup: () => void
  onRestore: () => void
  onScheduleBackup: (schedule: any) => void
  onDownloadBackup?: (backupId: string) => void
}

export const DataBackupCard = ({
  settings,
  backupHistory,
  isLoadingBackupHistory,
  onBackup,
  onRestore,
  onScheduleBackup,
  onDownloadBackup
}: DataBackupCardProps) => {
  const [autoBackup, setAutoBackup] = useState(settings?.auto_backup_enabled ?? true)
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>(settings?.backup_frequency as 'daily' | 'weekly' | 'monthly' ?? 'daily')
  const [backupTime, setBackupTime] = useState(settings?.backup_time?.substring(0, 5) ?? '02:00')
  const [includeFiles, setIncludeFiles] = useState(settings?.backup_include_files ?? true)
  const [includeDatabase, setIncludeDatabase] = useState(true)

  // Get last backup info
  const lastBackup = backupHistory.length > 0 ? backupHistory[0] : null
  const lastBackupDate = lastBackup?.started_at ? new Date(lastBackup.started_at).toLocaleString() : 'Never'
  const lastBackupStatus = lastBackup?.backup_status || 'none'
  const lastBackupCompletedDate = lastBackup?.completed_at ? new Date(lastBackup.completed_at).toLocaleString() : null

  // Calculate next backup time
  const getNextBackupTime = () => {
    if (!settings?.auto_backup_enabled) return 'Disabled'
    
    const now = new Date()
    const [hours, minutes] = (settings.backup_time || '02:00').split(':').map(Number)
    const nextBackup = new Date(now)
    nextBackup.setHours(hours, minutes, 0, 0)
    
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1)
    }
    
    return nextBackup.toLocaleString()
  }

  const handleScheduleBackup = () => {
    onScheduleBackup({
      auto_backup_enabled: autoBackup,
      backup_frequency: backupFrequency,
      backup_time: backupTime + ':00',
      backup_include_files: includeFiles,
      backup_include_media: includeFiles
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'pending':
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-900'
      case 'failed':
        return 'bg-red-50 text-red-900'
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-50 text-yellow-900'
      default:
        return 'bg-gray-50 text-gray-900'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      case 'pending':
        return 'Pending'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Never'
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl font-semibold text-gray-900">Data Backup</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Backup Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${getStatusColor(lastBackupStatus)}`}>
            {getStatusIcon(lastBackupStatus)}
            <div>
              <p className="font-medium">Last Backup</p>
              <p className="text-sm opacity-80">
                {lastBackupStatus === 'completed' && lastBackupCompletedDate 
                  ? lastBackupCompletedDate 
                  : lastBackupDate}
              </p>
              <p className="text-xs opacity-70">{getStatusText(lastBackupStatus)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Next Backup</p>
              <p className="text-sm text-blue-700">{getNextBackupTime()}</p>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Backup Settings</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoBackup"
              checked={autoBackup}
              onChange={(checked) => setAutoBackup(checked)}
            />
            <label htmlFor="autoBackup" className="text-sm font-medium text-gray-700">
              Enable Automatic Backup
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <Select
                value={backupFrequency}
                onChange={(e) => setBackupFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Time</label>
              <Input
                type="time"
                value={backupTime}
                onChange={(e) => setBackupTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Backup Content</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDatabase"
                  checked={includeDatabase}
                  onChange={(checked) => setIncludeDatabase(checked)}
                />
                <label htmlFor="includeDatabase" className="text-sm text-gray-700">
                  Include Database
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeFiles"
                  checked={includeFiles}
                  onChange={(checked) => setIncludeFiles(checked)}
                />
                <label htmlFor="includeFiles" className="text-sm text-gray-700">
                  Include Files & Media
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Backups */}
        {backupHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recent Backups</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {backupHistory.slice(0, 5).map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.backup_status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {backup.backup_type === 'manual' ? 'Manual Backup' : 'Automatic Backup'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {backup.backup_status === 'completed' && backup.completed_at
                          ? new Date(backup.completed_at).toLocaleString()
                          : new Date(backup.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {backup.backup_format?.toUpperCase()}
                    </span>
                    {backup.backup_status === 'completed' && onDownloadBackup && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDownloadBackup(backup.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={onBackup}
            disabled={isLoadingBackupHistory}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white"
          >
            {isLoadingBackupHistory ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Create Backup
          </Button>
          <Button 
            variant="outline"
            onClick={onRestore}
            className="bg-white border-gray-200 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Restore Data
          </Button>
          <Button 
            variant="outline"
            onClick={handleScheduleBackup}
            className="bg-white border-gray-200 hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Update Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
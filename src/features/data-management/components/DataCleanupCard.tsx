import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Trash2, 
  Archive, 
  AlertTriangle,
  Calendar,
  Database,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { DataManagementSettings, CleanupHistory } from "@/types/data-management"

export interface DataCleanupCardProps {
  settings: DataManagementSettings | null
  cleanupHistory: CleanupHistory[]
  isLoadingCleanupHistory: boolean
  onCleanup: (options: any) => void
  onArchive: (options: any) => void
}

export const DataCleanupCard = ({ 
  settings, 
  cleanupHistory, 
  isLoadingCleanupHistory, 
  onCleanup, 
  onArchive 
}: DataCleanupCardProps) => {
  const [cleanupType, setCleanupType] = useState<'logs' | 'temp_files' | 'old_backups' | 'all'>(settings?.auto_cleanup_enabled ? 'logs' : 'logs')
  const [olderThan, setOlderThan] = useState(settings?.cleanup_retention_days?.toString() ?? '90')
  const [includeArchived, setIncludeArchived] = useState(false)
  const [includeDeleted, setIncludeDeleted] = useState(true)
  const [archiveBefore, setArchiveBefore] = useState('365')

  const handleCleanup = () => {
    onCleanup({
      type: cleanupType,
      older_than_days: parseInt(olderThan),
      include_logs: cleanupType === 'logs' || cleanupType === 'all',
      include_temp_files: cleanupType === 'temp_files' || cleanupType === 'all',
      include_old_backups: cleanupType === 'old_backups' || cleanupType === 'all'
    })
  }

  const handleArchive = () => {
    onArchive({
      before: parseInt(archiveBefore)
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  // Calculate statistics from cleanup history
  const getCleanupStats = () => {
    const completedCleanups = cleanupHistory.filter(c => c.cleanup_status === 'completed')
    const totalProcessed = completedCleanups.reduce((sum, c) => sum + c.items_processed, 0)
    const totalDeleted = completedCleanups.reduce((sum, c) => sum + c.items_deleted, 0)
    const totalFreed = completedCleanups.reduce((sum, c) => sum + (c.space_freed || 0), 0)
    
    return {
      totalProcessed,
      totalDeleted,
      totalFreed: totalFreed / (1024 * 1024 * 1024) // Convert to GB
    }
  }

  const stats = getCleanupStats()

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          <CardTitle className="text-xl font-semibold text-gray-900">Data Cleanup & Archive</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cleanup Options */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Data Cleanup</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cleanup Type</label>
              <Select
                value={cleanupType}
                onChange={(e) => setCleanupType(e.target.value as 'logs' | 'temp_files' | 'old_backups' | 'all')}
              >
                <option value="logs">System Logs</option>
                <option value="temp_files">Temporary Files</option>
                <option value="old_backups">Old Backups</option>
                <option value="all">All Types</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Older Than (days)</label>
              <Input
                type="number"
                value={olderThan}
                onChange={(e) => setOlderThan(e.target.value)}
                placeholder="90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeArchived"
                checked={includeArchived}
                onChange={(checked) => setIncludeArchived(checked)}
              />
              <label htmlFor="includeArchived" className="text-sm font-medium text-gray-700">
                Include Archived Data
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDeleted"
                checked={includeDeleted}
                onChange={(checked) => setIncludeDeleted(checked)}
              />
              <label htmlFor="includeDeleted" className="text-sm font-medium text-gray-700">
                Include Soft-Deleted Records
              </label>
            </div>
          </div>

          <Button 
            onClick={handleCleanup}
            disabled={isLoadingCleanupHistory}
            variant="outline"
            className="bg-white border-red-200 text-red-700 hover:bg-red-50"
          >
            {isLoadingCleanupHistory ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Cleanup Data
          </Button>
        </div>

        {/* Archive Options */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="font-medium text-gray-900">Data Archiving</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Archive Data Older Than (days)</label>
              <Input
                type="number"
                value={archiveBefore}
                onChange={(e) => setArchiveBefore(e.target.value)}
                placeholder="365"
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Archive Warning</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Archiving will move old data to a separate storage location. 
                  Archived data can be restored but may not be immediately accessible.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleArchive}
            variant="outline"
            className="bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive Data
          </Button>
        </div>

        {/* Recent Cleanups */}
        {cleanupHistory.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="font-medium text-gray-900">Recent Cleanups</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cleanupHistory.slice(0, 5).map((cleanup) => (
                <div key={cleanup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(cleanup.cleanup_status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cleanup.cleanup_type} Cleanup
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(cleanup.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {cleanup.items_deleted} deleted
                    </p>
                    {cleanup.space_freed && (
                      <p className="text-xs text-gray-500">
                        {(cleanup.space_freed / (1024 * 1024)).toFixed(1)} MB freed
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Statistics */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="font-medium text-gray-900">Cleanup Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Total Processed</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.totalProcessed.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Items Deleted</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.totalDeleted.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Archive className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-900">Space Freed</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{stats.totalFreed.toFixed(1)} GB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
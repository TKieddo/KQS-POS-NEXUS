import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Clock, 
  FileText, 
  Cloud, 
  Download,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useReportSchedules } from '../hooks/useReports'
import { useExportSettings } from '../hooks/useReports'
import { useDataExports } from '../hooks/useReports'

export interface ReportsOverviewProps {
  className?: string
}

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ className }) => {
  const { schedules, loading: schedulesLoading } = useReportSchedules()
  const { settings, loading: settingsLoading } = useExportSettings()
  const { exports, loading: exportsLoading } = useDataExports()

  const activeSchedulesCount = schedules.filter(s => s.is_active).length
  const totalExportsCount = exports.length
  const completedExportsCount = exports.filter(e => e.status === 'completed').length
  const pendingExportsCount = exports.filter(e => e.status === 'pending' || e.status === 'processing').length

  // Calculate storage used (mock data for now)
  const storageUsed = '2.4 GB'
  const defaultFormat = settings?.default_format?.toUpperCase() || 'PDF'

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const totalFileSize = exports
    .filter(e => e.file_size)
    .reduce((sum, exp) => sum + (exp.file_size || 0), 0)

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className}`}>
      {/* Active Schedules */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Schedules</p>
              <p className="text-2xl font-bold text-blue-900">
                {schedulesLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  activeSchedulesCount
                )}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {schedules.length} total schedules
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-full">
              <Clock className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Generated */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Reports Generated</p>
              <p className="text-2xl font-bold text-green-900">
                {exportsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  completedExportsCount
                )}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {pendingExportsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <AlertTriangle className="h-3 w-3" />
                    {pendingExportsCount} pending
                  </div>
                )}
                {completedExportsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {completedExportsCount} completed
                  </div>
                )}
              </div>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <FileText className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Used */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Storage Used</p>
              <p className="text-2xl font-bold text-purple-900">
                {exportsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  formatFileSize(totalFileSize)
                )}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                {totalExportsCount} files stored
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-full">
              <Cloud className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Format */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Default Format</p>
              <p className="text-2xl font-bold text-orange-900">
                {settingsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  defaultFormat
                )}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {settings?.include_charts ? 'With charts' : 'Text only'}
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <Download className="h-6 w-6 text-orange-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
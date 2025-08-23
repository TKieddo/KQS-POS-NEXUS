import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  BarChart3,
  FileText,
  Cloud,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'

export interface ReportsQuickActionsProps {
  className?: string
}

export const ReportsQuickActions: React.FC<ReportsQuickActionsProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleGenerateAllReports = async () => {
    setIsGenerating(true)
    try {
      // TODO: Implement generate all reports
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Generated all reports')
    } catch (error) {
      console.error('Error generating reports:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateBackup = async () => {
    setIsBackingUp(true)
    try {
      // TODO: Implement backup creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      console.log('Backup created successfully')
    } catch (error) {
      console.error('Error creating backup:', error)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      // TODO: Implement data sync
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Data synced successfully')
    } catch (error) {
      console.error('Error syncing data:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const quickActions = [
    {
      id: 'generate-all',
      title: 'Generate All Reports',
      description: 'Generate all scheduled reports at once',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: handleGenerateAllReports,
      loading: isGenerating
    },
    {
      id: 'create-backup',
      title: 'Create Backup',
      description: 'Create a complete system backup',
      icon: Cloud,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: handleCreateBackup,
      loading: isBackingUp
    },
    {
      id: 'sync-data',
      title: 'Sync Data',
      description: 'Synchronize data across all branches',
      icon: RefreshCw,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: handleSyncData,
      loading: isSyncing
    },
    {
      id: 'export-all',
      title: 'Export All Data',
      description: 'Export all data in multiple formats',
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      action: () => console.log('Export all data'),
      loading: false
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import data from external sources',
      icon: Upload,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      action: () => console.log('Import data'),
      loading: false
    },
    {
      id: 'system-status',
      title: 'System Status',
      description: 'Check system health and performance',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      action: () => console.log('Check system status'),
      loading: false
    }
  ]

  const systemStatus = {
    reports: { status: 'healthy', count: 12, lastRun: '2 hours ago' },
    backups: { status: 'healthy', count: 5, lastRun: '1 day ago' },
    sync: { status: 'warning', count: 3, lastRun: '30 minutes ago' }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Last updated: 5 minutes ago</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(systemStatus.reports.status)}
              <div>
                <p className="font-medium text-gray-900">Reports</p>
                <p className="text-sm text-gray-600">{systemStatus.reports.count} active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(systemStatus.backups.status)}
              <div>
                <p className="font-medium text-gray-900">Backups</p>
                <p className="text-sm text-gray-600">{systemStatus.backups.count} available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(systemStatus.sync.status)}
              <div>
                <p className="font-medium text-gray-900">Sync</p>
                <p className="text-sm text-gray-600">{systemStatus.sync.count} pending</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.id}
                  className={`p-4 border rounded-lg ${action.bgColor} ${action.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={action.action}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      {action.loading ? (
                        <Loader2 className={`h-5 w-5 ${action.color} animate-spin`} />
                      ) : (
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Daily Sales Report generated</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Cloud className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System backup completed</p>
                  <p className="text-xs text-gray-600">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <RefreshCw className="h-4 w-4 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Data synchronization started</p>
                  <p className="text-xs text-gray-600">30 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
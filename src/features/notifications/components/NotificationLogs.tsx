import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Monitor,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useNotificationLogs } from '../hooks/useNotifications'
import { NotificationLog } from '../types'

export interface NotificationLogsProps {
  className?: string
  limit?: number
}

const TYPE_ICONS = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  'in-app': Monitor
}

const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  sent: 'text-green-600 bg-green-50 border-green-200',
  failed: 'text-red-600 bg-red-50 border-red-200'
}

const STATUS_ICONS = {
  pending: Clock,
  sent: CheckCircle,
  failed: AlertTriangle
}

export const NotificationLogs: React.FC<NotificationLogsProps> = ({ 
  className = '', 
  limit = 10 
}) => {
  const { logs, loading, error, refetch } = useNotificationLogs(limit)

  const getTypeIcon = (type: keyof typeof TYPE_ICONS) => {
    const IconComponent = TYPE_ICONS[type]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Mail className="h-4 w-4" />
  }

  const getStatusIcon = (status: keyof typeof STATUS_ICONS) => {
    const IconComponent = STATUS_ICONS[status]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <Clock className="h-4 w-4" />
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'sent': return 'Sent'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  if (loading) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-600">Loading notification logs...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Error loading notification logs: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white border-gray-200 shadow-sm ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Notifications</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="bg-white border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notification logs found</p>
            <p className="text-sm mt-1">Notifications will appear here once sent</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(log.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {log.subject || `${log.type.charAt(0).toUpperCase() + log.type.slice(1)} Notification`}
                      </p>
                      <p className="text-xs text-gray-500">
                        To: {log.recipient}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[log.status]}`}>
                    {getStatusIcon(log.status)}
                    {getStatusText(log.status)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Showing {logs.length} recent notifications</span>
              <Button variant="ghost" className="text-sm p-0 h-auto">
                View All Logs
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
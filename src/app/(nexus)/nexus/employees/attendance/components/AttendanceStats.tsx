import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  AlertTriangle,
  Calendar
} from 'lucide-react'

interface AttendanceStatsProps {
  stats: {
    today: {
      total: number
      present: number
      absent: number
      late: number
      onLeave: number
      rate: number
    }
    month: {
      total: number
      present: number
      absent: number
      late: number
      leave: number
      rate: number
    }
    leaveRequests: {
      pending: number
      approved: number
      rejected: number
    }
  }
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-4 w-4" />
    if (rate >= 75) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Attendance */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Today's Attendance
            </span>
            <Badge variant="outline" className="text-xs">
              {stats.today.rate.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Employees</span>
            <span className="font-semibold">{stats.today.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Present
            </span>
            <span className="font-semibold text-green-600">{stats.today.present}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              Absent
            </span>
            <span className="font-semibold text-red-600">{stats.today.absent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-600" />
              Late
            </span>
            <span className="font-semibold text-yellow-600">{stats.today.late}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-600" />
              On Leave
            </span>
            <span className="font-semibold text-blue-600">{stats.today.onLeave}</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Overview */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Monthly Overview
            </span>
            <Badge variant="outline" className="text-xs">
              {stats.month.rate.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Days</span>
            <span className="font-semibold">{stats.month.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Present Days
            </span>
            <span className="font-semibold text-green-600">{stats.month.present}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              Absent Days
            </span>
            <span className="font-semibold text-red-600">{stats.month.absent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-600" />
              Late Days
            </span>
            <span className="font-semibold text-yellow-600">{stats.month.late}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <FileText className="h-3 w-3 text-blue-600" />
              Leave Days
            </span>
            <span className="font-semibold text-blue-600">{stats.month.leave}</span>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Leave Requests
            </span>
            <Badge variant="outline" className="text-xs">
              {stats.leaveRequests.pending} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              Pending
            </span>
            <span className="font-semibold text-yellow-600">{stats.leaveRequests.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Approved
            </span>
            <span className="font-semibold text-green-600">{stats.leaveRequests.approved}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              Rejected
            </span>
            <span className="font-semibold text-red-600">{stats.leaveRequests.rejected}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="font-semibold">
                {stats.leaveRequests.pending + stats.leaveRequests.approved + stats.leaveRequests.rejected}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rate */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              Attendance Rate
            </span>
            <div className={`flex items-center gap-1 ${getStatusColor(stats.today.rate)}`}>
              {getStatusIcon(stats.today.rate)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStatusColor(stats.today.rate)}`}>
              {stats.today.rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Today's Rate</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Monthly Rate</span>
              <span className={`font-semibold ${getStatusColor(stats.month.rate)}`}>
                {stats.month.rate.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  stats.today.rate >= 90 ? 'bg-green-500' :
                  stats.today.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.today.rate, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

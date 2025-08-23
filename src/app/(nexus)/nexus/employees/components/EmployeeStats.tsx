import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { EmployeeStats as EmployeeStatsType } from '../types/employee'

interface EmployeeStatsProps {
  stats: EmployeeStatsType
}

export function EmployeeStats({ stats }: EmployeeStatsProps) {
  const mainStats = [
    {
      title: 'Total Employees',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'On Leave',
      value: stats.onLeave,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Terminated',
      value: stats.terminated,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800'
      case 'terminated':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className={`border-2 ${stat.borderColor} rounded-2xl shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    {stat.title === 'Total Employees' && stats.total > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {((stats.active / stats.total) * 100).toFixed(1)}% active rate
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Division Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Division */}
        <Card className="border-2 border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-gray-600" />
              Employees by Division
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.byDivision.length > 0 ? (
              stats.byDivision.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {item.division.code}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.division.name}</p>
                      <p className="text-sm text-gray-500">{item.division.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {item.count} employees
                    </Badge>
                    {stats.total > 0 && (
                      <span className="text-xs text-gray-500">
                        {((item.count / stats.total) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No divisions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Employment Type */}
        <Card className="border-2 border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              Employment Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.byEmploymentType.length > 0 ? (
              stats.byEmploymentType.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">
                        {item.type.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">
                        {item.count} {item.count === 1 ? 'employee' : 'employees'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {item.count}
                    </Badge>
                    {stats.total > 0 && (
                      <span className="text-xs text-gray-500">
                        {((item.count / stats.total) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No employment data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="border-2 border-gray-200 rounded-2xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-gray-600" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average per Division</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.byDivision.length > 0 
                    ? Math.round(stats.total / stats.byDivision.length) 
                    : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.onLeave} ({stats.total > 0 ? ((stats.onLeave / stats.total) * 100).toFixed(1) : 0}%)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

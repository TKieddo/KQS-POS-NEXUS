'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Calendar, 
  BarChart3,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  Sun,
  Flag
} from 'lucide-react'

import { Employee, AttendanceRecord } from '../hooks/useAttendance'

interface AnalyticsDashboardProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
}

export function AnalyticsDashboard({ employees, attendanceRecords }: AnalyticsDashboardProps) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Filter records for current month
    const currentMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })
    
    // Filter records for last month
    const lastMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return recordDate.getMonth() === lastMonth && recordDate.getFullYear() === lastMonthYear
    })
    
    // Calculate current month stats
    const currentMonthStats = {
      totalDays: new Date(currentYear, currentMonth + 1, 0).getDate(),
      totalRecords: currentMonthRecords.length,
      present: currentMonthRecords.filter(r => r.status === 'present').length,
      absent: currentMonthRecords.filter(r => r.status === 'absent').length,
      late: currentMonthRecords.filter(r => r.status === 'late').length,
      halfDay: currentMonthRecords.filter(r => r.status === 'half_day').length,
      sickLeave: currentMonthRecords.filter(r => r.status === 'sick_leave').length,
      annualLeave: currentMonthRecords.filter(r => r.status === 'annual_leave').length,
      unpaidLeave: currentMonthRecords.filter(r => r.status === 'unpaid_leave').length,
    }
    
    // Calculate last month stats
    const lastMonthStats = {
      totalDays: new Date(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth, 0).getDate(),
      totalRecords: lastMonthRecords.length,
      present: lastMonthRecords.filter(r => r.status === 'present').length,
      absent: lastMonthRecords.filter(r => r.status === 'absent').length,
      late: lastMonthRecords.filter(r => r.status === 'late').length,
      halfDay: lastMonthRecords.filter(r => r.status === 'half_day').length,
      sickLeave: lastMonthRecords.filter(r => r.status === 'sick_leave').length,
      annualLeave: lastMonthRecords.filter(r => r.status === 'annual_leave').length,
      unpaidLeave: lastMonthRecords.filter(r => r.status === 'unpaid_leave').length,
    }
    
    // Calculate attendance rates
    const currentAttendanceRate = currentMonthStats.totalRecords > 0 
      ? (currentMonthStats.present / currentMonthStats.totalRecords) * 100 
      : 0
    const lastAttendanceRate = lastMonthStats.totalRecords > 0 
      ? (lastMonthStats.present / lastMonthStats.totalRecords) * 100 
      : 0
    
    // Calculate employee performance
    const employeePerformance = employees.map(employee => {
      const employeeRecords = currentMonthRecords.filter(r => r.employeeId === employee.id)
      const presentDays = employeeRecords.filter(r => r.status === 'present').length
      const totalDays = currentMonthStats.totalDays
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
      
      return {
        employee,
        presentDays,
        totalDays,
        attendanceRate,
        lateCount: employeeRecords.filter(r => r.status === 'late').length,
        absentCount: employeeRecords.filter(r => r.status === 'absent').length,
        leaveCount: employeeRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length
      }
    }).sort((a, b) => b.attendanceRate - a.attendanceRate)
    
    // Calculate weekly trends
    const weeklyTrends = []
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(currentYear, currentMonth, week * 7 + 1)
      const weekEnd = new Date(currentYear, currentMonth, Math.min((week + 1) * 7, currentMonthStats.totalDays))
      
      const weekRecords = currentMonthRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= weekStart && recordDate <= weekEnd
      })
      
      const weekPresent = weekRecords.filter(r => r.status === 'present').length
      const weekTotal = weekRecords.length
      const weekRate = weekTotal > 0 ? (weekPresent / weekTotal) * 100 : 0
      
      weeklyTrends.push({
        week: week + 1,
        present: weekPresent,
        total: weekTotal,
        rate: weekRate,
        startDate: weekStart.toLocaleDateString(),
        endDate: weekEnd.toLocaleDateString()
      })
    }
    
    // Calculate division performance
    const divisionPerformance = employees.reduce((acc, employee) => {
      if (!acc[employee.division]) {
        acc[employee.division] = { employees: [], totalRecords: 0, presentRecords: 0 }
      }
      acc[employee.division].employees.push(employee)
      return acc
    }, {} as Record<string, { employees: Employee[], totalRecords: number, presentRecords: number }>)
    
    Object.keys(divisionPerformance).forEach(division => {
      const divisionEmployees = divisionPerformance[division].employees
      const divisionRecords = currentMonthRecords.filter(record => 
        divisionEmployees.some(emp => emp.id === record.employeeId)
      )
      divisionPerformance[division].totalRecords = divisionRecords.length
      divisionPerformance[division].presentRecords = divisionRecords.filter(r => r.status === 'present').length
    })
    
    return {
      currentMonthStats,
      lastMonthStats,
      currentAttendanceRate,
      lastAttendanceRate,
      employeePerformance,
      weeklyTrends,
      divisionPerformance,
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.isActive).length
    }
  }, [employees, attendanceRecords])
  
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <TrendingUp className="h-4 w-4 text-gray-600" />
  }
  
  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-gray-600'
  }
  
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (rate >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className={`text-2xl font-bold ${getAttendanceRateColor(analytics.currentAttendanceRate)}`}>
                  {analytics.currentAttendanceRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(analytics.currentAttendanceRate, analytics.lastAttendanceRate)}
                  <span className={`text-xs ${getTrendColor(analytics.currentAttendanceRate, analytics.lastAttendanceRate)}`}>
                    {Math.abs(analytics.currentAttendanceRate - analytics.lastAttendanceRate).toFixed(1)}%
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEmployees}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.activeEmployees} active
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{analytics.currentMonthStats.present}</p>
                <p className="text-xs text-gray-500 mt-1">
                  of {analytics.currentMonthStats.totalRecords} records
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-600">{analytics.currentMonthStats.absent}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.currentMonthStats.late} late
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Attendance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.weeklyTrends.map((week, index) => (
                <div key={week.week} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Week {week.week}</p>
                    <p className="text-sm text-gray-500">
                      {week.startDate} - {week.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getAttendanceRateColor(week.rate)}`}>
                      {week.rate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {week.present}/{week.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Division Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Division Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.divisionPerformance).map(([division, data]) => {
                const rate = data.totalRecords > 0 ? (data.presentRecords / data.totalRecords) * 100 : 0
                return (
                  <div key={division} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{division}</p>
                      <p className="text-sm text-gray-500">
                        {data.employees.length} employees
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getAttendanceRateBadge(rate)}>
                        {rate.toFixed(1)}%
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.presentRecords}/{data.totalRecords}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Performance Ranking
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Employee</th>
                  <th className="text-left p-2">Division</th>
                  <th className="text-center p-2">Attendance Rate</th>
                  <th className="text-center p-2">Present Days</th>
                  <th className="text-center p-2">Late</th>
                  <th className="text-center p-2">Absent</th>
                  <th className="text-center p-2">Leave Days</th>
                </tr>
              </thead>
              <tbody>
                {analytics.employeePerformance.map((perf, index) => (
                  <tr key={perf.employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-2 font-medium">{perf.employee.name}</td>
                    <td className="p-2 text-sm text-gray-600">{perf.employee.division}</td>
                    <td className="p-2 text-center">
                      <Badge className={getAttendanceRateBadge(perf.attendanceRate)}>
                        {perf.attendanceRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-2 text-center text-sm">
                      {perf.presentDays}/{perf.totalDays}
                    </td>
                    <td className="p-2 text-center">
                      {perf.lateCount > 0 && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          {perf.lateCount}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {perf.absentCount > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {perf.absentCount}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {perf.leaveCount > 0 && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          {perf.leaveCount}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leave Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Sick Leave</span>
                </div>
                <span className="font-medium">{analytics.currentMonthStats.sickLeave}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Annual Leave</span>
                </div>
                <span className="font-medium">{analytics.currentMonthStats.annualLeave}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Unpaid Leave</span>
                </div>
                <span className="font-medium">{analytics.currentMonthStats.unpaidLeave}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Month</span>
                <Badge className={getAttendanceRateBadge(analytics.currentAttendanceRate)}>
                  {analytics.currentAttendanceRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Month</span>
                <Badge variant="outline">
                  {analytics.lastAttendanceRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Change</span>
                <span className={`text-sm font-medium ${getTrendColor(analytics.currentAttendanceRate, analytics.lastAttendanceRate)}`}>
                  {analytics.currentAttendanceRate > analytics.lastAttendanceRate ? '+' : ''}
                  {(analytics.currentAttendanceRate - analytics.lastAttendanceRate).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Attendance Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

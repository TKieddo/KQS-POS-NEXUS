import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  Clock
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { AttendanceRecord, LeaveBalance } from '../types/attendance'

interface AttendanceAnalyticsProps {
  attendanceRecords: AttendanceRecord[]
  employees: Employee[]
  leaveBalances: LeaveBalance[]
}

export function AttendanceAnalytics({
  attendanceRecords,
  employees,
  leaveBalances
}: AttendanceAnalyticsProps) {
  // Calculate analytics data
  const analytics = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear
    })

    const totalDays = monthRecords.length
    const presentDays = monthRecords.filter(r => r.status === 'present').length
    const absentDays = monthRecords.filter(r => r.status === 'absent').length
    const lateDays = monthRecords.filter(r => r.status === 'late').length
    const leaveDays = monthRecords.filter(r => r.status === 'leave').length
    const halfDays = monthRecords.filter(r => r.status === 'half_day').length

    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
    const absenceRate = totalDays > 0 ? (absentDays / totalDays) * 100 : 0
    const lateRate = totalDays > 0 ? (lateDays / totalDays) * 100 : 0

    // Calculate trends (compare with previous month)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const previousMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === previousMonth && 
             recordDate.getFullYear() === previousYear
    })

    const previousPresentDays = previousMonthRecords.filter(r => r.status === 'present').length
    const previousTotalDays = previousMonthRecords.length
    const previousAttendanceRate = previousTotalDays > 0 ? (previousPresentDays / previousTotalDays) * 100 : 0

    const attendanceTrend = attendanceRate - previousAttendanceRate

    // Top absent employees
    const employeeAbsences = employees.map(emp => {
      const empRecords = monthRecords.filter(r => r.employee_id === emp.id)
      const absences = empRecords.filter(r => r.status === 'absent').length
      return {
        employee: emp,
        absences,
        totalDays: empRecords.length
      }
    }).filter(item => item.absences > 0)
    .sort((a, b) => b.absences - a.absences)
    .slice(0, 5)

    // Leave statistics
    const totalLeaveDays = leaveBalances.reduce((sum, balance) => 
      sum + balance.used_annual_leave + balance.used_sick_leave + balance.used_personal_leave, 0
    )
    const remainingLeaveDays = leaveBalances.reduce((sum, balance) => 
      sum + balance.remaining_annual_leave + balance.remaining_sick_leave + balance.remaining_personal_leave, 0
    )

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      halfDays,
      attendanceRate,
      absenceRate,
      lateRate,
      attendanceTrend,
      employeeAbsences,
      totalLeaveDays,
      remainingLeaveDays
    }
  }, [attendanceRecords, employees, leaveBalances])

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.attendanceRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.attendanceTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              {Math.abs(analytics.attendanceTrend).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.absentDays}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.absenceRate.toFixed(1)}% of total days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lateDays}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.lateRate.toFixed(1)}% of total days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.leaveDays}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.remainingLeaveDays} days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Attendance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Present</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.attendanceRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.presentDays}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Absent</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${analytics.absenceRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.absentDays}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Late</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${analytics.lateRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.lateDays}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">On Leave</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(analytics.leaveDays / analytics.totalDays) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.leaveDays}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Absent Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              Top Absent Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.employeeAbsences.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No absences recorded this month
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.employeeAbsences.map((item, index) => (
                  <div key={item.employee.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {item.employee.firstName} {item.employee.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.employee.employeeId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{item.absences} days</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leave Management Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Leave Management Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalLeaveDays}
              </div>
              <div className="text-sm text-gray-600">Total Leave Days Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.remainingLeaveDays}
              </div>
              <div className="text-sm text-gray-600">Remaining Leave Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {leaveBalances.length}
              </div>
              <div className="text-sm text-gray-600">Employees with Leave Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Download,
  Filter,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useAttendance } from '../../hooks/useAttendance'
import type { Employee } from '../../types/employee'
import type { AttendanceRecord, LeaveBalance } from '../../types/attendance'
import { ATTENDANCE_STATUSES } from '../../types/attendance'

interface AnalyticsTabProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  leaveBalances: LeaveBalance[]
  selectedEmployee: string
  onEmployeeSelect: (employeeId: string) => void
}

export function AnalyticsTab({
  employees,
  attendanceRecords,
  leaveBalances,
  selectedEmployee,
  onEmployeeSelect
}: AnalyticsTabProps) {
  const { getAttendanceStats, getMonthlyAttendance } = useAttendance()
  
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  // Filter records based on selected employee
  const filteredRecords = useMemo(() => {
    if (!selectedEmployee) return attendanceRecords
    return attendanceRecords.filter(record => record.employeeId === selectedEmployee)
  }, [attendanceRecords, selectedEmployee])

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalRecords = filteredRecords.length
    const presentDays = filteredRecords.filter(r => r.status === 'present').length
    const absentDays = filteredRecords.filter(r => r.status === 'absent').length
    const lateDays = filteredRecords.filter(r => r.status === 'late').length
    const leaveDays = filteredRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length

    const attendanceRate = totalRecords > 0 ? (presentDays / totalRecords) * 100 : 0
    const absenceRate = totalRecords > 0 ? (absentDays / totalRecords) * 100 : 0
    const lateRate = totalRecords > 0 ? (lateDays / totalRecords) * 100 : 0

    // Calculate average work hours
    let totalWorkHours = 0
    let workDaysCount = 0

    filteredRecords.forEach(record => {
      if (record.checkInTime && record.checkOutTime && record.status === 'present') {
        const checkIn = new Date(`2000-01-01T${record.checkInTime}`)
        const checkOut = new Date(`2000-01-01T${record.checkOutTime}`)
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
        totalWorkHours += hours
        workDaysCount++
      }
    })

    const averageWorkHours = workDaysCount > 0 ? totalWorkHours / workDaysCount : 0

    return {
      totalRecords,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      attendanceRate,
      absenceRate,
      lateRate,
      averageWorkHours,
      workDaysCount
    }
  }, [filteredRecords])

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const trends = months.map((month, index) => {
      const monthRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === index && recordDate.getFullYear() === selectedYear
      })

      const presentDays = monthRecords.filter(r => r.status === 'present').length
      const totalDays = monthRecords.length
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      return {
        month,
        attendanceRate,
        totalDays,
        presentDays
      }
    })

    return trends
  }, [filteredRecords, selectedYear])

  // Calculate employee performance ranking
  const employeeRanking = useMemo(() => {
    const employeeStats = employees.map(employee => {
      const employeeRecords = attendanceRecords.filter(record => record.employeeId === employee.id)
      const presentDays = employeeRecords.filter(r => r.status === 'present').length
      const totalDays = employeeRecords.length
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      return {
        employee,
        attendanceRate,
        totalDays,
        presentDays
      }
    })

    return employeeStats
      .filter(stat => stat.totalDays > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10) // Top 10 employees
  }, [employees, attendanceRecords])

  // Calculate leave balance statistics
  const leaveStats = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const currentYearBalances = leaveBalances.filter(balance => balance.year === currentYear)
    
    const totalLeaveDays = currentYearBalances.reduce((sum, balance) => sum + balance.totalLeaveDays, 0)
    const usedLeaveDays = currentYearBalances.reduce((sum, balance) => sum + balance.usedLeaveDays, 0)
    const remainingLeaveDays = currentYearBalances.reduce((sum, balance) => sum + balance.remainingLeaveDays, 0)
    const averageUsage = currentYearBalances.length > 0 ? usedLeaveDays / currentYearBalances.length : 0

    return {
      totalLeaveDays,
      usedLeaveDays,
      remainingLeaveDays,
      averageUsage,
      employeeCount: currentYearBalances.length
    }
  }, [leaveBalances])

  // Get status distribution
  const statusDistribution = useMemo(() => {
    const distribution = ATTENDANCE_STATUSES.map(status => ({
      status: status.label,
      count: filteredRecords.filter(r => r.status === status.value).length,
      percentage: filteredRecords.length > 0 
        ? (filteredRecords.filter(r => r.status === status.value).length / filteredRecords.length) * 100 
        : 0
    }))

    return distribution.filter(item => item.count > 0)
  }, [filteredRecords])

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (rate >= 75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Attendance Analytics</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{overallStats.attendanceRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{overallStats.averageWorkHours.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Avg Work Hours</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{leaveStats.averageUsage.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Leave Days Used</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{overallStats.totalRecords}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Attendance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusDistribution.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Attendance Trends ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyTrends.map((trend) => (
                <div key={trend.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trend.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${trend.attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{trend.attendanceRate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Performing Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employeeRanking.map((stat, index) => (
              <div key={stat.employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {stat.employee.firstName} {stat.employee.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.employee.employeeId} • {stat.presentDays}/{stat.totalDays} days
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(stat.attendanceRate)}
                  <span className={`font-bold ${getPerformanceColor(stat.attendanceRate)}`}>
                    {stat.attendanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leave Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Statistics ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{leaveStats.totalLeaveDays}</div>
              <div className="text-sm text-gray-600">Total Leave Days Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{leaveStats.usedLeaveDays}</div>
              <div className="text-sm text-gray-600">Leave Days Used</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{leaveStats.remainingLeaveDays}</div>
              <div className="text-sm text-gray-600">Leave Days Remaining</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Leave Usage Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${leaveStats.totalLeaveDays > 0 ? (leaveStats.usedLeaveDays / leaveStats.totalLeaveDays) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 days</span>
              <span>{leaveStats.usedLeaveDays} used</span>
              <span>{leaveStats.totalLeaveDays} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overallStats.attendanceRate < 90 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Attendance Rate Below Target</div>
                  <div className="text-sm text-yellow-700">
                    Current attendance rate is {overallStats.attendanceRate.toFixed(1)}%, which is below the 90% target.
                  </div>
                </div>
              </div>
            )}

            {overallStats.lateRate > 10 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-orange-800">High Late Arrival Rate</div>
                  <div className="text-sm text-orange-700">
                    {overallStats.lateRate.toFixed(1)}% of attendance records show late arrivals.
                  </div>
                </div>
              </div>
            )}

            {leaveStats.averageUsage > 8 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">High Leave Usage</div>
                  <div className="text-sm text-blue-700">
                    Average leave usage is {leaveStats.averageUsage.toFixed(1)} days per employee.
                  </div>
                </div>
              </div>
            )}

            {overallStats.attendanceRate >= 90 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Excellent Attendance</div>
                  <div className="text-sm text-green-700">
                    Attendance rate of {overallStats.attendanceRate.toFixed(1)}% exceeds the 90% target.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

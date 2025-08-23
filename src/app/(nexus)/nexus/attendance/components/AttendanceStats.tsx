import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { AttendanceRecord, LeaveBalance } from '../types/attendance'

interface AttendanceStatsProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  leaveBalances: LeaveBalance[]
}

export function AttendanceStats({
  employees,
  attendanceRecords,
  leaveBalances
}: AttendanceStatsProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Calculate employee statistics
  const employeeStats = useMemo(() => {
    const currentYear = new Date().getFullYear()
    
    return employees.map(employee => {
      const yearRecords = attendanceRecords.filter(record => 
        record.employee_id === employee.id &&
        new Date(record.date).getFullYear() === currentYear
      )
      
      const totalDays = yearRecords.length
      const presentDays = yearRecords.filter(r => r.status === 'present').length
      const absentDays = yearRecords.filter(r => r.status === 'absent').length
      const lateDays = yearRecords.filter(r => r.status === 'late').length
      const leaveDays = yearRecords.filter(r => r.status === 'leave').length
      
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
      
      const leaveBalance = leaveBalances.find(b => 
        b.employee_id === employee.id && b.year === currentYear
      )
      
      return {
        employee,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        leaveDays,
        attendanceRate,
        remainingLeaveDays: leaveBalance?.remaining_annual_leave || 0,
        usedLeaveDays: leaveBalance?.used_annual_leave || 0
      }
    }).filter(stat => 
      searchTerm === '' || 
      `${stat.employee.firstName} ${stat.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, attendanceRecords, leaveBalances, searchTerm])

  // Overall statistics
  const overallStats = useMemo(() => {
    const totalEmployees = employeeStats.length
    const avgAttendanceRate = employeeStats.reduce((sum, stat) => sum + stat.attendanceRate, 0) / totalEmployees
    const totalAbsences = employeeStats.reduce((sum, stat) => sum + stat.absentDays, 0)
    const totalLeaveDays = employeeStats.reduce((sum, stat) => sum + stat.usedLeaveDays, 0)
    
    return {
      totalEmployees,
      avgAttendanceRate,
      totalAbsences,
      totalLeaveDays
    }
  }, [employeeStats])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Attendance Statistics</h2>
          <p className="text-gray-600 mt-1">Detailed attendance analysis for all employees</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.avgAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAbsences}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalLeaveDays}</div>
            <p className="text-xs text-muted-foreground">Used this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
          />
        </div>
      </div>

      {/* Employee Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Employee Attendance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                  <TableHead>Absences</TableHead>
                  <TableHead>Late Days</TableHead>
                  <TableHead>Leave Days</TableHead>
                  <TableHead>Remaining Leave</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeStats.map((stat) => (
                    <TableRow key={stat.employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {stat.employee.firstName} {stat.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stat.employee.employeeId}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            stat.attendanceRate >= 90 ? 'text-green-600' :
                            stat.attendanceRate >= 75 ? 'text-yellow-600' :
                            stat.attendanceRate >= 60 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {stat.attendanceRate.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={stat.absentDays > 5 ? "destructive" : "outline"}>
                          {stat.absentDays} days
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">{stat.lateDays}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm font-medium">{stat.usedLeaveDays}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-green-600 font-medium">
                          {stat.remainingLeaveDays}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

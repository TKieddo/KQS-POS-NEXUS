import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  FileText, 
  Calendar,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { AttendanceRecord, LeaveBalance } from '../types/attendance'

interface LeaveManagementProps {
  employees: Employee[]
  leaveBalances: LeaveBalance[]
  attendanceRecords: AttendanceRecord[]
}

export function LeaveManagement({
  employees,
  leaveBalances,
  attendanceRecords
}: LeaveManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  // Calculate leave statistics
  const leaveStats = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearBalances = leaveBalances.filter(balance => balance.year === filterYear)
    
    const totalAnnualLeave = yearBalances.reduce((sum, balance) => sum + balance.total_annual_leave, 0)
    const usedAnnualLeave = yearBalances.reduce((sum, balance) => sum + balance.used_annual_leave, 0)
    const remainingAnnualLeave = yearBalances.reduce((sum, balance) => sum + balance.remaining_annual_leave, 0)
    
    const totalSickLeave = yearBalances.reduce((sum, balance) => sum + balance.total_sick_leave, 0)
    const usedSickLeave = yearBalances.reduce((sum, balance) => sum + balance.used_sick_leave, 0)
    const remainingSickLeave = yearBalances.reduce((sum, balance) => sum + balance.remaining_sick_leave, 0)
    
    const totalPersonalLeave = yearBalances.reduce((sum, balance) => sum + balance.total_personal_leave, 0)
    const usedPersonalLeave = yearBalances.reduce((sum, balance) => sum + balance.used_personal_leave, 0)
    const remainingPersonalLeave = yearBalances.reduce((sum, balance) => sum + balance.remaining_personal_leave, 0)

    return {
      totalAnnualLeave,
      usedAnnualLeave,
      remainingAnnualLeave,
      totalSickLeave,
      usedSickLeave,
      remainingSickLeave,
      totalPersonalLeave,
      usedPersonalLeave,
      remainingPersonalLeave,
      totalEmployees: yearBalances.length
    }
  }, [leaveBalances, filterYear])

  // Get employee leave details
  const employeeLeaveDetails = useMemo(() => {
    return employees.map(employee => {
      const balance = leaveBalances.find(b => 
        b.employee_id === employee.id && b.year === filterYear
      )
      
      // Get leave history from attendance records
      const leaveRecords = attendanceRecords.filter(record => 
        record.employee_id === employee.id && 
        record.status === 'leave' &&
        new Date(record.date).getFullYear() === filterYear
      )

      return {
        employee,
        balance,
        leaveRecords,
        totalLeaveDays: leaveRecords.length,
        annualLeaveUsed: balance?.used_annual_leave || 0,
        sickLeaveUsed: balance?.used_sick_leave || 0,
        personalLeaveUsed: balance?.used_personal_leave || 0,
        remainingAnnualLeave: balance?.remaining_annual_leave || 0,
        remainingSickLeave: balance?.remaining_sick_leave || 0,
        remainingPersonalLeave: balance?.remaining_personal_leave || 0
      }
    }).filter(item => 
      searchTerm === '' || 
      `${item.employee.firstName} ${item.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [employees, leaveBalances, attendanceRecords, filterYear, searchTerm])

  // Get leave type label
  const getLeaveTypeLabel = (leaveType?: string) => {
    switch (leaveType) {
      case 'annual':
        return <Badge className="bg-blue-100 text-blue-800">Annual Leave</Badge>
      case 'sick':
        return <Badge className="bg-red-100 text-red-800">Sick Leave</Badge>
      case 'personal':
        return <Badge className="bg-green-100 text-green-800">Personal Leave</Badge>
      case 'unpaid':
        return <Badge className="bg-gray-100 text-gray-800">Unpaid Leave</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          <p className="text-gray-600 mt-1">Track and manage employee leave balances</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Leave Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Year:</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Leave Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leaveStats.remainingAnnualLeave}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.usedAnnualLeave} used of {leaveStats.totalAnnualLeave} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{leaveStats.remainingSickLeave}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.usedSickLeave} used of {leaveStats.totalSickLeave} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leaveStats.remainingPersonalLeave}</div>
            <p className="text-xs text-muted-foreground">
              {leaveStats.usedPersonalLeave} used of {leaveStats.totalPersonalLeave} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              With leave balances in {filterYear}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Leave Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Employee Leave Balances - {filterYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Annual Leave</TableHead>
                  <TableHead>Sick Leave</TableHead>
                  <TableHead>Personal Leave</TableHead>
                  <TableHead>Total Used</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeLeaveDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  employeeLeaveDetails.map((item) => (
                    <TableRow key={item.employee.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.employee.firstName} {item.employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.employee.employeeId}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.remainingAnnualLeave} remaining</div>
                          <div className="text-gray-500">{item.annualLeaveUsed} used</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.remainingSickLeave} remaining</div>
                          <div className="text-gray-500">{item.sickLeaveUsed} used</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.remainingPersonalLeave} remaining</div>
                          <div className="text-gray-500">{item.personalLeaveUsed} used</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm font-medium">
                          {item.totalLeaveDays} days
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {item.balance ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            No Balance
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Leave Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Recent Leave Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(() => {
              const recentLeaveRecords = attendanceRecords
                .filter(record => record.status === 'leave')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)

              if (recentLeaveRecords.length === 0) {
                return (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent leave activity
                  </p>
                )
              }

              return recentLeaveRecords.map((record) => {
                const employee = employees.find(emp => emp.id === record.employee_id)
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()} - {record.reason}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getLeaveTypeLabel(record.leave_type)}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

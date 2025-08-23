'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  FileText, 
  Plus,
  RefreshCw
} from 'lucide-react'
import { useAttendance } from './hooks/useAttendance'
import { AttendanceStats } from './components/AttendanceStats'
import { DailyAttendance } from './components/DailyAttendance'
import { AttendanceCalendar } from './components/AttendanceCalendar'
import { AttendanceAnalytics } from './components/AttendanceAnalytics'
import { LeaveManagement } from './components/LeaveManagement'
import { AttendanceForm } from './components/AttendanceForm'
import { BulkAttendanceForm } from './components/BulkAttendanceForm'
import type { AttendanceFilters } from './types/attendance'

export default function AttendancePage() {
  const {
    attendanceRecords,
    leaveBalances,
    employees,
    loading,
    error,
    refreshData
  } = useAttendance()

  const [activeTab, setActiveTab] = useState('daily')
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    employeeId: 'all',
    status: 'all',
    divisionId: 'all'
  })

  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    const currentDate = new Date()
    const currentMonthRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentDate.getMonth() && 
             recordDate.getFullYear() === currentDate.getFullYear()
    })

    const totalDays = currentMonthRecords.length
    const presentDays = currentMonthRecords.filter(r => r.status === 'present').length
    const absentDays = currentMonthRecords.filter(r => r.status === 'absent').length
    const lateDays = currentMonthRecords.filter(r => r.status === 'late').length
    const leaveDays = currentMonthRecords.filter(r => r.status === 'leave').length

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    }
  }, [attendanceRecords])

  // Calculate leave summary
  const leaveSummary = useMemo(() => {
    const totalEmployees = employees.length
    const employeesWithLeave = leaveBalances.length
    const totalLeaveDays = leaveBalances.reduce((sum, balance) => 
      sum + balance.used_annual_leave + balance.used_sick_leave + balance.used_personal_leave, 0
    )
    const remainingLeaveDays = leaveBalances.reduce((sum, balance) => 
      sum + balance.remaining_annual_leave + balance.remaining_sick_leave + balance.remaining_personal_leave, 0
    )

    return {
      totalEmployees,
      employeesWithLeave,
      totalLeaveDays,
      remainingLeaveDays
    }
  }, [employees, leaveBalances])

  const handleRefresh = () => {
    refreshData()
  }

  const handleAttendanceSubmit = async (data: any) => {
    try {
      // Handle attendance submission
      console.log('Attendance submitted:', data)
      setShowAttendanceForm(false)
      refreshData()
    } catch (error) {
      console.error('Error submitting attendance:', error)
    }
  }

  const handleBulkAttendanceSubmit = async (data: any) => {
    try {
      // Handle bulk attendance submission
      console.log('Bulk attendance submitted:', data)
      setShowBulkForm(false)
      refreshData()
    } catch (error) {
      console.error('Error submitting bulk attendance:', error)
    }
  }

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading attendance data: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance & Leave Management</h1>
          <p className="text-gray-600 mt-1">Track employee attendance, manage leave, and analyze patterns</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowBulkForm(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Bulk Entry
          </Button>
          <Button onClick={() => setShowAttendanceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthStats.presentDays} present / {currentMonthStats.totalDays} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthStats.absentDays}</div>
            <p className="text-xs text-muted-foreground">
              {currentMonthStats.lateDays} late, {currentMonthStats.leaveDays} on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveSummary.remainingLeaveDays}</div>
            <p className="text-xs text-muted-foreground">
              {leaveSummary.totalLeaveDays} days used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Attendance
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Leave Management
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <DailyAttendance 
            employees={employees}
            attendanceRecords={attendanceRecords}
            filters={filters}
            onFiltersChange={setFilters}
            onEditAttendance={(employeeId) => {
              setSelectedEmployee(employeeId)
              setShowAttendanceForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <AttendanceCalendar 
            employees={employees}
            attendanceRecords={attendanceRecords}
            onDateSelect={(date, employeeId) => {
              setSelectedEmployee(employeeId)
              setShowAttendanceForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AttendanceAnalytics 
            attendanceRecords={attendanceRecords}
            employees={employees}
            leaveBalances={leaveBalances}
          />
        </TabsContent>

        <TabsContent value="leave" className="space-y-6">
          <LeaveManagement 
            employees={employees}
            leaveBalances={leaveBalances}
            attendanceRecords={attendanceRecords}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <AttendanceStats 
            employees={employees}
            attendanceRecords={attendanceRecords}
            leaveBalances={leaveBalances}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showAttendanceForm && (
        <AttendanceForm
          employee={selectedEmployee ? employees.find(emp => emp.id === selectedEmployee) : undefined}
          employees={employees}
          onSubmit={handleAttendanceSubmit}
          onCancel={() => {
            setShowAttendanceForm(false)
            setSelectedEmployee(null)
          }}
        />
      )}

      {showBulkForm && (
        <BulkAttendanceForm
          employees={employees}
          onSubmit={handleBulkAttendanceSubmit}
          onCancel={() => setShowBulkForm(false)}
        />
      )}
    </div>
  )
}

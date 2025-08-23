'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Clock4, 
  Heart, 
  Sun, 
  Flag, 
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Search,
  User,
  Filter
} from 'lucide-react'

import { Employee, AttendanceRecord } from '../hooks/useAttendance'

interface CalendarViewProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  selectedDate: string
  onDateSelect: (date: string) => void
  onEmployeeSelect: (employee: Employee) => void
}

export function CalendarView({ 
  employees, 
  attendanceRecords, 
  selectedDate, 
  onDateSelect, 
  onEmployeeSelect 
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [employees, searchQuery])

  // Filter attendance records based on selected employee
  const filteredAttendanceRecords = useMemo(() => {
    if (selectedEmployee === 'all') {
      return attendanceRecords
    }
    return attendanceRecords.filter(record => record.employee_id === selectedEmployee)
  }, [attendanceRecords, selectedEmployee])

  // Get selected employee object
  const selectedEmployeeObj = useMemo(() => {
    if (selectedEmployee === 'all') return null
    return employees.find(emp => emp.id === selectedEmployee)
  }, [employees, selectedEmployee])

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayRecords = filteredAttendanceRecords.filter(r => r.date === dateStr)
      
      days.push({
        date: new Date(current),
        dateStr,
        records: dayRecords,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentMonth, filteredAttendanceRecords])

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200'
      case 'absent': return 'bg-red-100 text-red-800 border-red-200'
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'half_day': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sick_leave': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'annual_leave': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'unpaid_leave': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-3 w-3" />
      case 'absent': return <XCircle className="h-3 w-3" />
      case 'late': return <Clock className="h-3 w-3" />
      case 'half_day': return <Clock4 className="h-3 w-3" />
      case 'sick_leave': return <Heart className="h-3 w-3" />
      case 'annual_leave': return <Sun className="h-3 w-3" />
      case 'unpaid_leave': return <Flag className="h-3 w-3" />
      default: return <AlertTriangle className="h-3 w-3" />
    }
  }

  const getAttendanceSummary = (dateStr: string) => {
    const dayRecords = filteredAttendanceRecords.filter(r => r.date === dateStr)
    const totalEmployees = selectedEmployee === 'all' ? employees.length : 1
    const present = dayRecords.filter(r => r.status === 'present').length
    const absent = dayRecords.filter(r => r.status === 'absent').length
    const late = dayRecords.filter(r => r.status === 'late').length
    const onLeave = dayRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length
    
    return { totalEmployees, present, absent, late, onLeave }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Calculate monthly statistics for selected employee
  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthRecords = filteredAttendanceRecords.filter(r => {
      const recordDate = new Date(r.date)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month
    })
    
    const totalDays = new Date(year, month + 1, 0).getDate()
    const totalPossible = selectedEmployee === 'all' ? employees.length * totalDays : totalDays
    const present = monthRecords.filter(r => r.status === 'present').length
    const absent = monthRecords.filter(r => r.status === 'absent').length
    const late = monthRecords.filter(r => r.status === 'late').length
    const onLeave = monthRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length
    
    return {
      totalDays,
      totalPossible,
      present,
      absent,
      late,
      onLeave,
      attendanceRate: totalPossible > 0 ? Math.round((present / totalPossible) * 100) : 0
    }
  }, [currentMonth, filteredAttendanceRecords, employees, selectedEmployee])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-6 text-white shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Attendance Calendar</h2>
              <p className="text-gray-300 text-sm">
                {selectedEmployeeObj ? `${selectedEmployeeObj.name}'s attendance` : 'All employees attendance'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="text-xl font-bold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Filter */}
      <Card className="bg-white border-gray-200 shadow-xl rounded-xl">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 py-4">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
            <Filter className="h-5 w-5 text-blue-400" />
            Employee Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-80">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60">
                  <SelectItem value="all" className="hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>All Employees</span>
                    </div>
                  </SelectItem>
                  {filteredEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id} className="hover:bg-gray-100">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.position}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Attendance Rate</p>
                <p className="text-2xl font-bold text-green-800 mt-1">{monthlyStats.attendanceRate}%</p>
                <p className="text-xs text-green-600">
                  {selectedEmployeeObj ? `${selectedEmployeeObj.name}` : 'All employees'} this month
                </p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Present Days</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">{monthlyStats.present}</p>
                <p className="text-xs text-blue-600">
                  {selectedEmployeeObj ? `${selectedEmployeeObj.name}` : 'Total'} recorded
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Absent Days</p>
                <p className="text-2xl font-bold text-red-800 mt-1">{monthlyStats.absent}</p>
                <p className="text-xs text-red-600">
                  {selectedEmployeeObj ? `${selectedEmployeeObj.name}` : 'Total'} recorded
                </p>
              </div>
              <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-xl rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Leave Days</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">{monthlyStats.onLeave}</p>
                <p className="text-xs text-purple-600">
                  {selectedEmployeeObj ? `${selectedEmployeeObj.name}` : 'Total'} recorded
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="bg-white border-gray-200 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 py-4">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
            <Calendar className="h-5 w-5 text-blue-400" />
            {selectedEmployeeObj ? `${selectedEmployeeObj.name}'s Calendar` : 'Monthly Calendar View'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm text-gray-700 bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarData.map((day, index) => {
              const summary = getAttendanceSummary(day.dateStr)
              const isSelected = day.dateStr === selectedDate
              const attendanceRate = summary.totalEmployees > 0 ? Math.round((summary.present / summary.totalEmployees) * 100) : 0
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-3 border rounded-xl cursor-pointer transition-all duration-300
                    ${day.isCurrentMonth ? 'bg-white hover:shadow-lg' : 'bg-gray-50'}
                    ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    ${isSelected ? 'ring-2 ring-black bg-black text-white' : ''}
                    ${!day.isCurrentMonth ? 'opacity-50' : ''}
                  `}
                  onClick={() => onDateSelect(day.dateStr)}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Attendance Summary */}
                  {day.isCurrentMonth && summary.totalEmployees > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${isSelected ? 'text-green-300' : 'text-green-600'}`}>
                          ✓ {summary.present}
                        </span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-red-300' : 'text-red-600'}`}>
                          ✗ {summary.absent}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${attendanceRate}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-center font-medium">
                        {attendanceRate}%
                      </div>
                    </div>
                  )}
                  
                  {/* Quick Status Indicators */}
                  {day.isCurrentMonth && day.records.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {day.records.slice(0, 2).map(record => {
                        const employee = employees.find(emp => emp.id === record.employee_id)
                        if (!employee) return null
                        
                        return (
                          <div
                            key={record.id}
                            className="flex items-center gap-1 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEmployeeSelect(employee)
                            }}
                          >
                            <Badge className={`${getStatusColor(record.status)} text-xs px-1 py-0`}>
                              {getStatusIcon(record.status)}
                            </Badge>
                          </div>
                        )
                      })}
                      
                      {day.records.length > 2 && (
                        <div className={`text-xs font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          +{day.records.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200 shadow-xl rounded-xl">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 py-4">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
              <Users className="h-5 w-5 text-blue-400" />
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
              {selectedEmployeeObj && ` - ${selectedEmployeeObj.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const dayRecords = filteredAttendanceRecords.filter(r => r.date === selectedDate)
              const summary = getAttendanceSummary(selectedDate)
              
              if (dayRecords.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h3>
                    <p className="text-gray-600">
                      {selectedEmployeeObj 
                        ? `No attendance has been recorded for ${selectedEmployeeObj.name} on this date.`
                        : 'No attendance has been recorded for this date.'
                      }
                    </p>
                  </div>
                )
              }
              
              return (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{summary.present}</div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{summary.absent}</div>
                      <div className="text-sm text-red-600">Absent</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">{summary.late}</div>
                      <div className="text-sm text-yellow-600">Late</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{summary.onLeave}</div>
                      <div className="text-sm text-blue-600">On Leave</div>
                    </div>
                  </div>
                  
                  {/* Employee List */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {selectedEmployeeObj ? 'Employee Details' : 'Employee Details'}
                    </h4>
                    {dayRecords.map(record => {
                      const employee = employees.find(emp => emp.id === record.employee_id)
                      if (!employee) return null
                      
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onEmployeeSelect(employee)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-600">{employee.position}</div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1">{record.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="bg-white border-gray-200 shadow-xl rounded-xl">
        <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 py-4">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-white">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            Attendance Legend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-green-800">Present</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                <XCircle className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-red-800">Absent</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-yellow-800">Late</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <Clock4 className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-orange-800">Half Day</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Heart className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-blue-800">Sick Leave</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                <Sun className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-purple-800">Annual Leave</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                <Flag className="h-3 w-3" />
              </Badge>
              <span className="text-sm font-medium text-gray-800">Unpaid Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

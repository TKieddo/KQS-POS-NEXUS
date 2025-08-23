import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import { ATTENDANCE_STATUSES } from '../types/attendance'

interface AttendanceCalendarProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  onDateSelect: (date: string, employeeId?: string) => void
}

export function AttendanceCalendar({
  employees,
  attendanceRecords,
  onDateSelect
}: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDay = new Date(startDate)
    
    while (currentDay <= lastDay || currentDay.getDay() !== 0) {
      const dateString = currentDay.toISOString().split('T')[0]
      const isCurrentMonth = currentDay.getMonth() === month
      const isToday = currentDay.toDateString() === new Date().toDateString()
      
      // Get attendance for this date
      const dayAttendance = selectedEmployee === 'all' 
        ? attendanceRecords.filter(record => record.date === dateString)
        : attendanceRecords.filter(record => 
            record.date === dateString && record.employee_id === selectedEmployee
          )
      
      days.push({
        date: dateString,
        dayOfWeek: currentDay.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: currentDay.getDate(),
        isCurrentMonth,
        isToday,
        isWeekend: currentDay.getDay() === 0 || currentDay.getDay() === 6,
        attendance: dayAttendance,
        totalEmployees: employees.length,
        presentCount: dayAttendance.filter(a => a.status === 'present').length,
        absentCount: dayAttendance.filter(a => a.status === 'absent').length,
        lateCount: dayAttendance.filter(a => a.status === 'late').length,
        leaveCount: dayAttendance.filter(a => a.status === 'leave').length
      })
      
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }, [currentDate, attendanceRecords, employees, selectedEmployee])

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get status color
  const getStatusColor = (status: AttendanceStatus) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status)
    if (!statusConfig) return 'gray'
    return statusConfig.color
  }

  // Get attendance summary for a day
  const getDaySummary = (day: any) => {
    if (day.attendance.length === 0) return null
    
    const total = day.attendance.length
    const present = day.presentCount
    const absent = day.absentCount
    const late = day.lateCount
    const leave = day.leaveCount
    
    return { total, present, absent, late, leave }
  }

  // Get day background color based on attendance
  const getDayBackgroundColor = (day: any) => {
    if (day.attendance.length === 0) return 'bg-gray-50'
    
    const summary = getDaySummary(day)
    if (!summary) return 'bg-gray-50'
    
    const attendanceRate = (summary.present / summary.total) * 100
    
    if (attendanceRate >= 90) return 'bg-green-50 border-green-200'
    if (attendanceRate >= 75) return 'bg-yellow-50 border-yellow-200'
    if (attendanceRate >= 50) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Attendance Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Employee Filter */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filter by Employee:</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm">On Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-sm">No Record</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${getDayBackgroundColor(day)}
                hover:bg-gray-100
              `}
              onClick={() => onDateSelect(day.date)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-sm font-medium
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'text-blue-600 font-bold' : ''}
                `}>
                  {day.dayNumber}
                </span>
                {day.isWeekend && (
                  <span className="text-xs text-gray-400">Weekend</span>
                )}
              </div>

              {/* Attendance Summary */}
              {day.attendance.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">{day.presentCount}</span>
                  </div>
                  {day.absentCount > 0 && (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600">{day.absentCount}</span>
                    </div>
                  )}
                  {day.lateCount > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs text-yellow-600">{day.lateCount}</span>
                    </div>
                  )}
                  {day.leaveCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-600">{day.leaveCount}</span>
                    </div>
                  )}
                </div>
              )}

              {/* No Record Indicator */}
              {day.attendance.length === 0 && day.isCurrentMonth && (
                <div className="flex items-center gap-1 mt-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">No record</span>
                </div>
              )}

              {/* Attendance Rate Badge */}
              {day.attendance.length > 0 && (
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {Math.round((day.presentCount / day.attendance.length) * 100)}%
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Month Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Month Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Days:</span>
              <span className="ml-2 font-medium">
                {calendarDays.filter(d => d.isCurrentMonth && d.attendance.length > 0).length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Average Attendance:</span>
              <span className="ml-2 font-medium">
                {(() => {
                  const daysWithAttendance = calendarDays.filter(d => 
                    d.isCurrentMonth && d.attendance.length > 0
                  )
                  if (daysWithAttendance.length === 0) return '0%'
                  
                  const totalPresent = daysWithAttendance.reduce((sum, day) => 
                    sum + day.presentCount, 0
                  )
                  const totalAttendance = daysWithAttendance.reduce((sum, day) => 
                    sum + day.attendance.length, 0
                  )
                  
                  return `${Math.round((totalPresent / totalAttendance) * 100)}%`
                })()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Absences:</span>
              <span className="ml-2 font-medium">
                {calendarDays.filter(d => d.isCurrentMonth).reduce((sum, day) => 
                  sum + day.absentCount, 0
                )}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Leave Days:</span>
              <span className="ml-2 font-medium">
                {calendarDays.filter(d => d.isCurrentMonth).reduce((sum, day) => 
                  sum + day.leaveCount, 0
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

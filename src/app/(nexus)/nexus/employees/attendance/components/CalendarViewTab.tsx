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
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sun,
  Heart,
  Flag,
  Home,
  AlertTriangle
} from 'lucide-react'
import type { Employee } from '../../types/employee'
import type { AttendanceRecord } from '../../types/attendance'
import { ATTENDANCE_STATUSES } from '../../types/attendance'

interface CalendarViewTabProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  selectedEmployee: string
  onEmployeeSelect: (employeeId: string) => void
}

export function CalendarViewTab({
  employees,
  attendanceRecords,
  selectedEmployee,
  onEmployeeSelect
}: CalendarViewTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(selectedEmployee)

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const firstDayWeekday = firstDayOfMonth.getDay()

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day))
    }
    
    return days
  }, [currentYear, currentMonth, firstDayWeekday, daysInMonth])

  // Get attendance for a specific date
  const getAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return attendanceRecords.filter(record => 
      record.date === dateString && 
      (selectedEmployeeId ? record.employeeId === selectedEmployeeId : true)
    )
  }

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'present':
        return { icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600', bg: 'bg-green-100' }
      case 'absent':
        return { icon: <XCircle className="h-3 w-3" />, color: 'text-red-600', bg: 'bg-red-100' }
      case 'late':
        return { icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600', bg: 'bg-yellow-100' }
      case 'half_day':
        return { icon: <Sun className="h-3 w-3" />, color: 'text-orange-600', bg: 'bg-orange-100' }
      case 'sick_leave':
        return { icon: <Heart className="h-3 w-3" />, color: 'text-purple-600', bg: 'bg-purple-100' }
      case 'annual_leave':
        return { icon: <Calendar className="h-3 w-3" />, color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'public_holiday':
        return { icon: <Flag className="h-3 w-3" />, color: 'text-indigo-600', bg: 'bg-indigo-100' }
      case 'weekend':
        return { icon: <Home className="h-3 w-3" />, color: 'text-slate-600', bg: 'bg-slate-100' }
      default:
        return { icon: <AlertTriangle className="h-3 w-3" />, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    onEmployeeSelect(employeeId)
  }

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(currentYear, month).toLocaleString('default', { month: 'long' })
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear()
  }

  // Check if date is weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {getMonthName(currentMonth)} {currentYear}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentMonth}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Attendance Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {ATTENDANCE_STATUSES.map((status) => {
              const display = getStatusDisplay(status.value)
              return (
                <div key={status.value} className="flex items-center gap-2 text-sm">
                  <div className={`p-1 rounded ${display.bg}`}>
                    {display.icon}
                  </div>
                  <span className="text-gray-700">{status.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24 border border-gray-200 bg-gray-50" />
              }

              const attendanceForDate = getAttendanceForDate(date)
              const isWeekendDay = isWeekend(date)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={index}
                  className={`h-24 border border-gray-200 p-2 relative ${
                    isTodayDate ? 'bg-blue-50 border-blue-300' : 
                    isWeekendDay ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-blue-600' : 
                    isWeekendDay ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                    {isTodayDate && <span className="ml-1 text-xs">•</span>}
                  </div>

                  {/* Attendance Indicators */}
                  <div className="space-y-1">
                    {attendanceForDate.length > 0 ? (
                      attendanceForDate.map((record, recordIndex) => {
                        const display = getStatusDisplay(record.status)
                        const employee = employees.find(e => e.id === record.employeeId)
                        
                        return (
                          <div
                            key={recordIndex}
                            className={`flex items-center gap-1 p-1 rounded text-xs ${display.bg}`}
                            title={`${employee?.firstName} ${employee?.lastName}: ${ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label}`}
                          >
                            {display.icon}
                            <span className={`${display.color} truncate`}>
                              {employee ? `${employee.firstName} ${employee.lastName.charAt(0)}` : 'Unknown'}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        {isWeekendDay ? 'Weekend' : 'No records'}
                      </div>
                    )}
                  </div>

                  {/* Attendance Count */}
                  {attendanceForDate.length > 0 && (
                    <div className="absolute bottom-1 right-1">
                      <Badge variant="outline" className="text-xs">
                        {attendanceForDate.length}
                      </Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {ATTENDANCE_STATUSES.map((status) => {
              const monthRecords = attendanceRecords.filter(record => {
                const recordDate = new Date(record.date)
                return record.status === status.value &&
                       recordDate.getMonth() === currentMonth &&
                       recordDate.getFullYear() === currentYear &&
                       (selectedEmployeeId ? record.employeeId === selectedEmployeeId : true)
              })

              const display = getStatusDisplay(status.value)
              
              return (
                <div key={status.value} className="text-center">
                  <div className={`inline-flex items-center gap-2 p-2 rounded-lg ${display.bg}`}>
                    {display.icon}
                    <span className={`font-semibold ${display.color}`}>
                      {monthRecords.length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{status.label}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

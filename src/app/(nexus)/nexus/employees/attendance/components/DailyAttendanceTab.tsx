import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CheckCircle,
  XCircle,
  Clock,
  Sun,
  Heart,
  Calendar,
  Flag,
  Home,
  Plus,
  Save,
  Users,
  Filter,
  Search,
  Clock4,
  AlertTriangle
} from 'lucide-react'
import { useAttendance } from '../../hooks/useAttendance'
import { AttendanceForm } from './AttendanceForm'
import { BulkAttendanceForm } from './BulkAttendanceForm'
import type { Employee, Division } from '../../types/employee'
import type { AttendanceRecord, AttendanceFilters } from '../../types/attendance'
import { ATTENDANCE_STATUSES, DEDUCTION_TYPES } from '../../types/attendance'

interface DailyAttendanceTabProps {
  employees: Employee[]
  divisions: Division[]
  attendanceRecords: AttendanceRecord[]
  selectedDate: string
  onDateChange: (date: string) => void
  onEmployeeSelect: (employeeId: string) => void
  onFiltersChange: (filters: AttendanceFilters) => void
  filters: AttendanceFilters
}

export function DailyAttendanceTab({
  employees,
  divisions,
  attendanceRecords,
  selectedDate,
  onDateChange,
  onEmployeeSelect,
  onFiltersChange,
  filters
}: DailyAttendanceTabProps) {
  const { createAttendanceRecord, updateAttendanceRecord, createBulkAttendance } = useAttendance()
  
  const [showAttendanceForm, setShowAttendanceForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('all')

  // Filter employees based on search and division
  const filteredEmployees = useMemo(() => {
    let filtered = employees

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(employee =>
        employee.firstName.toLowerCase().includes(term) ||
        employee.lastName.toLowerCase().includes(term) ||
        employee.employeeId.toLowerCase().includes(term)
      )
    }

    if (selectedDivision && selectedDivision !== 'all') {
      filtered = filtered.filter(employee => employee.divisionId === selectedDivision)
    }

    return filtered
  }, [employees, searchTerm, selectedDivision])

  // Get today's attendance records
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter(record => record.date === selectedDate)
  }, [attendanceRecords, selectedDate])

  // Create a map of employee attendance for today
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    todayRecords.forEach(record => {
      map.set(record.employeeId, record)
    })
    return map
  }, [todayRecords])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'half_day':
        return <Sun className="h-4 w-4 text-orange-600" />
      case 'sick_leave':
        return <Heart className="h-4 w-4 text-purple-600" />
      case 'annual_leave':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'public_holiday':
        return <Flag className="h-4 w-4 text-indigo-600" />
      case 'weekend':
        return <Home className="h-4 w-4 text-slate-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'half_day':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sick_leave':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'annual_leave':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'public_holiday':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'weekend':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    const statusOption = ATTENDANCE_STATUSES.find(s => s.value === status)
    return statusOption ? statusOption.label : status
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowAttendanceForm(true)
  }

  const handleBulkAttendance = () => {
    setShowBulkForm(true)
  }

  const handleAttendanceSubmit = async (data: any) => {
    try {
      if (data.id) {
        await updateAttendanceRecord(data.id, data)
      } else {
        await createAttendanceRecord(data)
      }
      setShowAttendanceForm(false)
      setSelectedEmployee(null)
    } catch (error) {
      console.error('Error saving attendance:', error)
    }
  }

  const handleBulkSubmit = async (data: any) => {
    try {
      await createBulkAttendance(data)
      setShowBulkForm(false)
    } catch (error) {
      console.error('Error saving bulk attendance:', error)
    }
  }

  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivision(divisionId)
    onFiltersChange({ ...filters, divisionId })
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = filteredEmployees.length
    const present = todayRecords.filter(r => r.status === 'present').length
    const absent = todayRecords.filter(r => r.status === 'absent').length
    const late = todayRecords.filter(r => r.status === 'late').length
    const onLeave = todayRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length
    const recorded = todayRecords.length

    return {
      total,
      present,
      absent,
      late,
      onLeave,
      recorded,
      pending: total - recorded
    }
  }, [filteredEmployees, todayRecords])

  return (
    <div className="space-y-6">
      {/* Header with Date and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <Label htmlFor="date" className="text-sm font-medium">Date:</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <Select value={selectedDivision || "all"} onValueChange={handleDivisionChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkAttendance}>
            <Users className="h-4 w-4 mr-2" />
            Bulk Attendance
          </Button>
          <Button onClick={() => setShowAttendanceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
            <div className="text-sm text-gray-600">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summaryStats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.onLeave}</div>
            <div className="text-sm text-gray-600">On Leave</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.recorded}</div>
            <div className="text-sm text-gray-600">Recorded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{summaryStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Attendance - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No employees found matching your criteria.
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const attendance = attendanceMap.get(employee.id)
                const division = divisions.find(d => d.id === employee.divisionId)
                
                return (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {attendance ? getStatusIcon(attendance.status) : <AlertTriangle className="h-4 w-4 text-gray-400" />}
                        <div>
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.employeeId} • {division?.name || 'Unknown Division'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {attendance ? (
                        <>
                          <Badge className={getStatusColor(attendance.status)}>
                            {getStatusLabel(attendance.status)}
                          </Badge>
                          
                          {attendance.checkInTime && (
                            <div className="text-sm text-gray-600">
                              <Clock4 className="h-3 w-3 inline mr-1" />
                              {attendance.checkInTime}
                            </div>
                          )}
                          
                          {attendance.checkOutTime && (
                            <div className="text-sm text-gray-600">
                              <Clock4 className="h-3 w-3 inline mr-1" />
                              {attendance.checkOutTime}
                            </div>
                          )}
                          
                          {attendance.reason && (
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {attendance.reason}
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Recorded
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showAttendanceForm && (
        <AttendanceForm
          employee={selectedEmployee}
          date={selectedDate}
          attendance={selectedEmployee ? attendanceMap.get(selectedEmployee.id) : null}
          onSubmit={handleAttendanceSubmit}
          onCancel={() => {
            setShowAttendanceForm(false)
            setSelectedEmployee(null)
          }}
        />
      )}

      {showBulkForm && (
        <BulkAttendanceForm
          employees={filteredEmployees}
          date={selectedDate}
          onSubmit={handleBulkSubmit}
          onCancel={() => setShowBulkForm(false)}
        />
      )}
    </div>
  )
}

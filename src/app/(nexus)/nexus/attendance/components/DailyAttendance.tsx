import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react'
import type { Employee, Division } from '../../employees/types/employee'
import type { AttendanceRecord, AttendanceFilters, AttendanceStatus } from '../types/attendance'
import { ATTENDANCE_STATUSES } from '../types/attendance'

interface DailyAttendanceProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
  filters: AttendanceFilters
  onFiltersChange: (filters: AttendanceFilters) => void
  onEditAttendance: (employeeId: string) => void
}

export function DailyAttendance({
  employees,
  attendanceRecords,
  filters,
  onFiltersChange,
  onEditAttendance
}: DailyAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Get divisions from employees
  const divisions = useMemo(() => {
    const divisionMap = new Map<string, Division>()
    employees.forEach(emp => {
      if (emp.divisionId) {
        // Mock division data - in real app, this would come from divisions table
        divisionMap.set(emp.divisionId, {
          id: emp.divisionId,
          name: `Division ${emp.divisionId}`,
          code: `DIV${emp.divisionId}`,
          description: '',
          is_active: true
        })
      }
    })
    return Array.from(divisionMap.values())
  }, [employees])

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDivision = filters.divisionId === 'all' || employee.divisionId === filters.divisionId

      return matchesSearch && matchesDivision
    })
  }, [employees, searchTerm, filters.divisionId])

  // Get attendance for selected date
  const getAttendanceForDate = (employeeId: string, date: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(record => 
      record.employee_id === employeeId && record.date === date
    )
  }

  // Get status badge
  const getStatusBadge = (status: AttendanceStatus) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status)
    if (!statusConfig) return null

    const colorMap = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800'
    }

    return (
      <Badge className={colorMap[statusConfig.color as keyof typeof colorMap]}>
        {statusConfig.label}
      </Badge>
    )
  }

  // Get status icon
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'half_day':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'leave':
        return <Calendar className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  // Format time
  const formatTime = (time?: string) => {
    if (!time) return '-'
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get division name
  const getDivisionName = (divisionId?: string) => {
    if (!divisionId) return 'No Division'
    const division = divisions.find(d => d.id === divisionId)
    return division?.name || 'Unknown Division'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Daily Attendance - {new Date(filters.dateRange.start).toLocaleDateString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                onFiltersChange({
                  ...filters,
                  dateRange: { start: today, end: today }
                })
              }}
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { start: e.target.value, end: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select 
              value={filters.divisionId} 
              onValueChange={(value) => onFiltersChange({ ...filters, divisionId: value })}
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => onFiltersChange({ ...filters, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {ATTENDANCE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  const attendance = getAttendanceForDate(employee.id, filters.dateRange.start)
                  
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {getDivisionName(employee.divisionId)}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {attendance ? (
                            <>
                              {getStatusIcon(attendance.status)}
                              {getStatusBadge(attendance.status)}
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 text-gray-400" />
                              <Badge variant="outline">Not Recorded</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">
                          {attendance?.check_in_time ? formatTime(attendance.check_in_time) : '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm">
                          {attendance?.check_out_time ? formatTime(attendance.check_out_time) : '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-600 max-w-[200px] truncate">
                          {attendance?.notes || '-'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEditAttendance(employee.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {attendance ? 'Edit' : 'Record'} Attendance
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredEmployees.length} of {employees.length} employees
          </span>
          <span>
            {filteredEmployees.filter(emp => {
              const attendance = getAttendanceForDate(emp.id, filters.dateRange.start)
              return attendance?.status === 'present'
            }).length} present today
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

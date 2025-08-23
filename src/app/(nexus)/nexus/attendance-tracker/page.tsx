'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar,
  Clock,
  Users,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  CalendarDays,
  UserCheck,
  UserX,
  Clock4,
  Sun,
  Heart,
  Flag,
  Home,
  Edit,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react'
import { NexusHeader } from '@/components/layout/NexusHeader'
import { AttendanceForm } from './components/AttendanceForm'
import { LeaveRequestForm } from './components/LeaveRequestForm'
import { EmployeeLeaveDetails } from './components/EmployeeLeaveDetails'
import { LeaveRequestDetails } from './components/LeaveRequestDetails'

import { CalendarView } from './components/CalendarView'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { useBranch } from '@/context/BranchContext'
import { useAttendance, Employee, AttendanceRecord, LeaveRequest, LeaveBalance } from './hooks/useAttendance'

export default function AttendanceTrackerPage() {
  const { selectedBranch } = useBranch()
  const [activeTab, setActiveTab] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState('all')
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showEmployeeLeaveDetails, setShowEmployeeLeaveDetails] = useState<Employee | null>(null)
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null)

  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())

  // Use the attendance hook for all database operations
  const {
    employees,
    attendanceRecords,
    leaveRequests,
    leaveBalances,
    loading,
    error,
    saveAttendanceRecord,
    bulkSaveAttendanceRecords,
    createLeaveRequest,
    updateLeaveRequestStatus,
    saveLeaveBalance,
    initializeLeaveBalance,
    calculateLeaveDays,
    clearError
  } = useAttendance()

  // Filtered data
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDivision = divisionFilter === 'all' || emp.division === divisionFilter
    const matchesBranch = !selectedBranch || 
      selectedBranch.id === '00000000-0000-0000-0000-000000000001' || // Central Warehouse
      emp.branch_id === selectedBranch.id
    return matchesSearch && matchesDivision && matchesBranch && emp.is_active
  })

  const todayRecords = attendanceRecords.filter(r => r.date === selectedDate)
  const divisions = [...new Set(employees.map(emp => emp.division))]

  // Calculate statistics
  const stats = {
    today: {
      total: filteredEmployees.length,
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: todayRecords.filter(r => r.status === 'absent').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      onLeave: todayRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length,
      rate: filteredEmployees.length > 0 ? Math.round((todayRecords.filter(r => r.status === 'present').length / filteredEmployees.length) * 100) : 0
    },
    leaveRequests: {
      pending: leaveRequests.filter(r => r.status === 'pending').length,
      approved: leaveRequests.filter(r => r.status === 'approved').length,
      rejected: leaveRequests.filter(r => r.status === 'rejected').length
    }
  }

  // Functions
  const handleRecordAttendance = async (employee: Employee, status: AttendanceRecord['status'], times?: { checkIn?: string, checkOut?: string }, reason?: string) => {
    try {
      const record = {
        employee_id: employee.id,
        employee_name: employee.name,
        date: selectedDate,
        check_in_time: times?.checkIn,
        check_out_time: times?.checkOut,
        status,
        reason,
        deduction_type: status === 'absent' ? ('leave_days' as const) : ('none' as const)
      }

      await saveAttendanceRecord(record)
      setSelectedEmployee(null)
    } catch (err) {
      console.error('Failed to save attendance record:', err)
    }
  }

  const handleBulkAttendance = async (status: AttendanceRecord['status'], deductionType?: 'leave_days' | 'salary' | 'none') => {
    try {
      const records = filteredEmployees.map(emp => ({
        employee_id: emp.id,
        employee_name: emp.name,
        date: selectedDate,
        status,
        deduction_type: deductionType || 'none'
      }))

      await bulkSaveAttendanceRecords(records)
    } catch (err) {
      console.error('Failed to save bulk attendance records:', err)
    }
  }

  const handleLeaveRequest = async (data: any) => {
    try {
      const request = {
        employee_id: data.employeeId,
        employee_name: data.employeeName,
        start_date: data.startDate,
        end_date: data.endDate,
        leave_type: data.leaveType,
        reason: data.reason,
        deduction_type: data.deductionType,
        number_of_days: data.numberOfDays,
        status: 'pending' as const
      }

      await createLeaveRequest(request)
      setShowLeaveForm(false)
    } catch (err) {
      console.error('Failed to create leave request:', err)
    }
  }

  const handleEmployeeSelection = (employeeId: string, checked: boolean) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(employeeId)
      } else {
        newSet.delete(employeeId)
      }
      return newSet
    })
  }

  const handleBulkMarkAttendance = async (status: AttendanceRecord['status']) => {
    try {
      const selectedEmployeeList = filteredEmployees.filter(emp => selectedEmployees.has(emp.id))
      const records = selectedEmployeeList.map(emp => ({
        employee_id: emp.id,
        employee_name: emp.name,
        date: selectedDate,
        status,
        deduction_type: status === 'absent' ? 'leave_days' as const : 'none' as const
      }))

      await bulkSaveAttendanceRecords(records)
      setSelectedEmployees(new Set())
    } catch (err) {
      console.error('Failed to save bulk attendance records:', err)
    }
  }

  const handleApproveLeaveRequest = async (requestId: string) => {
    try {
      await updateLeaveRequestStatus(requestId, 'approved')
      setSelectedLeaveRequest(null)
    } catch (err) {
      console.error('Failed to approve leave request:', err)
    }
  }

  const handleRejectLeaveRequest = async (requestId: string) => {
    try {
      await updateLeaveRequestStatus(requestId, 'rejected')
      setSelectedLeaveRequest(null)
    } catch (err) {
      console.error('Failed to reject leave request:', err)
    }
  }

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
      case 'present': return <CheckCircle className="h-4 w-4" />
      case 'absent': return <XCircle className="h-4 w-4" />
      case 'late': return <Clock className="h-4 w-4" />
      case 'half_day': return <Clock4 className="h-4 w-4" />
      case 'sick_leave': return <Heart className="h-4 w-4" />
      case 'annual_leave': return <Sun className="h-4 w-4" />
      case 'unpaid_leave': return <Flag className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

    // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <NexusHeader 
          title="Attendance Tracker" 
          subtitle="Comprehensive employee attendance and leave management" 
          backUrl="/nexus"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <NexusHeader 
          title="Attendance Tracker" 
          subtitle="Comprehensive employee attendance and leave management" 
          backUrl="/nexus"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={clearError}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <NexusHeader 
        title="Attendance Tracker" 
        subtitle="Comprehensive employee attendance and leave management" 
        backUrl="/nexus"
      />
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Present Today</p>
                <p className="text-2xl font-bold text-green-700">{stats.today.present}/{stats.today.total}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Absent Today</p>
                <p className="text-2xl font-bold text-red-700">{stats.today.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Late Today</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.today.late}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">{stats.today.rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

             {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
         <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-100 border border-gray-200 rounded-xl p-1">
           <TabsTrigger value="daily" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">
             <Calendar className="h-4 w-4" />
             Daily
           </TabsTrigger>
           <TabsTrigger value="calendar" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">
             <CalendarDays className="h-4 w-4" />
             Calendar
           </TabsTrigger>
           <TabsTrigger value="leave" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">
             <Heart className="h-4 w-4" />
             Leave
           </TabsTrigger>
           <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-black data-[state=active]:text-white transition-all duration-300">
             <BarChart3 className="h-4 w-4" />
             Analytics
           </TabsTrigger>
         </TabsList>

        {/* Daily Attendance Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Daily Attendance - {selectedDate}
                </CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {/* Filters */}
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <Input
                       placeholder="Search employees..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="max-w-sm"
                     />
                   </div>
                   <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                     <SelectTrigger className="w-48">
                       <SelectValue placeholder="All Divisions" />
                     </SelectTrigger>
                     <SelectContent className="bg-white border border-gray-200 shadow-lg">
                       <SelectItem value="all" className="hover:bg-gray-100">All Divisions</SelectItem>
                       {divisions.map(division => (
                         <SelectItem key={division} value={division} className="hover:bg-gray-100">{division}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   
                 </div>

                                 {/* Bulk Actions */}
                 <div className="flex gap-2 items-center">
                   {selectedEmployees.size > 0 && (
                     <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => handleBulkMarkAttendance('present')}>
                         Mark Selected Present ({selectedEmployees.size})
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => handleBulkMarkAttendance('absent')}>
                         Mark Selected Absent ({selectedEmployees.size})
                       </Button>
                     </div>
                   )}
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={() => handleBulkAttendance('present')}>
                       Mark All Present
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => handleBulkAttendance('absent', 'leave_days')}>
                       Mark All Absent (Leave)
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => handleBulkAttendance('absent', 'salary')}>
                       Mark All Absent (Salary)
                     </Button>
                   </div>
                 </div>

                                 {/* Employee List */}
                 <div className="space-y-2">
                   {filteredEmployees.map(employee => {
                                           const record = todayRecords.find(r => r.employee_id === employee.id)
                     const isSelected = selectedEmployees.has(employee.id)
                     return (
                       <Card key={employee.id} className="p-4">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <input
                               type="checkbox"
                               checked={isSelected}
                               onChange={(e) => handleEmployeeSelection(employee.id, e.target.checked)}
                               className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                             />
                             <div>
                               <h4 className="font-semibold">{employee.name}</h4>
                               <p className="text-sm text-muted-foreground">
                                 {employee.position} • {employee.division} • {employee.branch_id ? 'Branch' : 'Central Warehouse'}
                               </p>
                             </div>
                             {record && (
                               <div className="flex items-center gap-2">
                                 <Badge className={getStatusColor(record.status)}>
                                   {getStatusIcon(record.status)}
                                   {record.status.replace('_', ' ')}
                                 </Badge>
                                                                   {record.check_in_time && (
                                    <span className="text-sm text-muted-foreground">
                                      In: {record.check_in_time}
                                    </span>
                                  )}
                                  {record.check_out_time && (
                                    <span className="text-sm text-muted-foreground">
                                      Out: {record.check_out_time}
                                    </span>
                                  )}
                               </div>
                             )}
                           </div>
                           <div className="flex gap-2">
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={() => setSelectedEmployee(employee)}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </Card>
                     )
                   })}
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                 {/* Calendar View Tab */}
         <TabsContent value="calendar" className="space-y-4">
           <CalendarView 
             employees={filteredEmployees}
             attendanceRecords={attendanceRecords}
             selectedDate={selectedDate}
             onDateSelect={setSelectedDate}
             onEmployeeSelect={setSelectedEmployee}
           />
         </TabsContent>

                 {/* Leave Management Tab */}
         <TabsContent value="leave" className="space-y-6">
                                                                                               {/* Premium Header */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-4 text-white shadow-2xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Leave Management</h2>
                      <p className="text-gray-300 text-sm">Comprehensive leave tracking and management</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowLeaveForm(true)}
                    className="bg-black hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-2xl shadow-lg border border-gray-600 transition-all duration-300 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Leave Request
                  </Button>
                </div>
              </div>

                         {/* Premium Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Pending</p>
                       <p className="text-2xl font-bold text-yellow-800 mt-1">{stats.leaveRequests.pending}</p>
                       <p className="text-xs text-yellow-600">Awaiting approval</p>
                     </div>
                     <div className="w-10 h-10 bg-yellow-200 rounded-xl flex items-center justify-center shadow-lg">
                       <AlertTriangle className="h-5 w-5 text-yellow-700" />
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Approved</p>
                       <p className="text-2xl font-bold text-green-800 mt-1">{stats.leaveRequests.approved}</p>
                       <p className="text-xs text-green-600">Successfully processed</p>
                     </div>
                     <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center shadow-lg">
                       <CheckCircle className="h-5 w-5 text-green-700" />
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                 <CardContent className="p-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Rejected</p>
                       <p className="text-2xl font-bold text-red-800 mt-1">{stats.leaveRequests.rejected}</p>
                       <p className="text-xs text-red-600">Not approved</p>
                     </div>
                     <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center shadow-lg">
                       <XCircle className="h-5 w-5 text-red-700" />
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>

                                                                                               {/* Premium Leave Requests Section */}
              <Card className="bg-white border-gray-200 shadow-xl">
                                 <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 rounded-t-xl py-3">
                   <CardTitle className="flex items-center gap-3 text-base font-bold text-white">
                     <FileText className="h-4 w-4 text-blue-400" />
                     Leave Requests
                   </CardTitle>
                 </CardHeader>
               <CardContent className="p-4">
                <div className="space-y-4">
                  {leaveRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Requests</h3>
                      <p className="text-gray-600">No leave requests have been submitted yet.</p>
                    </div>
                  ) : (
                                         leaveRequests.map(request => (
                                               <Card key={request.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <User className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-xs">{request.employee_name}</h4>
                                    <p className="text-xs text-gray-600">
                                      {request.start_date} - {request.end_date} • {request.leave_type.replace('_', ' ')} • {request.number_of_days} {request.number_of_days === 1 ? 'day' : 'days'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-xs mb-1 line-clamp-1">{request.reason}</p>
                                <div className="flex items-center gap-1">
                                  <Badge className={
                                    request.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200 text-xs px-1.5 py-0.5' :
                                    request.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 text-xs px-1.5 py-0.5' :
                                    'bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-1.5 py-0.5'
                                  }>
                                    {request.status}
                                  </Badge>
                                  <Badge variant="outline" className="bg-white border-gray-300 text-gray-700 text-xs px-1.5 py-0.5">
                                    {request.deduction_type === 'leave_days' ? 'Leave Days' : 
                                     request.deduction_type === 'salary' ? 'Salary' : 'No Deduction'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => setSelectedLeaveRequest(request)}
                                  className="bg-black hover:bg-gray-800 text-white rounded-lg px-2 py-1 shadow-lg transition-all duration-300"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                     ))
                  )}
                </div>
              </CardContent>
            </Card>

                                                   {/* Premium Leave Balances Section */}
              <Card className="bg-white border-gray-200 shadow-xl">
                                 <CardHeader className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 rounded-t-xl py-3">
                   <CardTitle className="flex items-center gap-3 text-base font-bold text-white">
                     <CalendarDays className="h-4 w-4 text-blue-400" />
                     Leave Balances
                   </CardTitle>
                 </CardHeader>
               <CardContent className="p-4">
                <div className="space-y-4">
                  {leaveBalances.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarDays className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leave Balances</h3>
                      <p className="text-gray-600">No leave balances have been created yet.</p>
                    </div>
                  ) : (
                                         leaveBalances.map(balance => {
                       const employee = employees.find(emp => emp.id === balance.employee_id)
                       return (
                                                   <Card key={balance.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                            <CardContent className="p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-xs">{balance.employee_name}</h4>
                                    <p className="text-xs text-gray-600">Year {balance.year}</p>
                                  </div>
                                </div>
                                                                <div className="flex items-center gap-4">
                                   <div className="text-center bg-gray-50 rounded-lg p-2 min-w-[70px]">
                                     <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-0.5">Total</p>
                                     <p className="text-lg font-bold text-gray-900">{balance.total_leave_days}</p>
                                   </div>
                                   <div className="text-center bg-red-50 rounded-lg p-2 min-w-[70px]">
                                     <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-0.5">Used</p>
                                     <p className="text-lg font-bold text-red-700">{balance.used_leave_days}</p>
                                   </div>
                                   <div className="text-center bg-green-50 rounded-lg p-2 min-w-[70px]">
                                     <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">Remaining</p>
                                     <p className="text-lg font-bold text-green-700">{balance.remaining_leave_days}</p>
                                   </div>
                                   <div className="text-center bg-purple-50 rounded-lg p-2 min-w-[70px]">
                                     <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-0.5">Carried Over</p>
                                     <p className="text-lg font-bold text-purple-700">{balance.carried_over_days}</p>
                                   </div>
                                  {employee && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => setShowEmployeeLeaveDetails(employee)}
                                      className="bg-black hover:bg-gray-800 text-white rounded-lg px-2 py-1 shadow-lg transition-all duration-300 font-semibold text-xs"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Details
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                       )
                     })
                  )}
                </div>
              </CardContent>
            </Card>
         </TabsContent>

                 {/* Analytics Tab */}
         <TabsContent value="analytics" className="space-y-4">
           <AnalyticsDashboard 
             employees={filteredEmployees}
             attendanceRecords={attendanceRecords}
           />
         </TabsContent>
      </Tabs>

      {/* Attendance Form Dialog */}
      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Attendance - {selectedEmployee.name}</DialogTitle>
            </DialogHeader>
                         <AttendanceForm 
               employee={selectedEmployee}
               record={attendanceRecords.find(r => r.employee_id === selectedEmployee.id && r.date === selectedDate)}
               onSave={handleRecordAttendance}
               onCancel={() => setSelectedEmployee(null)}
             />
          </DialogContent>
        </Dialog>
      )}

             {/* Leave Request Form Dialog */}
       {showLeaveForm && (
         <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
           <DialogContent className="max-w-4xl">
             <DialogHeader>
               <DialogTitle>New Leave Request</DialogTitle>
             </DialogHeader>
             <LeaveRequestForm 
               employees={employees}
               leaveBalances={leaveBalances}
               onSave={handleLeaveRequest}
               onCancel={() => setShowLeaveForm(false)}
             />
           </DialogContent>
         </Dialog>
       )}

       {/* Employee Leave Details Modal */}
       {showEmployeeLeaveDetails && (
         <EmployeeLeaveDetails 
           employee={showEmployeeLeaveDetails}
           leaveBalance={leaveBalances.find(b => b.employee_id === showEmployeeLeaveDetails.id)!}
           leaveRequests={leaveRequests}
           isOpen={!!showEmployeeLeaveDetails}
           onClose={() => setShowEmployeeLeaveDetails(null)}
         />
       )}

        {/* Leave Request Details Modal */}
        {selectedLeaveRequest && (
          <LeaveRequestDetails 
            request={selectedLeaveRequest}
            leaveBalance={leaveBalances.find(b => b.employee_id === selectedLeaveRequest.employee_id)}
            isOpen={!!selectedLeaveRequest}
            onClose={() => setSelectedLeaveRequest(null)}
            onApprove={handleApproveLeaveRequest}
            onReject={handleRejectLeaveRequest}
          />
        )}
       
     </div>
   )
 }




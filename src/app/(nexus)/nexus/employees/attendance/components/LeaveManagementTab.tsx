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
  Calendar,
  Users,
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Search,
  Heart,
  CalendarDays,
  UserCheck,
  UserX
} from 'lucide-react'
import { useAttendance } from '../../hooks/useAttendance'
import { LeaveRequestForm } from './LeaveRequestForm'
import type { Employee } from '../../types/employee'
import type { LeaveBalance, LeaveRequest } from '../../types/attendance'
import { LEAVE_TYPES, LEAVE_REQUEST_STATUSES } from '../../types/attendance'

interface LeaveManagementTabProps {
  employees: Employee[]
  leaveBalances: LeaveBalance[]
  leaveRequests: LeaveRequest[]
  selectedEmployee: string
  onEmployeeSelect: (employeeId: string) => void
}

export function LeaveManagementTab({
  employees,
  leaveBalances,
  leaveRequests,
  selectedEmployee,
  onEmployeeSelect
}: LeaveManagementTabProps) {
  const { updateLeaveRequestStatus } = useAttendance()
  
  const [showLeaveRequestForm, setShowLeaveRequestForm] = useState(false)
  const [selectedEmployeeForLeave, setSelectedEmployeeForLeave] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all')

  // Filter leave requests
  const filteredLeaveRequests = useMemo(() => {
    let filtered = leaveRequests

    if (selectedEmployee) {
      filtered = filtered.filter(request => request.employeeId === selectedEmployee)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(request => {
        const employee = employees.find(e => e.id === request.employeeId)
        return employee && (
          employee.firstName.toLowerCase().includes(term) ||
          employee.lastName.toLowerCase().includes(term) ||
          employee.employeeId.toLowerCase().includes(term)
        )
      })
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    if (leaveTypeFilter && leaveTypeFilter !== 'all') {
      filtered = filtered.filter(request => request.leaveType === leaveTypeFilter)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [leaveRequests, selectedEmployee, employees, searchTerm, statusFilter, leaveTypeFilter])

  // Get leave balance for selected employee
  const selectedEmployeeBalance = useMemo(() => {
    if (!selectedEmployee) return null
    return leaveBalances.find(balance => 
      balance.employeeId === selectedEmployee && 
      balance.year === new Date().getFullYear()
    )
  }, [leaveBalances, selectedEmployee])

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const pending = leaveRequests.filter(r => r.status === 'pending').length
    const approved = leaveRequests.filter(r => r.status === 'approved').length
    const rejected = leaveRequests.filter(r => r.status === 'rejected').length
    const cancelled = leaveRequests.filter(r => r.status === 'cancelled').length

    const totalLeaveDays = leaveBalances.reduce((sum, balance) => sum + balance.totalLeaveDays, 0)
    const usedLeaveDays = leaveBalances.reduce((sum, balance) => sum + balance.usedLeaveDays, 0)
    const remainingLeaveDays = leaveBalances.reduce((sum, balance) => sum + balance.remainingLeaveDays, 0)

    return {
      requests: { pending, approved, rejected, cancelled },
      balances: { total: totalLeaveDays, used: usedLeaveDays, remaining: remainingLeaveDays }
    }
  }, [leaveRequests, leaveBalances])

  const handleCreateLeaveRequest = () => {
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee)
      setSelectedEmployeeForLeave(employee || null)
    }
    setShowLeaveRequestForm(true)
  }

  const handleLeaveRequestSubmit = async (data: any) => {
    try {
      // This would be handled by the form component
      setShowLeaveRequestForm(false)
      setSelectedEmployeeForLeave(null)
    } catch (error) {
      console.error('Error creating leave request:', error)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await updateLeaveRequestStatus(requestId, 'approved', 'current-user-id')
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateLeaveRequestStatus(requestId, 'rejected', 'current-user-id')
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'annual':
        return 'text-blue-600'
      case 'sick':
        return 'text-purple-600'
      case 'unpaid':
        return 'text-gray-600'
      case 'maternity':
        return 'text-pink-600'
      case 'paternity':
        return 'text-indigo-600'
      case 'bereavement':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end dates
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Leave Management</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateLeaveRequest}>
            <Plus className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.requests.pending}</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.requests.approved}</div>
            <div className="text-sm text-gray-600">Approved Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.balances.remaining}</div>
            <div className="text-sm text-gray-600">Total Leave Days Remaining</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.balances.used}</div>
            <div className="text-sm text-gray-600">Total Leave Days Used</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance for Selected Employee */}
      {selectedEmployee && selectedEmployeeBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedEmployeeBalance.totalLeaveDays}</div>
                <div className="text-sm text-gray-600">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{selectedEmployeeBalance.usedLeaveDays}</div>
                <div className="text-sm text-gray-600">Used Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedEmployeeBalance.remainingLeaveDays}</div>
                <div className="text-sm text-gray-600">Remaining Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedEmployeeBalance.carriedOverDays}</div>
                <div className="text-sm text-gray-600">Carried Over</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
              {LEAVE_REQUEST_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={leaveTypeFilter || "all"} onValueChange={setLeaveTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Leave Requests ({filteredLeaveRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeaveRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leave requests found matching your criteria.
              </div>
            ) : (
              filteredLeaveRequests.map((request) => {
                const employee = employees.find(e => e.id === request.employeeId)
                const leaveDays = calculateLeaveDays(request.startDate, request.endDate)
                
                return (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium">
                            {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee?.employeeId} • {employee?.position}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(request.status)}>
                          {LEAVE_REQUEST_STATUSES.find(s => s.value === request.status)?.label}
                        </Badge>
                        <Badge variant="outline" className={getLeaveTypeColor(request.leaveType)}>
                          {LEAVE_TYPES.find(t => t.value === request.leaveType)?.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <span className="ml-2 font-medium">{new Date(request.startDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <span className="ml-2 font-medium">{new Date(request.endDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{leaveDays} day(s)</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-600">Reason:</span>
                      <span className="ml-2">{request.reason}</span>
                    </div>

                    {request.notes && (
                      <div className="text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <span className="ml-2">{request.notes}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Requested on {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.approvedBy && (
                        <span>Approved by {request.approvedBy} on {request.approvedAt && new Date(request.approvedAt).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Action Buttons for Pending Requests */}
                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showLeaveRequestForm && (
        <LeaveRequestForm
          employee={selectedEmployeeForLeave}
          onSubmit={handleLeaveRequestSubmit}
          onCancel={() => {
            setShowLeaveRequestForm(false)
            setSelectedEmployeeForLeave(null)
          }}
        />
      )}
    </div>
  )
}

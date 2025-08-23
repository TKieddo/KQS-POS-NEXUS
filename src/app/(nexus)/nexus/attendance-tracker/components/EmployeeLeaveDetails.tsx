'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  FileText,
  X,
  Heart,
  Sun,
  Flag
} from 'lucide-react'

import { Employee, LeaveBalance, LeaveRequest } from '../hooks/useAttendance'

interface EmployeeLeaveDetailsProps {
  employee: Employee
  leaveBalance: LeaveBalance
  leaveRequests: LeaveRequest[]
  isOpen: boolean
  onClose: () => void
}

export function EmployeeLeaveDetails({ 
  employee, 
  leaveBalance, 
  leaveRequests, 
  isOpen, 
  onClose 
}: EmployeeLeaveDetailsProps) {
  if (!isOpen) return null

  const employeeRequests = leaveRequests.filter(req => req.employee_id === employee.id)
  const pendingRequests = employeeRequests.filter(req => req.status === 'pending')
  const approvedRequests = employeeRequests.filter(req => req.status === 'approved')
  const rejectedRequests = employeeRequests.filter(req => req.status === 'rejected')
  
  const usagePercentage = leaveBalance.total_leave_days > 0 
    ? (leaveBalance.used_leave_days / leaveBalance.total_leave_days) * 100 
    : 0

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case 'annual_leave': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sick_leave': return 'bg-red-100 text-red-800 border-red-200'
      case 'unpaid_leave': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{employee.name}</h2>
                <p className="text-xs text-gray-600">{employee.position} • {employee.division}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Leave Balance Overview */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Leave Balance - {leaveBalance.year}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Leave Usage</span>
                    <span className="text-gray-600">{leaveBalance.used_leave_days}/{leaveBalance.total_leave_days} days</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-blue-600">Total Days</p>
                      <p className="text-lg font-bold text-blue-800">{leaveBalance.total_leave_days}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="text-xs font-medium text-red-600">Used Days</p>
                      <p className="text-lg font-bold text-red-800">{leaveBalance.used_leave_days}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs font-medium text-green-600">Remaining</p>
                      <p className="text-lg font-bold text-green-800">{leaveBalance.remaining_leave_days}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-xs font-medium text-purple-600">Carried Over</p>
                      <p className="text-lg font-bold text-purple-800">{leaveBalance.carried_over_days}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Warning for low leave balance */}
                {leaveBalance.remaining_leave_days <= 3 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-yellow-700 text-sm font-medium">
                      Low leave balance: Only {leaveBalance.remaining_leave_days} days remaining
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leave Requests History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Leave Requests History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employeeRequests.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No leave requests found for this employee</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {employeeRequests.slice(0, 3).map(request => (
                      <Card key={request.id} className="p-3 bg-gray-50 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getLeaveTypeColor(request.leave_type)}>
                                {request.leave_type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="bg-white border-gray-300 text-xs">
                                {request.deduction_type === 'leave_days' ? 'Leave Days' : 
                                 request.deduction_type === 'salary' ? 'Salary' : 'No Deduction'}
                              </Badge>
                              {getStatusIcon(request.status)}
                            </div>
                            <p className="font-medium text-gray-900 text-sm">{request.start_date} - {request.end_date}</p>
                            <p className="text-xs text-gray-600 mt-1">{request.reason}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.number_of_days} {request.number_of_days === 1 ? 'day' : 'days'}
                              {request.approved_by && (
                                <span className="ml-2">• Approved by {request.approved_by}</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium capitalize text-gray-900">{request.status}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {employeeRequests.length > 3 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">+{employeeRequests.length - 3} more requests</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-xs font-medium text-yellow-600">Pending Requests</p>
                  <p className="text-lg font-bold text-yellow-700">{pendingRequests.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-green-600">Approved Requests</p>
                  <p className="text-lg font-bold text-green-700">{approvedRequests.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-xs font-medium text-red-600">Rejected Requests</p>
                  <p className="text-lg font-bold text-red-700">{rejectedRequests.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

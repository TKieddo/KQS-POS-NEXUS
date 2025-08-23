'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  CalendarDays,
  Heart,
  Sun,
  Flag,
  Baby,
  Users,
  Skull
} from 'lucide-react'
import { LeaveRequest, LeaveBalance } from '../hooks/useAttendance'

interface LeaveRequestDetailsProps {
  request: LeaveRequest | null
  leaveBalance?: LeaveBalance
  isOpen: boolean
  onClose: () => void
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function LeaveRequestDetails({ 
  request, 
  leaveBalance, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: LeaveRequestDetailsProps) {
  if (!request) return null

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'annual': return <Sun className="h-4 w-4" />
      case 'sick': return <Heart className="h-4 w-4" />
      case 'maternity': return <Baby className="h-4 w-4" />
      case 'paternity': return <Users className="h-4 w-4" />
      case 'bereavement': return <Skull className="h-4 w-4" />
      default: return <Flag className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

     return (
     <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-lg font-bold">
             <Eye className="h-5 w-5 text-blue-600" />
             Leave Request Details
           </DialogTitle>
         </DialogHeader>

                   <div className="space-y-3">
                      {/* Employee Information */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-blue-600" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{request.employee_name}</h3>
                    <p className="text-xs text-gray-600">ID: {request.employee_id}</p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

                                           {/* Leave Details */}
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  Leave Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Start:</span>
                      <span className="text-gray-700">{new Date(request.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">End:</span>
                      <span className="text-gray-700">{new Date(request.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Duration:</span>
                      <span className="text-gray-700">{request.number_of_days} {request.number_of_days === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {getLeaveTypeIcon(request.leave_type)}
                      <span className="font-medium">Type:</span>
                      <span className="text-gray-700 capitalize">{request.leave_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Deduction:</span>
                      <span className="text-gray-700 text-xs">
                        {request.deduction_type === 'leave_days' ? 'Leave Days' : 
                         request.deduction_type === 'salary' ? 'Salary' : 'None'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CalendarDays className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">Requested:</span>
                      <span className="text-gray-700">{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <h4 className="font-medium mb-1 text-xs">Reason for Leave:</h4>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-700 text-xs">{request.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

                                           {/* Leave Balance Information */}
            {leaveBalance && (
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-3 w-3 text-green-600" />
                    Current Leave Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center bg-white rounded-lg p-1.5 shadow-sm">
                      <p className="text-xs font-medium text-gray-600">Total</p>
                      <p className="text-base font-bold text-gray-900">{leaveBalance.total_leave_days}</p>
                    </div>
                    <div className="text-center bg-white rounded-lg p-1.5 shadow-sm">
                      <p className="text-xs font-medium text-red-600">Used</p>
                      <p className="text-base font-bold text-red-700">{leaveBalance.used_leave_days}</p>
                    </div>
                    <div className="text-center bg-white rounded-lg p-1.5 shadow-sm">
                      <p className="text-xs font-medium text-green-600">Remaining</p>
                      <p className="text-base font-bold text-green-700">{leaveBalance.remaining_leave_days}</p>
                    </div>
                    <div className="text-center bg-white rounded-lg p-1.5 shadow-sm">
                      <p className="text-xs font-medium text-purple-600">Carried Over</p>
                      <p className="text-base font-bold text-purple-700">{leaveBalance.carried_over_days}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

                                           {/* Approval Actions */}
            {request.status === 'pending' && (
              <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    Approval Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => onApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => onReject(request.id)}
                      variant="destructive"
                      className="px-4 py-2 rounded-lg font-medium text-sm"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

                                           {/* Approval Information */}
            {request.status !== 'pending' && request.approved_by && (
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-blue-600" />
                    Approval Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium">Approved by:</span> {request.approved_by}</p>
                    {request.approved_at && (
                      <p><span className="font-medium">Approved on:</span> {new Date(request.approved_at).toLocaleDateString()}</p>
                    )}
                    {request.notes && (
                      <div>
                        <p className="font-medium">Notes:</p>
                        <p className="text-gray-700 text-xs">{request.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

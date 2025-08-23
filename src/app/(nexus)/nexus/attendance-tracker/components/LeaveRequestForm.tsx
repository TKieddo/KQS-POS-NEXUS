'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Info } from 'lucide-react'
import { Employee, LeaveBalance, LeaveRequest } from '../hooks/useAttendance'

interface LeaveRequestFormProps {
  employees: Employee[]
  leaveBalances: LeaveBalance[]
  onSave: (data: Omit<LeaveRequest, 'id' | 'status'>) => void
  onCancel: () => void
}

export function LeaveRequestForm({ employees, leaveBalances, onSave, onCancel }: LeaveRequestFormProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('annual')
  const [deductionType, setDeductionType] = useState<'leave_days' | 'salary' | 'none'>('leave_days')
  const [reason, setReason] = useState('')
  const [numberOfDays, setNumberOfDays] = useState(1)

  // Get selected employee's leave balance
  const selectedEmployeeBalance = leaveBalances.find(balance => balance.employeeId === employeeId)
  const currentYear = new Date().getFullYear()

  // Calculate number of days between start and end date
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setNumberOfDays(diffDays)
    }
  }, [startDate, endDate])

  // Check if leave days are sufficient
  const isLeaveDaysSufficient = selectedEmployeeBalance && 
    deductionType === 'leave_days' && 
    numberOfDays <= selectedEmployeeBalance.remainingLeaveDays

  const handleSubmit = () => {
    if (!employeeId || !startDate || !endDate || !reason) {
      alert('Please fill in all required fields')
      return
    }

    if (deductionType === 'leave_days' && !isLeaveDaysSufficient) {
      alert('Insufficient leave days. Please check the leave balance.')
      return
    }

    onSave({
      employeeId,
      employeeName: employees.find(emp => emp.id === employeeId)?.name || '',
      startDate,
      endDate,
      leaveType,
      reason,
      deductionType,
      numberOfDays
    })
  }

  return (
    <div className="space-y-6">
      {/* Employee Selection */}
      <div className="space-y-2">
        <Label>Employee *</Label>
        <Select value={employeeId} onValueChange={setEmployeeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {employees.map(emp => (
              <SelectItem key={emp.id} value={emp.id} className="hover:bg-gray-100">{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Leave Balance Display */}
      {selectedEmployeeBalance && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Leave Balance for {selectedEmployeeBalance.employeeName}</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-blue-600 font-medium">Total Days</p>
                <p className="text-lg font-bold text-blue-800">{selectedEmployeeBalance.totalLeaveDays}</p>
              </div>
              <div className="text-center">
                <p className="text-red-600 font-medium">Used Days</p>
                <p className="text-lg font-bold text-red-800">{selectedEmployeeBalance.usedLeaveDays}</p>
              </div>
              <div className="text-center">
                <p className="text-green-600 font-medium">Remaining</p>
                <p className="text-lg font-bold text-green-800">{selectedEmployeeBalance.remainingLeaveDays}</p>
              </div>
              <div className="text-center">
                <p className="text-purple-600 font-medium">Carried Over</p>
                <p className="text-lg font-bold text-purple-800">{selectedEmployeeBalance.carriedOverDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date *</Label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Leave Type</Label>
          <Select value={leaveType} onValueChange={(value: LeaveRequest['leaveType']) => setLeaveType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="annual" className="hover:bg-gray-100">Annual Leave</SelectItem>
              <SelectItem value="sick" className="hover:bg-gray-100">Sick Leave</SelectItem>
              <SelectItem value="unpaid" className="hover:bg-gray-100">Unpaid Leave</SelectItem>
              <SelectItem value="maternity" className="hover:bg-gray-100">Maternity Leave</SelectItem>
              <SelectItem value="paternity" className="hover:bg-gray-100">Paternity Leave</SelectItem>
              <SelectItem value="bereavement" className="hover:bg-gray-100">Bereavement Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Deduction Type *</Label>
          <Select value={deductionType} onValueChange={(value: 'leave_days' | 'salary' | 'none') => setDeductionType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="leave_days" className="hover:bg-gray-100">Deduct from Leave Days</SelectItem>
              <SelectItem value="salary" className="hover:bg-gray-100">Deduct from Salary</SelectItem>
              <SelectItem value="none" className="hover:bg-gray-100">No Deduction</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Number of Days Display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="font-medium">Number of Days:</span>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
        </Badge>
      </div>

      {/* Warning for insufficient leave days */}
      {deductionType === 'leave_days' && selectedEmployeeBalance && !isLeaveDaysSufficient && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700 text-sm">
            Warning: Employee only has {selectedEmployeeBalance.remainingLeaveDays} leave days remaining, 
            but requesting {numberOfDays} days. Consider changing deduction type to salary.
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label>Reason *</Label>
        <Textarea 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
          placeholder="Enter reason for leave..." 
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!employeeId || !startDate || !endDate || !reason || (deductionType === 'leave_days' && !isLeaveDaysSufficient)}
        >
          Submit Request
        </Button>
      </div>
    </div>
  )
}

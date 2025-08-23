'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { Employee, AttendanceRecord } from '../hooks/useAttendance'

interface AttendanceFormProps {
  employee: Employee
  record?: AttendanceRecord
  onSave: (employee: Employee, status: AttendanceRecord['status'], times?: { checkIn?: string, checkOut?: string }, reason?: string) => void
  onCancel: () => void
}

export function AttendanceForm({ employee, record, onSave, onCancel }: AttendanceFormProps) {
  const [status, setStatus] = useState<AttendanceRecord['status']>(record?.status || 'present')
  const [checkIn, setCheckIn] = useState(record?.check_in_time || '')
  const [checkOut, setCheckOut] = useState(record?.check_out_time || '')
  const [reason, setReason] = useState(record?.reason || '')

  return (
    <div className="space-y-4">
      <div>
        <Label>Status</Label>
        <Select value={status} onValueChange={(value: AttendanceRecord['status']) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem value="present" className="hover:bg-gray-100">Present</SelectItem>
            <SelectItem value="absent" className="hover:bg-gray-100">Absent</SelectItem>
            <SelectItem value="late" className="hover:bg-gray-100">Late</SelectItem>
            <SelectItem value="half_day" className="hover:bg-gray-100">Half Day</SelectItem>
            <SelectItem value="sick_leave" className="hover:bg-gray-100">Sick Leave</SelectItem>
            <SelectItem value="annual_leave" className="hover:bg-gray-100">Annual Leave</SelectItem>
            <SelectItem value="unpaid_leave" className="hover:bg-gray-100">Unpaid Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === 'present' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Check-in Time</Label>
            <Input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <Label>Check-out Time</Label>
            <Input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
      )}

      {status !== 'present' && (
        <div>
          <Label>Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for absence or late arrival..." />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(employee, status, { checkIn, checkOut }, reason)}>Save</Button>
      </div>
    </div>
  )
}

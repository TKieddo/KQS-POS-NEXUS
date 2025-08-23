import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Clock, 
  User, 
  Calendar,
  Save,
  X,
  AlertCircle
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { AttendanceRecord, AttendanceFormData } from '../types/attendance'
import { ATTENDANCE_STATUSES, LEAVE_TYPES, DEDUCTION_TYPES } from '../types/attendance'

interface AttendanceFormProps {
  employee?: Employee
  employees: Employee[]
  attendanceRecord?: AttendanceRecord
  onSubmit: (data: AttendanceFormData) => Promise<void>
  onCancel: () => void
}

export function AttendanceForm({
  employee,
  employees,
  attendanceRecord,
  onSubmit,
  onCancel
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<AttendanceFormData>({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    status: 'present',
    leave_type: undefined,
    deduction_type: undefined,
    reason: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data
  useEffect(() => {
    if (attendanceRecord) {
      setFormData({
        employee_id: attendanceRecord.employee_id,
        date: attendanceRecord.date,
        check_in_time: attendanceRecord.check_in_time || '',
        check_out_time: attendanceRecord.check_out_time || '',
        status: attendanceRecord.status,
        leave_type: attendanceRecord.leave_type,
        deduction_type: attendanceRecord.deduction_type,
        reason: attendanceRecord.reason || '',
        notes: attendanceRecord.notes || ''
      })
    } else if (employee) {
      setFormData(prev => ({
        ...prev,
        employee_id: employee.id,
        date: new Date().toISOString().split('T')[0]
      }))
    }
  }, [attendanceRecord, employee])

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    if (formData.status === 'leave' && !formData.leave_type) {
      newErrors.leave_type = 'Leave type is required when status is leave'
    }

    if (formData.status === 'absent' && !formData.deduction_type) {
      newErrors.deduction_type = 'Deduction type is required when status is absent'
    }

    if (formData.status === 'leave' && !formData.reason) {
      newErrors.reason = 'Reason is required when status is leave'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Auto-fill current time
  const fillCurrentTime = (field: 'check_in_time' | 'check_out_time') => {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)
    handleInputChange(field, timeString)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {attendanceRecord ? 'Edit Attendance' : 'Record Attendance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select 
              value={formData.employee_id} 
              onValueChange={(value) => handleInputChange('employee_id', value)}
              disabled={!!employee} // Disable if employee is pre-selected
            >
              <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-red-600">{errors.employee_id}</p>
            )}
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_time">Check In Time</Label>
              <div className="flex gap-2">
                <Input
                  id="check_in_time"
                  type="time"
                  value={formData.check_in_time}
                  onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                  placeholder="09:00"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCurrentTime('check_in_time')}
                >
                  Now
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out_time">Check Out Time</Label>
              <div className="flex gap-2">
                <Input
                  id="check_out_time"
                  type="time"
                  value={formData.check_out_time}
                  onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                  placeholder="17:00"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillCurrentTime('check_out_time')}
                >
                  Now
                </Button>
              </div>
            </div>
          </div>

          {/* Leave Type (shown when status is leave) */}
          {formData.status === 'leave' && (
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type *</Label>
              <Select 
                value={formData.leave_type || ''} 
                onValueChange={(value) => handleInputChange('leave_type', value)}
              >
                <SelectTrigger className={errors.leave_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leave_type && (
                <p className="text-sm text-red-600">{errors.leave_type}</p>
              )}
            </div>
          )}

          {/* Deduction Type (shown when status is absent) */}
          {formData.status === 'absent' && (
            <div className="space-y-2">
              <Label htmlFor="deduction_type">Deduction Type *</Label>
              <Select 
                value={formData.deduction_type || ''} 
                onValueChange={(value) => handleInputChange('deduction_type', value)}
              >
                <SelectTrigger className={errors.deduction_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select deduction type" />
                </SelectTrigger>
                <SelectContent>
                  {DEDUCTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deduction_type && (
                <p className="text-sm text-red-600">{errors.deduction_type}</p>
              )}
            </div>
          )}

          {/* Reason (shown when status is leave or absent) */}
          {(formData.status === 'leave' || formData.status === 'absent') && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Enter reason for leave/absence..."
                className={errors.reason ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Warning for future dates */}
          {new Date(formData.date) > new Date() && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                You are recording attendance for a future date. Please verify the date is correct.
              </span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (attendanceRecord ? 'Update' : 'Record')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

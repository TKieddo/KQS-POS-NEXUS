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
  User,
  Clock,
  Calendar,
  Save,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sun,
  Heart,
  Flag,
  Home
} from 'lucide-react'
import type { Employee } from '../../types/employee'
import type { AttendanceRecord, AttendanceFormData } from '../../types/attendance'
import { ATTENDANCE_STATUSES, DEDUCTION_TYPES } from '../../types/attendance'

interface AttendanceFormProps {
  employee?: Employee | null
  date: string
  attendance?: AttendanceRecord | null
  onSubmit: (data: AttendanceFormData & { id?: string }) => Promise<void>
  onCancel: () => void
}

export function AttendanceForm({ 
  employee, 
  date, 
  attendance, 
  onSubmit, 
  onCancel 
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<AttendanceFormData>({
    employeeId: '',
    date: date,
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    deductionType: 'none',
    reason: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id
      }))
    }

    if (attendance) {
      setFormData({
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkInTime: attendance.checkInTime || '',
        checkOutTime: attendance.checkOutTime || '',
        status: attendance.status,
        deductionType: attendance.deductionType || 'none',
        reason: attendance.reason || '',
        notes: attendance.notes || ''
      })
    }
  }, [employee, attendance])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    // Validate times
    if (formData.checkInTime && formData.checkOutTime) {
      const checkIn = new Date(`2000-01-01T${formData.checkInTime}`)
      const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`)
      
      if (checkOut <= checkIn) {
        newErrors.checkOutTime = 'Check-out time must be after check-in time'
      }
    }

    // Validate deduction type for absent status
    if (formData.status === 'absent' && !formData.deductionType) {
      newErrors.deductionType = 'Deduction type is required for absent status'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        id: attendance?.id
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error saving attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
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
        return 'text-green-600'
      case 'absent':
        return 'text-red-600'
      case 'late':
        return 'text-yellow-600'
      case 'half_day':
        return 'text-orange-600'
      case 'sick_leave':
        return 'text-purple-600'
      case 'annual_leave':
        return 'text-blue-600'
      case 'public_holiday':
        return 'text-indigo-600'
      case 'weekend':
        return 'text-slate-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {attendance ? 'Edit Attendance Record' : 'Record Attendance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          {employee && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{employee.firstName} {employee.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-medium">{employee.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-medium">{employee.position}</span>
                </div>
                <div>
                  <span className="text-gray-600">Division:</span>
                  <span className="ml-2 font-medium">{employee.divisionId}</span>
                </div>
              </div>
            </div>
          )}

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
              {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.value)}
                        <span className={getStatusColor(status.value)}>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
            </div>
          </div>

          {/* Time Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                placeholder="08:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                placeholder="17:00"
                className={errors.checkOutTime ? 'border-red-500' : ''}
              />
              {errors.checkOutTime && <p className="text-xs text-red-600">{errors.checkOutTime}</p>}
            </div>
          </div>

          {/* Deduction Type (for absent status) */}
          {formData.status === 'absent' && (
            <div className="space-y-2">
              <Label htmlFor="deductionType">Deduction Type *</Label>
              <Select value={formData.deductionType} onValueChange={(value) => handleInputChange('deductionType', value)}>
                <SelectTrigger className={errors.deductionType ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEDUCTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deductionType && <p className="text-xs text-red-600">{errors.deductionType}</p>}
            </div>
          )}

          {/* Reason and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Reason for absence or late arrival..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes or comments..."
                rows={3}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange('status', 'present')
                  handleInputChange('checkInTime', '08:00')
                  handleInputChange('checkOutTime', '17:00')
                }}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Present
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange('status', 'absent')
                  handleInputChange('deductionType', 'leave_days')
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Absent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange('status', 'late')
                  handleInputChange('checkInTime', '08:30')
                }}
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Late
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange('status', 'sick_leave')
                  handleInputChange('deductionType', 'leave_days')
                }}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Heart className="h-3 w-3 mr-1" />
                Sick Leave
              </Button>
            </div>
          </div>

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
              {loading ? 'Saving...' : (attendance ? 'Update Record' : 'Save Record')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

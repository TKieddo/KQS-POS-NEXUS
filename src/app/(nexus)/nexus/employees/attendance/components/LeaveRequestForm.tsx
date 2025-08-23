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
  Calendar,
  Save,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react'
import type { Employee } from '../../types/employee'
import { LEAVE_TYPES } from '../../types/attendance'

interface LeaveRequestFormProps {
  employee?: Employee | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function LeaveRequestForm({ 
  employee, 
  onSubmit, 
  onCancel 
}: LeaveRequestFormProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    leaveType: 'annual' as 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement',
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
  }, [employee])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    // Validate date range
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past'
      }
      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date'
      }
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
        status: 'pending' as const
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Error creating leave request:', error)
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

  const calculateLeaveDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays + 1 // Include both start and end dates
    }
    return 0
  }

  const leaveDays = calculateLeaveDays()

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            New Leave Request
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

          {/* Leave Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && <p className="text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Leave Duration */}
          {leaveDays > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Leave Duration</span>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {leaveDays} day(s) from {formData.startDate && new Date(formData.startDate).toLocaleDateString()} 
                to {formData.endDate && new Date(formData.endDate).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select value={formData.leaveType} onValueChange={(value: any) => handleInputChange('leaveType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              rows={3}
              className={errors.reason ? 'border-red-500' : ''}
            />
            {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information or special requests..."
              rows={2}
            />
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Important Information</div>
                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                  <div>• Leave requests are subject to approval by management</div>
                  <div>• Please submit requests at least 2 weeks in advance for annual leave</div>
                  <div>• Emergency leave requests will be reviewed on a case-by-case basis</div>
                  <div>• You will be notified of the approval status via email</div>
                </div>
              </div>
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

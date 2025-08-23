import React, { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sun,
  Heart,
  Calendar,
  Flag,
  Home,
  Save,
  X,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react'
import type { Employee } from '../../types/employee'
import type { BulkAttendanceData } from '../../types/attendance'
import { ATTENDANCE_STATUSES, DEDUCTION_TYPES } from '../../types/attendance'

interface BulkAttendanceFormProps {
  employees: Employee[]
  date: string
  onSubmit: (data: BulkAttendanceData) => Promise<void>
  onCancel: () => void
}

interface EmployeeAttendance {
  employeeId: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave' | 'public_holiday' | 'weekend'
  checkInTime?: string
  checkOutTime?: string
  deductionType?: 'leave_days' | 'salary' | 'none'
  reason?: string
  notes?: string
}

export function BulkAttendanceForm({ 
  employees, 
  date, 
  onSubmit, 
  onCancel 
}: BulkAttendanceFormProps) {
  const [employeeRecords, setEmployeeRecords] = useState<EmployeeAttendance[]>([])
  const [defaultStatus, setDefaultStatus] = useState<'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave' | 'public_holiday' | 'weekend'>('present')
  const [defaultCheckIn, setDefaultCheckIn] = useState('08:00')
  const [defaultCheckOut, setDefaultCheckOut] = useState('17:00')
  const [loading, setLoading] = useState(false)

  // Initialize employee records
  useMemo(() => {
    const records = employees.map(employee => ({
      employeeId: employee.id,
      status: defaultStatus,
      checkInTime: defaultCheckIn,
      checkOutTime: defaultCheckOut,
      deductionType: defaultStatus === 'absent' ? 'leave_days' as const : 'none' as const,
      reason: '',
      notes: ''
    }))
    setEmployeeRecords(records)
  }, [employees, defaultStatus, defaultCheckIn, defaultCheckOut])

  const handleStatusChange = (employeeId: string, status: EmployeeAttendance['status']) => {
    setEmployeeRecords(prev => 
      prev.map(record => 
        record.employeeId === employeeId 
          ? { 
              ...record, 
              status,
              deductionType: status === 'absent' ? 'leave_days' : 'none'
            }
          : record
      )
    )
  }

  const handleTimeChange = (employeeId: string, field: 'checkInTime' | 'checkOutTime', value: string) => {
    setEmployeeRecords(prev => 
      prev.map(record => 
        record.employeeId === employeeId 
          ? { ...record, [field]: value }
          : record
      )
    )
  }

  const handleDeductionChange = (employeeId: string, deductionType: 'leave_days' | 'salary' | 'none') => {
    setEmployeeRecords(prev => 
      prev.map(record => 
        record.employeeId === employeeId 
          ? { ...record, deductionType }
          : record
      )
    )
  }

  const handleReasonChange = (employeeId: string, reason: string) => {
    setEmployeeRecords(prev => 
      prev.map(record => 
        record.employeeId === employeeId 
          ? { ...record, reason }
          : record
      )
    )
  }

  const handleApplyToAll = (field: 'status' | 'checkInTime' | 'checkOutTime' | 'deductionType') => {
    setEmployeeRecords(prev => 
      prev.map(record => {
        switch (field) {
          case 'status':
            return { 
              ...record, 
              status: defaultStatus,
              deductionType: defaultStatus === 'absent' ? 'leave_days' : 'none'
            }
          case 'checkInTime':
            return { ...record, checkInTime: defaultCheckIn }
          case 'checkOutTime':
            return { ...record, checkOutTime: defaultCheckOut }
          case 'deductionType':
            return { ...record, deductionType: defaultStatus === 'absent' ? 'leave_days' : 'none' }
          default:
            return record
        }
      })
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'half_day':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sick_leave':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'annual_leave':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'public_holiday':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'weekend':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data: BulkAttendanceData = {
        date,
        records: employeeRecords
      }
      await onSubmit(data)
    } catch (error) {
      console.error('Error saving bulk attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const summaryStats = useMemo(() => {
    const present = employeeRecords.filter(r => r.status === 'present').length
    const absent = employeeRecords.filter(r => r.status === 'absent').length
    const late = employeeRecords.filter(r => r.status === 'late').length
    const onLeave = employeeRecords.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length

    return { present, absent, late, onLeave, total: employeeRecords.length }
  }, [employeeRecords])

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Bulk Attendance Recording - {new Date(date).toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Default Settings */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Default Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultStatus">Default Status</Label>
                <Select value={defaultStatus} onValueChange={(value: any) => setDefaultStatus(value)}>
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToAll('status')}
                  className="w-full"
                >
                  Apply to All
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCheckIn">Default Check-in</Label>
                <Input
                  id="defaultCheckIn"
                  type="time"
                  value={defaultCheckIn}
                  onChange={(e) => setDefaultCheckIn(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToAll('checkInTime')}
                  className="w-full"
                >
                  Apply to All
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCheckOut">Default Check-out</Label>
                <Input
                  id="defaultCheckOut"
                  type="time"
                  value={defaultCheckOut}
                  onChange={(e) => setDefaultCheckOut(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyToAll('checkOutTime')}
                  className="w-full"
                >
                  Apply to All
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Summary</Label>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className="font-medium text-green-600">{summaryStats.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <span className="font-medium text-red-600">{summaryStats.absent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late:</span>
                    <span className="font-medium text-yellow-600">{summaryStats.late}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On Leave:</span>
                    <span className="font-medium text-blue-600">{summaryStats.onLeave}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Employee Records ({employeeRecords.length})</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employeeRecords.map((record) => {
                const employee = employees.find(e => e.id === record.employeeId)
                if (!employee) return null

                return (
                  <div key={record.employeeId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status)}
                        <div>
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.employeeId} • {employee.position}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {ATTENDANCE_STATUSES.find(s => s.value === record.status)?.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select value={record.status} onValueChange={(value: any) => handleStatusChange(record.employeeId, value)}>
                          <SelectTrigger className="h-8">
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

                      <div className="space-y-1">
                        <Label className="text-xs">Check-in</Label>
                        <Input
                          type="time"
                          value={record.checkInTime || ''}
                          onChange={(e) => handleTimeChange(record.employeeId, 'checkInTime', e.target.value)}
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Check-out</Label>
                        <Input
                          type="time"
                          value={record.checkOutTime || ''}
                          onChange={(e) => handleTimeChange(record.employeeId, 'checkOutTime', e.target.value)}
                          className="h-8"
                        />
                      </div>

                      {record.status === 'absent' && (
                        <div className="space-y-1">
                          <Label className="text-xs">Deduction</Label>
                          <Select value={record.deductionType} onValueChange={(value: any) => handleDeductionChange(record.employeeId, value)}>
                            <SelectTrigger className="h-8">
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
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Reason</Label>
                      <Input
                        value={record.reason || ''}
                        onChange={(e) => handleReasonChange(record.employeeId, e.target.value)}
                        placeholder="Reason for absence or late arrival..."
                        className="h-8"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              Recording attendance for {employeeRecords.length} employees
            </div>
            <div className="flex gap-3">
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
                {loading ? 'Saving...' : 'Save All Records'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

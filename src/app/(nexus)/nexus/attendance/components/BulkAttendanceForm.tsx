import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Users, 
  Calendar,
  Save,
  X,
  Clock
} from 'lucide-react'
import type { Employee } from '../../employees/types/employee'
import type { QuickAttendanceEntry, BulkAttendanceEntry } from '../types/attendance'
import { ATTENDANCE_STATUSES } from '../types/attendance'

interface BulkAttendanceFormProps {
  employees: Employee[]
  onSubmit: (data: BulkAttendanceEntry) => Promise<void>
  onCancel: () => void
}

export function BulkAttendanceForm({
  employees,
  onSubmit,
  onCancel
}: BulkAttendanceFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [defaultStatus, setDefaultStatus] = useState('present')
  const [entries, setEntries] = useState<QuickAttendanceEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Initialize entries for all employees
  React.useEffect(() => {
    const initialEntries = employees.map(emp => ({
      employee_id: emp.id,
      status: defaultStatus as any,
      check_in_time: '',
      notes: ''
    }))
    setEntries(initialEntries)
  }, [employees, defaultStatus])

  // Update all entries when default status changes
  const updateAllStatus = (status: string) => {
    setEntries(prev => prev.map(entry => ({ ...entry, status: status as any })))
  }

  // Update individual entry
  const updateEntry = (employeeId: string, field: string, value: any) => {
    setEntries(prev => prev.map(entry => 
      entry.employee_id === employeeId 
        ? { ...entry, [field]: value }
        : entry
    ))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const bulkEntry: BulkAttendanceEntry = {
        date,
        entries: entries.filter(entry => entry.status !== 'present' || entry.check_in_time || entry.notes)
      }
      await onSubmit(bulkEntry)
    } catch (error) {
      console.error('Error submitting bulk attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get employee name
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
  }

  // Get employee ID
  const getEmployeeId = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    return employee?.employeeId || 'N/A'
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status)
    if (!statusConfig) return null

    const colorMap = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800'
    }

    return (
      <Badge className={colorMap[statusConfig.color as keyof typeof colorMap]}>
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Bulk Attendance Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_status">Default Status</Label>
              <Select 
                value={defaultStatus} 
                onValueChange={(value) => {
                  setDefaultStatus(value)
                  updateAllStatus(value)
                }}
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

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateAllStatus('present')}
                >
                  All Present
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateAllStatus('absent')}
                >
                  All Absent
                </Button>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In Time</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.employee_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getEmployeeName(entry.employee_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getEmployeeId(entry.employee_id)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Select 
                        value={entry.status} 
                        onValueChange={(value) => updateEntry(entry.employee_id, 'status', value)}
                      >
                        <SelectTrigger className="w-32">
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
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={entry.check_in_time}
                          onChange={(e) => updateEntry(entry.employee_id, 'check_in_time', e.target.value)}
                          placeholder="09:00"
                          className="w-24"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const now = new Date()
                            const timeString = now.toTimeString().slice(0, 5)
                            updateEntry(entry.employee_id, 'check_in_time', timeString)
                          }}
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        value={entry.notes}
                        onChange={(e) => updateEntry(entry.employee_id, 'notes', e.target.value)}
                        placeholder="Notes..."
                        className="w-48"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Recording attendance for {employees.length} employees on {new Date(date).toLocaleDateString()}
            </span>
            <span>
              {entries.filter(entry => entry.status === 'present').length} present, 
              {entries.filter(entry => entry.status === 'absent').length} absent, 
              {entries.filter(entry => entry.status === 'late').length} late
            </span>
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
              {loading ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

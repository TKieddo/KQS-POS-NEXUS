export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave' | 'public_holiday' | 'weekend'
  deductionType?: 'leave_days' | 'salary' | 'none'
  reason?: string
  notes?: string
  recordedBy: string
  recordedAt: string
  updatedAt: string
}

export interface LeaveBalance {
  id: string
  employeeId: string
  year: number
  totalLeaveDays: number
  usedLeaveDays: number
  remainingLeaveDays: number
  carriedOverDays: number
  createdAt: string
  updatedAt: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement'
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  halfDays: number
  leaveDays: number
  attendanceRate: number
  averageCheckInTime: string
  averageCheckOutTime: string
  totalWorkHours: number
  overtimeHours: number
}

export interface MonthlyAttendance {
  month: string
  year: number
  totalWorkingDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  leaveDays: number
  attendanceRate: number
  stats: AttendanceStats
}

export interface AttendanceFilters {
  employeeId?: string
  startDate?: string
  endDate?: string
  status?: string
  divisionId?: string
}

export interface AttendanceFormData {
  employeeId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave' | 'public_holiday' | 'weekend'
  deductionType?: 'leave_days' | 'salary' | 'none'
  reason?: string
  notes?: string
}

export interface BulkAttendanceData {
  date: string
  records: Array<{
    employeeId: string
    status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave' | 'public_holiday' | 'weekend'
    checkInTime?: string
    checkOutTime?: string
    deductionType?: 'leave_days' | 'salary' | 'none'
    reason?: string
    notes?: string
  }>
}

// Attendance status options
export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', color: 'green', icon: 'check' },
  { value: 'absent', label: 'Absent', color: 'red', icon: 'x' },
  { value: 'late', label: 'Late', color: 'yellow', icon: 'clock' },
  { value: 'half_day', label: 'Half Day', color: 'orange', icon: 'sun' },
  { value: 'sick_leave', label: 'Sick Leave', color: 'purple', icon: 'heart' },
  { value: 'annual_leave', label: 'Annual Leave', color: 'blue', icon: 'calendar' },
  { value: 'unpaid_leave', label: 'Unpaid Leave', color: 'gray', icon: 'minus' },
  { value: 'public_holiday', label: 'Public Holiday', color: 'indigo', icon: 'flag' },
  { value: 'weekend', label: 'Weekend', color: 'slate', icon: 'home' }
] as const

// Deduction types
export const DEDUCTION_TYPES = [
  { value: 'leave_days', label: 'Deduct from Leave Days' },
  { value: 'salary', label: 'Deduct from Salary' },
  { value: 'none', label: 'No Deduction' }
] as const

// Leave types
export const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'bereavement', label: 'Bereavement Leave' }
] as const

// Leave request statuses
export const LEAVE_REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
] as const

// Working days configuration
export interface WorkingDaysConfig {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
  workingHours: {
    start: string
    end: string
  }
  lateThreshold: number // minutes
  halfDayThreshold: number // hours
}

export const DEFAULT_WORKING_DAYS: WorkingDaysConfig = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
  workingHours: {
    start: '08:00',
    end: '17:00'
  },
  lateThreshold: 15, // 15 minutes
  halfDayThreshold: 4 // 4 hours
}

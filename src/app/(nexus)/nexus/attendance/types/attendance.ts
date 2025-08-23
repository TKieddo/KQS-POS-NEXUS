// Base entity interface
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Attendance record interface
export interface AttendanceRecord extends BaseEntity {
  employee_id: string
  date: string
  check_in_time?: string
  check_out_time?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave'
  leave_type?: 'annual' | 'sick' | 'personal' | 'unpaid'
  deduction_type?: 'leave_days' | 'salary' | 'none'
  reason?: string
  notes?: string
  recorded_by: string
}

// Leave balance interface
export interface LeaveBalance extends BaseEntity {
  employee_id: string
  year: number
  total_annual_leave: number
  used_annual_leave: number
  remaining_annual_leave: number
  total_sick_leave: number
  used_sick_leave: number
  remaining_sick_leave: number
  total_personal_leave: number
  used_personal_leave: number
  remaining_personal_leave: number
}

// Attendance summary interface
export interface AttendanceSummary {
  employee_id: string
  employee_name: string
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  half_days: number
  leave_days: number
  attendance_rate: number
  remaining_leave_days: number
}

// Monthly attendance stats
export interface MonthlyStats {
  month: string
  year: number
  total_employees: number
  average_attendance_rate: number
  total_absent_days: number
  total_leave_days: number
  total_late_days: number
}

// Attendance filters
export interface AttendanceFilters {
  dateRange: {
    start: string
    end: string
  }
  employeeId: string
  status: 'all' | 'present' | 'absent' | 'late' | 'half_day' | 'leave'
  divisionId: string
}

// Quick attendance entry
export interface QuickAttendanceEntry {
  employee_id: string
  status: 'present' | 'absent' | 'late' | 'half_day'
  check_in_time?: string
  notes?: string
}

// Bulk attendance entry
export interface BulkAttendanceEntry {
  date: string
  entries: QuickAttendanceEntry[]
}

// Calendar day interface
export interface CalendarDay {
  date: string
  dayOfWeek: string
  isWeekend: boolean
  isHoliday: boolean
  attendance?: AttendanceRecord
  isToday: boolean
  isSelected: boolean
}

// Attendance form data
export interface AttendanceFormData {
  employee_id: string
  date: string
  check_in_time: string
  check_out_time: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave'
  leave_type?: 'annual' | 'sick' | 'personal' | 'unpaid'
  deduction_type?: 'leave_days' | 'salary' | 'none'
  reason: string
  notes: string
}

// Constants
export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', color: 'green' },
  { value: 'absent', label: 'Absent', color: 'red' },
  { value: 'late', label: 'Late', color: 'yellow' },
  { value: 'half_day', label: 'Half Day', color: 'orange' },
  { value: 'leave', label: 'On Leave', color: 'blue' }
] as const

export const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
] as const

export const DEDUCTION_TYPES = [
  { value: 'leave_days', label: 'Deduct from Leave Days' },
  { value: 'salary', label: 'Deduct from Salary' },
  { value: 'none', label: 'No Deduction' }
] as const

export const WORK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

// Utility types
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number]['value']
export type LeaveType = typeof LEAVE_TYPES[number]['value']
export type DeductionType = typeof DEDUCTION_TYPES[number]['value']
export type WorkDay = typeof WORK_DAYS[number]

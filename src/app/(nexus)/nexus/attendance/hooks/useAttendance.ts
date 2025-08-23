import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  AttendanceRecord, 
  LeaveBalance, 
  AttendanceSummary, 
  MonthlyStats,
  AttendanceFilters,
  QuickAttendanceEntry,
  BulkAttendanceEntry
} from '../types/attendance'
import type { Employee } from '../../employees/types/employee'

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('first_name', { ascending: true })

      if (employeesError) throw employeesError
      setEmployees(employeesData || [])

      // Load attendance records for current month
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (attendanceError) throw attendanceError
      setAttendanceRecords(attendanceData || [])

      // Load leave balances for current year
      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('year', currentDate.getFullYear())

      if (leaveError) throw leaveError
      setLeaveBalances(leaveData || [])

    } catch (err) {
      console.error('Error loading attendance data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Get attendance records with filters
  const getAttendanceRecords = async (filters: AttendanceFilters) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .gte('date', filters.dateRange.start)
        .lte('date', filters.dateRange.end)
        .order('date', { ascending: false })

      if (filters.employeeId && filters.employeeId !== 'all') {
        query = query.eq('employee_id', filters.employeeId)
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      if (error) throw error

      return data || []
    } catch (err) {
      console.error('Error fetching attendance records:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch records')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Create attendance record
  const createAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([record])
        .select()
        .single()

      if (error) throw error

      setAttendanceRecords(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating attendance record:', err)
      setError(err instanceof Error ? err.message : 'Failed to create record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update attendance record
  const updateAttendanceRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAttendanceRecords(prev => 
        prev.map(record => record.id === id ? data : record)
      )
      return data
    } catch (err) {
      console.error('Error updating attendance record:', err)
      setError(err instanceof Error ? err.message : 'Failed to update record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete attendance record
  const deleteAttendanceRecord = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAttendanceRecords(prev => prev.filter(record => record.id !== id))
    } catch (err) {
      console.error('Error deleting attendance record:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Bulk create attendance records
  const bulkCreateAttendance = async (bulkEntry: BulkAttendanceEntry) => {
    setLoading(true)
    setError(null)

    try {
      const records = bulkEntry.entries.map(entry => ({
        employee_id: entry.employee_id,
        date: bulkEntry.date,
        check_in_time: entry.check_in_time,
        status: entry.status,
        notes: entry.notes,
        recorded_by: 'current_user_id' // Replace with actual user ID
      }))

      const { data, error } = await supabase
        .from('attendance_records')
        .insert(records)
        .select()

      if (error) throw error

      setAttendanceRecords(prev => [...(data || []), ...prev])
      return data
    } catch (err) {
      console.error('Error creating bulk attendance:', err)
      setError(err instanceof Error ? err.message : 'Failed to create bulk records')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get attendance summary for an employee
  const getAttendanceSummary = async (employeeId: string, startDate: string, endDate: string): Promise<AttendanceSummary | null> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const records = data || []
      const employee = employees.find(emp => emp.id === employeeId)
      
      if (!employee) return null

      const totalDays = records.length
      const presentDays = records.filter(r => r.status === 'present').length
      const absentDays = records.filter(r => r.status === 'absent').length
      const lateDays = records.filter(r => r.status === 'late').length
      const halfDays = records.filter(r => r.status === 'half_day').length
      const leaveDays = records.filter(r => r.status === 'leave').length

      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      // Get remaining leave days
      const currentYear = new Date().getFullYear()
      const leaveBalance = leaveBalances.find(lb => 
        lb.employee_id === employeeId && lb.year === currentYear
      )

      const remainingLeaveDays = leaveBalance?.remaining_annual_leave || 0

      return {
        employee_id: employeeId,
        employee_name: `${employee.firstName} ${employee.lastName}`,
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
        half_days: halfDays,
        leave_days: leaveDays,
        attendance_rate: Math.round(attendanceRate * 100) / 100,
        remaining_leave_days: remainingLeaveDays
      }
    } catch (err) {
      console.error('Error getting attendance summary:', err)
      return null
    }
  }

  // Get monthly statistics
  const getMonthlyStats = async (year: number, month: number): Promise<MonthlyStats | null> => {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const records = data || []
      const uniqueEmployees = new Set(records.map(r => r.employee_id))
      const totalEmployees = uniqueEmployees.size

      const totalAbsentDays = records.filter(r => r.status === 'absent').length
      const totalLeaveDays = records.filter(r => r.status === 'leave').length
      const totalLateDays = records.filter(r => r.status === 'late').length

      const presentDays = records.filter(r => r.status === 'present').length
      const totalDays = records.length
      const averageAttendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      return {
        month: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' }),
        year,
        total_employees: totalEmployees,
        average_attendance_rate: Math.round(averageAttendanceRate * 100) / 100,
        total_absent_days: totalAbsentDays,
        total_leave_days: totalLeaveDays,
        total_late_days: totalLateDays
      }
    } catch (err) {
      console.error('Error getting monthly stats:', err)
      return null
    }
  }

  // Update leave balance
  const updateLeaveBalance = async (employeeId: string, leaveType: string, daysUsed: number) => {
    setLoading(true)
    setError(null)

    try {
      const currentYear = new Date().getFullYear()
      const existingBalance = leaveBalances.find(lb => 
        lb.employee_id === employeeId && lb.year === currentYear
      )

      if (existingBalance) {
        const updates: any = {}
        if (leaveType === 'annual') {
          updates.used_annual_leave = existingBalance.used_annual_leave + daysUsed
          updates.remaining_annual_leave = existingBalance.remaining_annual_leave - daysUsed
        } else if (leaveType === 'sick') {
          updates.used_sick_leave = existingBalance.used_sick_leave + daysUsed
          updates.remaining_sick_leave = existingBalance.remaining_sick_leave - daysUsed
        } else if (leaveType === 'personal') {
          updates.used_personal_leave = existingBalance.used_personal_leave + daysUsed
          updates.remaining_personal_leave = existingBalance.remaining_personal_leave - daysUsed
        }

        const { data, error } = await supabase
          .from('leave_balances')
          .update(updates)
          .eq('id', existingBalance.id)
          .select()
          .single()

        if (error) throw error

        setLeaveBalances(prev => 
          prev.map(lb => lb.id === existingBalance.id ? data : lb)
        )
        return data
      } else {
        // Create new leave balance
        const newBalance = {
          employee_id: employeeId,
          year: currentYear,
          total_annual_leave: 12, // 12 days per year as per Lesotho law
          used_annual_leave: leaveType === 'annual' ? daysUsed : 0,
          remaining_annual_leave: leaveType === 'annual' ? 12 - daysUsed : 12,
          total_sick_leave: 10,
          used_sick_leave: leaveType === 'sick' ? daysUsed : 0,
          remaining_sick_leave: leaveType === 'sick' ? 10 - daysUsed : 10,
          total_personal_leave: 5,
          used_personal_leave: leaveType === 'personal' ? daysUsed : 0,
          remaining_personal_leave: leaveType === 'personal' ? 5 - daysUsed : 5
        }

        const { data, error } = await supabase
          .from('leave_balances')
          .insert([newBalance])
          .select()
          .single()

        if (error) throw error

        setLeaveBalances(prev => [data, ...prev])
        return data
      }
    } catch (err) {
      console.error('Error updating leave balance:', err)
      setError(err instanceof Error ? err.message : 'Failed to update leave balance')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Refresh data
  const refreshData = () => {
    loadData()
  }

  return {
    attendanceRecords,
    leaveBalances,
    employees,
    loading,
    error,
    getAttendanceRecords,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    bulkCreateAttendance,
    getAttendanceSummary,
    getMonthlyStats,
    updateLeaveBalance,
    refreshData
  }
}

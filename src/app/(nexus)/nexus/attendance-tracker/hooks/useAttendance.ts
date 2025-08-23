'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Employee {
  id: string
  name: string
  division: string
  position: string
  branch_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  date: string
  check_in_time?: string
  check_out_time?: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'sick_leave' | 'annual_leave' | 'unpaid_leave'
  deduction_type?: 'leave_days' | 'salary' | 'none'
  reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  employee_name: string
  start_date: string
  end_date: string
  leave_type: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement'
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  notes?: string
  deduction_type: 'leave_days' | 'salary' | 'none'
  number_of_days: number
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  employee_name: string
  year: number
  total_leave_days: number
  used_leave_days: number
  remaining_leave_days: number
  carried_over_days: number
  created_at: string
  updated_at: string
}

export function useAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setEmployees(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  // Fetch attendance records
  const fetchAttendanceRecords = async (date?: string) => {
    try {
      setLoading(true)
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query
      if (error) throw error
      setAttendanceRecords(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records')
    } finally {
      setLoading(false)
    }
  }

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeaveRequests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  // Fetch leave balances
  const fetchLeaveBalances = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*')
        .order('year', { ascending: false })

      if (error) throw error
      setLeaveBalances(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave balances')
    } finally {
      setLoading(false)
    }
  }

  // Create or update attendance record
  const saveAttendanceRecord = async (record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      
      // Check if record already exists for this employee and date
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('employee_id', record.employee_id)
        .eq('date', record.date)
        .single()

      let result
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance_records')
          .update({
            check_in_time: record.check_in_time,
            check_out_time: record.check_out_time,
            status: record.status,
            deduction_type: record.deduction_type,
            reason: record.reason,
            notes: record.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            ...record,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Refresh attendance records
      await fetchAttendanceRecords()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Bulk save attendance records
  const bulkSaveAttendanceRecords = async (records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      setLoading(true)
      
      // Delete existing records for the date
      if (records.length > 0) {
        await supabase
          .from('attendance_records')
          .delete()
          .eq('date', records[0].date)
      }

      // Insert new records
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(records.map(record => ({
          ...record,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error

      // Refresh attendance records
      await fetchAttendanceRecords()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bulk attendance records')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create leave request
  const createLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          ...request,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Refresh leave requests
      await fetchLeaveRequests()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leave request')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update leave request status
  const updateLeaveRequestStatus = async (id: string, status: LeaveRequest['status'], approvedBy?: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status,
          approved_by: approvedBy,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Refresh leave requests
      await fetchLeaveRequests()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leave request')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create or update leave balance
  const saveLeaveBalance = async (balance: Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      
      // Check if balance already exists for this employee and year
      const { data: existingBalance } = await supabase
        .from('leave_balances')
        .select('id')
        .eq('employee_id', balance.employee_id)
        .eq('year', balance.year)
        .single()

      let result
      if (existingBalance) {
        // Update existing balance
        const { data, error } = await supabase
          .from('leave_balances')
          .update({
            total_leave_days: balance.total_leave_days,
            used_leave_days: balance.used_leave_days,
            remaining_leave_days: balance.remaining_leave_days,
            carried_over_days: balance.carried_over_days,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBalance.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new balance
        const { data, error } = await supabase
          .from('leave_balances')
          .insert({
            ...balance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Refresh leave balances
      await fetchLeaveBalances()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save leave balance')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initialize leave balance for employee (12 days per year as per Lesotho law)
  const initializeLeaveBalance = async (employeeId: string, employeeName: string, year: number) => {
    try {
      const balance = {
        employee_id: employeeId,
        employee_name: employeeName,
        year,
        total_leave_days: 12,
        used_leave_days: 0,
        remaining_leave_days: 12,
        carried_over_days: 0
      }

      return await saveLeaveBalance(balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize leave balance')
      throw err
    }
  }

  // Calculate leave days between two dates
  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end dates
  }

  // Get attendance records for a specific date range
  const getAttendanceRecordsByDateRange = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records by date range')
      throw err
    }
  }

  // Get employee attendance summary
  const getEmployeeAttendanceSummary = async (employeeId: string, startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const records = data || []
      const present = records.filter(r => r.status === 'present').length
      const absent = records.filter(r => r.status === 'absent').length
      const late = records.filter(r => r.status === 'late').length
      const onLeave = records.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length

      return {
        total: records.length,
        present,
        absent,
        late,
        onLeave,
        attendanceRate: records.length > 0 ? (present / records.length) * 100 : 0
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get employee attendance summary')
      throw err
    }
  }

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          fetchEmployees(),
          fetchAttendanceRecords(),
          fetchLeaveRequests(),
          fetchLeaveBalances()
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  return {
    // Data
    employees,
    attendanceRecords,
    leaveRequests,
    leaveBalances,
    loading,
    error,

    // Actions
    fetchEmployees,
    fetchAttendanceRecords,
    fetchLeaveRequests,
    fetchLeaveBalances,
    saveAttendanceRecord,
    bulkSaveAttendanceRecords,
    createLeaveRequest,
    updateLeaveRequestStatus,
    saveLeaveBalance,
    initializeLeaveBalance,
    calculateLeaveDays,
    getAttendanceRecordsByDateRange,
    getEmployeeAttendanceSummary,

    // Utility functions
    clearError: () => setError(null)
  }
}

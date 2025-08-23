import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { 
  AttendanceRecord, 
  LeaveBalance, 
  LeaveRequest, 
  AttendanceStats, 
  MonthlyAttendance,
  AttendanceFilters,
  AttendanceFormData,
  BulkAttendanceData,
  WorkingDaysConfig
} from '../types/attendance'
import type { Employee } from '../types/employee'

export function useAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(async (filters?: AttendanceFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false })

      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId)
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setAttendanceRecords(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch leave balances
  const fetchLeaveBalances = useCallback(async (employeeId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('leave_balances')
        .select('*')
        .order('year', { ascending: false })

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setLeaveBalances(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave balances')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async (employeeId?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (employeeId) {
        query = query.eq('employee_id', employeeId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setLeaveRequests(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }, [])

  // Create attendance record
  const createAttendanceRecord = useCallback(async (data: AttendanceFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: record, error: createError } = await supabase
        .from('attendance_records')
        .insert([{
          employee_id: data.employeeId,
          date: data.date,
          check_in_time: data.checkInTime,
          check_out_time: data.checkOutTime,
          status: data.status,
          deduction_type: data.deductionType,
          reason: data.reason,
          notes: data.notes,
          recorded_by: (await supabase.auth.getUser()).data.user?.id || 'system'
        }])
        .select()
        .single()

      if (createError) throw createError
      
      setAttendanceRecords(prev => [record, ...prev])
      return record
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attendance record')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update attendance record
  const updateAttendanceRecord = useCallback(async (id: string, data: Partial<AttendanceFormData>) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: record, error: updateError } = await supabase
        .from('attendance_records')
        .update({
          check_in_time: data.checkInTime,
          check_out_time: data.checkOutTime,
          status: data.status,
          deduction_type: data.deductionType,
          reason: data.reason,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      setAttendanceRecords(prev => 
        prev.map(r => r.id === id ? record : r)
      )
      return record
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance record')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete attendance record
  const deleteAttendanceRecord = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      setAttendanceRecords(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendance record')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk create attendance records
  const createBulkAttendance = useCallback(async (data: BulkAttendanceData) => {
    setLoading(true)
    setError(null)
    
    try {
      const records = data.records.map(record => ({
        employee_id: record.employeeId,
        date: data.date,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        status: record.status,
        deduction_type: record.deductionType,
        reason: record.reason,
        notes: record.notes,
        recorded_by: (await supabase.auth.getUser()).data.user?.id || 'system'
      }))

      const { data: createdRecords, error: createError } = await supabase
        .from('attendance_records')
        .insert(records)
        .select()

      if (createError) throw createError
      
      setAttendanceRecords(prev => [...createdRecords, ...prev])
      return createdRecords
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bulk attendance records')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create leave request
  const createLeaveRequest = useCallback(async (data: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: request, error: createError } = await supabase
        .from('leave_requests')
        .insert([{
          employee_id: data.employeeId,
          start_date: data.startDate,
          end_date: data.endDate,
          leave_type: data.leaveType,
          reason: data.reason,
          status: data.status,
          notes: data.notes
        }])
        .select()
        .single()

      if (createError) throw createError
      
      setLeaveRequests(prev => [request, ...prev])
      return request
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create leave request')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update leave request status
  const updateLeaveRequestStatus = useCallback(async (id: string, status: LeaveRequest['status'], approvedBy?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'approved' && approvedBy) {
        updateData.approved_by = approvedBy
        updateData.approved_at = new Date().toISOString()
      }

      const { data: request, error: updateError } = await supabase
        .from('leave_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      setLeaveRequests(prev => 
        prev.map(r => r.id === id ? request : r)
      )
      return request
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leave request')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Get attendance statistics
  const getAttendanceStats = useCallback(async (employeeId: string, startDate: string, endDate: string): Promise<AttendanceStats> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      const records = data || []
      const totalDays = records.length
      const presentDays = records.filter(r => r.status === 'present').length
      const absentDays = records.filter(r => r.status === 'absent').length
      const lateDays = records.filter(r => r.status === 'late').length
      const halfDays = records.filter(r => r.status === 'half_day').length
      const leaveDays = records.filter(r => ['sick_leave', 'annual_leave', 'unpaid_leave'].includes(r.status)).length

      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      // Calculate average check-in/out times
      const checkInTimes = records
        .filter(r => r.check_in_time)
        .map(r => new Date(`2000-01-01T${r.check_in_time}`).getTime())
      
      const checkOutTimes = records
        .filter(r => r.check_out_time)
        .map(r => new Date(`2000-01-01T${r.check_out_time}`).getTime())

      const averageCheckInTime = checkInTimes.length > 0 
        ? new Date(checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length).toTimeString().slice(0, 5)
        : '00:00'

      const averageCheckOutTime = checkOutTimes.length > 0
        ? new Date(checkOutTimes.reduce((a, b) => a + b, 0) / checkOutTimes.length).toTimeString().slice(0, 5)
        : '00:00'

      // Calculate work hours
      let totalWorkHours = 0
      let overtimeHours = 0
      const standardWorkDay = 8 // 8 hours

      records.forEach(record => {
        if (record.check_in_time && record.check_out_time) {
          const checkIn = new Date(`2000-01-01T${record.check_in_time}`)
          const checkOut = new Date(`2000-01-01T${record.check_out_time}`)
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
          
          totalWorkHours += hours
          if (hours > standardWorkDay) {
            overtimeHours += hours - standardWorkDay
          }
        }
      })

      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        leaveDays,
        attendanceRate,
        averageCheckInTime,
        averageCheckOutTime,
        totalWorkHours,
        overtimeHours
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to calculate attendance statistics')
    }
  }, [])

  // Get monthly attendance summary
  const getMonthlyAttendance = useCallback(async (employeeId: string, year: number): Promise<MonthlyAttendance[]> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)

      if (error) throw error

      const records = data || []
      const monthlyData: MonthlyAttendance[] = []

      for (let month = 1; month <= 12; month++) {
        const monthRecords = records.filter(r => {
          const recordMonth = new Date(r.date).getMonth() + 1
          return recordMonth === month
        })

        const stats = await getAttendanceStats(
          employeeId,
          `${year}-${month.toString().padStart(2, '0')}-01`,
          `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`
        )

        monthlyData.push({
          month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
          year,
          totalWorkingDays: stats.totalDays,
          presentDays: stats.presentDays,
          absentDays: stats.absentDays,
          lateDays: stats.lateDays,
          leaveDays: stats.leaveDays,
          attendanceRate: stats.attendanceRate,
          stats
        })
      }

      return monthlyData
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get monthly attendance')
    }
  }, [getAttendanceStats])

  // Initialize leave balance for employee
  const initializeLeaveBalance = useCallback(async (employeeId: string, year: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .insert([{
          employee_id: employeeId,
          year,
          total_leave_days: 12, // 12 days per year as per Lesotho law
          used_leave_days: 0,
          remaining_leave_days: 12,
          carried_over_days: 0
        }])
        .select()
        .single()

      if (error) throw error
      
      setLeaveBalances(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize leave balance')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update leave balance
  const updateLeaveBalance = useCallback(async (employeeId: string, year: number, usedDays: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('leave_balances')
        .update({
          used_leave_days: usedDays,
          remaining_leave_days: 12 - usedDays,
          updated_at: new Date().toISOString()
        })
        .eq('employee_id', employeeId)
        .eq('year', year)
        .select()
        .single()

      if (error) throw error
      
      setLeaveBalances(prev => 
        prev.map(b => (b.employeeId === employeeId && b.year === year) ? data : b)
      )
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update leave balance')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // State
    attendanceRecords,
    leaveBalances,
    leaveRequests,
    loading,
    error,

    // Actions
    fetchAttendanceRecords,
    fetchLeaveBalances,
    fetchLeaveRequests,
    createAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    createBulkAttendance,
    createLeaveRequest,
    updateLeaveRequestStatus,
    getAttendanceStats,
    getMonthlyAttendance,
    initializeLeaveBalance,
    updateLeaveBalance
  }
}

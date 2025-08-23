'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { 
  ReportSchedule, 
  ExportSettings, 
  DataExport,
  ReportExecution,
  ReportScheduleFormData,
  ExportSettingsFormData,
  DataExportFormData
} from '../types'
import { 
  ReportSchedulesService, 
  ExportSettingsService, 
  DataExportService,
  ReportExecutionsService
} from '../services/reports-service'

// ========================================
// REPORT SCHEDULES HOOK
// ========================================

export const useReportSchedules = () => {
  const { selectedBranch } = useBranch()
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ReportSchedulesService.getReportSchedules(selectedBranch?.id)
      setSchedules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report schedules')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const addSchedule = useCallback(async (schedule: ReportScheduleFormData) => {
    try {
      setError(null)
      const newSchedule = await ReportSchedulesService.createReportSchedule(schedule, selectedBranch?.id)
      setSchedules(prev => [newSchedule, ...prev])
      return newSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report schedule')
      throw err
    }
  }, [selectedBranch?.id])

  const updateSchedule = useCallback(async (id: string, updates: Partial<ReportScheduleFormData>) => {
    try {
      setError(null)
      const updatedSchedule = await ReportSchedulesService.updateReportSchedule(id, updates)
      setSchedules(prev => prev.map(schedule => schedule.id === id ? updatedSchedule : schedule))
      return updatedSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report schedule')
      throw err
    }
  }, [])

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setError(null)
      await ReportSchedulesService.deleteReportSchedule(id)
      setSchedules(prev => prev.filter(schedule => schedule.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report schedule')
      throw err
    }
  }, [])

  const toggleSchedule = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null)
      const updatedSchedule = await ReportSchedulesService.toggleReportSchedule(id, isActive)
      setSchedules(prev => prev.map(schedule => schedule.id === id ? updatedSchedule : schedule))
      return updatedSchedule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle report schedule')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  return {
    schedules,
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    refetch: fetchSchedules
  }
}

// ========================================
// EXPORT SETTINGS HOOK
// ========================================

export const useExportSettings = () => {
  const { selectedBranch } = useBranch()
  const [settings, setSettings] = useState<ExportSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ExportSettingsService.getExportSettings(selectedBranch?.id)
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch export settings')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const saveSettings = useCallback(async (newSettings: ExportSettingsFormData) => {
    try {
      setSaving(true)
      setError(null)
      const savedSettings = await ExportSettingsService.saveExportSettings(newSettings, selectedBranch?.id)
      setSettings(savedSettings)
      return savedSettings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save export settings')
      throw err
    } finally {
      setSaving(false)
    }
  }, [selectedBranch?.id])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    saving,
    saveSettings,
    refetch: fetchSettings
  }
}

// ========================================
// DATA EXPORTS HOOK
// ========================================

export const useDataExports = () => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const [exports, setExports] = useState<DataExport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const fetchExports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DataExportService.getDataExports(selectedBranch?.id)
      setExports(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data exports')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const createExport = useCallback(async (exportData: DataExportFormData) => {
    try {
      setCreating(true)
      setError(null)
      const newExport = await DataExportService.createDataExport(exportData, selectedBranch?.id, user?.id)
      setExports(prev => [newExport, ...prev])
      return newExport
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data export')
      throw err
    } finally {
      setCreating(false)
    }
  }, [selectedBranch?.id, user?.id])

  const deleteExport = useCallback(async (id: string) => {
    try {
      setError(null)
      await DataExportService.deleteDataExport(id)
      setExports(prev => prev.filter(exp => exp.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data export')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchExports()
  }, [fetchExports])

  return {
    exports,
    loading,
    error,
    creating,
    createExport,
    deleteExport,
    refetch: fetchExports
  }
}

// ========================================
// REPORT EXECUTIONS HOOK
// ========================================

export const useReportExecutions = () => {
  const { selectedBranch } = useBranch()
  const [executions, setExecutions] = useState<ReportExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ReportExecutionsService.getReportExecutions(selectedBranch?.id)
      setExecutions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report executions')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const createExecution = useCallback(async (execution: Omit<ReportExecution, 'id' | 'started_at'>) => {
    try {
      setError(null)
      const newExecution = await ReportExecutionsService.createReportExecution(execution)
      setExecutions(prev => [newExecution, ...prev])
      return newExecution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report execution')
      throw err
    }
  }, [])

  const updateExecutionStatus = useCallback(async (id: string, status: 'pending' | 'processing' | 'completed' | 'failed', fileUrl?: string, fileSize?: number, errorMessage?: string) => {
    try {
      setError(null)
      const updatedExecution = await ReportExecutionsService.updateReportExecutionStatus(id, status, fileUrl, fileSize, errorMessage)
      setExecutions(prev => prev.map(exec => exec.id === id ? updatedExecution : exec))
      return updatedExecution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report execution status')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchExecutions()
  }, [fetchExecutions])

  return {
    executions,
    loading,
    error,
    createExecution,
    updateExecutionStatus,
    refetch: fetchExecutions
  }
} 
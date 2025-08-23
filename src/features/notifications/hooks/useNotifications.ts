'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { 
  NotificationRule, 
  IntegrationSettings, 
  NotificationLog,
  NotificationRuleFormData,
  IntegrationSettingsFormData
} from '../types'
import { 
  NotificationRulesService, 
  IntegrationSettingsService, 
  NotificationLogsService 
} from '../services/notifications-service'

// ========================================
// NOTIFICATION RULES HOOK
// ========================================

export const useNotificationRules = () => {
  const { selectedBranch } = useBranch()
  const [rules, setRules] = useState<NotificationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotificationRulesService.getNotificationRules(selectedBranch?.id)
      setRules(data)
    } catch (err) {
      console.error('Error fetching rules:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notification rules')
      setRules([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const addRule = useCallback(async (rule: NotificationRuleFormData) => {
    try {
      setError(null)
      const newRule = await NotificationRulesService.createNotificationRule(rule, selectedBranch?.id)
      setRules(prev => [newRule, ...prev])
      return newRule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification rule')
      throw err
    }
  }, [selectedBranch?.id])

  const updateRule = useCallback(async (id: string, updates: Partial<NotificationRuleFormData>) => {
    try {
      setError(null)
      const updatedRule = await NotificationRulesService.updateNotificationRule(id, updates)
      setRules(prev => prev.map(rule => rule.id === id ? updatedRule : rule))
      return updatedRule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification rule')
      throw err
    }
  }, [])

  const deleteRule = useCallback(async (id: string) => {
    try {
      setError(null)
      await NotificationRulesService.deleteNotificationRule(id)
      setRules(prev => prev.filter(rule => rule.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification rule')
      throw err
    }
  }, [])

  const toggleRule = useCallback(async (id: string, isActive: boolean) => {
    try {
      setError(null)
      const updatedRule = await NotificationRulesService.toggleNotificationRule(id, isActive)
      setRules(prev => prev.map(rule => rule.id === id ? updatedRule : rule))
      return updatedRule
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle notification rule')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  return {
    rules,
    loading,
    error,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules
  }
}

// ========================================
// INTEGRATION SETTINGS HOOK
// ========================================

export const useIntegrationSettings = () => {
  const { selectedBranch } = useBranch()
  const [settings, setSettings] = useState<IntegrationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await IntegrationSettingsService.getIntegrationSettings(selectedBranch?.id)
      setSettings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integration settings')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch?.id])

  const saveSettings = useCallback(async (newSettings: IntegrationSettingsFormData) => {
    try {
      setSaving(true)
      setError(null)
      const savedSettings = await IntegrationSettingsService.saveIntegrationSettings(newSettings, selectedBranch?.id)
      setSettings(savedSettings)
      return savedSettings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save integration settings')
      throw err
    } finally {
      setSaving(false)
    }
  }, [selectedBranch?.id])

  const testEmail = useCallback(async (testSettings: IntegrationSettingsFormData) => {
    try {
      setError(null)
      const result = await IntegrationSettingsService.testEmailConfiguration(testSettings)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test email configuration')
      throw err
    }
  }, [])

  const testSMS = useCallback(async (testSettings: IntegrationSettingsFormData) => {
    try {
      setError(null)
      const result = await IntegrationSettingsService.testSMSConfiguration(testSettings)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test SMS configuration')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    saving,
    saveSettings,
    testEmail,
    testSMS,
    refetch: fetchSettings
  }
}

// ========================================
// NOTIFICATION LOGS HOOK
// ========================================

export const useNotificationLogs = (limit: number = 50) => {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotificationLogsService.getNotificationLogs(limit)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification logs')
    } finally {
      setLoading(false)
    }
  }, [limit])

  const createLog = useCallback(async (log: Omit<NotificationLog, 'id' | 'created_at'>) => {
    try {
      setError(null)
      const newLog = await NotificationLogsService.createNotificationLog(log)
      setLogs(prev => [newLog, ...prev.slice(0, limit - 1)])
      return newLog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification log')
      throw err
    }
  }, [limit])

  const updateLogStatus = useCallback(async (id: string, status: 'pending' | 'sent' | 'failed', errorMessage?: string) => {
    try {
      setError(null)
      const updatedLog = await NotificationLogsService.updateNotificationLogStatus(id, status, errorMessage)
      setLogs(prev => prev.map(log => log.id === id ? updatedLog : log))
      return updatedLog
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification log')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    loading,
    error,
    createLog,
    updateLogStatus,
    refetch: fetchLogs
  }
} 
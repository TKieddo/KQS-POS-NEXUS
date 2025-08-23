'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBranch } from '@/context/BranchContext'
import { productPricingCompleteService } from '@/lib/product-pricing-complete-service'
import type {
  PricingSettings,
  PricingRule,
  PriceAnalysisData,
  PricingReport,
  ImportExportHistory,
  BulkPriceUpdate,
  DiscountManagement,
  PriceOptimizationSuggestion,
  QuickActionLog
} from '@/lib/product-pricing-complete-service'

export const useProductPricingComplete = () => {
  const { selectedBranch } = useBranch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for all data
  const [settings, setSettings] = useState<PricingSettings | null>(null)
  const [rules, setRules] = useState<PricingRule[]>([])
  const [analysisData, setAnalysisData] = useState<PriceAnalysisData[]>([])
  const [reports, setReports] = useState<PricingReport[]>([])
  const [importExportHistory, setImportExportHistory] = useState<ImportExportHistory[]>([])
  const [bulkUpdates, setBulkUpdates] = useState<BulkPriceUpdate[]>([])
  const [discounts, setDiscounts] = useState<DiscountManagement[]>([])
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<PriceOptimizationSuggestion[]>([])
  const [actionLogs, setActionLogs] = useState<QuickActionLog[]>([])

  // Overview data
  const [overview, setOverview] = useState({
    rulesCount: 0,
    activeRulesCount: 0,
    analysisCount: 0,
    reportsCount: 0
  })

  // Load all data
  const loadAllData = useCallback(async () => {
    console.log('loadAllData called, selectedBranch:', selectedBranch)
    
    if (!selectedBranch?.id) {
      console.log('No selectedBranch.id, skipping data load')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Loading pricing data for branch:', selectedBranch.id)
      
      const [
        settingsData,
        rulesData,
        analysisData,
        reportsData,
        historyData,
        bulkUpdatesData,
        discountsData,
        suggestionsData,
        logsData,
        overviewData
      ] = await Promise.all([
        productPricingCompleteService.getSettings(selectedBranch.id),
        productPricingCompleteService.getRules(selectedBranch.id),
        productPricingCompleteService.getAnalysisData(selectedBranch.id),
        productPricingCompleteService.getReports(selectedBranch.id),
        productPricingCompleteService.getHistory(selectedBranch.id),
        productPricingCompleteService.getBulkUpdates(selectedBranch.id),
        productPricingCompleteService.getDiscounts(selectedBranch.id),
        productPricingCompleteService.getSuggestions(selectedBranch.id),
        productPricingCompleteService.getActionLogs(selectedBranch.id),
        productPricingCompleteService.getPricingOverview(selectedBranch.id)
      ])

      console.log('Data loaded successfully:', {
        settings: settingsData,
        rules: rulesData?.length || 0,
        overview: overviewData
      })

      setSettings(settingsData)
      setRules(rulesData || [])
      setAnalysisData(analysisData || [])
      setReports(reportsData || [])
      setImportExportHistory(historyData || [])
      setBulkUpdates(bulkUpdatesData || [])
      setDiscounts(discountsData || [])
      setOptimizationSuggestions(suggestionsData || [])
      setActionLogs(logsData || [])
      setOverview(overviewData || {
        rulesCount: 0,
        activeRulesCount: 0,
        analysisCount: 0,
        reportsCount: 0
      })
    } catch (err) {
      console.error('Error loading pricing data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id])

  // Load data on mount and branch change
  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Pricing Settings
  const updateSettings = useCallback(async (updates: Partial<PricingSettings>) => {
    if (!selectedBranch?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.updateSettings(selectedBranch.id, updates)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Pricing Rules
  const createRule = useCallback(async (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const ruleId = await productPricingCompleteService.createRule({
        ...rule,
        branch_id: selectedBranch.id
      })
      if (ruleId) {
        await loadAllData() // Reload data
      }
      return ruleId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  const updateRule = useCallback(async (id: string, updates: Partial<PricingRule>) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.updateRule(id, updates)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData])

  const deleteRule = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.deleteRule(id)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData])

  // Price Analysis
  const createAnalysisData = useCallback(async (data: Omit<PriceAnalysisData, 'id' | 'created_at'>) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const analysisId = await productPricingCompleteService.createAnalysisData({
        ...data,
        branch_id: selectedBranch.id
      })
      if (analysisId) {
        await loadAllData() // Reload data
      }
      return analysisId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis data')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Pricing Reports
  const generateReport = useCallback(async (
    reportType: string,
    startDate: string,
    endDate: string,
    reportName: string
  ) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const reportId = await productPricingCompleteService.generateReport(
        selectedBranch.id,
        reportType,
        startDate,
        endDate,
        reportName
      )
      if (reportId) {
        await loadAllData() // Reload data
      }
      return reportId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Import/Export
  const exportData = useCallback(async (dataType: string) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const data = await productPricingCompleteService.exportData(selectedBranch.id, dataType)
      
      // Create history record
      await productPricingCompleteService.createHistoryRecord({
        branch_id: selectedBranch.id,
        operation_type: 'export',
        data_type: dataType as any,
        filename: `${dataType}_${new Date().toISOString().split('T')[0]}.json`,
        file_size: JSON.stringify(data).length,
        status: 'completed'
      })

      await loadAllData() // Reload data
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  const importData = useCallback(async (dataType: string, data: any) => {
    if (!selectedBranch?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.importData(selectedBranch.id, dataType, data)
      
      // Create history record
      await productPricingCompleteService.createHistoryRecord({
        branch_id: selectedBranch.id,
        operation_type: 'import',
        data_type: dataType as any,
        filename: `imported_${dataType}_${new Date().toISOString().split('T')[0]}.json`,
        status: success ? 'completed' : 'failed'
      })

      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Bulk Price Updates
  const createBulkUpdate = useCallback(async (update: Omit<BulkPriceUpdate, 'id' | 'created_at' | 'completed_at' | 'branch_id'> & { branch_id?: string }) => {
    if (!selectedBranch?.id) {
      setError('No branch selected. Please select a branch first.')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const updateId = await productPricingCompleteService.createBulkUpdate({
        ...update,
        branch_id: selectedBranch.id
      })
      
      if (updateId) {
        // Execute the bulk update
        const success = await productPricingCompleteService.executeBulkUpdate(updateId)
        if (success) {
          await loadAllData() // Reload data
        }
      }
      
      return updateId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bulk update'
      setError(errorMessage)
      
      // If it's a migration error, provide specific guidance
      if (errorMessage.includes('Database migration required')) {
        setError('Database migration required. Please contact your administrator to run the pricing migration in the Supabase dashboard.')
      } else if (errorMessage.includes('Missing required fields')) {
        setError('Please fill in all required fields for the bulk update.')
      } else if (errorMessage.includes('Invalid branch reference')) {
        setError('Please select a valid branch before creating a bulk update.')
      } else if (errorMessage.includes('Database error')) {
        setError(`Database error: ${errorMessage}. Please try again or contact support.`)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Discount Management
  const createDiscount = useCallback(async (discount: Omit<DiscountManagement, 'id' | 'created_at' | 'updated_at' | 'branch_id' | 'created_by'> & { branch_id?: string; created_by?: string }) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const discountId = await productPricingCompleteService.createDiscount({
        ...discount,
        branch_id: selectedBranch.id
      })
      if (discountId) {
        await loadAllData() // Reload data
      }
      return discountId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discount')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  const updateDiscount = useCallback(async (id: string, updates: Partial<DiscountManagement>) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.updateDiscount(id, updates)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update discount')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData])

  const deleteDiscount = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.deleteDiscount(id)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete discount')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData])

  // Apply all active discounts to products
  const applyAllActiveDiscounts = useCallback(async () => {
    if (!selectedBranch?.id) return false

    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.applyAllActiveDiscounts(selectedBranch.id)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply active discounts')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Price Optimization
  const createOptimizationSuggestion = useCallback(async (suggestion: Omit<PriceOptimizationSuggestion, 'id' | 'created_at'>) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const suggestionId = await productPricingCompleteService.createSuggestion({
        ...suggestion,
        branch_id: selectedBranch.id
      })
      if (suggestionId) {
        await loadAllData() // Reload data
      }
      return suggestionId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create optimization suggestion')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  const applyOptimizationSuggestion = useCallback(async (suggestionId: string, userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await productPricingCompleteService.applySuggestion(suggestionId, userId)
      if (success) {
        await loadAllData() // Reload data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply optimization suggestion')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadAllData])

  // Quick Actions
  const logQuickAction = useCallback(async (action: Omit<QuickActionLog, 'id' | 'created_at' | 'branch_id' | 'performed_by'> & { branch_id?: string; performed_by?: string }) => {
    if (!selectedBranch?.id) return null

    setIsLoading(true)
    setError(null)

    try {
      const actionId = await productPricingCompleteService.logAction({
        ...action,
        branch_id: selectedBranch.id
      })
      if (actionId) {
        await loadAllData() // Reload data
      }
      return actionId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log quick action')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Apply All Pricing Rules
  const applyAllPricingRules = useCallback(async () => {
    if (!selectedBranch?.id) return { success: 0, failed: 0 }

    setIsLoading(true)
    setError(null)

    try {
      const result = await productPricingCompleteService.applyAllPricingRules(selectedBranch.id)
      if (result) {
        await loadAllData() // Reload data
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply pricing rules')
      return { success: 0, failed: 0 }
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranch?.id, loadAllData])

  // Utility functions
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshData = useCallback(() => {
    loadAllData()
  }, [loadAllData])

  return {
    // State
    isLoading,
    error,
    settings,
    rules,
    analysisData,
    reports,
    importExportHistory,
    bulkUpdates,
    discounts,
    optimizationSuggestions,
    actionLogs,
    overview,

    // Actions
    updateSettings,
    createRule,
    updateRule,
    deleteRule,
    createAnalysisData,
    generateReport,
    exportData,
    importData,
    createBulkUpdate,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    createOptimizationSuggestion,
    applyOptimizationSuggestion,
    logQuickAction,
    applyAllPricingRules,
    applyAllActiveDiscounts,
    clearError,
    refreshData
  }
} 
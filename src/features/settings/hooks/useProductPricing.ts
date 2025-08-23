'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useBranch } from '@/context/BranchContext'
import { ProductPricingService, type ProductPricingSettings, type ProductPricingRule, type BulkPricingOperation, type SeasonalPricingRule } from '@/lib/product-pricing-service'

export const useProductPricing = () => {
  const { user } = useAuth()
  const { selectedBranch } = useBranch()
  const [service, setService] = useState<ProductPricingService | null>(null)

  // State
  const [pricingSettings, setPricingSettings] = useState<ProductPricingSettings | null>(null)
  const [pricingRules, setPricingRules] = useState<ProductPricingRule[]>([])
  const [seasonalRules, setSeasonalRules] = useState<SeasonalPricingRule[]>([])
  const [bulkOperations, setBulkOperations] = useState<BulkPricingOperation[]>([])
  
  // Loading states
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isLoadingRules, setIsLoadingRules] = useState(true)
  const [isLoadingSeasonal, setIsLoadingSeasonal] = useState(true)
  const [isLoadingBulk, setIsLoadingBulk] = useState(true)
  
  // Saving states
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isSavingRule, setIsSavingRule] = useState(false)
  const [isSavingSeasonal, setIsSavingSeasonal] = useState(false)
  
  // Error states
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [rulesError, setRulesError] = useState<string | null>(null)
  const [seasonalError, setSeasonalError] = useState<string | null>(null)
  const [bulkError, setBulkError] = useState<string | null>(null)

  // Initialize service when branch changes
  useEffect(() => {
    if (selectedBranch?.id) {
      setService(new ProductPricingService(selectedBranch.id))
    }
  }, [selectedBranch?.id])

  // Load pricing settings
  const loadPricingSettings = useCallback(async () => {
    if (!service) return

    setIsLoadingSettings(true)
    setSettingsError(null)

    try {
      const { data, error } = await service.getPricingSettings()
      
      if (error) {
        setSettingsError(error)
        return
      }

      setPricingSettings(data)
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : 'Failed to load pricing settings')
    } finally {
      setIsLoadingSettings(false)
    }
  }, [service])

  // Load pricing rules
  const loadPricingRules = useCallback(async () => {
    if (!service) return

    setIsLoadingRules(true)
    setRulesError(null)

    try {
      const { data, error } = await service.getPricingRules()
      
      if (error) {
        setRulesError(error)
        return
      }

      setPricingRules(data || [])
    } catch (error) {
      setRulesError(error instanceof Error ? error.message : 'Failed to load pricing rules')
    } finally {
      setIsLoadingRules(false)
    }
  }, [service])

  // Load seasonal pricing rules
  const loadSeasonalRules = useCallback(async () => {
    if (!service) return

    setIsLoadingSeasonal(true)
    setSeasonalError(null)

    try {
      const { data, error } = await service.getSeasonalPricingRules()
      
      if (error) {
        setSeasonalError(error)
        return
      }

      setSeasonalRules(data || [])
    } catch (error) {
      setSeasonalError(error instanceof Error ? error.message : 'Failed to load seasonal rules')
    } finally {
      setIsLoadingSeasonal(false)
    }
  }, [service])

  // Load bulk operations
  const loadBulkOperations = useCallback(async () => {
    if (!service) return

    setIsLoadingBulk(true)
    setBulkError(null)

    try {
      const { data, error } = await service.getBulkPricingOperations()
      
      if (error) {
        setBulkError(error)
        return
      }

      setBulkOperations(data || [])
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Failed to load bulk operations')
    } finally {
      setIsLoadingBulk(false)
    }
  }, [service])

  // Load all data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadPricingSettings(),
      loadPricingRules(),
      loadSeasonalRules(),
      loadBulkOperations()
    ])
  }, [loadPricingSettings, loadPricingRules, loadSeasonalRules, loadBulkOperations])

  // Load data when service changes
  useEffect(() => {
    if (service) {
      loadAllData()
    }
  }, [service, loadAllData])

  // Update pricing settings
  const updatePricingSettings = useCallback(async (updates: Partial<ProductPricingSettings>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingSettings(true)
    setSettingsError(null)

    try {
      const result = await service.updatePricingSettings(updates)
      
      if (result.success) {
        setPricingSettings(prev => prev ? { ...prev, ...updates } : null)
      } else {
        setSettingsError(result.error || 'Failed to update settings')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings'
      setSettingsError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingSettings(false)
    }
  }, [service])

  // Create pricing rule
  const createPricingRule = useCallback(async (rule: Omit<ProductPricingRule, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingRule(true)
    setRulesError(null)

    try {
      const result = await service.createPricingRule(rule)
      
      if (result.success && result.data) {
        setPricingRules(prev => [...prev, result.data!])
      } else {
        setRulesError(result.error || 'Failed to create rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rule'
      setRulesError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingRule(false)
    }
  }, [service])

  // Update pricing rule
  const updatePricingRule = useCallback(async (id: string, updates: Partial<ProductPricingRule>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingRule(true)
    setRulesError(null)

    try {
      const result = await service.updatePricingRule(id, updates)
      
      if (result.success) {
        setPricingRules(prev => prev.map(rule => 
          rule.id === id ? { ...rule, ...updates } : rule
        ))
      } else {
        setRulesError(result.error || 'Failed to update rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update rule'
      setRulesError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingRule(false)
    }
  }, [service])

  // Delete pricing rule
  const deletePricingRule = useCallback(async (id: string) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingRule(true)
    setRulesError(null)

    try {
      const result = await service.deletePricingRule(id)
      
      if (result.success) {
        setPricingRules(prev => prev.filter(rule => rule.id !== id))
      } else {
        setRulesError(result.error || 'Failed to delete rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete rule'
      setRulesError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingRule(false)
    }
  }, [service])

  // Toggle pricing rule status
  const togglePricingRuleStatus = useCallback(async (id: string, isActive: boolean) => {
    return updatePricingRule(id, { is_active: isActive })
  }, [updatePricingRule])

  // Create seasonal pricing rule
  const createSeasonalRule = useCallback(async (rule: Omit<SeasonalPricingRule, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingSeasonal(true)
    setSeasonalError(null)

    try {
      const result = await service.createSeasonalPricingRule(rule)
      
      if (result.success && result.data) {
        setSeasonalRules(prev => [...prev, result.data!])
      } else {
        setSeasonalError(result.error || 'Failed to create seasonal rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create seasonal rule'
      setSeasonalError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingSeasonal(false)
    }
  }, [service])

  // Update seasonal pricing rule
  const updateSeasonalRule = useCallback(async (id: string, updates: Partial<SeasonalPricingRule>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingSeasonal(true)
    setSeasonalError(null)

    try {
      const result = await service.updateSeasonalPricingRule(id, updates)
      
      if (result.success) {
        setSeasonalRules(prev => prev.map(rule => 
          rule.id === id ? { ...rule, ...updates } : rule
        ))
      } else {
        setSeasonalError(result.error || 'Failed to update seasonal rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update seasonal rule'
      setSeasonalError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingSeasonal(false)
    }
  }, [service])

  // Delete seasonal pricing rule
  const deleteSeasonalRule = useCallback(async (id: string) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    setIsSavingSeasonal(true)
    setSeasonalError(null)

    try {
      const result = await service.deleteSeasonalPricingRule(id)
      
      if (result.success) {
        setSeasonalRules(prev => prev.filter(rule => rule.id !== id))
      } else {
        setSeasonalError(result.error || 'Failed to delete seasonal rule')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete seasonal rule'
      setSeasonalError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSavingSeasonal(false)
    }
  }, [service])

  // Create bulk pricing operation
  const createBulkOperation = useCallback(async (operation: Omit<BulkPricingOperation, 'id' | 'business_id' | 'created_at'>) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    try {
      const result = await service.createBulkPricingOperation(operation)
      
      if (result.success && result.data) {
        setBulkOperations(prev => [result.data!, ...prev])
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bulk operation'
      setBulkError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [service])

  // Apply pricing rules to product
  const applyPricingRulesToProduct = useCallback(async (productId: string, basePrice: number) => {
    if (!service) return { finalPrice: basePrice, appliedRules: [] }

    try {
      return await service.applyPricingRulesToProduct(productId, basePrice)
    } catch (error) {
      console.error('Error applying pricing rules:', error)
      return { finalPrice: basePrice, appliedRules: [] }
    }
  }, [service])

  // Export pricing data
  const exportPricingData = useCallback(async () => {
    if (!service) return { success: false, error: 'Service not initialized' }

    try {
      return await service.exportPricingData()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export data'
      return { success: false, error: errorMessage }
    }
  }, [service])

  // Import pricing data
  const importPricingData = useCallback(async (importData: any) => {
    if (!service) return { success: false, error: 'Service not initialized' }

    try {
      const result = await service.importPricingData(importData)
      
      if (result.success) {
        // Reload all data after successful import
        await loadAllData()
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import data'
      return { success: false, error: errorMessage }
    }
  }, [service, loadAllData])

  // Reset all errors
  const resetErrors = useCallback(() => {
    setSettingsError(null)
    setRulesError(null)
    setSeasonalError(null)
    setBulkError(null)
  }, [])

  // Check if any data is loading
  const isLoading = isLoadingSettings || isLoadingRules || isLoadingSeasonal || isLoadingBulk

  // Check if any operation is saving
  const isSaving = isSavingSettings || isSavingRule || isSavingSeasonal

  // Check if there are any errors
  const hasErrors = settingsError || rulesError || seasonalError || bulkError

  return {
    // Data
    pricingSettings,
    pricingRules,
    seasonalRules,
    bulkOperations,
    
    // Loading states
    isLoading,
    isLoadingSettings,
    isLoadingRules,
    isLoadingSeasonal,
    isLoadingBulk,
    
    // Saving states
    isSaving,
    isSavingSettings,
    isSavingRule,
    isSavingSeasonal,
    
    // Error states
    hasErrors,
    settingsError,
    rulesError,
    seasonalError,
    bulkError,
    
    // Actions
    loadAllData,
    loadPricingSettings,
    loadPricingRules,
    loadSeasonalRules,
    loadBulkOperations,
    updatePricingSettings,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    togglePricingRuleStatus,
    createSeasonalRule,
    updateSeasonalRule,
    deleteSeasonalRule,
    createBulkOperation,
    applyPricingRulesToProduct,
    exportPricingData,
    importPricingData,
    resetErrors
  }
} 
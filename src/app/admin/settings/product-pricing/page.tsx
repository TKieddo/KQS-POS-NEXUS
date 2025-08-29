'use client'

import React, { useState } from 'react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { PricingSettingsForm } from '@/features/settings/components/product-pricing/PricingSettingsForm'
import { PricingRulesList } from '@/features/settings/components/product-pricing/PricingRulesList'
import { QuickActions } from '@/features/settings/components/product-pricing/QuickActions'
import { PriceCalculator } from '@/features/settings/components/product-pricing/PriceCalculator'
import { PriceAnalysis } from '@/features/settings/components/product-pricing/PriceAnalysis'
import { PricingReports } from '@/features/settings/components/product-pricing/PricingReports'
import { ImportExport } from '@/features/settings/components/product-pricing/ImportExport'
import { PriceOptimization } from '@/features/settings/components/product-pricing/PriceOptimization'
import { PremiumButton } from '@/components/ui/premium-button'
import { useProductPricingComplete } from '@/features/settings/hooks/useProductPricingComplete'
import { priceOptimizationService } from '@/lib/price-optimization-service'
import { supabase } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'
import { 
  Settings,
  Calculator, 
  TrendingUp,
  FileText,
  Download,
  Zap,
  Target,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

type TabType = 'settings' | 'quick-actions' | 'calculator' | 'analysis' | 'reports' | 'import-export' | 'price-optimization'

export default function ProductPricingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings')
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const { selectedBranch } = useBranch()
  
  const {
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
  } = useProductPricingComplete()

  // Implement the AI suggestion generation
  const handleGenerateAISuggestions = async () => {
    console.log('=== AI SUGGESTION GENERATION DEBUG ===')
    console.log('handleGenerateAISuggestions called')
    console.log('selectedBranch:', selectedBranch)
    console.log('selectedBranch.id:', selectedBranch?.id)
    console.log('selectedBranch type:', typeof selectedBranch?.id)
    
    if (!selectedBranch?.id) {
      console.error('No branch selected')
      alert('No branch selected. Please select a branch first.')
      return
    }

    setIsGeneratingSuggestions(true)
    try {
      console.log('Starting AI suggestion generation for branch:', selectedBranch.id)
      
      // Test basic database connectivity first
      console.log('Testing basic database connectivity...')
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name')
        .limit(3)
      
      console.log('Basic products query result:', { testData, testError })
      console.log('testError details:', {
        message: testError?.message,
        details: testError?.details,
        hint: testError?.hint,
        code: testError?.code,
        fullError: testError
      })
      
      if (testError) {
        console.error('Basic database query failed:', testError)
        console.error('Error object type:', typeof testError)
        console.error('Error object keys:', Object.keys(testError || {}))
        throw new Error(`Database connection failed: ${testError?.message || 'Unknown error'}`)
      }
      
      console.log('Database connectivity test passed')
      
      // Test if price_optimization_suggestions table exists
      console.log('Testing price_optimization_suggestions table...')
      const { data: tableTestData, error: tableTestError } = await supabase
        .from('price_optimization_suggestions')
        .select('id')
        .limit(1)
      
      console.log('Table test result:', { tableTestData, tableTestError })
      console.log('Table test error details:', {
        message: tableTestError?.message,
        details: tableTestError?.details,
        hint: tableTestError?.hint,
        code: tableTestError?.code
      })
      
      if (tableTestError) {
        console.error('price_optimization_suggestions table test failed:', tableTestError)
        console.error('This means the migration needs to be applied')
        throw new Error(`Price optimization table not found: ${tableTestError?.message || 'Table does not exist'}`)
      }
      
      console.log('price_optimization_suggestions table exists')
      
      // First, check if there are eligible products
      console.log('Calling getOptimizationEligibleProducts...')
      const eligibleProducts = await priceOptimizationService.getOptimizationEligibleProducts(selectedBranch.id)
      console.log('Eligible products found:', eligibleProducts.length)
      console.log('Eligible products:', eligibleProducts)
      
      if (eligibleProducts.length === 0) {
        console.log('No eligible products found for optimization')
        alert('No products found for price optimization. Please add some products with prices first.')
        return
      }

      console.log('Calling generateBulkSuggestions...')
      const result = await priceOptimizationService.generateBulkSuggestions(selectedBranch.id)
      console.log('AI suggestions generated:', result)
      
      if (result.success > 0) {
        console.log(`Successfully generated ${result.success} suggestions`)
        // Refresh the data to show new suggestions
        await refreshData()
      } else {
        console.log('No suggestions were generated successfully')
        alert('No AI suggestions were generated. This might be due to insufficient product data or AI service issues.')
      }
    } catch (error: any) {
      console.error('=== ERROR DETAILS ===')
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error object:', error)
      console.error('=== END ERROR DETAILS ===')
      
      alert(`Failed to generate AI suggestions: ${error?.message || 'Unknown error'}`)
      throw error
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  // Debug logging removed for production

  const tabs = [
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
      description: 'Product pricing settings and rules'
    },
    {
      id: 'quick-actions' as TabType,
      label: 'Quick Actions',
      icon: Zap,
      description: 'Common actions for product and pricing management'
    },
    {
      id: 'calculator' as TabType,
      label: 'Price Calculator',
      icon: Calculator,
      description: 'Calculate optimal pricing with cost analysis'
    },
    {
      id: 'analysis' as TabType,
      label: 'Price Analysis',
      icon: TrendingUp,
      description: 'Analyze pricing trends and competitiveness'
    },
    {
      id: 'reports' as TabType,
      label: 'Pricing Reports',
      icon: FileText,
      description: 'Generate comprehensive pricing reports'
    },
    {
      id: 'import-export' as TabType,
      label: 'Import & Export',
      icon: Download,
      description: 'Manage pricing data and settings'
    },
    {
      id: 'price-optimization' as TabType,
      label: 'Price Optimization',
      icon: BarChart3,
      description: 'AI-powered price optimization suggestions'
    }
  ]

  const handleQuickAction = (action: string) => {
    console.log('Quick action triggered:', action)
    // Handle different quick actions
    switch (action) {
      case 'price-calculator':
        setActiveTab('calculator')
        break
      case 'price-analysis':
        setActiveTab('analysis')
        break
      case 'pricing-reports':
        setActiveTab('reports')
        break
      case 'import-export':
        setActiveTab('import-export')
        break
      case 'bulk-price-update':
        // Handle bulk price update
        console.log('Bulk price update triggered')
        break
      case 'discount-management':
        // Handle discount management
        console.log('Discount management triggered')
        break
      case 'pricing-rules-apply':
        // Handle pricing rules application
        console.log('Pricing rules application triggered')
        break
      case 'price-optimization':
        // Handle price optimization
        console.log('Price optimization triggered')
        setActiveTab('price-optimization')
        break
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Pricing Overview</h4>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{overview?.rulesCount || 0}</div>
                    <div className="text-sm text-gray-600">Pricing Rules</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">{overview?.activeRulesCount || 0}</div>
                    <div className="text-sm text-gray-600">Active Rules</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{overview?.analysisCount || 0}</div>
                    <div className="text-sm text-gray-600">Price Analysis</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{overview?.reportsCount || 0}</div>
                    <div className="text-sm text-gray-600">Reports</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pricing Settings Form */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Pricing Settings</h4>
              <PricingSettingsForm
                settings={settings}
                onUpdate={updateSettings}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
            
            {/* Pricing Rules List */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <PricingRulesList
                rules={rules}
                onCreateRule={async (rule) => {
                  const ruleId = await createRule(rule)
                  return { success: !!ruleId, error: ruleId ? undefined : 'Failed to create rule' }
                }}
                onUpdateRule={async (id, updates) => {
                  const success = await updateRule(id, updates)
                  return { success, error: success ? undefined : 'Failed to update rule' }
                }}
                onDeleteRule={async (id) => {
                  const success = await deleteRule(id)
                  return { success, error: success ? undefined : 'Failed to delete rule' }
                }}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </div>
          </div>
        )
      case 'quick-actions':
        return (
          <QuickActions
            onPriceCalculator={() => setActiveTab('calculator')}
            onPriceAnalysis={() => setActiveTab('analysis')}
            onPricingReports={() => setActiveTab('reports')}
            onImportExport={() => setActiveTab('import-export')}
            onBulkPriceUpdate={() => handleQuickAction('bulk-price-update')}
            onDiscountManagement={() => handleQuickAction('discount-management')}
            onPricingRulesApply={() => handleQuickAction('pricing-rules-apply')}
            onPriceOptimization={() => setActiveTab('price-optimization')}
            // Pass real data from database
            settings={settings}
            rules={rules}
            bulkUpdates={bulkUpdates}
            discounts={discounts}
            actionLogs={actionLogs}
            overview={overview}
            isLoading={isLoading}
            onCreateBulkUpdate={createBulkUpdate}
            onCreateDiscount={createDiscount}
            onApplyPricingRules={applyAllPricingRules}
            onApplyAllActiveDiscounts={applyAllActiveDiscounts}
            onLogAction={logQuickAction}
          />
        )
      case 'calculator':
        return (
          <PriceCalculator
            settings={settings}
            rules={rules}
            onSaveCalculation={createAnalysisData}
            isLoading={isLoading}
          />
        )
      case 'analysis':
        return (
          <PriceAnalysis
            analysisData={analysisData}
            settings={settings}
            onCreateAnalysis={createAnalysisData}
            isLoading={isLoading}
          />
        )
      case 'reports':
        return (
          <PricingReports
            reports={reports}
            overview={overview}
            onGenerateReport={generateReport}
            isLoading={isLoading}
          />
        )
      case 'import-export':
        return (
          <ImportExport
            importExportHistory={importExportHistory}
            onExportData={exportData}
            onImportData={importData}
            isLoading={isLoading}
          />
        )
      case 'price-optimization':
        return (
          <PriceOptimization
            suggestions={optimizationSuggestions}
            settings={settings}
            rules={rules}
            isLoading={isLoading || isGeneratingSuggestions}
            onCreateSuggestion={createOptimizationSuggestion}
            onApplySuggestion={applyOptimizationSuggestion}
            onGenerateAISuggestions={handleGenerateAISuggestions}
            onUpdateSettings={updateSettings}
          />
        )
      default:
        return null
    }
  }

  return (
    <SettingsPageLayout
      title="Product & Pricing"
      description="Manage product pricing settings, rules, and analysis tools"
      icon={Target}
    >
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
                  
      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 min-h-[600px]">
        <div className="p-6">
          {isLoading && !settings ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E5FF29] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pricing settings...</p>
              </div>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      {/* Quick Navigation */}
      {activeTab !== 'quick-actions' && (
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Navigation</h4>
          <div className="flex flex-wrap gap-2">
            {tabs.filter(tab => tab.id !== activeTab).map((tab) => {
              const Icon = tab.icon
              return (
                <PremiumButton
                  key={tab.id}
                  variant="outline"
                  size="sm"
                  icon={Icon}
                  onClick={() => setActiveTab(tab.id)}
                  className="text-xs"
                >
                  {tab.label}
                </PremiumButton>
              )
            })}
          </div>
        </div>
      )}
    </SettingsPageLayout>
  )
}
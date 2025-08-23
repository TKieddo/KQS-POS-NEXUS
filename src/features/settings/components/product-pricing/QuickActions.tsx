import React, { useState } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  FileText, 
  Download, 
  Upload, 
  Percent, 
  DollarSign, 
  Settings,
  Zap,
  Target,
  BarChart3,
  RefreshCw,
  Clock,
  Users,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { Modal } from '@/components/ui/modal'
import type { 
  PricingSettings, 
  PricingRule, 
  BulkPriceUpdate, 
  DiscountManagement, 
  QuickActionLog 
} from '@/lib/product-pricing-complete-service'

// Custom types that make branch_id optional since hook handles it
type BulkUpdateInput = Omit<BulkPriceUpdate, 'id' | 'created_at' | 'completed_at' | 'branch_id'> & {
  branch_id?: string
}

type DiscountInput = Omit<DiscountManagement, 'id' | 'created_at' | 'updated_at' | 'branch_id' | 'created_by'> & {
  branch_id?: string
  created_by?: string
}

type LogActionInput = Omit<QuickActionLog, 'id' | 'created_at' | 'branch_id' | 'performed_by'> & {
  branch_id?: string
  performed_by?: string
}

interface QuickActionsProps {
  onPriceCalculator: () => void
  onPriceAnalysis: () => void
  onPricingReports: () => void
  onImportExport: () => void
  onBulkPriceUpdate: () => void
  onDiscountManagement: () => void
  onPricingRulesApply: () => void
  onPriceOptimization: () => void
  // Real data from database
  settings: PricingSettings | null
  rules: PricingRule[]
  bulkUpdates: BulkPriceUpdate[]
  discounts: DiscountManagement[]
  actionLogs: QuickActionLog[]
  overview: {
    rulesCount: number
    activeRulesCount: number
    analysisCount: number
    reportsCount: number
  }
  isLoading: boolean
  onCreateBulkUpdate: (update: BulkUpdateInput) => Promise<string | null>
  onCreateDiscount: (discount: DiscountInput) => Promise<string | null>
  onApplyPricingRules: (branchId?: string) => Promise<{ success: number; failed: number }>
  onApplyAllActiveDiscounts: () => Promise<boolean>
  onLogAction: (action: LogActionInput) => Promise<string | null>
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onPriceCalculator,
  onPriceAnalysis,
  onPricingReports,
  onImportExport,
  onBulkPriceUpdate,
  onDiscountManagement,
  onPricingRulesApply,
  onPriceOptimization,
  settings,
  rules,
  bulkUpdates,
  discounts,
  actionLogs,
  overview,
  isLoading,
  onCreateBulkUpdate,
  onCreateDiscount,
  onApplyPricingRules,
  onApplyAllActiveDiscounts,
  onLogAction
}) => {
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    update_type: 'percentage' as 'percentage' | 'fixed' | 'multiplier' | 'set',
    update_direction: 'increase' as 'increase' | 'decrease',
    update_value: 0,
    affected_categories: [] as string[]
  })
  const [discountForm, setDiscountForm] = useState({
    discount_name: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'buy_one_get_one' | 'bulk',
    discount_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    min_purchase_amount: 0
  })

  const actions = [
    {
      title: 'Price Calculator',
      description: 'Calculate optimal pricing with cost analysis',
      icon: Calculator,
      color: 'from-blue-500 to-blue-600',
      onClick: onPriceCalculator,
      stats: `${settings?.default_markup_percentage || 0}% markup`
    },
    {
      title: 'Price Analysis',
      description: 'Analyze pricing trends and competitiveness',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      onClick: onPriceAnalysis,
      stats: `${overview.analysisCount} analyses`
    },
    {
      title: 'Pricing Reports',
      description: 'Generate comprehensive pricing reports',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      onClick: onPricingReports,
      stats: `${overview.reportsCount} reports`
    },
    {
      title: 'Import & Export',
      description: 'Manage pricing data and settings',
      icon: Download,
      color: 'from-orange-500 to-orange-600',
      onClick: onImportExport,
      stats: `${actionLogs.length} operations`
    },
    {
      title: 'Bulk Price Update',
      description: 'Update multiple product prices at once',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      onClick: () => setIsBulkUpdateModalOpen(true),
      stats: `${bulkUpdates.length} updates`
    },
    {
      title: 'Discount Management',
      description: 'Manage product discounts and promotions',
      icon: Percent,
      color: 'from-pink-500 to-pink-600',
      onClick: () => setIsDiscountModalOpen(true),
      stats: `${discounts.filter(d => d.is_active).length} active`
    },
    {
      title: 'Apply Pricing Rules',
      description: 'Apply pricing rules to products',
      icon: Target,
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => setIsRulesModalOpen(true),
      stats: `${overview.activeRulesCount} active rules`
    },
    {
      title: 'Price Optimization',
      description: 'AI-powered price optimization suggestions',
      icon: BarChart3,
      color: 'from-teal-500 to-teal-600',
      onClick: onPriceOptimization,
      stats: 'AI powered'
    }
  ]

  const resetForms = () => {
    setBulkUpdateForm({
      update_type: 'percentage',
      update_direction: 'increase',
      update_value: 0,
      affected_categories: []
    })
    setDiscountForm({
      discount_name: '',
      discount_type: 'percentage',
      discount_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      min_purchase_amount: 0
    })
    setError(null)
    setSuccess(null)
  }

  const handleBulkUpdate = async () => {
    if (!bulkUpdateForm.update_value || bulkUpdateForm.update_value <= 0) {
      setError('Please enter a valid update value')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const updateId = await onCreateBulkUpdate({
        update_type: bulkUpdateForm.update_type,
        update_direction: bulkUpdateForm.update_direction,
        update_value: bulkUpdateForm.update_value,
        affected_categories: bulkUpdateForm.affected_categories,
        affected_products_count: 0, // Will be calculated
        total_value_change: 0, // Will be calculated
        status: 'processing'
      })

      if (updateId) {
        await onLogAction({
          action_type: 'bulk_update',
          action_details: bulkUpdateForm,
          affected_items_count: 0,
          status: 'completed'
        })
        setSuccess('Bulk price update created successfully!')
        setTimeout(() => {
          setIsBulkUpdateModalOpen(false)
          resetForms()
        }, 1500)
      } else {
        setError('Failed to create bulk update')
      }
    } catch (error) {
      console.error('Error creating bulk update:', error)
      
      // Check for specific migration error
      if (error instanceof Error && error.message.includes('Database migration required')) {
        setError('Database migration required. Please run the pricing migration in your Supabase dashboard. See MIGRATION_GUIDE.md for instructions.')
      } else {
        setError('An unexpected error occurred. Please check the console for details.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateDiscount = async () => {
    if (!discountForm.discount_name.trim()) {
      setError('Discount name is required')
      return
    }

    if (!discountForm.discount_value || discountForm.discount_value <= 0) {
      setError('Please enter a valid discount value')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const discountId = await onCreateDiscount({
        discount_name: discountForm.discount_name,
        discount_type: discountForm.discount_type,
        discount_value: discountForm.discount_value,
        start_date: discountForm.start_date,
        end_date: discountForm.end_date || undefined,
        min_purchase_amount: discountForm.min_purchase_amount || undefined,
        applies_to_categories: undefined,
        applies_to_products: undefined,
        max_discount_amount: undefined,
        usage_limit: undefined,
        current_usage: 0,
        is_active: true
      })

      if (discountId) {
        await onLogAction({
          action_type: 'discount_management',
          action_details: discountForm,
          affected_items_count: 0,
          status: 'completed'
        })
        setSuccess('Discount created successfully and applied to products!')
        setTimeout(() => {
          setIsDiscountModalOpen(false)
          resetForms()
        }, 1500)
      } else {
        setError('Failed to create discount')
      }
    } catch (error) {
      console.error('Error creating discount:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplyPricingRules = async () => {
    if (overview.activeRulesCount === 0) {
      setError('No active pricing rules to apply')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await onApplyPricingRules() // Will be set by service
      await onLogAction({
        action_type: 'rules_apply',
        action_details: { result },
        affected_items_count: result.success + result.failed,
        status: result.failed === 0 ? 'completed' : 'partial'
      })
      
      if (result.success > 0) {
        setSuccess(`Successfully applied ${result.success} pricing rules${result.failed > 0 ? ` (${result.failed} failed)` : ''}`)
        setTimeout(() => {
          setIsRulesModalOpen(false)
          resetForms()
        }, 2000)
      } else {
        setError('No pricing rules were applied successfully')
      }
    } catch (error) {
      console.error('Error applying pricing rules:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = (modalType: 'bulk' | 'discount' | 'rules') => {
    switch (modalType) {
      case 'bulk':
        setIsBulkUpdateModalOpen(false)
        break
      case 'discount':
        setIsDiscountModalOpen(false)
        break
      case 'rules':
        setIsRulesModalOpen(false)
        break
    }
    resetForms()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <PremiumButton
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => window.location.reload()}
        >
          Refresh
        </PremiumButton>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Rules</p>
              <p className="text-2xl font-bold">{overview.activeRulesCount}</p>
            </div>
            <Target className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Recent Updates</p>
              <p className="text-2xl font-bold">{bulkUpdates.filter(u => u.status === 'completed').length}</p>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Discounts</p>
              <p className="text-2xl font-bold">{discounts.filter(d => d.is_active).length}</p>
            </div>
            <Percent className="h-8 w-8 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Actions Today</p>
              <p className="text-2xl font-bold">{actionLogs.filter(log => {
                const today = new Date().toDateString()
                return new Date(log.created_at).toDateString() === today
              }).length}</p>
            </div>
            <Clock className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            className="group cursor-pointer bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {action.description}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {action.stats}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Price Update Modal */}
      <Modal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => closeModal('bulk')}
        title="Bulk Price Update"
        maxWidth="2xl"
      >
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Bulk Price Update Options</h4>
            <p className="text-sm text-blue-700">
              Update prices for multiple products simultaneously. Choose the type, direction (increase/decrease), and value.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              <strong>Examples:</strong> 10% increase, $5 decrease, 1.5x multiplier, set to $25
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Update Type
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={bulkUpdateForm.update_type}
                onChange={(e) => setBulkUpdateForm(prev => ({ 
                  ...prev, 
                  update_type: e.target.value as any 
                }))}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="multiplier">Price Multiplier</option>
                <option value="set">Set Specific Price</option>
              </select>
            </div>

            {bulkUpdateForm.update_type !== 'set' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Direction
                </label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bulkUpdateForm.update_direction}
                  onChange={(e) => setBulkUpdateForm(prev => ({ 
                    ...prev, 
                    update_direction: e.target.value as 'increase' | 'decrease'
                  }))}
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Value *
              </label>
              <input
                type="number"
                placeholder={bulkUpdateForm.update_type === 'set' ? 'Enter price' : 'Enter value'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={bulkUpdateForm.update_value}
                onChange={(e) => setBulkUpdateForm(prev => ({ 
                  ...prev, 
                  update_value: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => closeModal('bulk')}
              disabled={isSubmitting}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              gradient="blue"
              size="sm"
              onClick={handleBulkUpdate}
              disabled={isSubmitting || bulkUpdateForm.update_value <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Apply Updates'}
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Discount Management Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => closeModal('discount')}
        title="Discount Management"
        maxWidth="2xl"
      >
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Create New Discount</h4>
            <p className="text-sm text-green-700">
              Create and manage product discounts, seasonal sales, and promotional offers. Discounts are automatically applied to products when created.
            </p>
          </div>

          {/* Apply All Active Discounts Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Apply All Active Discounts</h4>
                <p className="text-sm text-blue-700">
                  Manually apply all active discounts to products. This is useful if discounts weren't applied automatically.
                </p>
              </div>
              <PremiumButton
                gradient="blue"
                size="sm"
                onClick={async () => {
                  setIsSubmitting(true)
                  setError(null)
                  try {
                    const success = await onApplyAllActiveDiscounts()
                    if (success) {
                      setSuccess('All active discounts applied to products successfully!')
                    } else {
                      setError('Failed to apply active discounts')
                    }
                  } catch (error) {
                    setError('An error occurred while applying discounts')
                  } finally {
                    setIsSubmitting(false)
                  }
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Applying...' : 'Apply All'}
              </PremiumButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Discount Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Summer Sale"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discountForm.discount_name}
                onChange={(e) => setDiscountForm(prev => ({ 
                  ...prev, 
                  discount_name: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Discount Type
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discountForm.discount_type}
                onChange={(e) => setDiscountForm(prev => ({ 
                  ...prev, 
                  discount_type: e.target.value as any 
                }))}
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed">Fixed Amount Discount</option>
                <option value="buy_one_get_one">Buy One Get One</option>
                <option value="bulk">Bulk Purchase Discount</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Discount Value *
              </label>
              <input
                type="number"
                placeholder="Enter discount value"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discountForm.discount_value}
                onChange={(e) => setDiscountForm(prev => ({ 
                  ...prev, 
                  discount_value: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={discountForm.start_date}
                onChange={(e) => setDiscountForm(prev => ({ 
                  ...prev, 
                  start_date: e.target.value 
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => closeModal('discount')}
              disabled={isSubmitting}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              gradient="green"
              size="sm"
              onClick={handleCreateDiscount}
              disabled={isSubmitting || !discountForm.discount_name.trim() || discountForm.discount_value <= 0}
            >
              {isSubmitting ? 'Creating...' : 'Create Discount'}
            </PremiumButton>
          </div>
        </div>
      </Modal>

      {/* Apply Pricing Rules Modal */}
      <Modal
        isOpen={isRulesModalOpen}
        onClose={() => closeModal('rules')}
        title="Apply Pricing Rules"
        maxWidth="md"
      >
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">Apply Pricing Rules</h4>
            <p className="text-sm text-indigo-700">
              Apply all active pricing rules to your products. This will update prices based on your configured rules.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Rules:</span>
              <span className="text-sm font-semibold text-gray-900">{overview.activeRulesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Rules:</span>
              <span className="text-sm font-semibold text-gray-900">{overview.rulesCount}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => closeModal('rules')}
              disabled={isSubmitting}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              gradient="purple"
              size="sm"
              onClick={handleApplyPricingRules}
              disabled={isSubmitting || overview.activeRulesCount === 0}
            >
              {isSubmitting ? 'Applying...' : 'Apply Rules'}
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 
import React, { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, TrendingUp, Percent, Tag, Calculator } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { Modal } from '@/components/ui/modal'
import { useBranch } from '@/context/BranchContext'
import type { PricingRule } from '@/lib/product-pricing-complete-service'

interface PricingRulesListProps {
  rules: PricingRule[]
  onCreateRule: (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>
  onUpdateRule: (id: string, updates: Partial<PricingRule>) => Promise<{ success: boolean; error?: string }>
  onDeleteRule: (id: string) => Promise<{ success: boolean; error?: string }>
  isLoading?: boolean
  disabled?: boolean
}

export const PricingRulesList: React.FC<PricingRulesListProps> = ({
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  isLoading = false,
  disabled = false
}) => {
  const { selectedBranch } = useBranch()
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRule, setNewRule] = useState<Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>>({
    branch_id: selectedBranch?.id || '',
    name: '',
    description: '',
    rule_type: 'markup',
    condition_type: 'category',
    condition_value: {},
    action_type: 'set_price',
    action_value: 0,
    priority: 0,
    is_active: true,
    applies_to_variants: false
  })

  // Update branch_id when selectedBranch changes
  useEffect(() => {
    if (selectedBranch?.id) {
      setNewRule(prev => ({ ...prev, branch_id: selectedBranch.id }))
    }
  }, [selectedBranch?.id])

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'markup': return <TrendingUp className="h-3.5 w-3.5 text-black" />
      case 'percentage': return <Percent className="h-3.5 w-3.5 text-black" />
      case 'fixed_price': return <Tag className="h-3.5 w-3.5 text-black" />
      case 'competitive': return <Calculator className="h-3.5 w-3.5 text-black" />
      default: return <Calculator className="h-3.5 w-3.5 text-black" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const handleSaveRule = async () => {
    if (!selectedBranch?.id) {
      setError('No branch selected. Please select a branch first.')
      return
    }

    if (!newRule.name.trim()) {
      setError('Rule name is required')
      return
    }

    if (newRule.action_value <= 0) {
      setError('Action value must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Ensure branch_id is set
      const ruleToSave = {
        ...newRule,
        branch_id: selectedBranch.id
      }

      if (editingRule) {
        const result = await onUpdateRule(editingRule.id, editingRule)
        if (result.success) {
          setShowModal(false)
          setEditingRule(null)
          resetForm()
        } else {
          setError(result.error || 'Failed to update rule')
        }
      } else {
        console.log('Creating rule with data:', ruleToSave)
        const result = await onCreateRule(ruleToSave)
        if (result.success) {
          setShowModal(false)
          resetForm()
        } else {
          setError(result.error || 'Failed to create rule')
        }
      }
    } catch (err) {
      console.error('Error saving rule:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRule = async (id: string) => {
    const ruleToDelete = rules.find(rule => rule.id === id)
    const ruleName = ruleToDelete?.name || 'this pricing rule'
    
    if (confirm(`Are you sure you want to delete "${ruleName}"?\n\nThis action cannot be undone and will remove the pricing rule from all products.`)) {
      try {
        const result = await onDeleteRule(id)
        if (result.success) {
          // Show success message
          alert(`Successfully deleted "${ruleName}"`)
        } else {
          alert(result.error || 'Failed to delete rule')
        }
      } catch (err) {
        alert('An unexpected error occurred while deleting the rule')
      }
    }
  }

  const resetForm = () => {
    setNewRule({
      branch_id: selectedBranch?.id || '',
      name: '',
      description: '',
      rule_type: 'markup',
      condition_type: 'category',
      condition_value: {},
      action_type: 'set_price',
      action_value: 0,
      priority: 0,
      is_active: true,
      applies_to_variants: false
    })
    setError(null)
  }

  const openEditModal = (rule: PricingRule) => {
    setEditingRule(rule)
    setNewRule({
      branch_id: rule.branch_id,
      name: rule.name,
      description: rule.description || '',
      rule_type: rule.rule_type,
      condition_type: rule.condition_type,
      condition_value: rule.condition_value,
      action_type: rule.action_type,
      action_value: rule.action_value,
      priority: rule.priority,
      is_active: rule.is_active,
      applies_to_variants: rule.applies_to_variants
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingRule(null)
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingRule(null)
    resetForm()
  }

  const currentRule = editingRule || newRule

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Pricing Rules</h4>
        <div className="flex gap-2">
          {rules.length > 0 && (
            <PremiumButton
              onClick={() => {
                if (confirm(`Are you sure you want to delete ALL ${rules.length} pricing rules?\n\nThis action cannot be undone and will remove all pricing rules from all products.`)) {
                  // Delete all rules
                  Promise.all(rules.map(rule => onDeleteRule(rule.id)))
                    .then(() => alert(`Successfully deleted all ${rules.length} pricing rules`))
                    .catch(() => alert('An error occurred while deleting some rules'))
                }
              }}
              variant="outline"
              size="sm"
              icon={Trash2}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              disabled={disabled || isLoading}
            >
              Delete All
            </PremiumButton>
          )}
          <PremiumButton
            onClick={openCreateModal}
            gradient="blue"
            icon={Plus}
            size="sm"
            disabled={disabled || isLoading}
          >
            Add Rule
          </PremiumButton>
        </div>
      </div>

      {/* Rules List */}
      {rules.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can edit or delete individual rules using the buttons on each rule card. 
              Use "Delete All" to remove all pricing rules at once.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
          </div>
        ) : !rules || rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No pricing rules found.</p>
            <p className="text-xs mt-1">Create your first pricing rule to get started.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="group relative overflow-hidden rounded-xl bg-black hover:bg-gray-900/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-[#E5FF29]/10">
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5FF29] border border-[#E5FF29] flex items-center justify-center">
                      {getRuleIcon(rule.rule_type)}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm">{rule.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${
                        rule.is_active 
                          ? 'bg-[#E5FF29]/20 text-[#E5FF29] border-[#E5FF29]/40' 
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        <div className={`w-1 h-1 rounded-full mr-1 ${rule.is_active ? 'bg-[#E5FF29]' : 'bg-red-400'}`} />
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <PremiumButton
                      onClick={() => openEditModal(rule)}
                      variant="outline"
                      size="xs"
                      icon={Edit}
                      className="text-white hover:text-[#E5FF29] bg-white/5 hover:bg-[#E5FF29]/10 border-[#E5FF29]/20 hover:border-[#E5FF29]/40"
                      disabled={disabled}
                    >
                      Edit
                    </PremiumButton>
                    <PremiumButton
                      onClick={() => handleDeleteRule(rule.id)}
                      variant="outline"
                      size="xs"
                      icon={Trash2}
                      className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50"
                      disabled={disabled}
                    >
                      Delete
                    </PremiumButton>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white/5 rounded-lg p-2.5 border border-[#E5FF29]">
                    <div className="text-xs text-gray-400 mb-1">Type</div>
                    <div className="text-white font-semibold capitalize text-sm">{rule.rule_type.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-[#E5FF29]">
                    <div className="text-xs text-gray-400 mb-1">Value</div>
                    <div className="text-white font-semibold">
                      {rule.rule_type === 'fixed_price' ? formatCurrency(rule.action_value) : `${rule.action_value}${rule.rule_type === 'markup' || rule.rule_type === 'percentage' ? '%' : ''}`}
                    </div>
                  </div>
                </div>

                {rule.description && (
                  <div className="text-xs text-gray-400 italic">{rule.description}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingRule ? 'Edit Pricing Rule' : 'Add New Pricing Rule'}
        maxWidth="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
              <input
                value={currentRule.name}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, name: e.target.value })
                  } else {
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                }}
                placeholder="e.g., Standard Markup"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
              <select
                value={currentRule.rule_type}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, rule_type: e.target.value as any })
                  } else {
                    setNewRule({ ...newRule, rule_type: e.target.value as any })
                  }
                }}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
              >
                <option value="markup">Markup (%)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_price">Fixed Price</option>
                <option value="competitive">Competitive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Value *</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={currentRule.action_value}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, action_value: parseFloat(e.target.value) || 0 })
                  } else {
                    setNewRule({ ...newRule, action_value: parseFloat(e.target.value) || 0 })
                  }
                }}
                placeholder="25"
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={currentRule.is_active ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (editingRule) {
                    setEditingRule({ ...editingRule, is_active: e.target.value === 'active' })
                  } else {
                    setNewRule({ ...newRule, is_active: e.target.value === 'active' })
                  }
                }}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={currentRule.description || ''}
              onChange={(e) => {
                if (editingRule) {
                  setEditingRule({ ...editingRule, description: e.target.value })
                } else {
                  setNewRule({ ...newRule, description: e.target.value })
                }
              }}
              placeholder="Optional description for this pricing rule"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent resize-none bg-gray-50"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              gradient="green"
              size="sm"
              onClick={handleSaveRule}
              disabled={isSubmitting || !currentRule.name.trim() || currentRule.action_value <= 0}
            >
              {isSubmitting ? 'Saving...' : (editingRule ? 'Update Rule' : 'Add Rule')}
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 
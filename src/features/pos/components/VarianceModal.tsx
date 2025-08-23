'use client'

import React, { useState } from 'react'
import { AlertTriangle, DollarSign, FileText, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createVariance, getVarianceCategories } from '@/lib/variance-service'
import { useBranch } from '@/context/BranchContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface VarianceModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  expectedAmount: number
  actualAmount: number
  difference: number
  onVarianceCreated?: () => void
}

export const VarianceModal: React.FC<VarianceModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  expectedAmount,
  actualAmount,
  difference,
  onVarianceCreated
}) => {
  const { selectedBranch } = useBranch()
  const { user } = useAuth()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const categories = getVarianceCategories()
  const varianceType = difference > 0 ? 'overage' : 'shortage'
  const varianceAmount = Math.abs(difference)

  const handleSubmit = async () => {
    if (!category || !selectedBranch?.id) {
      toast.error('Please select a category')
      return
    }

    if (varianceAmount === 0) {
      toast.error('No variance to record')
      return
    }

    setIsSubmitting(true)
    try {
      const reportedBy = user?.user_metadata?.full_name || user?.email || 'Cashier'
      
      const result = await createVariance({
        cashup_session_id: sessionId,
        variance_type: varianceType,
        amount: varianceAmount,
        category: category,
        description: description.trim() || undefined,
        reported_by: reportedBy,
        branch_id: selectedBranch.id
      })

      if (result.success) {
        toast.success(`${varianceType === 'overage' ? 'Overage' : 'Shortage'} recorded successfully`)
        onVarianceCreated?.()
        onClose()
        // Reset form
        setCategory('')
        setDescription('')
      } else {
        toast.error(result.error || 'Failed to record variance')
      }
    } catch (error) {
      console.error('Error recording variance:', error)
      toast.error('Failed to record variance')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Record Cash {varianceType === 'overage' ? 'Overage' : 'Shortage'}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-200 hover:bg-gray-50"
          >
            ×
          </Button>
        </div>

        {/* Variance Summary */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Variance Amount:</span>
            <span className={`font-bold ${
              varianceType === 'overage' ? 'text-green-600' : 'text-red-600'
            }`}>
              {varianceType === 'overage' ? '+' : '-'}{formatCurrency(varianceAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variance Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {category && (
              <p className="text-xs text-gray-500 mt-1">
                {categories.find(c => c.value === category)?.description}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            className="flex-1 bg-[#E5FF29] text-black font-semibold hover:bg-[#E5FF29]/90"
            onClick={handleSubmit}
            disabled={isSubmitting || !category}
          >
            {isSubmitting ? 'Recording...' : 'Record Variance'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-gray-200 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

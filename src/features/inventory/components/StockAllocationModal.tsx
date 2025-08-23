'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Package, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { allocateStockToBranch, getBranches, getCentralStock } from '@/lib/stock-services'
import { useBranch } from '@/context/BranchContext'
import { executeWithAuth } from '@/lib/auth-utils'
import { handleDatabaseError } from '@/lib/error-handling'
import { toast } from 'sonner'
import type { Product, Branch } from '@/types'

interface StockAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  onSuccess?: () => void
}

export const StockAllocationModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSuccess 
}: StockAllocationModalProps) => {
  const { branches } = useBranch()
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableStock, setAvailableStock] = useState<number>(0)

  useEffect(() => {
    if (product && isOpen) {
      fetchAvailableStock()
    }
  }, [product, isOpen])

  const fetchAvailableStock = async () => {
    if (!product) return

    try {
      const data = await executeWithAuth(async () => {
        const { data } = await getCentralStock()
        return data || []
      })
      const stockItem = data.find(item => item.product_id === product.id)
      setAvailableStock(stockItem?.available_quantity || 0)
    } catch (error) {
      handleDatabaseError(error, 'fetching available stock')
    }
  }

  const handleAllocate = async () => {
    if (!product || !selectedBranch || quantity <= 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const result = await executeWithAuth(async () => {
        return await allocateStockToBranch({
          productId: product.id,
          branchId: selectedBranch,
          quantity,
          notes: notes.trim() || undefined
        })
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to allocate stock')
      }

      toast.success(`Successfully allocated ${quantity} units to branch`)
      onSuccess?.()
      handleClose()
    } catch (error) {
      handleDatabaseError(error, 'allocating stock')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedBranch('')
    setQuantity(1)
    setNotes('')
    setAvailableStock(0)
    onClose()
  }

  const getBranchName = (branchId: string) => {
    return branches.find(b => b.id === branchId)?.name || 'Unknown Branch'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#E5FF29]" />
              Allocate Stock
            </h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Info Card */}
          {product && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#E5FF29] rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      SKU: {product.sku || 'N/A'} • Available: <span className="font-semibold text-green-600">{availableStock} units</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    R {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Unit Price</p>
                </div>
              </div>
            </div>
          )}

          {/* Allocation Form - Horizontal Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Branch
              </label>
                             <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                 <SelectTrigger className="w-full h-11 border border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#E5FF29] transition-colors">
                   <SelectValue placeholder="Select a branch..." />
                 </SelectTrigger>
                 <SelectContent className="bg-white border border-gray-200 shadow-lg">
                   {branches.map((branch) => (
                     <SelectItem key={branch.id} value={branch.id}>
                       {branch.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Allocate
              </label>
              <PremiumInput
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
                className="h-11 border border-gray-200 rounded-lg hover:border-gray-300 focus:border-[#E5FF29] transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max: <span className="font-semibold text-green-600">{availableStock} units</span>
              </p>
            </div>

            {/* Total Value Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Value
              </label>
              <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-lg font-bold text-gray-900">
                  R {((product?.price || 0) * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this allocation..."
              className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:border-[#E5FF29] resize-none transition-colors"
              rows={3}
            />
          </div>

          {/* Summary Card */}
          {selectedBranch && quantity > 0 && (
            <div className="mt-6 p-4 bg-[#E5FF29]/10 border border-[#E5FF29]/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-[#E5FF29]" />
                  <span className="text-sm font-medium text-gray-900">
                    Allocating to: <span className="font-semibold">{getBranchName(selectedBranch)}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">
                    {quantity} units
                  </span>
                  <ArrowRight className="h-5 w-5 text-[#E5FF29]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAllocate}
            disabled={!selectedBranch || quantity <= 0 || quantity > availableStock || isLoading}
            className="flex-1 bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90"
          >
            {isLoading ? 'Allocating...' : 'Allocate Stock'}
          </Button>
        </div>
      </div>
    </div>
  )
} 
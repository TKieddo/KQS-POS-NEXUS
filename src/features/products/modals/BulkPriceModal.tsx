import { useState, useEffect } from 'react'
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { bulkUpdatePrices, getPricePreview, type BulkPriceResult } from "@/lib/promotion-services"
import { getProducts, type Product } from "@/lib/supabase"

interface BulkPriceModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  selectedProductIds: string[]
  onPricesUpdated?: () => void
}

export const BulkPriceModal = ({ 
  isOpen, 
  onClose, 
  selectedCount, 
  selectedProductIds,
  onPricesUpdated 
}: BulkPriceModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [result, setResult] = useState<BulkPriceResult | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    method: 'percentage_increase' as 'percentage_increase' | 'percentage_decrease' | 'fixed_increase' | 'fixed_decrease' | 'set_fixed',
    value: '',
    roundToNearest: false
  })

  // Preview data
  const [previewData, setPreviewData] = useState<{
    currentTotal: number
    newTotal: number
    change: number
    changePercent: number
  } | null>(null)

  // Load selected products for preview
  useEffect(() => {
    if (isOpen && selectedProductIds.length > 0) {
      loadPreviewData()
    }
  }, [isOpen, selectedProductIds, formData])

  const loadPreviewData = async () => {
    try {
      const { data: products } = await getProducts()
      if (!products) return
      
      const selectedProducts = products.filter((p: Product) => selectedProductIds.includes(p.id))
      
      if (selectedProducts.length === 0) return

      const currentTotal = selectedProducts.reduce((sum: number, p: Product) => sum + p.price, 0)
      let newTotal = 0

      if (formData.value && !isNaN(parseFloat(formData.value))) {
        const value = parseFloat(formData.value)
        newTotal = selectedProducts.reduce((sum: number, p: Product) => {
          const newPrice = getPricePreview(p.price, formData.method, value, formData.roundToNearest ? 0.99 : undefined)
          return sum + newPrice
        }, 0)
      } else {
        newTotal = currentTotal
      }

      const change = newTotal - currentTotal
      const changePercent = currentTotal > 0 ? (change / currentTotal) * 100 : 0

      setPreviewData({
        currentTotal,
        newTotal,
        change,
        changePercent
      })
    } catch (err) {
      console.error('Error loading preview data:', err)
    }
  }

  const handleUpdatePrices = async () => {
    if (!formData.value || isNaN(parseFloat(formData.value))) {
      setError('Please enter a valid value')
      return
    }

    if (selectedProductIds.length === 0) {
      setError('No products selected')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      const result = await bulkUpdatePrices({
        method: formData.method,
        value: parseFloat(formData.value),
        roundToNearest: formData.roundToNearest ? 0.99 : undefined,
        productIds: selectedProductIds
      })

      setResult(result)
      
      if (result.success) {
        setSuccess(result.message)
        onPricesUpdated?.()
        // Close modal after 2 seconds on success
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to update prices')
      console.error('Error updating prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      method: 'percentage_increase',
      value: '',
      roundToNearest: false
    })
    setError(null)
    setSuccess(null)
    setResult(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'percentage_increase': return 'Increase by percentage (%)'
      case 'percentage_decrease': return 'Decrease by percentage (%)'
      case 'fixed_increase': return 'Increase by fixed amount ($)'
      case 'fixed_decrease': return 'Decrease by fixed amount ($)'
      case 'set_fixed': return 'Set fixed price ($)'
      default: return method
    }
  }

  const getValuePlaceholder = () => {
    switch (formData.method) {
      case 'percentage_increase':
      case 'percentage_decrease':
        return 'Enter percentage (e.g., 15)'
      case 'fixed_increase':
      case 'fixed_decrease':
      case 'set_fixed':
        return 'Enter amount (e.g., 5.99)'
      default:
        return 'Enter value'
    }
  }

  const getValueLabel = () => {
    switch (formData.method) {
      case 'percentage_increase':
      case 'percentage_decrease':
        return 'Percentage (%)'
      case 'fixed_increase':
      case 'fixed_decrease':
      case 'set_fixed':
        return 'Amount ($)'
      default:
        return 'Value'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Price Update" maxWidth="lg">
      <div className="flex flex-col h-full max-h-[80vh]">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Summary */}
          <div className="p-4 bg-[#F3F3F3] rounded-lg">
            <p className="text-sm text-black font-medium mb-2">
              {selectedCount} products selected for price update
            </p>
            <p className="text-xs text-black/60">
              This action will update prices for all selected products.
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Price Preview */}
          {previewData && formData.value && !isNaN(parseFloat(formData.value)) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Price Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Current Total:</span>
                  <span className="ml-2 font-medium">${previewData.currentTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-700">New Total:</span>
                  <span className="ml-2 font-medium">${previewData.newTotal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Change:</span>
                  <span className={`ml-2 font-medium ${previewData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {previewData.change >= 0 ? '+' : ''}${previewData.change.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Change %:</span>
                  <span className={`ml-2 font-medium ${previewData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {previewData.changePercent >= 0 ? '+' : ''}{previewData.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Update Method</label>
              <select 
                className="w-full p-2 border border-black/20 rounded-md bg-white"
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  method: e.target.value as typeof formData.method 
                }))}
              >
                <option value="percentage_increase">Increase by percentage (%)</option>
                <option value="percentage_decrease">Decrease by percentage (%)</option>
                <option value="fixed_increase">Increase by fixed amount ($)</option>
                <option value="fixed_decrease">Decrease by fixed amount ($)</option>
                <option value="set_fixed">Set fixed price ($)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">{getValueLabel()}</label>
              <Input 
                type="number" 
                placeholder={getValuePlaceholder()}
                className="bg-white border-black/20" 
                min="0"
                max={formData.method.includes('percentage') ? '100' : undefined}
                step={formData.method.includes('percentage') ? '1' : '0.01'}
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="roundPrices" 
                className="rounded"
                checked={formData.roundToNearest}
                onChange={(e) => setFormData(prev => ({ ...prev, roundToNearest: e.target.checked }))}
              />
              <label htmlFor="roundPrices" className="text-sm text-black">
                Round prices to nearest $0.99
              </label>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </span>
                </div>
              </div>
              
              {result.success && (
                <div className="text-sm text-green-700">
                  Successfully updated {result.updated} products
                </div>
              )}
              
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-700 break-words">
                        <span className="font-medium">{error.productName}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Button Section */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-6">
          <Button 
            className="bg-[#E5FF29] text-black hover:bg-[#e5ff29]/90"
            onClick={handleUpdatePrices}
            disabled={loading || !formData.value || selectedProductIds.length === 0}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            {loading ? 'Updating...' : 'Update Prices'}
          </Button>
          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 
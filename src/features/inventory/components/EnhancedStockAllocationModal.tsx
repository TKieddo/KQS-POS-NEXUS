'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Package, Building2, Users, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal } from '@/components/ui/modal'
import { allocateStockToBranch, getBranches, getCentralStock } from '@/lib/stock-services'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { executeWithAuth } from '@/lib/auth-utils'
import { handleDatabaseError } from '@/lib/error-handling'

interface ProductVariant {
  id: string
  sku: string | null
  barcode: string | null
  price: number | null
  cost_price: number | null
  stock_quantity: number
  min_stock_level: number
  max_stock_level: number | null
  image_url: string | null
  is_active: boolean
  options: { [key: string]: string }
}

interface ProductWithStock {
  id: string
  name: string
  sku: string | null
  has_variants: boolean
  stock_quantity: number
  variants?: ProductVariant[]
}

interface Branch {
  id: string
  name: string
  address?: string
}

interface VariantAllocation {
  variantId: string
  quantity: number
  enabled: boolean
  sku?: string
  stockQuantity: number
  options: { [key: string]: string }
}

interface EnhancedStockAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  product?: ProductWithStock
  variant?: ProductVariant
  onSuccess?: () => void
  mode?: 'product' | 'variant' | 'bulk'
}

export const EnhancedStockAllocationModal: React.FC<EnhancedStockAllocationModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  variant,
  onSuccess,
  mode = 'product'
}) => {
  const { branches } = useBranch()
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [availableStock, setAvailableStock] = useState<number>(0)
  const [variantAllocations, setVariantAllocations] = useState<VariantAllocation[]>([])
  const [allocateMode, setAllocateMode] = useState<'single' | 'bulk'>('single')

  useEffect(() => {
    if (product && isOpen) {
      fetchAvailableStock()
      if (mode === 'bulk' && product.has_variants) {
        setAllocateMode('bulk')
        loadVariants()
      } else {
        setAllocateMode('single')
      }
    }
  }, [product, variant, isOpen, mode])

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setSelectedBranch('')
      setQuantity(1)
      setNotes('')
      setVariantAllocations([])
    }
  }, [isOpen])

  const fetchAvailableStock = async () => {
    if (!product) return

    try {
      const stockData = await executeWithAuth(async () => {
        const { data } = await getCentralStock()
        return data || []
      })
      
      if (variant) {
        // For variant-specific allocation, use variant stock
        setAvailableStock(variant.stock_quantity)
      } else {
        // For product allocation, use total available stock
        const stockItem = stockData.find(item => item.product_id === product.id)
        setAvailableStock(stockItem?.available_quantity || 0)
      }
    } catch (error) {
      handleDatabaseError(error, 'fetching available stock')
    }
  }

  const loadVariants = async () => {
    if (!product?.has_variants) return

    try {
      const variantsData = await executeWithAuth(async () => {
        const { data, error } = await supabase
          .from('product_variants')
          .select(`
            id,
            sku,
            stock_quantity,
            product_variant_options (
              variant_options (
                value,
                label,
                variant_option_types (
                  display_name
                )
              )
            )
          `)
          .eq('product_id', product.id)
          .eq('is_active', true)

        if (error) throw error
        return data || []
      })

      console.log('Loaded variants data:', variantsData)

      const allocations: VariantAllocation[] = variantsData.map((variant: any) => {
        // Build variant options object
        const options: { [key: string]: string } = {}
        if (variant.product_variant_options) {
          variant.product_variant_options.forEach((pvo: any) => {
            if (pvo.variant_options) {
              const optionType = pvo.variant_options.variant_option_types?.display_name || 'Option'
              const optionValue = pvo.variant_options.label || pvo.variant_options.value
              options[optionType] = optionValue
            }
          })
        }

        return {
          variantId: variant.id,
          quantity: 0, // Start with 0 to prevent accidental over-allocation
          enabled: variant.stock_quantity > 0, // Only enable if stock is available
          sku: variant.sku,
          stockQuantity: variant.stock_quantity || 0,
          options
        }
      })

      console.log('Processed variant allocations:', allocations)
      setVariantAllocations(allocations)
    } catch (error) {
      handleDatabaseError(error, 'loading variants')
    }
  }

  const handleAllocate = async () => {
    if (!product || !selectedBranch) {
      toast.error('Please select a branch')
      return
    }

    if (allocateMode === 'single' && quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (allocateMode === 'bulk') {
      const validAllocations = variantAllocations.filter(v => v.enabled && v.quantity > 0)
      
      if (validAllocations.length === 0 && quantity === 0) {
        toast.error('Please select at least one item with a valid quantity')
        return
      }

      // Check if any allocation exceeds available stock
      const invalidAllocations = validAllocations.filter(v => v.quantity > v.stockQuantity)
      if (invalidAllocations.length > 0) {
        toast.error('Some variants have quantities exceeding available stock')
        return
      }
    }

    setIsLoading(true)
    try {
      if (allocateMode === 'single') {
        // Single product/variant allocation
        const targetId = variant ? variant.id : product.id
        const targetType = variant ? 'variant' : 'product'
        
        const result = await executeWithAuth(async () => {
          return await allocateStockToBranch({
            productId: product.id,
            variantId: variant?.id,
            branchId: selectedBranch,
            quantity: quantity,
            notes: notes.trim() || undefined
          })
        })

        if (!result.success) {
          throw new Error(result.error || 'Failed to allocate stock')
        }

        toast.success(
          `Successfully allocated ${quantity} units of ${variant ? 'variant' : 'product'} to branch`
        )
      } else {
        // Bulk allocation for multiple variants
        const enabledAllocations = variantAllocations.filter(v => v.enabled && v.quantity > 0)
        
        for (const allocation of enabledAllocations) {
          const result = await executeWithAuth(async () => {
            return await allocateStockToBranch({
              productId: product.id,
              variantId: allocation.variantId,
              branchId: selectedBranch,
              quantity: allocation.quantity,
              notes: notes.trim() || undefined
            })
          })

          if (!result.success) {
            throw new Error(`Failed to allocate variant ${allocation.variantId}: ${result.error}`)
          }
        }

        toast.success(
          `Successfully allocated ${enabledAllocations.length} variants to branch`
        )
      }

      onSuccess?.()
      onClose()
    } catch (error: any) {
      handleDatabaseError(error, 'allocating stock')
    } finally {
      setIsLoading(false)
    }
  }

  const updateVariantAllocation = (variantId: string, field: 'quantity' | 'enabled', value: number | boolean) => {
    setVariantAllocations(prev => 
      prev.map(v => 
        v.variantId === variantId 
          ? { ...v, [field]: value }
          : v
      )
    )
  }

  const formatVariantOptions = (options: { [key: string]: string }) => {
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  const getModalTitle = () => {
    if (mode === 'bulk') return 'Bulk Allocate Product & Variants'
    if (variant) return 'Allocate Product Variant'
    return 'Allocate Product Stock'
  }

  const getModalDescription = () => {
    if (mode === 'bulk') return 'Allocate the main product and selected variants to a branch'
    if (variant) return 'Allocate this specific product variant to a branch'
    return 'Allocate product stock to a specific branch'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E5FF29] rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
              <p className="text-sm text-gray-600">{getModalDescription()}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Horizontal Layout for Large Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Product Info & Settings */}
              <div className="lg:col-span-1 space-y-6">
                {/* Product/Variant Info */}
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{product?.name}</h3>
                          {variant && (
                            <p className="text-sm text-gray-600 truncate">
                              {formatVariantOptions(variant.options)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          SKU: {variant?.sku || product?.sku || 'N/A'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Available: {availableStock}
                        </Badge>
                        {product?.has_variants && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            Has Variants
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Mode Toggle */}
                {product?.has_variants && mode === 'bulk' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Allocation Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Tabs value={allocateMode} onValueChange={(value) => setAllocateMode(value as 'single' | 'bulk')}>
                        <TabsList className="grid w-full grid-cols-2 h-9">
                          <TabsTrigger value="single" className="text-xs">Single Product</TabsTrigger>
                          <TabsTrigger value="bulk" className="text-xs">Bulk Mode</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}

                {/* Branch Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Target Branch</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="bg-white h-9">
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {branches
                          .filter(branch => branch.id !== '00000000-0000-0000-0000-000000000001')
                          .map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {branch.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Notes Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes for this allocation..."
                      className="bg-white resize-none"
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Allocation Details */}
              <div className="lg:col-span-2">
                {/* Single Allocation */}
                {allocateMode === 'single' && (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Allocation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Package className="h-8 w-8 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {variant ? 'Variant Allocation' : 'Product Allocation'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Allocate stock to the selected branch
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Quantity to Allocate</Label>
                          <div className="mt-2 flex items-center gap-4">
                            <Input
                              type="number"
                              min="1"
                              max={availableStock}
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                              className="bg-white h-12 text-lg font-semibold text-center"
                              placeholder="0"
                            />
                            <div className="text-sm text-gray-500">
                              <div>Max: {availableStock}</div>
                              <div className="text-xs">units available</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Allocation Summary</p>
                              <p className="mt-1">
                                {quantity || 0} units will be moved from central warehouse to the selected branch.
                                This action cannot be undone automatically.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bulk Allocation */}
                {allocateMode === 'bulk' && (
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Bulk Allocation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-amber-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">
                              Select variants to allocate along with the main product
                            </span>
                          </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="max-h-80 overflow-y-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Select</th>
                                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Item</th>
                                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Available</th>
                                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Allocate</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {/* Main Product Row */}
                                <tr className="bg-blue-50">
                                  <td className="py-3 px-4">
                                    <Checkbox
                                      checked={true}
                                      disabled
                                      onChange={() => {}}
                                    />
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">{product?.name}</p>
                                        <p className="text-xs text-blue-600 font-medium">Main Product</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      {product?.stock_quantity || 0}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <Input
                                      type="number"
                                      min="0"
                                      max={product?.stock_quantity || 0}
                                      value={quantity}
                                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                      className="w-20 h-8 text-xs text-center"
                                    />
                                  </td>
                                </tr>

                                {/* Variant Rows */}
                                {variantAllocations.map((allocation, index) => (
                                  <tr key={allocation.variantId} className={`hover:bg-gray-50 ${allocation.stockQuantity === 0 ? 'opacity-60' : ''}`}>
                                    <td className="py-3 px-4">
                                      <Checkbox
                                        checked={allocation.enabled}
                                        disabled={allocation.stockQuantity === 0}
                                        onChange={(checked) => 
                                          updateVariantAllocation(allocation.variantId, 'enabled', checked)
                                        }
                                      />
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                          allocation.stockQuantity > 0 ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                          <Package className={`h-4 w-4 ${
                                            allocation.stockQuantity > 0 ? 'text-green-600' : 'text-gray-400'
                                          }`} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {formatVariantOptions(allocation.options) || `Variant ${index + 1}`}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            SKU: {allocation.sku || 'N/A'}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <Badge 
                                        className={`text-xs ${
                                          allocation.stockQuantity > 0 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {allocation.stockQuantity}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={allocation.stockQuantity}
                                        value={allocation.quantity}
                                        onChange={(e) => {
                                          const newQuantity = parseInt(e.target.value) || 0
                                          if (newQuantity <= allocation.stockQuantity) {
                                            updateVariantAllocation(allocation.variantId, 'quantity', newQuantity)
                                          } else {
                                            toast.error(`Maximum ${allocation.stockQuantity} units available for this variant`)
                                          }
                                        }}
                                        disabled={!allocation.enabled || allocation.stockQuantity === 0}
                                        className="w-20 h-8 text-xs text-center"
                                        placeholder={allocation.stockQuantity === 0 ? "0" : "0"}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {variantAllocations.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No variants found for this product</p>
                          </div>
                        )}

                        {variantAllocations.length > 0 && variantAllocations.every(v => v.stockQuantity === 0) && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-amber-800">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">
                                All variants are out of stock. Please restock before allocating.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>Stock will be transferred from central warehouse</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAllocate}
                disabled={isLoading || !selectedBranch || (allocateMode === 'single' && quantity <= 0)}
                className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 px-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Allocating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Allocate Stock
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

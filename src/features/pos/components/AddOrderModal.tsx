'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { X, Plus, Minus, Package, Tag, Hash, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '../types'
import { useBranch } from '@/context/BranchContext'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AddOrderModalProps {
  product: Product
  onClose: () => void
  onAddToOrder: (product: Product, quantity: number, options?: any) => void
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  product,
  onClose,
  onAddToOrder
}) => {
  const [quantity, setQuantity] = useState(1)
  const { selectedBranch } = useBranch()

  type Variant = {
    id: string
    sku: string | null
    price: number | null
    stock_quantity: number
    options: Record<string, string>
  }

  const isCentral = selectedBranch?.id === '00000000-0000-0000-0000-000000000001'
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [loadingVariants, setLoadingVariants] = useState(false)

  useEffect(() => {
    const loadVariants = async () => {
      if (!product.has_variants) return
      setLoadingVariants(true)
      try {
        if (isCentral) {
          const { data, error } = await supabase
            .from('product_variants')
            .select(`
              id, sku, price, stock_quantity,
              product_variant_options (
                variant_options (
                  label,
                  value,
                  variant_option_types (display_name)
                )
              )
            `)
            .eq('product_id', product.id)
            .eq('is_active', true)

          if (!error && data) {
            const transformed: Variant[] = data.map((v: any) => {
              const opts: Record<string, string> = {}
              v.product_variant_options?.forEach((pvo: any) => {
                const type = pvo.variant_options?.variant_option_types?.display_name
                const value = pvo.variant_options?.label || pvo.variant_options?.value
                if (type && value) opts[type] = value
              })
              return { id: v.id, sku: v.sku, price: v.price, stock_quantity: v.stock_quantity || 0, options: opts }
            })
            setVariants(transformed)
            const firstAvailable = transformed.find(v => v.stock_quantity > 0)
            setSelectedVariantId(firstAvailable?.id || transformed[0]?.id || '')
          }
        } else {
          const { data, error } = await supabase
            .from('branch_stock')
            .select(`
              stock_quantity,
              variant_id,
              product_variants:variant_id (
                id, sku, price,
                product_variant_options (
                  variant_options (
                    label,
                    value,
                    variant_option_types (display_name)
                  )
                )
              )
            `)
            .eq('product_id', product.id)
            .eq('branch_id', selectedBranch?.id || '')
            .not('variant_id', 'is', null)

          if (!error && data) {
            const transformed: Variant[] = data.map((row: any) => {
              const v = row.product_variants
              const opts: Record<string, string> = {}
              v?.product_variant_options?.forEach((pvo: any) => {
                const type = pvo.variant_options?.variant_option_types?.display_name
                const value = pvo.variant_options?.label || pvo.variant_options?.value
                if (type && value) opts[type] = value
              })
              return { id: v?.id || row.variant_id, sku: v?.sku || null, price: v?.price || 0, stock_quantity: row.stock_quantity || 0, options: opts }
            })
            setVariants(transformed)
            const firstAvailable = transformed.find(v => v.stock_quantity > 0)
            setSelectedVariantId(firstAvailable?.id || transformed[0]?.id || '')
          }
        }
      } finally {
        setLoadingVariants(false)
      }
    }
    loadVariants()
  }, [product.id, product.has_variants, selectedBranch?.id])

  const selectedVariant = useMemo(() => variants.find(v => v.id === selectedVariantId) || null, [variants, selectedVariantId])

  const basePrice = selectedVariant && product.has_variants ? (selectedVariant.price || product.price) : product.price
  const totalPrice = basePrice * quantity
  const maxQuantity = selectedVariant && product.has_variants ? (selectedVariant.stock_quantity || 0) : (product.stock_quantity || 0)

  const handleAddToOrder = () => {
    onAddToOrder(product, quantity, selectedVariant ? {
      variantId: selectedVariant.id,
      variantSku: selectedVariant.sku,
      variantOptions: selectedVariant.options,
      unitPrice: basePrice
    } : undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add to Order</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Info */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {product.name}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-3">
                {formatCurrency(basePrice)}
              </p>
              {product.category_name && (
                <Badge variant="secondary" className="text-sm">
                  <Tag className="h-4 w-4 mr-1" />
                  {product.category_name}
                </Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-6 space-y-3">
            {product.description && (
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.sku || 'N/A'}</span>
              </div>
              
              {product.barcode && (
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Barcode:</span>
                  <span className="font-medium">{product.barcode}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Unit:</span>
                <span className="font-medium">{product.unit || 'piece'}</span>
              </div>
            </div>

            {/* Stock Information & Variant Selector */}
            <div className="bg-gray-50 rounded-lg p-4">
              {product.has_variants && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Variant</div>
                  <Select value={selectedVariantId || undefined} onValueChange={setSelectedVariantId}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={loadingVariants ? 'Loading variants...' : 'Select a variant'} />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-60 overflow-y-auto">
                      {variants.length === 0 && (
                        <SelectItem value="no_variants" disabled>No variants</SelectItem>
                      )}
                      {variants.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm">
                              {Object.entries(v.options).map(([k, val]) => `${k}: ${val}`).join(', ') || (v.sku || v.id.slice(0,8))}
                            </span>
                            <span className="text-xs text-gray-500">{v.stock_quantity} in stock</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Available Stock</span>
                <span className={`text-sm font-bold ${maxQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {maxQuantity} units
                </span>
              </div>
              {maxQuantity <= 10 && maxQuantity > 0 && (
                <p className="text-xs text-orange-600 mt-1">Low stock warning</p>
              )}
              {maxQuantity === 0 && (
                <p className="text-xs text-red-600 mt-1">Out of stock</p>
              )}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Quantity (Max: {maxQuantity})
            </label>
            <div className="flex items-center justify-center space-x-6">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 w-12 p-0"
                disabled={quantity <= 1}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                className="h-12 w-12 p-0"
                disabled={quantity >= maxQuantity || maxQuantity === 0}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            {quantity > maxQuantity && maxQuantity > 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Cannot add more than available stock ({maxQuantity})
              </p>
            )}
          </div>

          {/* Cost Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Unit Price:</span>
              <span className="text-sm font-medium">{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="text-sm font-medium">{quantity}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <Button
            className="w-full bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-semibold h-12 text-lg"
            onClick={handleAddToOrder}
            disabled={maxQuantity === 0 || quantity > maxQuantity}
          >
            Add to Order - {formatCurrency(totalPrice)}
          </Button>
        </div>
      </div>
    </div>
  )
} 
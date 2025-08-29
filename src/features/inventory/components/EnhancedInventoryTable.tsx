'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Package, Building2, ArrowRight, Eye, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  barcode: string | null
  price: number
  cost_price: number | null
  stock_quantity: number
  min_stock_level: number
  has_variants: boolean
  is_active: boolean
  category: {
    id: string
    name: string
    color: string
  } | null
  // Stock allocation data
  total_stock?: number
  allocated_stock?: number
  available_stock?: number
  // Branch-specific data
  branch_allocations?: {
    [branchId: string]: {
      allocated_quantity: number
      branch_name: string
    }
  }
  variants?: ProductVariant[]
}

interface EnhancedInventoryTableProps {
  products: ProductWithStock[]
  isLoading: boolean
  isCentralWarehouse: boolean
  currentBranchId?: string
  onAllocateProduct: (product: ProductWithStock) => void
  onAllocateVariant: (product: ProductWithStock, variant: ProductVariant) => void
  onBulkAllocate: (product: ProductWithStock) => void
  onRefresh: () => void
}

const VariantRow: React.FC<{
  variant: ProductVariant
  product: ProductWithStock
  isCentralWarehouse: boolean
  onAllocateVariant: (product: ProductWithStock, variant: ProductVariant) => void
}> = ({ variant, product, isCentralWarehouse, onAllocateVariant }) => {
  const formatOptions = (options: { [key: string]: string }) => {
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  const getStockStatus = (stock: number, minLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (stock <= minLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const stockStatus = getStockStatus(variant.stock_quantity, variant.min_stock_level)

  return (
          <tr className="bg-gray-50 border-b border-gray-200">
      <td className="py-2 px-2 pl-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <Package className="h-3 w-3 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">
              {variant.sku || `${product.sku}-VAR`}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {formatOptions(variant.options)}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-2 px-2">
        <Badge className={`${stockStatus.color} text-xs px-1 py-0 leading-tight whitespace-nowrap`}>
          {stockStatus.label}
        </Badge>
      </td>
      
      <td className="py-2 px-2 text-xs text-gray-600 truncate max-w-16">
        {variant.barcode || 'N/A'}
      </td>
      
      <td className="py-2 px-2 text-right">
        <span className="text-xs font-medium">R{(variant.price || 0).toFixed(2)}</span>
      </td>
      
      {isCentralWarehouse ? (
        <>
          <td className="py-2 px-2 text-right text-xs font-medium">
            {variant.stock_quantity}
          </td>
          <td className="py-2 px-2 text-right text-xs text-yellow-600">
            0
          </td>
          <td className="py-2 px-2 text-right text-xs text-green-600">
            {variant.stock_quantity}
          </td>
        </>
      ) : (
        <td className="py-2 px-2 text-right text-xs text-blue-600 font-medium">
          {variant.stock_quantity}
        </td>
      )}
      
      <td className="py-2 px-2 text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAllocateVariant(product, variant)}
          className="h-6 px-2 text-xs"
        >
          <Building2 className="h-3 w-3" />
        </Button>
      </td>
    </tr>
  )
}

const ProductRow: React.FC<{
  product: ProductWithStock
  isCentralWarehouse: boolean
  currentBranchId?: string
  onAllocateProduct: (product: ProductWithStock) => void
  onAllocateVariant: (product: ProductWithStock, variant: ProductVariant) => void
  onBulkAllocate: (product: ProductWithStock) => void
}> = ({ product, isCentralWarehouse, currentBranchId, onAllocateProduct, onAllocateVariant, onBulkAllocate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)

  const fetchVariants = async () => {
    if (!product.has_variants || variants.length > 0) return

    setIsLoadingVariants(true)
    try {
      if (isCentralWarehouse) {
        // Central warehouse shows global variant stock
        const variantsData = await executeWithAuth(async () => {
          const { data, error } = await supabase
            .from('product_variants')
            .select(`
              *,
              product_variant_options (
                id,
                option_id,
                variant_options (
                  id,
                  value,
                  label,
                  color_hex,
                  variant_option_types (
                    id,
                    name,
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

        const transformedVariants: ProductVariant[] = variantsData.map((variant: any) => {
          const options: { [key: string]: string } = {}
          if (variant.product_variant_options) {
            variant.product_variant_options.forEach((pvo: any) => {
              if (pvo.variant_options && pvo.variant_options.variant_option_types) {
                const optionType = pvo.variant_options.variant_option_types.display_name || pvo.variant_options.variant_option_types.name
                const optionValue = pvo.variant_options.label || pvo.variant_options.value
                options[optionType] = optionValue
              }
            })
          }
          return {
            id: variant.id,
            sku: variant.sku,
            barcode: variant.barcode,
            price: variant.price,
            cost_price: variant.cost_price,
            stock_quantity: variant.stock_quantity || 0,
            min_stock_level: variant.min_stock_level || 0,
            max_stock_level: variant.max_stock_level,
            image_url: variant.image_url,
            is_active: variant.is_active,
            options
          }
        })
        setVariants(transformedVariants)
      } else {
        // Branch view: show branch-specific variant stock from branch_stock
        const branchVariants = await executeWithAuth(async () => {
          const { data, error } = await supabase
            .from('branch_stock')
            .select(`
              stock_quantity,
              variant_id,
              product_variants:variant_id (
                id,
                sku,
                barcode,
                price,
                cost_price,
                stock_quantity,
                min_stock_level,
                max_stock_level,
                image_url,
                is_active,
                product_variant_options (
                  id,
                  option_id,
                  variant_options (
                    id,
                    value,
                    label,
                    color_hex,
                    variant_option_types (
                      id,
                      name,
                      display_name
                    )
                  )
                )
              )
            `)
            .eq('product_id', product.id)
            .eq('branch_id', currentBranchId || '')
            .not('variant_id', 'is', null)

          if (error) throw error
          return data || []
        })

        const transformedVariants: ProductVariant[] = branchVariants.map((row: any) => {
          const v = row.product_variants
          const options: { [key: string]: string } = {}
          if (v?.product_variant_options) {
            v.product_variant_options.forEach((pvo: any) => {
              if (pvo.variant_options && pvo.variant_options.variant_option_types) {
                const optionType = pvo.variant_options.variant_option_types.display_name || pvo.variant_options.variant_option_types.name
                const optionValue = pvo.variant_options.label || pvo.variant_options.value
                options[optionType] = optionValue
              }
            })
          }
          return {
            id: v?.id || row.variant_id,
            sku: v?.sku || null,
            barcode: v?.barcode || null,
            price: v?.price || 0,
            cost_price: v?.cost_price || 0,
            stock_quantity: row.stock_quantity || 0, // branch-specific stock
            min_stock_level: v?.min_stock_level || 0,
            max_stock_level: v?.max_stock_level || null,
            image_url: v?.image_url || null,
            is_active: v?.is_active ?? true,
            options
          }
        })
        setVariants(transformedVariants)
      }
    } catch (error) {
      handleDatabaseError(error, 'loading product variants')
    } finally {
      setIsLoadingVariants(false)
    }
  }

  const handleToggleExpanded = () => {
    console.log('Toggle expanded clicked for product:', product.name, 'has_variants:', product.has_variants)
    if (!isExpanded && product.has_variants) {
      console.log('Fetching variants for product:', product.id)
      fetchVariants()
    }
    setIsExpanded(!isExpanded)
  }

  const getStockStatus = (stock: number, minLevel: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (stock <= minLevel) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const stockStatus = getStockStatus(
    product.total_stock || product.stock_quantity, 
    product.min_stock_level
  )

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="py-2 px-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="h-5 w-5 p-0 flex-shrink-0"
              style={{ visibility: product.has_variants ? 'visible' : 'hidden' }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            
            <div className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                {product.has_variants && (
                  <Badge variant="outline" className="text-xs px-1 py-0 whitespace-nowrap">
                    {variants.length > 0 ? `${variants.length}v` : 'Var'}
                  </Badge>
                )}
              </div>
              {product.category && (
                <span 
                  className="inline-block px-1 py-0 text-xs rounded text-white truncate max-w-20"
                  style={{ backgroundColor: product.category.color }}
                >
                  {product.category.name}
                </span>
              )}
            </div>
          </div>
        </td>
        
        <td className="py-2 px-2">
          <Badge className={`${stockStatus.color} text-xs px-1 py-0 leading-tight whitespace-nowrap`}>
            {stockStatus.label === 'Out of Stock' ? 'Out' : stockStatus.label === 'Low Stock' ? 'Low' : 'In Stock'}
          </Badge>
        </td>
        
        <td className="py-2 px-2 text-xs text-gray-600 truncate max-w-20">
          {product.sku || 'N/A'}
        </td>
        
        <td className="py-2 px-2 text-right">
          <span className="text-xs font-medium">R{product.price.toFixed(2)}</span>
        </td>
        
        {isCentralWarehouse ? (
          <>
            <td className="py-2 px-2 text-right text-xs font-medium">
              {product.total_stock || product.stock_quantity}
            </td>
            <td className="py-2 px-2 text-right text-xs text-yellow-600">
              {product.allocated_stock || 0}
            </td>
            <td className="py-2 px-2 text-right text-xs text-green-600">
              {product.available_stock || (product.stock_quantity - (product.allocated_stock || 0))}
            </td>
          </>
        ) : (
          <td className="py-2 px-2 text-right text-xs text-blue-600 font-medium">
            {product.has_variants ? 0 : (product.allocated_stock || 0)}
          </td>
        )}
        
        <td className="py-2 px-2 text-right">
          <div className="flex items-center gap-1 justify-end">
            {product.has_variants && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAllocate(product)}
                className="h-6 px-2 text-xs"
                title="Bulk Allocate"
              >
                <Package className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAllocateProduct(product)}
              className="h-6 px-2 text-xs"
              title="Allocate"
            >
              <Building2 className="h-3 w-3" />
            </Button>
          </div>
        </td>
      </tr>
      
      {/* Variant Rows */}
      {isExpanded && product.has_variants && (
        <>
          {isLoadingVariants ? (
            <tr>
              <td colSpan={isCentralWarehouse ? 8 : 6} className="py-2 px-2 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              </td>
            </tr>
          ) : variants.length > 0 ? (
            variants.map((variant) => (
              <VariantRow
                key={variant.id}
                variant={variant}
                product={product}
                isCentralWarehouse={isCentralWarehouse}
                onAllocateVariant={onAllocateVariant}
              />
            ))
          ) : (
            <tr>
              <td colSpan={isCentralWarehouse ? 8 : 6} className="py-2 px-2 pl-8 text-center text-gray-500 text-xs">
                No variants found
              </td>
            </tr>
          )}
        </>
      )}
    </>
  )
}

export const EnhancedInventoryTable: React.FC<EnhancedInventoryTableProps> = ({
  products,
  isLoading,
  isCentralWarehouse,
  currentBranchId,
  onAllocateProduct,
  onAllocateVariant,
  onBulkAllocate,
  onRefresh
}) => {
  // Debug logging removed for production
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-500">Loading inventory...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">
              {isCentralWarehouse 
                ? "No products in central warehouse stock."
                : "No allocated products for this branch."
              }
            </p>
            <Button onClick={onRefresh}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-900 text-xs">Product</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-900 text-xs">Status</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-900 text-xs">SKU</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Price</th>
                {isCentralWarehouse ? (
                  <>
                    <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Total</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Alloc</th>
                    <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Avail</th>
                  </>
                ) : (
                  <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Allocated</th>
                )}
                <th className="text-right py-2 px-2 font-semibold text-gray-900 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isCentralWarehouse={isCentralWarehouse}
                  currentBranchId={currentBranchId}
                  onAllocateProduct={onAllocateProduct}
                  onAllocateVariant={onAllocateVariant}
                  onBulkAllocate={onBulkAllocate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

import { Edit, Trash2, Barcode, Package, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DiscountBadge } from "@/components/ui/discount-badge"
import type { Product as SupabaseProduct } from "@/lib/supabase"
import { calculateDiscountedPrice, isDiscountValid, truncateProductDescription } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { VariantEditModal } from "@/features/products/modals/VariantEditModal"

// UI Product interface that matches the current table structure
export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  totalStock: number
  availableStock: number
  laybyeStock: number
  price: number
  finalPrice: number // Price after discount
  image_url?: string | null
  discountInfo?: {
    amount: number
    type: 'percentage' | 'fixed'
    description?: string
    expiresAt?: string
    isActive: boolean
  }
  status: 'Active' | 'Inactive'
  has_variants?: boolean
  // branch-only derived field
  branch_quantity?: number
}

// Product variant interface for the table display
export interface ProductVariant {
  id: string
  sku: string
  barcode?: string
  price: number
  cost_price?: number
  stock_quantity: number
  min_stock_level?: number
  max_stock_level?: number | null
  image_url?: string
  is_active: boolean
  discount_amount?: number | null
  discount_type?: 'percentage' | 'fixed' | null
  discount_description?: string | null
  discount_expires_at?: string | null
  is_discount_active?: boolean
  options: { [key: string]: string } // e.g. { size: "M", color: "Red" }
}

// Transform Supabase product to UI product
export const transformProduct = (supabaseProduct: SupabaseProduct & { 
  categories?: { name: string },
  branch_allocations?: Array<{ allocated_quantity: number }>
}): Product => {
  const discountInfo = supabaseProduct.is_discount_active && supabaseProduct.discount_amount ? {
    amount: supabaseProduct.discount_amount,
    type: (supabaseProduct.discount_type as 'percentage' | 'fixed') || 'percentage',
    description: supabaseProduct.discount_description || undefined,
    expiresAt: supabaseProduct.discount_expires_at || undefined,
    isActive: supabaseProduct.is_discount_active
  } : undefined

  const finalPrice = discountInfo && isDiscountValid(discountInfo.isActive, discountInfo.expiresAt)
    ? calculateDiscountedPrice(supabaseProduct.price, discountInfo.amount, discountInfo.type)
    : supabaseProduct.price

  // If branch_allocations exist, use allocated quantity, otherwise use total stock
  const branchQuantity = (supabaseProduct as any).branch_quantity as number | undefined
  const isBranchView = typeof branchQuantity === 'number'
  const allocatedQuantity = isBranchView ? branchQuantity : (supabaseProduct.branch_allocations?.[0]?.allocated_quantity || 0)
  const totalStock = isBranchView ? branchQuantity! : (supabaseProduct.branch_allocations ? allocatedQuantity : supabaseProduct.stock_quantity)
  const availableStock = totalStock

  return {
    id: supabaseProduct.id,
    sku: supabaseProduct.sku || 'N/A',
    name: supabaseProduct.name,
    description: supabaseProduct.description || '',
    category: supabaseProduct.categories?.name || 'Uncategorized',
    totalStock,
    availableStock,
    laybyeStock: 0, // This will need to be calculated from laybye orders
    price: supabaseProduct.price,
    finalPrice,
    image_url: supabaseProduct.image_url,
    discountInfo,
    status: supabaseProduct.is_active ? 'Active' : 'Inactive',
    has_variants: supabaseProduct.has_variants || false,
    branch_quantity: branchQuantity
  }
}

interface ProductRowProps {
  product: Product
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onBarcode: (id: string) => void
  stockFilter?: 'all' | 'available' | 'laybye-only' | 'out-of-stock' | 'low-stock'
  onVariantEdit: (variant: ProductVariant, productName: string) => void
  isCentralWarehouse?: boolean
  currentBranchId?: string
}

// Component for variant rows
const VariantRow = ({ 
  variant, 
  productName, 
  onVariantUpdated 
}: { 
  variant: ProductVariant; 
  productName: string;
  onVariantUpdated: () => void;
}) => {
  const getVariantName = () => {
    const optionValues = Object.values(variant.options).filter(Boolean)
    return optionValues.length > 0 ? optionValues.join(', ') : 'Default Variant'
  }

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'bg-[#FF3B3B]/20 text-[#FF3B3B]'
    if (stock <= 5) return 'bg-[#FF9500]/20 text-[#FF9500]'
    return 'bg-[#009B4D]/20 text-[#009B4D]'
  }

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of stock'
    if (stock <= 5) return `${stock} available (low)`
    return `${stock} available`
  }

  return (
    <tr className="border-b border-gray-100 bg-gray-50/50">
      <td className="px-3 py-2"></td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3 pl-8">
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={`${productName} - ${getVariantName()}`}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm">{getVariantName()}</p>
            <p className="text-xs text-gray-500">Variant</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-gray-700 font-mono text-sm">{variant.sku || 'N/A'}</td>
      <td className="px-3 py-2 text-gray-500 text-sm">-</td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(variant.stock_quantity)}`}>
          {getStockStatusText(variant.stock_quantity)}
        </span>
      </td>
      <td className="px-3 py-2 text-gray-800 text-sm">
        <span className="font-semibold">${variant.price.toFixed(2)}</span>
        {variant.cost_price && (
          <div className="text-xs text-gray-500">Cost: ${variant.cost_price.toFixed(2)}</div>
        )}
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          variant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {variant.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onVariantUpdated}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 h-7 px-2"
            title="Edit variant"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-gray-300 text-gray-600 hover:bg-gray-50 h-7 px-2"
            title="Generate barcode"
          >
            <Barcode className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

const ProductRow = ({ 
  product, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onBarcode,
  stockFilter = 'all',
  onVariantEdit,
  isCentralWarehouse = true,
  currentBranchId
}: ProductRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)

  const fetchVariants = async (force = false) => {
    if (!product.has_variants || (variants.length > 0 && !force)) return

    console.log('fetchVariants called for product:', product.id, 'force:', force)
    setIsLoadingVariants(true)
    try {
      if (isCentralWarehouse) {
      const { data: variantsData, error } = await supabase
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

      if (error) {
        console.error('Error fetching variants:', error)
        return
      }

      if (variantsData) {
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
            sku: variant.sku || '',
            barcode: variant.barcode || '',
            price: variant.price || 0,
            cost_price: variant.cost_price || 0,
            stock_quantity: variant.stock_quantity || 0,
            min_stock_level: variant.min_stock_level || 0,
            max_stock_level: variant.max_stock_level || null,
            image_url: variant.image_url || '',
            is_active: variant.is_active,
            discount_amount: variant.discount_amount || null,
            discount_type: variant.discount_type || null,
            discount_description: variant.discount_description || null,
            discount_expires_at: variant.discount_expires_at || null,
            is_discount_active: variant.is_discount_active || false,
            options
          }
        })
          setVariants(transformedVariants)
        }
      } else {
        // Branch view: show only allocated variants with branch-specific quantities
        const { data: branchVariants, error } = await supabase
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

        if (error) {
          console.error('Error fetching branch variants:', error)
          return
        }

        if (branchVariants) {
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
              sku: v?.sku || '',
              barcode: v?.barcode || '',
              price: v?.price || 0,
              cost_price: v?.cost_price || 0,
              stock_quantity: row.stock_quantity || 0, // branch quantity
              min_stock_level: v?.min_stock_level || 0,
              max_stock_level: v?.max_stock_level || null,
              image_url: v?.image_url || '',
              is_active: v?.is_active ?? true,
              discount_amount: v?.discount_amount || null,
              discount_type: v?.discount_type || null,
              discount_description: v?.discount_description || null,
              discount_expires_at: v?.discount_expires_at || null,
              is_discount_active: v?.is_discount_active || false,
              options
            }
          })
        setVariants(transformedVariants)
        }
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  const handleToggleExpand = async () => {
    if (!product.has_variants) return
    
    if (!isExpanded) {
      await fetchVariants()
    }
    setIsExpanded(!isExpanded)
  }

  const handleVariantEditLocal = (variant: ProductVariant) => {
    onVariantEdit(variant, product.name)
  }

  const handleVariantUpdated = async () => {
    console.log('handleVariantUpdated called - clearing variants and refetching')
    // Clear variants and force refetch
    setVariants([])
    setIsLoadingVariants(false)
    // Small delay to ensure state is updated
    setTimeout(() => {
      fetchVariants(true) // Force refresh
    }, 100)
  }
  const getStockStatus = (available: number, total: number) => {
    if (available === 0 && total === 0) return 'out-of-stock'
    if (available === 0 && total > 0) return 'laybye-only'
    if (available <= 5) return 'low-stock'
    return 'in-stock'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-[#009B4D]/20 text-[#009B4D]'
      case 'low-stock': return 'bg-[#FF9500]/20 text-[#FF9500]'
      case 'laybye-only': return 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
      case 'out-of-stock': return 'bg-[#FF3B3B]/20 text-[#FF3B3B]'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in-stock': return `${product.availableStock} available`
      case 'low-stock': return `${product.availableStock} available (low)`
      case 'laybye-only': return `${product.laybyeStock} on laybye only`
      case 'out-of-stock': return 'Out of stock'
      default: return 'Unknown'
    }
  }

  const stockStatus = getStockStatus(product.availableStock, product.totalStock)

  // Only show laybye text if:
  // 1. There is laybye stock AND
  // 2. We're not filtering to "available" or "laybye-only" (which would be redundant)
  const shouldShowLaybyeText = product.laybyeStock > 0 && stockFilter !== 'available' && stockFilter !== 'laybye-only'

  return (
    <>
      <tr className="border-b border-white/10 bg-white pointer-events-none">
        <td className="px-3 py-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isSelected}
              onChange={() => onSelect(product.id)}
            />
            {product.has_variants && (
              <button
                onClick={handleToggleExpand}
                className="p-1 hover:bg-gray-100 rounded transition-colors pointer-events-auto"
                title={isExpanded ? 'Collapse variants' : 'Expand variants'}
              >
                {isLoadingVariants ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-2 pointer-events-auto">
          <div className="flex items-center gap-3">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-[#F3F3F3] rounded-md flex items-center justify-center">
                <Package className="h-6 w-6 text-black/30" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-black">{product.name}</p>
                {product.has_variants && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {variants.length > 0 ? `${variants.length} variants` : 'Has variants'}
                  </span>
                )}
              </div>
              <p 
                className="text-xs text-black/50 cursor-help"
                title={product.description && product.description.length > 60 ? product.description : undefined}
              >
                {truncateProductDescription(product.description)}
              </p>
            </div>
          </div>
        </td>
      <td className="px-3 py-2 text-black/80 font-mono pointer-events-auto">{product.sku}</td>
      <td className="px-3 py-2 text-black/80 pointer-events-auto">{product.category}</td>
      <td className="px-3 py-2 pointer-events-auto">
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(stockStatus)}`}>
            {getStockStatusText(stockStatus)}
          </span>
          {shouldShowLaybyeText && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <EyeOff className="h-3 w-3" />
              <span>{product.laybyeStock} on laybye</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-black/80 pointer-events-auto">
        <div className="space-y-1">
          {product.discountInfo && product.finalPrice < product.price ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">${product.finalPrice.toFixed(2)}</span>
                <span className="text-xs text-gray-500 line-through">${product.price.toFixed(2)}</span>
              </div>
              <DiscountBadge 
                amount={product.discountInfo.amount} 
                type={product.discountInfo.type}
                description={product.discountInfo.description}
                expiresAt={product.discountInfo.expiresAt}
                isActive={product.discountInfo.isActive}
                size="sm"
                showExpiry={false}
              />
            </>
          ) : (
            <span className="font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-2 pointer-events-auto">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          product.status === 'Active' ? 'bg-black text-[#E5FF29]' : 'bg-[#FF3B3B]/20 text-[#FF3B3B]'
        }`}>
          {product.status}
        </span>
      </td>
      <td className="px-3 py-2 pointer-events-auto">
        <div className="flex items-center gap-2 relative z-10">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Edit button clicked for product:', product.id)
              onEdit(product)
            }}
            className="border-gray-300 text-black hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors cursor-pointer"
            title="Edit product"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Barcode button clicked for product:', product.id)
              onBarcode(product.id)
            }}
            className="border-gray-300 text-black hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors cursor-pointer"
            title="Generate barcode"
          >
            <Barcode className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Delete button clicked for product:', product.id)
              onDelete(product.id)
            }}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 active:bg-red-100 transition-colors cursor-pointer"
            title="Delete product"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
    
    {/* Render variant rows when expanded */}
    {isExpanded && variants.map((variant) => (
      <VariantRow
        key={variant.id}
        variant={variant}
        productName={product.name}
        onVariantUpdated={() => handleVariantEditLocal(variant)}
      />
    ))}
  </>
  )
}

interface ProductTableProps {
  products: Product[]
  selectedProducts: string[]
  onSelectAll: () => void
  onSelectProduct: (id: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onBarcodeProduct: (id: string) => void
  stockFilter?: 'all' | 'available' | 'laybye-only' | 'out-of-stock' | 'low-stock'
  onVariantUpdated?: () => void
  isCentralWarehouse?: boolean
  currentBranchId?: string
}

export const ProductTable = ({
  products,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onBarcodeProduct,
  stockFilter = 'all',
  onVariantUpdated,
  isCentralWarehouse,
  currentBranchId
}: ProductTableProps) => {
  const allSelected = selectedProducts.length === products.length && products.length > 0
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [editingProductName, setEditingProductName] = useState<string>('')
  const [showVariantEditModal, setShowVariantEditModal] = useState(false)

  const handleVariantEdit = (variant: ProductVariant, productName: string) => {
    console.log('handleVariantEdit called with variant:', variant)
    console.log('Variant options:', variant.options)
    setEditingVariant(variant)
    setEditingProductName(productName)
    setShowVariantEditModal(true)
  }

  const handleVariantUpdated = () => {
    setShowVariantEditModal(false)
    setEditingVariant(null)
    setEditingProductName('')
    onVariantUpdated?.()
  }

  return (
    <div className="rounded-2xl p-3 shadow-lg bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-l-xl">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={allSelected}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Product</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">SKU</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Category</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Stock Status</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Price</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325]">Status</th>
              <th className="text-left px-3 py-2 font-semibold text-white/90 bg-[#232325] rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={onSelectProduct}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onBarcode={onBarcodeProduct}
                stockFilter={stockFilter}
                onVariantEdit={handleVariantEdit}
                isCentralWarehouse={!!isCentralWarehouse}
                currentBranchId={currentBranchId}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Variant Edit Modal - Outside of table structure */}
      {editingVariant && (
        <VariantEditModal
          isOpen={showVariantEditModal}
          onClose={() => setShowVariantEditModal(false)}
          variant={editingVariant}
          productName={editingProductName}
          onVariantUpdated={handleVariantUpdated}
        />
      )}
    </div>
  )
} 
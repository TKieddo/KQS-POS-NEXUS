import { Edit, Trash2, Barcode, Package, Eye, EyeOff, MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DiscountBadge } from "@/components/ui/discount-badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Product } from "./ProductTable"
import { calculateDiscountedPrice, isDiscountValid, truncateProductDescription } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onBarcode: (id: string) => void
  stockFilter?: 'all' | 'available' | 'laybye-only' | 'out-of-stock' | 'low-stock'
}

interface Category {
  id: string
  name: string
  count: number
}

const ProductCard = ({ 
  product, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onBarcode,
  stockFilter = 'all'
}: ProductCardProps) => {
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
  const stockStatusColor = getStockStatusColor(stockStatus)
  const stockStatusText = getStockStatusText(stockStatus)

  const hasDiscount = product.discountInfo && isDiscountValid(
    product.discountInfo.isActive, 
    product.discountInfo.expiresAt
  )

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 bg-white relative ${
      isSelected ? 'ring-2 ring-[#E5FF29] shadow-md' : ''
    }`} style={{ border: '0.5px solid #000000' }}>
      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={isSelected}
          onChange={() => onSelect(product.id)}
          className="bg-white border-gray-300"
        />
      </div>

      {/* Product Image */}
      <div className="relative p-0.5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={product.status === 'Active' ? 'default' : 'secondary'}
            className={product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
          >
            {product.status}
          </Badge>
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-12">
            <DiscountBadge 
              discount={product.discountInfo!}
              className="bg-red-500 text-white"
            />
          </div>
        )}

        {/* Stock indicator */}
        {stockStatus === 'low-stock' && (
          <div className="absolute top-2 left-8 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            Low Stock
          </div>
        )}
        
        {stockStatus === 'out-of-stock' && (
          <div className="absolute top-2 left-8 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            R {product.finalPrice.toFixed(2)}
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(product)}
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBarcode(product.id)}
              className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
            >
              <Barcode className="h-3 w-3" />
            </Button>
            <DropdownMenu
              trigger={
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              }
            >
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBarcode(product.id)}>
                  <Barcode className="mr-2 h-4 w-4" />
                  Generate Barcode
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stock info */}
        <div className="text-xs text-gray-500">
          Stock: {product.totalStock} units
        </div>
      </div>
    </Card>
  )
}

interface ProductGalleryProps {
  products: Product[]
  selectedProducts: string[]
  onSelectAll: () => void
  onSelectProduct: (id: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onBarcodeProduct: (id: string) => void
  stockFilter?: 'all' | 'available' | 'laybye-only' | 'out-of-stock' | 'low-stock'
  categories?: Category[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
}

export const ProductGallery = ({
  products,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onBarcodeProduct,
  stockFilter = 'all',
  categories = [],
  selectedCategory = 'all',
  onCategoryChange
}: ProductGalleryProps) => {
  const allSelected = products.length > 0 && selectedProducts.length === products.length
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Categories:</h3>
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onCategoryChange?.('all')}
              className={
                selectedCategory === 'all'
                  ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-6 px-3 text-xs font-medium rounded-full whitespace-nowrap'
                  : 'hover:bg-gray-200 text-gray-700 h-6 px-3 text-xs rounded-full whitespace-nowrap'
              }
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onCategoryChange?.(category.id)}
                className={
                  selectedCategory === category.id
                    ? 'bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 h-6 px-3 text-xs font-medium rounded-full whitespace-nowrap'
                    : 'hover:bg-gray-200 text-gray-700 h-6 px-3 text-xs rounded-full whitespace-nowrap'
                }
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Header with Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={onSelectAll}
            className="bg-white border-gray-300"
          />
          <span className="text-sm text-gray-600">
            {selectedProducts.length > 0 
              ? `${selectedProducts.length} of ${products.length} selected`
              : `${products.length} products`
            }
          </span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedProducts.includes(product.id)}
            onSelect={onSelectProduct}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
            onBarcode={onBarcodeProduct}
            stockFilter={stockFilter}
          />
        ))}
      </div>
    </div>
  )
} 
import * as React from 'react'
import { Plus, X, Palette, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { ProductImageUpload } from './ProductImageUpload'

export interface ProductVariant {
  id: string
  color?: string
  size?: string
  sku: string
  price: number
  stock: number
  quantity: number
  imageUrl?: string // Add image assignment for variant
}

export interface ProductVariantsProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  baseSku: string
  basePrice: number
  baseStock: number
  galleryImages: string[] // Add gallery images prop
  className?: string
}

const ProductVariants = ({ 
  variants, 
  onVariantsChange, 
  baseSku, 
  basePrice, 
  baseStock,
  galleryImages,
  className 
}: ProductVariantsProps) => {
  const [showColorForm, setShowColorForm] = React.useState(false)
  const [showSizeForm, setShowSizeForm] = React.useState(false)
  const [newColor, setNewColor] = React.useState('')
  const [newSize, setNewSize] = React.useState('')

  const mockColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Gray', 'Navy']
  const mockSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

  const addVariant = (color?: string, size?: string) => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      color,
      size,
      sku: `${baseSku}-${variants.length + 1}`,
      price: basePrice,
      stock: baseStock,
      quantity: 1,
    }
    onVariantsChange([...variants, newVariant])
  }

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    onVariantsChange(
      variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    )
  }

  const removeVariant = (id: string) => {
    onVariantsChange(variants.filter(v => v.id !== id))
  }

  const handleVariantImageSelect = (variantId: string, imageUrl: string) => {
    onVariantsChange(
      variants.map(v => v.id === variantId ? { ...v, imageUrl } : v)
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Variants Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Product Variants</h4>
          <p className="text-xs text-gray-600 mt-1">Add different sizes and colors</p>
        </div>
        <div className="flex gap-2">
          <PremiumButton
            onClick={() => setShowColorForm(true)}
            gradient="purple"
            size="sm"
            className="rounded-full px-2 py-1 text-xs font-semibold h-8"
          >
            <Palette className="h-3 w-3 mr-1" />
            Add Color
          </PremiumButton>
          <PremiumButton
            onClick={() => setShowSizeForm(true)}
            gradient="green"
            size="sm"
            className="rounded-full px-2 py-1 text-xs font-semibold h-8"
          >
            <Ruler className="h-3 w-3 mr-1" />
            Add Size
          </PremiumButton>
        </div>
      </div>

      {/* Variants List */}
      {variants.length > 0 && (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div 
              key={variant.id}
              className="p-3 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(variant.color || variant.size) && (
                    <div className="flex items-center gap-1">
                      {variant.color && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {variant.color}
                        </span>
                      )}
                      {variant.size && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {variant.size}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <PremiumButton
                  onClick={() => removeVariant(variant.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </PremiumButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <PremiumInput
                    value={variant.sku}
                    onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                    className="text-xs h-8 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <PremiumInput
                    type="number"
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                    className="text-xs h-8 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <PremiumInput
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                    className="text-xs h-8 px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <PremiumInput
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="text-xs h-8 px-2 py-1"
                  />
                </div>
              </div>

              {/* Variant image selection from gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Assign Image
                  </label>
                  <div className="flex gap-1 overflow-x-auto">
                    {galleryImages.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => handleVariantImageSelect(variant.id, img)}
                        className={cn(
                          'w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all',
                          variant.imageUrl === img ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <img
                          src={img}
                          alt="Variant"
                          className="w-full h-full object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Color Modal */}
      {showColorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Color Variant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mockColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        addVariant(color)
                        setShowColorForm(false)
                      }}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <PremiumButton
                  variant="outline"
                  onClick={() => setShowColorForm(false)}
                  size="sm"
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Size Modal */}
      {showSizeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Size Variant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {mockSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        addVariant(undefined, size)
                        setShowSizeForm(false)
                      }}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <PremiumButton
                  variant="outline"
                  onClick={() => setShowSizeForm(false)}
                  size="sm"
                >
                  Cancel
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ProductVariants.displayName = 'ProductVariants'

export { ProductVariants } 
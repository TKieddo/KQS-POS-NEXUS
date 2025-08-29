import { useState, useEffect } from 'react'
import { Save, Package, Tag, Ruler, Image as ImageIcon, Copy, Edit3 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { useProducts } from '@/hooks/useProducts'
import { ProductFormSection } from '../components/ProductFormSection'
import { ProductImageGallery } from '../components/ProductImageGallery'
import { CategorySelector } from '../components/CategorySelector'
import { VariantManager, type ProductVariant as VariantManagerProductVariant } from '../components/VariantManager'
import type { Product as SupabaseProduct } from '@/lib/supabase'
import { uploadProductImage, createProductImage } from '@/lib/supabase'
import { 
  getVariantOptionsForCategory, 
  getSizeOptionsForCategory, 
  getColorOptionsForCategory, 
  getGenderOptionsForCategory,
  getBrandOptionsForCategory,
  addVariantOption,
  type VariantOption
} from '@/lib/variant-services'
import { VariantEditModal } from './VariantEditModal'
import { supabase } from '@/lib/supabase'
import { AIDescriptionGenerator } from '../components/AIDescriptionGenerator'
import { AITitleGenerator } from '../components/AITitleGenerator'
import type { ProductInfo } from '@/lib/ai-services'

// Image type for gallery
interface GalleryImage {
  file?: File
  url: string
  isExisting?: boolean
}

interface ProductVariant {
  id: string
  color?: string
  size?: string
  sku: string
  barcode: string
  price: number
  stock: number
  quantity: number
  imageUrl?: string
}

interface ProductData {
  name: string;
  description: string;
  category_id: string;
  cost_price: string;
  price: string;
  stock_quantity: string;
  min_stock_level: string;
  max_stock_level: string;
  unit: string;
  sku: string;
  barcode: string;
  hasVariants: boolean;
  variants: ProductVariant[];
  colorImages: { [color: string]: string };
  discount_amount: string;
  discount_type: 'percentage' | 'fixed';
  discount_description: string;
  discount_expires_at: string;
  is_discount_active: boolean;
}

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: SupabaseProduct | null
  onProductUpdated?: () => void
}

function generateBarcode(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().padStart(12, '0').slice(0, 12)
}

export const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }: EditProductModalProps) => {
  const { categories, editProduct, addCategory, fetchCategories, fetchProductWithVariants } = useProducts()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [barcodeCopied, setBarcodeCopied] = useState(false)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [mainImage, setMainImage] = useState<string | null>(null)
  const [existingVariants, setExistingVariants] = useState<any[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    category_id: '',
    cost_price: '',
    price: '',
    stock_quantity: '0',
    min_stock_level: '0',
    max_stock_level: '',
    unit: 'piece',
    sku: '',
    barcode: '',
    hasVariants: false,
    variants: [],
    colorImages: {},
    discount_amount: '',
    discount_type: 'percentage',
    discount_description: '',
    discount_expires_at: '',
    is_discount_active: false,
  })

  // Variant options state
  const [sizeOptions, setSizeOptions] = useState<VariantOption[]>([])
  const [colorOptions, setColorOptions] = useState<VariantOption[]>([])
  const [genderOptions, setGenderOptions] = useState<VariantOption[]>([])
  const [brandOptions, setBrandOptions] = useState<VariantOption[]>([])

  // Variants state for the new VariantManager
  const [variants, setVariants] = useState<VariantManagerProductVariant[]>([])
  
  // Color image mapping
  const [colorImages, setColorImages] = useState<{ [color: string]: string }>({})

  // Variant edit modal state
  const [isVariantEditModalOpen, setIsVariantEditModalOpen] = useState(false)
  const [selectedVariantToEdit, setSelectedVariantToEdit] = useState<ProductVariant | null>(null)

  // Close modal if product becomes null
  useEffect(() => {
    if (isOpen && !product) {
      onClose()
    }
  }, [isOpen, product, onClose])

  // Load existing variants
  const loadExistingVariants = async (productId: string) => {
    setIsLoadingVariants(true)
    try {
      // Load variants with their options
      const { data: variantsWithOptions } = await supabase
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
        .eq('product_id', productId)
        .eq('is_active', true)

      if (variantsWithOptions) {
        setExistingVariants(variantsWithOptions)
        
        // Convert database variants to VariantManager format
        const variantManagerVariants: VariantManagerProductVariant[] = variantsWithOptions.map((variant: any) => {
          // Extract options from product_variant_options
          const options: { [key: string]: string } = {}
          if (variant.product_variant_options) {
            variant.product_variant_options.forEach((pvo: any) => {
              if (pvo.variant_options && pvo.variant_options.variant_option_types) {
                const optionType = pvo.variant_options.variant_option_types.name
                const optionValue = pvo.variant_options.value
                options[optionType] = optionValue
              }
            })
          }

          return {
            id: variant.id,
            sku: variant.sku || '',
            barcode: variant.barcode || '',
            price: variant.price || 0,
            cost: variant.cost_price || 0,
            stock_quantity: variant.stock_quantity || 0,
            image_url: variant.image_url || '',
            is_active: variant.is_active,
            options
          }
        })

        setVariants(variantManagerVariants)
        
        // Extract color images from existing variants
        const existingColorImages: { [color: string]: string } = {}
        
        // Extract colors and their images from existing variants
        variantsWithOptions.forEach((variant: any) => {
          if (variant.sku) {
            // Try to extract color from SKU (e.g., "98785643-XXL-Blue")
            const skuParts = variant.sku.split('-')
            if (skuParts.length > 2) {
              const possibleColor = skuParts[skuParts.length - 1]
              if (possibleColor && variant.image_url) {
                existingColorImages[possibleColor] = variant.image_url
              }
            }
          }
        })
        
        setColorImages(existingColorImages)
      }
    } catch (error) {
      console.error('Error loading variants:', error)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  // Load product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      // Load existing product data
      setProductData({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id || '',
        cost_price: product.cost_price?.toString() || '',
        price: product.price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '0',
        min_stock_level: product.min_stock_level?.toString() || '0',
        max_stock_level: product.max_stock_level?.toString() || '',
        unit: product.unit || 'piece',
        sku: product.sku || '',
        barcode: product.barcode || '',
        hasVariants: product.has_variants || false,
        variants: [],
        colorImages: {},
        discount_amount: product.discount_amount?.toString() || '',
        discount_type: (product.discount_type as 'percentage' | 'fixed') || 'percentage',
        discount_description: product.discount_description || '',
        discount_expires_at: product.discount_expires_at || '',
        is_discount_active: product.is_discount_active || false,
      })

      // Load existing images
      if (product.image_url) {
        setMainImage(product.image_url)
        setImages([{ url: product.image_url, isExisting: true }])
      }

      // Load existing variants if product has variants
      if (product.has_variants) {
        loadExistingVariants(product.id)
      }
    }
  }, [isOpen, product, fetchProductWithVariants])

  // Load variant options when category changes
  useEffect(() => {
    const loadVariantOptions = async () => {
      if (productData.category_id) {
        const [sizes, colors, genders, brands] = await Promise.all([
          getSizeOptionsForCategory(productData.category_id),
          getColorOptionsForCategory(productData.category_id),
          getGenderOptionsForCategory(productData.category_id),
          getBrandOptionsForCategory(productData.category_id)
        ])
        setSizeOptions(sizes)
        setColorOptions(colors)
        setGenderOptions(genders)
        setBrandOptions(brands)
      }
    }

    loadVariantOptions()
  }, [productData.category_id])

  // Auto-generate barcode when name or SKU changes
  useEffect(() => {
    const base = productData.sku || productData.name
    if (base && !productData.barcode) {
      setProductData(prev => ({ ...prev, barcode: generateBarcode(base) }))
    }
  }, [productData.name, productData.sku, productData.barcode])

  const handleSave = async () => {
    if (!product) {
      alert('No product selected for editing')
      return
    }

    if (!productData.name || !productData.price) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload new images to Supabase
      const urlMap: Record<string, string> = {}
      for (const img of images) {
        if (img.file && !img.url.startsWith('https://')) {
          const supaUrl = await uploadProductImage(img.file)
          if (!supaUrl) throw new Error('Image upload failed')
          urlMap[img.url] = supaUrl
        } else if (img.isExisting) {
          urlMap[img.url] = img.url
        }
      }

      // 2. Prepare product data with Supabase URLs
      const mainImageUrl = mainImage && urlMap[mainImage] ? urlMap[mainImage] : mainImage

      // Use the variants from VariantManager
      const productUpdates = {
        name: productData.name,
        description: productData.description || null,
        category_id: productData.category_id || null,
        price: parseFloat(productData.price),
        cost_price: productData.cost_price ? parseFloat(productData.cost_price) : null,
        stock_quantity: variants.length > 0 
          ? variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0)
          : parseInt(productData.stock_quantity) || 0,
        min_stock_level: parseInt(productData.min_stock_level) || 0,
        max_stock_level: productData.max_stock_level ? parseInt(productData.max_stock_level) : null,
        unit: productData.unit,
        sku: productData.sku || null,
        barcode: productData.barcode || null,
        is_active: true,
        image_url: mainImageUrl,
        has_variants: variants.length > 0,
        discount_amount: productData.discount_amount ? parseFloat(productData.discount_amount) : null,
        discount_type: productData.discount_type,
        discount_description: productData.discount_description || null,
        discount_expires_at: productData.discount_expires_at || null,
        is_discount_active: productData.is_discount_active,
      }

      // 3. Update the product
      const result = await editProduct(product.id, productUpdates)
      
      if (result) {
        // 4. Save new variants if any from VariantManager
        if (variants.length > 0) {
          for (const variant of variants) {
            // Check if variant already exists (by SKU)
            const { data: existingVariant } = await supabase
              .from('product_variants')
              .select('id')
              .eq('product_id', product.id)
              .eq('sku', variant.sku)
              .single()

            if (!existingVariant) {
              // Save new variant to product_variants table
              const { error: variantError } = await supabase
                .from('product_variants')
                .insert({
                  product_id: product.id,
                  sku: variant.sku,
                  barcode: variant.barcode,
                  price: variant.price,
                  cost_price: variant.cost,
                  stock_quantity: variant.stock_quantity,
                  image_url: variant.image_url,
                  is_active: variant.is_active,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (variantError) {
                console.error('Error saving variant:', variantError)
                throw new Error(`Failed to save variant ${variant.sku}`)
              }

              // Get the newly created variant ID
              const { data: newVariant } = await supabase
                .from('product_variants')
                .select('id')
                .eq('product_id', product.id)
                .eq('sku', variant.sku)
                .single()

              if (newVariant) {
                // Save variant options to product_variant_options table
                for (const [optionType, optionValue] of Object.entries(variant.options)) {
                  if (optionValue) {
                    // Get the variant option ID
                    const { data: optionData } = await supabase
                      .from('variant_options')
                      .select('id')
                      .eq('value', optionValue)
                      .single()

                    if (optionData) {
                      await supabase
                        .from('product_variant_options')
                        .insert({
                          variant_id: newVariant.id,
                          option_id: optionData.id,
                          created_at: new Date().toISOString()
                        })
                    }
                  }
                }
              }
            }
          }
        }

        // 5. Update variants with color images
        if (Object.keys(colorImages).length > 0) {
          for (const [color, imageUrl] of Object.entries(colorImages)) {
            // Find variants that match this color
            const variantsToUpdate = existingVariants.filter((variant: any) => {
              const skuParts = variant.sku?.split('-')
              return skuParts && skuParts[skuParts.length - 1] === color
            })
            
            // Update each variant with the color image
            for (const variant of variantsToUpdate) {
              await supabase
                .from('product_variants')
                .update({ 
                  image_url: imageUrl,
                  updated_at: new Date().toISOString()
                })
                .eq('id', variant.id)
            }
          }
        }
        
        onClose()
        onProductUpdated?.()
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Image handlers
  const handleAddImages = (files: FileList | null) => {
    if (files) {
      const newImages: GalleryImage[] = Array.from(files).map(file => ({ file, url: URL.createObjectURL(file) }))
      setImages(prev => [...prev, ...newImages])
      if (!mainImage && newImages.length > 0) setMainImage(newImages[0].url)
    }
  }

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img.url !== url))
    if (mainImage === url) {
      const remaining = images.filter(img => img.url !== url)
      setMainImage(remaining.length > 0 ? remaining[0].url : null)
    }
  }

  const handleMainImageSelect = (url: string) => {
    setMainImage(url)
  }

  // Barcode copy handler
  const handleCopyBarcode = () => {
    if (productData.barcode) {
      navigator.clipboard.writeText(productData.barcode)
      setBarcodeCopied(true)
      setTimeout(() => setBarcodeCopied(false), 1200)
    }
  }

  const handleAddCategory = async (categoryData: { name: string; description: string }) => {
    try {
      const result = await addCategory({
        name: categoryData.name,
        description: categoryData.description || null,
        color: '#3B82F6',
        is_active: true
      })
      
      if (result) {
        await fetchCategories()
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding category:', error)
      return false
    }
  }

  const handleColorImageChange = (color: string, imageUrl: string | null) => {
    setColorImages(prev => {
      if (imageUrl === null) {
        const newColorImages = { ...prev }
        delete newColorImages[color]
        return newColorImages
      } else {
        return { ...prev, [color]: imageUrl }
      }
    })
  }

  const buildProductInfoForAI = (): ProductInfo => {
    // Get category name
    const categoryName = categories.find(cat => cat.id === productData.category_id)?.name || ''
    
    // Convert variants to AI format
    const aiVariants = variants.map(variant => ({
      sku: variant.sku,
      color: variant.options.color,
      size: variant.options.size,
      gender: variant.options.gender,
      brand: variant.options.brand,
      price: variant.price,
      stock_quantity: variant.stock_quantity || 0
    }))

    return {
      name: productData.name,
      category: categoryName,
      price: parseFloat(productData.price) || undefined,
      cost_price: parseFloat(productData.cost_price) || undefined,
      variants: aiVariants.length > 0 ? aiVariants : undefined,
      images: images.map(img => img.url),
      mainImage: mainImage || undefined,
      unit: productData.unit,
      stock_quantity: variants.length === 0 ? parseInt(productData.stock_quantity) || undefined : undefined,
      min_stock_level: parseInt(productData.min_stock_level) || undefined,
      max_stock_level: parseInt(productData.max_stock_level) || undefined,
      discount_amount: productData.discount_amount ? parseFloat(productData.discount_amount) : undefined,
      discount_type: productData.discount_type,
      discount_description: productData.discount_description || undefined
    }
  }

  const handleAddNewOption = async (value: string, type: string) => {
    try {
      const result = await addVariantOption(type, value, value)
      if (result && productData.category_id) {
        const [sizes, colors, genders, brands] = await Promise.all([
          getSizeOptionsForCategory(productData.category_id),
          getColorOptionsForCategory(productData.category_id),
          getGenderOptionsForCategory(productData.category_id),
          getBrandOptionsForCategory(productData.category_id)
        ])
        setSizeOptions(sizes)
        setColorOptions(colors)
        setGenderOptions(genders)
        setBrandOptions(brands)
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding new option:', error)
      return false
    }
  }

  const calculateDiscountedPrice = (originalPrice: number, discountAmount: number, discountType: 'percentage' | 'fixed') => {
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountAmount / 100)
    } else {
      return originalPrice - discountAmount
    }
  }

  // Handle variant deletion
  const handleDeleteVariant = async (variantId: string, variantSku: string) => {
    if (confirm(`Are you sure you want to delete variant "${variantSku}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('product_variants')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', variantId)

        if (error) throw error

        // Reload variants to reflect changes
        if (product) {
          loadExistingVariants(product.id)
        }
      } catch (error) {
        console.error('Error deleting variant:', error)
        alert('Failed to delete variant. Please try again.')
      }
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Product" 
      maxWidth="7xl" 
      className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      headerButtons={
        <div className="flex gap-2">
          <PremiumButton variant="outline" onClick={onClose} size="sm" className="rounded-full px-4 py-2 text-sm font-semibold">
            Cancel
          </PremiumButton>
          <PremiumButton 
            onClick={handleSave} 
            gradient="green" 
            size="sm" 
            icon={Save} 
            className="rounded-full px-4 py-2 text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </PremiumButton>
        </div>
      }
    >
      <div className="px-4 py-6 space-y-4 max-h-[calc(95vh-140px)] overflow-y-auto bg-[#f8fafc]">
        {!product ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* General Information Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-blue-600" />
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                  <PremiumInput
                    value={productData.name}
                    onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Product Name"
                    className="w-full h-9 text-sm"
                  />
                  
                  {/* AI Title Generator */}
                  <div className="mt-3">
                    <AITitleGenerator
                      productInfo={buildProductInfoForAI()}
                      currentTitle={productData.name}
                      onTitleGenerated={(title) => setProductData(prev => ({ ...prev, name: title }))}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product Description"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 text-sm h-20"
                    rows={2}
                  />
                  
                  {/* AI Description Generator */}
                  <div className="mt-3">
                    <AIDescriptionGenerator
                      productInfo={buildProductInfoForAI()}
                      currentDescription={productData.description}
                      onDescriptionGenerated={(description) => setProductData(prev => ({ ...prev, description }))}
                    />
                  </div>
                </div>

                {/* Variant Manager */}
                <div className="md:col-span-2">
                  <VariantManager
                    variants={variants}
                    onVariantsChange={setVariants}
                    baseSku={productData.sku}
                    basePrice={parseFloat(productData.price) || 0}
                    baseCost={parseFloat(productData.cost_price) || 0}
                    availableOptions={{
                      size: sizeOptions,
                      color: colorOptions,
                      gender: genderOptions,
                      brand: brandOptions
                    }}
                    onAddNewOption={handleAddNewOption}
                  />
                </div>
              </div>
            </div>

            {/* Stock Quantity Field (for products without variants) */}
            {variants.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Stock Quantity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={productData.stock_quantity}
                      onChange={(e) => setProductData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                      placeholder="0"
                      className="w-full text-xs px-2 py-1 h-8 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                    <select
                      value={productData.unit}
                      onChange={(e) => setProductData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full h-8 px-2 py-1 border border-gray-200 rounded text-xs bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram</option>
                      <option value="g">Gram</option>
                      <option value="l">Liter</option>
                      <option value="ml">Milliliter</option>
                      <option value="m">Meter</option>
                      <option value="cm">Centimeter</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Discount & Pricing Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3">Discount & Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Original Price</label>
                  <PremiumInput
                    value={productData.price}
                    onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
                  <PremiumInput
                    value={productData.cost_price}
                    onChange={(e) => setProductData(prev => ({ ...prev, cost_price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full h-9 text-sm"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="enableDiscount"
                    checked={productData.is_discount_active}
                    onChange={(e) => setProductData(prev => ({ ...prev, is_discount_active: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="enableDiscount" className="text-sm font-medium text-gray-700">
                    Enable Discount
                  </label>
                </div>

                {productData.is_discount_active && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Discount Amount</label>
                        <PremiumInput
                          value={productData.discount_amount}
                          onChange={(e) => setProductData(prev => ({ ...prev, discount_amount: e.target.value }))}
                          placeholder={productData.discount_type === 'percentage' ? '10' : '5.00'}
                          className="w-full h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                        <select
                          value={productData.discount_type}
                          onChange={(e) => setProductData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                          className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Discount Description</label>
                      <PremiumInput
                        value={productData.discount_description}
                        onChange={(e) => setProductData(prev => ({ ...prev, discount_description: e.target.value }))}
                        placeholder="e.g. New Year Sale, Clearance Discount"
                        className="w-full h-9 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Expires At (Optional)</label>
                      <input
                        type="datetime-local"
                        value={productData.discount_expires_at}
                        onChange={(e) => setProductData(prev => ({ ...prev, discount_expires_at: e.target.value }))}
                        className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Discount Preview */}
                    {productData.price && productData.discount_amount && (
                      <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-xs text-blue-800">
                          <div className="flex justify-between">
                            <span>Original Price:</span>
                            <span>${parseFloat(productData.price).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>
                              {productData.discount_type === 'percentage' 
                                ? `${productData.discount_amount}%` 
                                : `$${parseFloat(productData.discount_amount).toFixed(2)}`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Final Price:</span>
                            <span>
                              ${calculateDiscountedPrice(
                                parseFloat(productData.price),
                                parseFloat(productData.discount_amount),
                                productData.discount_type
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SKU & Barcode Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3">SKU & Barcode</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                  <PremiumInput
                    value={productData.sku}
                    onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Enter SKU"
                    className="w-full h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">Barcode
                    <button type="button" onClick={handleCopyBarcode} className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none" title="Copy Barcode">
                      <Copy className="h-3 w-3" />
                    </button>
                    {barcodeCopied && <span className="text-xs text-green-600 ml-2">Copied!</span>}
                  </label>
                  <PremiumInput
                    value={productData.barcode}
                    readOnly
                    className="w-full bg-gray-100 cursor-not-allowed h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Existing Variants Display */}
            {product?.has_variants && (
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  Existing Variants
                </h3>
                
                {isLoadingVariants ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading variants...</span>
                  </div>
                ) : existingVariants.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {existingVariants.map((variant) => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">SKU: {variant.sku}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              variant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span className="font-medium">${variant.price?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stock:</span>
                              <span className="font-medium">{variant.stock_quantity || 0}</span>
                            </div>
                            {variant.barcode && (
                              <div className="flex justify-between">
                                <span>Barcode:</span>
                                <span className="font-mono text-xs">{variant.barcode}</span>
                              </div>
                            )}
                            {variant.image_url && (
                              <div className="flex justify-between items-center">
                                <span>Image:</span>
                                <img 
                                  src={variant.image_url} 
                                  alt="Variant" 
                                  className="w-6 h-6 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedVariantToEdit(variant)
                                setIsVariantEditModalOpen(true)
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVariant(variant.id, variant.sku)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Use the Variant Manager above to add new variants with specific options.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No variants found for this product.</p>
                    <p className="text-xs mt-1">Use the Variant Manager above to add new variants.</p>
                  </div>
                )}
              </div>
            )}
            {/* Variant Statistics */}
            {product?.has_variants && existingVariants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Variant Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{existingVariants.length}</div>
                    <div className="text-xs text-gray-600">Total Variants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {existingVariants.filter(v => v.is_active).length}
                    </div>
                    <div className="text-xs text-gray-600">Active Variants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {existingVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600">Total Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${existingVariants.reduce((sum, v) => sum + (v.price || 0), 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Total Value</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Images & Category */}
          <div className="flex flex-col gap-4">
            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3">Product Images</h3>
              <ProductImageGallery
                images={images.map(img => img.url)}
                mainImage={mainImage}
                onMainImageSelect={handleMainImageSelect}
                onRemoveImage={handleRemoveImage}
                onAddImages={handleAddImages}
              />
            </div>
            
            {/* Category Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3">Category</h3>
              <CategorySelector
                categories={categories.map(cat => ({ ...cat, description: cat.description ?? '' }))}
                selectedCategoryId={productData.category_id}
                onCategoryChange={(categoryId) => setProductData(prev => ({ ...prev, category_id: categoryId }))}
                onAddCategory={handleAddCategory}
              />
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Variant Edit Modal */}
      {selectedVariantToEdit && (
        <VariantEditModal
          isOpen={isVariantEditModalOpen}
          onClose={() => setIsVariantEditModalOpen(false)}
          variant={selectedVariantToEdit}
          productName={productData.name}
          onVariantUpdated={() => {
            // Reload variants to reflect changes
            if (product) {
              loadExistingVariants(product.id)
            }
            setIsVariantEditModalOpen(false)
          }}
        />
      )}
    </Modal>
  )
} 
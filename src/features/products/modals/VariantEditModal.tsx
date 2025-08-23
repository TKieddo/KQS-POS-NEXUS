import { useState, useEffect } from 'react'
import { Save, X, Package, Tag, Image as ImageIcon, Copy, Edit3 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { ProductImageGallery } from '../components/ProductImageGallery'
import { supabase } from '@/lib/supabase'

interface VariantData {
  id: string
  sku: string
  barcode: string
  price: number
  cost_price: number
  stock_quantity: number
  min_stock_level: number
  max_stock_level: number
  image_url: string | null
  is_active: boolean
  discount_amount: number | null
  discount_type: 'percentage' | 'fixed' | null
  discount_description: string | null
  discount_expires_at: string | null
  is_discount_active: boolean
}

interface VariantEditModalProps {
  isOpen: boolean
  onClose: () => void
  variant: any
  productName: string
  onVariantUpdated?: () => void
}

function generateBarcode(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().padStart(12, '0').slice(0, 12)
}

export const VariantEditModal = ({ isOpen, onClose, variant, productName, onVariantUpdated }: VariantEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [barcodeCopied, setBarcodeCopied] = useState(false)
  const [images, setImages] = useState<{ file?: File; url: string; isExisting?: boolean }[]>([])
  const [mainImage, setMainImage] = useState<string | null>(null)
  
  const [variantData, setVariantData] = useState<VariantData>({
    id: '',
    sku: '',
    barcode: '',
    price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    image_url: null,
    is_active: true,
    discount_amount: null,
    discount_type: null,
    discount_description: null,
    discount_expires_at: null,
    is_discount_active: false,
  })

  // Load variant data when modal opens
  useEffect(() => {
    if (isOpen && variant) {
      console.log('VariantEditModal: Loading variant data:', variant)
      setVariantData({
        id: variant.id || '',
        sku: variant.sku || '',
        barcode: variant.barcode || '',
        price: variant.price || 0,
        cost_price: variant.cost_price || 0,
        stock_quantity: variant.stock_quantity || 0,
        min_stock_level: variant.min_stock_level || 0,
        max_stock_level: variant.max_stock_level || 0,
        image_url: variant.image_url || null,
        is_active: variant.is_active !== false,
        discount_amount: variant.discount_amount || null,
        discount_type: variant.discount_type || null,
        discount_description: variant.discount_description || null,
        discount_expires_at: variant.discount_expires_at || null,
        is_discount_active: variant.is_discount_active || false,
      })

      // Load existing images
      if (variant.image_url) {
        setMainImage(variant.image_url)
        setImages([{ url: variant.image_url, isExisting: true }])
      }
    }
  }, [isOpen, variant])

  // Auto-generate barcode when SKU changes
  useEffect(() => {
    if (variantData.sku && !variantData.barcode) {
      setVariantData(prev => ({ ...prev, barcode: generateBarcode(variantData.sku) }))
    }
  }, [variantData.sku, variantData.barcode])

  const handleSave = async () => {
    if (!variantData.sku || variantData.price <= 0) {
      alert('Please fill in all required fields (SKU and Price)')
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

      // 2. Prepare variant data with Supabase URLs
      const mainImageUrl = mainImage && urlMap[mainImage] ? urlMap[mainImage] : mainImage

      const variantUpdates = {
        sku: variantData.sku,
        barcode: variantData.barcode || null,
        price: variantData.price,
        cost_price: variantData.cost_price || null,
        stock_quantity: variantData.stock_quantity,
        min_stock_level: variantData.min_stock_level,
        max_stock_level: variantData.max_stock_level || null,
        image_url: mainImageUrl,
        is_active: variantData.is_active,
        discount_amount: variantData.discount_amount || null,
        discount_type: variantData.discount_type || null,
        discount_description: variantData.discount_description || null,
        discount_expires_at: variantData.discount_expires_at || null,
        is_discount_active: variantData.is_discount_active,
        updated_at: new Date().toISOString()
      }

      // 3. Update the variant
      console.log('Updating variant with ID:', variantData.id)
      console.log('Variant updates:', variantUpdates)
      
      const { data, error } = await supabase
        .from('product_variants')
        .update(variantUpdates)
        .eq('id', variantData.id)
        .select()
        .single()

      console.log('Supabase update result:', { data, error })

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      if (data) {
        console.log('Variant updated successfully:', data)
        onClose()
        onVariantUpdated?.()
      }
    } catch (error) {
      console.error('Error updating variant:', error)
      alert('Failed to update variant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete variant "${variantData.sku}"? This action cannot be undone.`)) {
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', variantData.id)

      if (error) throw error

      onClose()
      onVariantUpdated?.()
    } catch (error) {
      console.error('Error deleting variant:', error)
      alert('Failed to delete variant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Image handlers
  const handleAddImages = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).map(file => ({ file, url: URL.createObjectURL(file) }))
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
    if (variantData.barcode) {
      navigator.clipboard.writeText(variantData.barcode)
      setBarcodeCopied(true)
      setTimeout(() => setBarcodeCopied(false), 1200)
    }
  }

  const calculateDiscountedPrice = (originalPrice: number, discountAmount: number, discountType: 'percentage' | 'fixed') => {
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountAmount / 100)
    } else {
      return originalPrice - discountAmount
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit Variant: ${variantData.sku}`}
      maxWidth="4xl" 
      className="bg-white/95 rounded-3xl shadow-2xl border border-gray-100/60 backdrop-blur-xl max-h-[95vh] overflow-hidden"
      headerButtons={
        <div className="flex gap-2">
          <PremiumButton variant="outline" onClick={onClose} size="sm" className="rounded-full px-4 py-2 text-sm font-semibold">
            Cancel
          </PremiumButton>
          <PremiumButton 
            onClick={handleDelete} 
            gradient="red" 
            size="sm" 
            className="rounded-full px-4 py-2 text-sm font-semibold"
            disabled={isSubmitting}
          >
            Delete
          </PremiumButton>
          <PremiumButton 
            onClick={handleSave} 
            gradient="green" 
            size="sm" 
            icon={Save} 
            className="rounded-full px-4 py-2 text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </PremiumButton>
        </div>
      }
    >
      <div className="px-4 py-6 space-y-4 max-h-[calc(95vh-140px)] overflow-y-auto bg-[#f8fafc]">
        {!variant ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading variant data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Variant Details */}
            <div className="flex flex-col gap-4">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                    <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border">
                      {productName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                    <PremiumInput
                      value={variantData.sku}
                      onChange={(e) => setVariantData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Variant SKU"
                      className="w-full h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">Barcode
                      <button type="button" onClick={handleCopyBarcode} className="text-blue-600 hover:text-blue-800 focus:outline-none" title="Copy Barcode">
                        <Copy className="h-3 w-3" />
                      </button>
                      {barcodeCopied && <span className="text-xs text-green-600">Copied!</span>}
                    </label>
                    <PremiumInput
                      value={variantData.barcode}
                      onChange={(e) => setVariantData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Barcode"
                      className="w-full h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={variantData.is_active}
                      onChange={(e) => setVariantData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active Variant
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                    <PremiumInput
                      value={variantData.price.toString()}
                      onChange={(e) => setVariantData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="w-full h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
                    <PremiumInput
                      value={variantData.cost_price.toString()}
                      onChange={(e) => setVariantData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="w-full h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Stock Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={variantData.stock_quantity}
                      onChange={(e) => setVariantData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      value={variantData.min_stock_level}
                      onChange={(e) => setVariantData(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) || 0 }))}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      value={variantData.max_stock_level || ''}
                      onChange={(e) => setVariantData(prev => ({ ...prev, max_stock_level: parseInt(e.target.value) || null }))}
                      className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Variant Discount */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Variant Discount</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enableVariantDiscount"
                      checked={variantData.is_discount_active}
                      onChange={(e) => setVariantData(prev => ({ ...prev, is_discount_active: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="enableVariantDiscount" className="text-sm font-medium text-gray-700">
                      Enable Variant-Specific Discount
                    </label>
                  </div>

                  {variantData.is_discount_active && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Discount Amount</label>
                          <PremiumInput
                            value={variantData.discount_amount?.toString() || ''}
                            onChange={(e) => setVariantData(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || null }))}
                            placeholder={variantData.discount_type === 'percentage' ? '10' : '5.00'}
                            className="w-full h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                          <select
                            value={variantData.discount_type || 'percentage'}
                            onChange={(e) => setVariantData(prev => ({ ...prev, discount_type: e.target.value as 'percentage' | 'fixed' }))}
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
                          value={variantData.discount_description || ''}
                          onChange={(e) => setVariantData(prev => ({ ...prev, discount_description: e.target.value }))}
                          placeholder="e.g. Clearance, Special Offer"
                          className="w-full h-9 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Expires At (Optional)</label>
                        <input
                          type="datetime-local"
                          value={variantData.discount_expires_at || ''}
                          onChange={(e) => setVariantData(prev => ({ ...prev, discount_expires_at: e.target.value }))}
                          className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Discount Preview */}
                      {variantData.price && variantData.discount_amount && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="text-xs text-blue-800">
                            <div className="flex justify-between">
                              <span>Original Price:</span>
                              <span>${variantData.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span>
                                {variantData.discount_type === 'percentage' 
                                  ? `${variantData.discount_amount}%` 
                                  : `$${variantData.discount_amount.toFixed(2)}`
                                }
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Final Price:</span>
                              <span>
                                ${calculateDiscountedPrice(
                                  variantData.price,
                                  variantData.discount_amount,
                                  variantData.discount_type || 'percentage'
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
            </div>

            {/* Right Column: Images */}
            <div className="flex flex-col gap-4">
              {/* Variant Image */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Variant Image</h3>
                <ProductImageGallery
                  images={images.map(img => img.url)}
                  mainImage={mainImage}
                  onMainImageSelect={handleMainImageSelect}
                  onRemoveImage={handleRemoveImage}
                  onAddImages={handleAddImages}
                />
              </div>

              {/* Stock Status */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-base font-semibold mb-3">Stock Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Current Stock</span>
                    <span className={`text-lg font-bold ${
                      variantData.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {variantData.stock_quantity}
                    </span>
                  </div>
                  
                  {variantData.min_stock_level > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Min Stock Level</span>
                      <span className="text-lg font-bold text-orange-600">
                        {variantData.min_stock_level}
                      </span>
                    </div>
                  )}
                  
                  {variantData.max_stock_level && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Max Stock Level</span>
                      <span className="text-lg font-bold text-blue-600">
                        {variantData.max_stock_level}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> This variant's stock is managed separately from the main product.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

// Helper function for image upload
async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
} 
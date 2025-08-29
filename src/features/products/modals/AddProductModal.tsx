import { useState, useEffect } from 'react'
import { Save, Package, Tag, Ruler, Image as ImageIcon, Copy } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { Modal } from '@/components/ui/modal'
import { useProducts } from '@/hooks/useProducts'
import { ProductFormSection } from '../components/ProductFormSection'
import { ProductImageGallery } from '../components/ProductImageGallery'
import { ProductVariants } from '../components/ProductVariants'
import { CategorySelector } from '../components/CategorySelector'
import { VariantManager, type ProductVariant as VariantManagerProductVariant } from '../components/VariantManager'
import { AIVariantDetector } from '../components/AIVariantDetector'
import { ColorImageSelector } from '../components/ColorImageSelector'
import type { Product as SupabaseProduct } from '@/lib/supabase'
import { uploadProductImage, createProductImage, supabase, ensureStorageBuckets } from '@/lib/supabase'
import { AIDescriptionGenerator } from '../components/AIDescriptionGenerator'
import { AITitleGenerator } from '../components/AITitleGenerator'
import type { ProductInfo } from '@/lib/ai-services'
import { toast } from 'sonner'
import { 
  getVariantOptionsForCategory, 
  getSizeOptionsForCategory, 
  getColorOptionsForCategory, 
  getGenderOptionsForCategory,
  getBrandOptionsForCategory,
  addVariantOption,
  type VariantOption
} from '@/lib/variant-services'

// Image type for gallery
interface GalleryImage {
  file: File
  url: string
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

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded?: () => void
}

function generateBarcode(input: string, suffix?: string): string {
  let hash = 0
  const inputWithSuffix = suffix ? `${input}-${suffix}` : input
  
  for (let i = 0; i < inputWithSuffix.length; i++) {
    hash = ((hash << 5) - hash) + inputWithSuffix.charCodeAt(i)
    hash |= 0
  }
  
  // Add timestamp to make it more unique
  const timestamp = Date.now().toString().slice(-6)
  const baseBarcode = Math.abs(hash).toString().padStart(8, '0')
  
  return `${baseBarcode}${timestamp}`.slice(0, 12)
}

export const AddProductModal = ({ isOpen, onClose, onProductAdded }: AddProductModalProps) => {
  const { categories, addProduct, addCategory, fetchCategories } = useProducts()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [barcodeCopied, setBarcodeCopied] = useState(false)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [mainImage, setMainImage] = useState<string | null>(null)
  
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

  // Load variant options when category changes
  useEffect(() => {
    const loadVariantOptions = async () => {
      if (productData.category_id) {
        console.log('Loading variant options for category:', productData.category_id)
        try {
        const [sizes, colors, genders, brands] = await Promise.all([
          getSizeOptionsForCategory(productData.category_id),
          getColorOptionsForCategory(productData.category_id),
          getGenderOptionsForCategory(productData.category_id),
          getBrandOptionsForCategory(productData.category_id)
        ])
          console.log('Loaded variant options:', { sizes, colors, genders, brands })
        setSizeOptions(sizes)
        setColorOptions(colors)
        setGenderOptions(genders)
        setBrandOptions(brands)
        } catch (error) {
          console.error('Error loading variant options:', error)
          setSizeOptions([])
          setColorOptions([])
          setGenderOptions([])
          setBrandOptions([])
        }
      } else {
        console.log('No category selected, clearing variant options')
        setSizeOptions([])
        setColorOptions([])
        setGenderOptions([])
        setBrandOptions([])
      }
    }

    loadVariantOptions()
  }, [productData.category_id])

  // Auto-generate barcode when name or SKU changes (only for products without variants)
  useEffect(() => {
    const base = productData.sku || productData.name
    if (base && !productData.barcode && variants.length === 0) {
      setProductData(prev => ({ ...prev, barcode: generateBarcode(base) }))
    }
  }, [productData.name, productData.sku, productData.barcode, variants.length])

  const handleSave = async () => {
    console.log('🚀 [DEBUG] AddProductModal: handleSave started')
    console.log('📋 [DEBUG] Form validation check:', { 
      name: productData.name, 
      price: productData.price,
      hasName: !!productData.name,
      hasPrice: !!productData.price
    })

    if (!productData.name || !productData.price) {
      console.log('❌ [DEBUG] Validation failed - missing required fields')
      toast.error('Please fill in all required fields (Product Name and Price)')
      return
    }

    console.log('✅ [DEBUG] Validation passed, starting save process')
    setIsSubmitting(true)

    try {
      // 0. Ensure storage buckets exist before uploading images
      console.log('🗄️ [DEBUG] Ensuring storage buckets exist...')
      try {
        const { data: bucket, error } = await supabase.storage.getBucket('product-images')
        if (error && error.message.includes('not found')) {
          console.log('🗄️ [DEBUG] Creating product-images bucket...')
          const { error: createError } = await supabase.storage.createBucket('product-images', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            fileSizeLimit: 10485760 // 10MB
          })
          if (createError) {
            console.error('❌ [DEBUG] Failed to create bucket:', createError)
          } else {
            console.log('✅ [DEBUG] Successfully created product-images bucket')
          }
        } else if (error) {
          console.error('❌ [DEBUG] Error checking bucket:', error)
        } else {
          console.log('✅ [DEBUG] product-images bucket exists')
        }
      } catch (bucketError) {
        console.error('❌ [DEBUG] Error ensuring storage buckets:', bucketError)
      }
      // 1. Upload images to Supabase
      console.log('🖼️ [DEBUG] Starting image upload process')
      console.log('📸 [DEBUG] Images to upload:', images.length)
      
      const urlMap: Record<string, string> = {}
      if (images.length > 0) {
        console.log('📤 [DEBUG] Uploading images...')
        toast.loading('Uploading images...')
        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          console.log(`📤 [DEBUG] Uploading image ${i + 1}/${images.length}:`, {
            fileName: img.file.name,
            fileSize: img.file.size,
            fileType: img.file.type
          })
          
          const supaUrl = await uploadProductImage(img.file)
          console.log(`📤 [DEBUG] Image ${i + 1} upload result:`, supaUrl)
          
          if (!supaUrl) {
            console.error('❌ [DEBUG] Image upload failed for image:', img.file.name)
            toast.dismiss()
            toast.error('Failed to upload image. Please try again.')
            return
          }
          urlMap[img.url] = supaUrl
        }
        console.log('✅ [DEBUG] All images uploaded successfully')
        console.log('🖼️ [DEBUG] URL mapping:', urlMap)
        toast.dismiss()
      } else {
        console.log('ℹ️ [DEBUG] No images to upload')
      }

      // 2. Prepare product data with Supabase URLs
      console.log('🔧 [DEBUG] Preparing product data')
      const mainImageUrl = mainImage && urlMap[mainImage] ? urlMap[mainImage] : mainImage
      const galleryUrls = images.map(img => urlMap[img.url]).filter(Boolean)
      
      console.log('🖼️ [DEBUG] Image URLs:', {
        mainImage,
        mainImageUrl,
        galleryUrls,
        urlMap
      })

      // Use the variants from VariantManager
      const productToSave = {
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
        // Don't set barcode for main product if it has variants - only variants should have barcodes
        barcode: variants.length > 0 ? null : (productData.barcode || null),
        is_active: true,
        image_url: mainImageUrl,
        has_variants: variants.length > 0,
        discount_amount: productData.discount_amount ? parseFloat(productData.discount_amount) : null,
        discount_type: productData.discount_type,
        discount_description: productData.discount_description || null,
        discount_expires_at: productData.discount_expires_at || null,
        is_discount_active: productData.is_discount_active,
      }

      console.log('📦 [DEBUG] Product data to save:', JSON.stringify(productToSave, null, 2))
      console.log('🔢 [DEBUG] Variants count:', variants.length)
      console.log('🏷️ [DEBUG] Barcode logic:', {
        hasVariants: variants.length > 0,
        originalBarcode: productData.barcode,
        finalBarcode: productToSave.barcode,
        reason: variants.length > 0 ? 'No barcode for main product with variants' : 'Barcode allowed for single product'
      })
      if (variants.length > 0) {
        console.log('🔢 [DEBUG] Variants data:', JSON.stringify(variants, null, 2))
      }

      // 3. Save the product
      console.log('💾 [DEBUG] Calling addProduct function...')
      toast.loading('Saving product...')
      const result = await addProduct(productToSave)
      
      console.log('💾 [DEBUG] addProduct result:', result)
      
      if (!result) {
        console.error('❌ [DEBUG] addProduct returned null - product save failed')
        toast.dismiss()
        toast.error('Failed to save product. Please check your data and try again.')
        return
      }

      console.log('✅ [DEBUG] Product saved successfully with ID:', result.id)

      // 4. Save product images
      if (galleryUrls.length > 0) {
        console.log('🖼️ [DEBUG] Saving product images to database...')
        toast.loading('Saving product images...')
        for (let i = 0; i < galleryUrls.length; i++) {
          const imageUrl = galleryUrls[i]
          const isMain = imageUrl === mainImageUrl
          
          console.log(`🖼️ [DEBUG] Saving image ${i + 1}/${galleryUrls.length}:`, {
            imageUrl,
            isMain,
            productId: result.id
          })
          
          const imageSaveResult = await createProductImage({
            product_id: result.id,
            variant_id: null,
            image_url: imageUrl,
            image_name: `Product Image ${i + 1}`,
            image_size: null,
            is_main_image: isMain,
            sort_order: i
          })
          
          console.log(`🖼️ [DEBUG] Image ${i + 1} save result:`, imageSaveResult)
        }
        console.log('✅ [DEBUG] All product images saved successfully')
      } else {
        console.log('ℹ️ [DEBUG] No product images to save')
      }
      
      // 5. Save variants if any
      if (variants.length > 0) {
        console.log('🔢 [DEBUG] Saving product variants...')
        toast.loading('Saving product variants...')
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i]
          console.log(`🔢 [DEBUG] Saving variant ${i + 1}/${variants.length}:`, JSON.stringify(variant, null, 2))
          
          // Save variant to product_variants table
          const variantInsertData = {
            product_id: result.id,
            sku: variant.sku,
            barcode: variant.barcode,
            price: variant.price,
            cost_price: variant.cost,
            stock_quantity: variant.stock_quantity,
            image_url: variant.image_url,
            is_active: variant.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          console.log(`🔢 [DEBUG] Variant ${i + 1} insert data:`, JSON.stringify(variantInsertData, null, 2))
          
          const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .insert(variantInsertData)
            .select()
            .single()

          console.log(`🔢 [DEBUG] Variant ${i + 1} insert result:`, { data: variantData, error: variantError })

          if (variantError) {
            console.error(`❌ [DEBUG] Error saving variant ${variant.sku}:`, variantError)
            toast.dismiss()
            toast.error(`Failed to save variant ${variant.sku}: ${variantError.message}`)
            return
          }

          console.log(`✅ [DEBUG] Variant ${variant.sku} saved successfully with ID:`, variantData?.id)

          // Save variant options to product_variant_options table
          console.log(`🔢 [DEBUG] Saving options for variant ${variant.sku}...`)
          const variantId = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', result.id)
            .eq('sku', variant.sku)
            .single()

          console.log(`🔢 [DEBUG] Variant ID lookup result:`, variantId)

          if (variantId.data) {
            console.log(`🔢 [DEBUG] Saving options for variant ID:`, variantId.data.id)
            // Save each option (size, color, gender, brand)
            for (const [optionType, optionValue] of Object.entries(variant.options)) {
              if (optionValue) {
                console.log(`🔢 [DEBUG] Processing option:`, { optionType, optionValue })
                
                // Get the variant option ID
                const { data: optionData, error: optionError } = await supabase
                  .from('variant_options')
                  .select('id')
                  .eq('value', optionValue)
                  .single()

                console.log(`🔢 [DEBUG] Option lookup result:`, { optionData, optionError })

                if (optionData) {
                  const optionInsertData = {
                    variant_id: variantId.data.id,
                    option_id: optionData.id,
                    created_at: new Date().toISOString()
                  }
                  
                  console.log(`🔢 [DEBUG] Inserting option:`, optionInsertData)
                  
                  const { data: insertedOption, error: insertOptionError } = await supabase
                    .from('product_variant_options')
                    .insert(optionInsertData)
                    .select()
                    .single()

                  console.log(`🔢 [DEBUG] Option insert result:`, { data: insertedOption, error: insertOptionError })
                  
                  if (insertOptionError) {
                    console.error(`❌ [DEBUG] Error saving option ${optionType}:`, insertOptionError)
                  } else {
                    console.log(`✅ [DEBUG] Option ${optionType} saved successfully`)
                  }
                } else {
                  console.warn(`⚠️ [DEBUG] Option not found in variant_options table:`, optionValue)
                }
              }
            }
          } else {
            console.error(`❌ [DEBUG] Could not find variant ID for SKU:`, variant.sku)
          }
        }
        console.log('✅ [DEBUG] All variants saved successfully')
      } else {
        console.log('ℹ️ [DEBUG] No variants to save')
      }
      
      console.log('🎉 [DEBUG] Product save process completed successfully!')
      toast.dismiss()
      toast.success(`Product "${productData.name}" saved successfully!`)
      
      onClose()
      onProductAdded?.()
      
      // Reset form
      console.log('🔄 [DEBUG] Resetting form...')
      setProductData({
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
      setImages([])
      setMainImage(null)
      setVariants([])
      console.log('✅ [DEBUG] Form reset completed')
    } catch (error) {
      console.error('❌ [DEBUG] Error in handleSave:', error)
      console.error('❌ [DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      toast.dismiss()
      toast.error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      console.log('🏁 [DEBUG] handleSave completed, setting isSubmitting to false')
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

  // Handle color image selection
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

  // Handle adding new options
  const handleAddNewOption = async (value: string, type: string) => {
    try {
      console.log('Adding new variant option:', { type, value })
      const result = await addVariantOption(type, value, value)
      if (result) {
        console.log('Variant option added successfully:', result)
        // Reload variant options for the current category
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
        return true
      } else {
        console.error('Failed to add variant option - no result returned')
        return false
      }
    } catch (error) {
      console.error('Error adding new option:', error)
      return false
    }
  }

  const handleAIVariantsGenerated = (aiVariants: VariantManagerProductVariant[]) => {
    // Merge AI-generated variants with existing variants, avoiding duplicates
    const existingSkus = new Set(variants.map(v => v.sku))
    const newVariants = aiVariants.filter(v => !existingSkus.has(v.sku))
    
    if (newVariants.length > 0) {
      setVariants(prev => [...prev, ...newVariants])
    }
  }

  const calculateDiscountedPrice = (originalPrice: number, discountAmount: number, discountType: 'percentage' | 'fixed') => {
    if (discountType === 'percentage') {
      return originalPrice * (1 - discountAmount / 100)
    } else {
      return originalPrice - discountAmount
    }
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Product" 
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
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </PremiumButton>
        </div>
      }
    >
      <div className="px-4 py-6 space-y-4 max-h-[calc(95vh-140px)] overflow-y-auto bg-[#f8fafc]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* General Information Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
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

                {/* AI Variant Detection */}
                <div className="md:col-span-2">
                  <AIVariantDetector
                    images={images.map(img => img.url)}
                    productName={productData.name}
                    basePrice={parseFloat(productData.price) || 0}
                    baseSku={productData.sku}
                    onVariantsGenerated={handleAIVariantsGenerated}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock Section */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                Pricing & Stock
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Original Price *</label>
                  <PremiumInput
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full h-9 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
                  <PremiumInput
                      type="number"
                    value={productData.cost_price}
                    onChange={(e) => setProductData(prev => ({ ...prev, cost_price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full h-9 text-sm"
                      min="0"
                    step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                    <select
                    value={productData.unit}
                    onChange={(e) => setProductData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                    <option value="meter">Meter</option>
                    <option value="pack">Pack</option>
                      <option value="box">Box</option>
                    <option value="pair">Pair</option>
                    <option value="set">Set</option>
                    </select>
                </div>
              </div>

              {variants.length === 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Stock Quantity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                      <PremiumInput
                        type="number"
                        value={productData.stock_quantity}
                        onChange={(e) => setProductData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                        placeholder="0"
                        className="w-full h-9 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min Stock Level</label>
                      <PremiumInput
                        type="number"
                        value={productData.min_stock_level}
                        onChange={(e) => setProductData(prev => ({ ...prev, min_stock_level: e.target.value }))}
                        placeholder="0"
                        className="w-full h-9 text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max Stock Level</label>
                      <PremiumInput
                        type="number"
                        value={productData.max_stock_level}
                        onChange={(e) => setProductData(prev => ({ ...prev, max_stock_level: e.target.value }))}
                        placeholder="Optional"
                        className="w-full h-9 text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SKU & Barcode Section */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-purple-600" />
                SKU & Barcode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                  <PremiumInput
                    value={productData.sku}
                    onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                    className="w-full h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
                    Barcode
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(productData.barcode)}
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                      title="Copy Barcode"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </label>
                  <PremiumInput
                    value={productData.barcode}
                    onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                    placeholder="Barcode"
                    className="w-full h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Variant Manager */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Product Variants
              </h3>
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



            {/* Discount Section */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-orange-600" />
                Product Discount
              </h3>

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
      </div>
    </Modal>
  )
} 

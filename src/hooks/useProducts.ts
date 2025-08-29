import { useState, useEffect, useCallback } from 'react'
import { 
  getProducts, 
  getProductById, 
  getProductBySku,
  getProductWithVariants,
  createProduct, 
  updateProduct, 
  deleteProduct, 
  bulkDeleteProducts,
  updateProductStock,
  getLowStockProducts,
  getOutOfStockProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Product,
  type Category,
  createProductVariant,
  createProductImage
} from '@/lib/supabase'

interface UseProductsReturn {
  // Data
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  
  // Product operations
  fetchProducts: (branchId?: string) => Promise<void>
  fetchProductById: (id: string) => Promise<Product | null>
  fetchProductBySku: (sku: string) => Promise<Product | null>
  fetchProductWithVariants: (id: string) => Promise<any | null>
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product | null>
  editProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>
  removeProduct: (id: string) => Promise<boolean>
  bulkRemoveProducts: (ids: string[]) => Promise<boolean>
  updateStock: (id: string, quantity: number) => Promise<boolean>
  
  // Category operations
  fetchCategories: () => Promise<void>
  addCategory: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<Category | null>
  editCategory: (id: string, updates: Partial<Category>) => Promise<Category | null>
  removeCategory: (id: string) => Promise<boolean>
  
  // Filtered data
  getLowStock: (threshold?: number) => Promise<Product[]>
  getOutOfStock: () => Promise<Product[]>
  searchProductsByTerm: (searchTerm: string) => Promise<Product[]>
  getProductsByCategoryId: (categoryId: string) => Promise<Product[]>
  
  // Utility
  clearError: () => void
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all products
  const fetchProducts = useCallback(async (branchId?: string) => {
    console.log('useProducts: fetchProducts called with branchId:', branchId)
    setLoading(true)
    setError(null)
    
    try {
      console.log('useProducts: calling getProducts()')
      const { data, error: fetchError } = await getProducts(branchId)
      
      console.log('useProducts: getProducts response:', { data, error: fetchError })
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      console.log('useProducts: setting products:', data)
      setProducts(data || [])
    } catch (err) {
      console.error('useProducts: error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch product by ID
  const fetchProductById = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const { data, error: fetchError } = await getProductById(id)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
      return null
    }
  }, [])

  // Fetch product by SKU
  const fetchProductBySku = useCallback(async (sku: string): Promise<Product | null> => {
    try {
      const { data, error: fetchError } = await getProductBySku(sku)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product')
      return null
    }
  }, [])

  // Fetch product with variants
  const fetchProductWithVariants = useCallback(async (id: string): Promise<any | null> => {
    try {
      const { data, error: fetchError } = await getProductWithVariants(id)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product with variants')
      return null
    }
  }, [])

  // Add new product (normalized)
  const addProduct = useCallback(async (productData: any): Promise<Product | null> => {
    console.log('🔧 [DEBUG] useProducts.addProduct: Starting product creation')
    console.log('📦 [DEBUG] useProducts.addProduct: Input productData:', JSON.stringify(productData, null, 2))
    
    setLoading(true)
    setError(null)
    try {
      // 2. Create product - only pass fields that exist in the products table
      const productInsertData = {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        barcode: productData.barcode,
        category_id: productData.category_id,
        price: productData.price,
        cost_price: productData.cost_price,
        stock_quantity: productData.stock_quantity,
        min_stock_level: productData.min_stock_level,
        max_stock_level: productData.max_stock_level,
        unit: productData.unit,
        is_active: productData.is_active,
        image_url: productData.image_url,
        has_variants: productData.has_variants,
        discount_amount: productData.discount_amount,
        discount_type: productData.discount_type,
        discount_description: productData.discount_description,
        discount_expires_at: productData.discount_expires_at,
        is_discount_active: productData.is_discount_active,
      }
      
      console.log('💾 [DEBUG] useProducts.addProduct: Calling createProduct with data:', JSON.stringify(productInsertData, null, 2))
      
      const { data: product, error: createError } = await createProduct(productInsertData)
      
      console.log('💾 [DEBUG] useProducts.addProduct: createProduct result:', { product, error: createError })
      
      if (createError || !product) {
        console.error('❌ [DEBUG] useProducts.addProduct: Product creation failed:', createError)
        throw new Error(createError?.message || 'Product creation failed')
      }
      
      console.log('✅ [DEBUG] useProducts.addProduct: Product created successfully with ID:', product.id)
      
      // 3. Create variants - convert to proper database format
      if (productData.variants && productData.variants.length > 0) {
        console.log('🔢 [DEBUG] useProducts.addProduct: Creating variants...')
        for (let i = 0; i < productData.variants.length; i++) {
          const variant = productData.variants[i]
          console.log(`🔢 [DEBUG] useProducts.addProduct: Creating variant ${i + 1}/${productData.variants.length}:`, JSON.stringify(variant, null, 2))
          
          const variantInsertData = {
            product_id: product.id,
            sku: variant.sku,
            barcode: variant.barcode || null, // Use variant barcode if available
            price: variant.price,
            cost_price: null, // Will be set from product cost_price
            stock_quantity: variant.quantity || variant.stock || 0,
            min_stock_level: parseInt(productData.min_stock_level) || 0,
            max_stock_level: productData.max_stock_level ? parseInt(productData.max_stock_level) : null,
            image_url: variant.imageUrl || null,
            is_active: true,
            discount_amount: null, // Variants inherit discount from parent product
            discount_type: null,
            discount_description: null,
            discount_expires_at: null,
            is_discount_active: false,
          }
          
          console.log(`🔢 [DEBUG] useProducts.addProduct: Variant ${i + 1} insert data:`, JSON.stringify(variantInsertData, null, 2))
          
          const variantResult = await createProductVariant(variantInsertData)
          console.log(`🔢 [DEBUG] useProducts.addProduct: Variant ${i + 1} creation result:`, variantResult)
        }
        console.log('✅ [DEBUG] useProducts.addProduct: All variants created successfully')
      } else {
        console.log('ℹ️ [DEBUG] useProducts.addProduct: No variants to create')
      }
      
      // Note: Product images are now handled separately in the AddProductModal
      // to avoid the gallery_urls column issue
      console.log('📝 [DEBUG] useProducts.addProduct: Updating local products state')
      setProducts(prev => [...prev, product])
      console.log('✅ [DEBUG] useProducts.addProduct: Product creation completed successfully')
      return product
    } catch (err) {
      console.error('❌ [DEBUG] useProducts.addProduct: Error occurred:', err)
      console.error('❌ [DEBUG] useProducts.addProduct: Error stack:', err instanceof Error ? err.stack : 'No stack trace')
      setError(err instanceof Error ? err.message : 'Failed to create product')
      return null
    } finally {
      console.log('🏁 [DEBUG] useProducts.addProduct: Setting loading to false')
      setLoading(false)
    }
  }, [])

  // Edit product
  const editProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await updateProduct(id, updates)
      
      if (updateError) {
        throw new Error(updateError.message)
      }
      
      if (data) {
        setProducts(prev => prev.map(product => product.id === id ? data : product))
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove product (soft delete)
  const removeProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await deleteProduct(id)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }
      
      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Bulk remove products
  const bulkRemoveProducts = useCallback(async (ids: string[]): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await bulkDeleteProducts(ids)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }
      
      setProducts(prev => prev.filter(product => !ids.includes(product.id)))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete products')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update product stock
  const updateStock = useCallback(async (id: string, quantity: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await updateProductStock(id, quantity)
      
      if (updateError) {
        throw new Error(updateError.message)
      }
      
      if (data) {
        setProducts(prev => prev.map(product => product.id === id ? data : product))
      }
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await getCategories()
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  // Add category
  const addCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: createError } = await createCategory(categoryData)
      
      if (createError) {
        throw new Error(createError.message)
      }
      
      if (data) {
        setCategories(prev => [...prev, data])
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Edit category
  const editCategory = useCallback(async (id: string, updates: Partial<Category>): Promise<Category | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await updateCategory(id, updates)
      
      if (updateError) {
        throw new Error(updateError.message)
      }
      
      if (data) {
        setCategories(prev => prev.map(category => category.id === id ? data : category))
      }
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove category
  const removeCategory = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await deleteCategory(id)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }
      
      setCategories(prev => prev.filter(category => category.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Get low stock products
  const getLowStock = useCallback(async (threshold: number = 5): Promise<Product[]> => {
    try {
      const { data, error: fetchError } = await getLowStockProducts(threshold)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock products')
      return []
    }
  }, [])

  // Get out of stock products
  const getOutOfStock = useCallback(async (): Promise<Product[]> => {
    try {
      const { data, error: fetchError } = await getOutOfStockProducts()
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch out of stock products')
      return []
    }
  }, [])

  // Search products
  const searchProductsByTerm = useCallback(async (searchTerm: string): Promise<Product[]> => {
    try {
      const { data, error: fetchError } = await searchProducts(searchTerm)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products')
      return []
    }
  }, [])

  // Get products by category
  const getProductsByCategoryId = useCallback(async (categoryId: string): Promise<Product[]> => {
    try {
      const { data, error: fetchError } = await getProductsByCategory(categoryId)
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products by category')
      return []
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load initial data - only fetch categories automatically
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    // Data
    products,
    categories,
    loading,
    error,
    
    // Product operations
    fetchProducts,
    fetchProductById,
    fetchProductBySku,
    fetchProductWithVariants,
    addProduct,
    editProduct,
    removeProduct,
    bulkRemoveProducts,
    updateStock,
    
    // Category operations
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    
    // Filtered data
    getLowStock,
    getOutOfStock,
    searchProductsByTerm,
    getProductsByCategoryId,
    
    // Utility
    clearError
  }
} 
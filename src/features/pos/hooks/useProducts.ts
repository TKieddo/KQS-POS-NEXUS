import { useState, useEffect } from 'react'
import { supabase, getProducts, searchProducts as searchProductsDB } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'
import type { Product } from '../types'

export const useProducts = () => {
  const { selectedBranch } = useBranch()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // If Central Warehouse is selected, pass undefined to get all products
      // If specific branch is selected, pass the branch ID
      const branchId = selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? undefined : selectedBranch?.id
      const { data, error: fetchError } = await getProducts(branchId)
      
      if (fetchError) {
        console.error('Error fetching products:', fetchError)
        setError(fetchError.message)
        return
      }
      
      if (data) {
        // Transform the data to match our Product type
        const transformedProducts: Product[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          cost_price: product.cost_price || 0,
          stock_quantity: typeof product.branch_quantity === 'number' ? product.branch_quantity : product.stock_quantity,
          category_id: product.category_id || '',
          category_name: product.categories?.name || 'Uncategorized',
          image_url: product.image_url || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          is_active: product.is_active,
          has_variants: product.has_variants,
          created_at: product.created_at,
          updated_at: product.updated_at
        }))
        
        setProducts(transformedProducts)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      await fetchProducts()
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: searchError } = await searchProductsDB(query)
      
      if (searchError) {
        console.error('Error searching products:', searchError)
        setError(searchError.message)
        return
      }
      
      if (data) {
        // Transform the data to match our Product type
        const transformedProducts: Product[] = data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          cost_price: product.cost_price || 0,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id || '',
          category_name: product.categories?.name || 'Uncategorized',
          image_url: product.image_url || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          is_active: product.is_active,
          has_variants: product.has_variants,
          created_at: product.created_at,
          updated_at: product.updated_at
        }))
        
        setProducts(transformedProducts)
      }
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  const getProductsByCategory = async (categoryId: string) => {
    if (categoryId === 'all') {
      await fetchProducts()
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: categoryError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('is_active', true)
        .eq('category_id', categoryId)
        .order('name')
      
      if (categoryError) {
        console.error('Error fetching products by category:', categoryError)
        setError(categoryError.message)
        return
      }
      
      if (data) {
        // Transform the data to match our Product type
        const transformedProducts: Product[] = data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          cost_price: product.cost_price || 0,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id || '',
          category_name: product.categories?.name || 'Uncategorized',
          image_url: product.image_url || '',
          barcode: product.barcode || '',
          sku: product.sku || '',
          is_active: product.is_active,
          has_variants: product.has_variants,
          created_at: product.created_at,
          updated_at: product.updated_at
        }))
        
        setProducts(transformedProducts)
      }
    } catch (err) {
      console.error('Error fetching products by category:', err)
      setError('Failed to fetch products by category')
    } finally {
      setLoading(false)
    }
  }

  const getProductByBarcode = async (barcode: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // If Central Warehouse is selected, pass undefined to get all products
      // If specific branch is selected, pass the branch ID
      const branchId = selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? undefined : selectedBranch?.id
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('is_active', true)
        .eq('barcode', barcode)
      
      // Add branch filtering if specific branch is selected
      if (branchId && branchId !== '00000000-0000-0000-0000-000000000001') {
        query = query.eq('branch_allocations.branch_id', branchId)
      }
      
      const { data, error: barcodeError } = await query.single()
      
      if (barcodeError) {
        console.error('Error fetching product by barcode:', barcodeError)
        setError(barcodeError.message)
        return null
      }
      
      if (data) {
        // Transform the data to match our Product type
        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          cost_price: data.cost_price || 0,
          stock_quantity: data.stock_quantity,
          category_id: data.category_id || '',
          category_name: data.categories?.name || 'Uncategorized',
          image_url: data.image_url || '',
          barcode: data.barcode || '',
          sku: data.sku || '',
          is_active: data.is_active,
          has_variants: data.has_variants,
          created_at: data.created_at,
          updated_at: data.updated_at
        }
        
        return transformedProduct
      }
      
      return null
    } catch (err) {
      console.error('Error fetching product by barcode:', err)
      setError('Failed to fetch product by barcode')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Refetch products when branch changes
  useEffect(() => {
    if (selectedBranch) {
      console.log('Branch changed in POS, refetching products for:', selectedBranch.name)
      fetchProducts()
    }
  }, [selectedBranch])

  return {
    products,
    loading,
    error,
    searchProducts,
    fetchProducts,
    getProductsByCategory,
    getProductByBarcode
  }
} 
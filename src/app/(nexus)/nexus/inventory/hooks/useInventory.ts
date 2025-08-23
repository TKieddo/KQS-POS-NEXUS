import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useBranch } from '@/context/BranchContext'

export interface Product {
  id: string
  name: string
  description?: string
  sku?: string
  barcode?: string
  category_id?: string
  category?: string // Add category name field
  categories?: { id: string; name: string } // Add categories relationship
  price: number
  cost_price: number
  stock_quantity: number
  min_stock_level?: number
  max_stock_level?: number
  unit?: string
  is_active: boolean
  image_url?: string
  has_variants?: boolean
  created_at: string
  updated_at: string
  discount_amount?: number
  discount_type?: string
  discount_description?: string
  discount_expires_at?: string
  is_discount_active?: boolean
  branch_id?: string
}

interface InventoryStats {
  totalProducts: number
  totalValue: number
  totalCost: number
  totalProfit: number
  expectedProfit: number
  averageProfitMargin: number
  lowStockItems: number
  outOfStockItems: number
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedBranch } = useBranch()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            id,
            name
          )
        `)
        .eq('is_active', true)

      // If Central Warehouse is selected, show all products (comprehensive data)
      // If a specific branch is selected, filter by that branch
      if (selectedBranch && selectedBranch.name !== 'Central Warehouse') {
        query = query.eq('branch_id', selectedBranch.id)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transform the data to include category names
      const transformedProducts = data?.map(product => {
        console.log('Product:', product.name, 'Category ID:', product.category_id, 'Categories:', product.categories)
        return {
          ...product,
          category: product.categories?.name || 'Uncategorized'
        }
      }) || []

      setProducts(transformedProducts)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (): InventoryStats => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0)
    const totalCost = products.reduce((sum, product) => sum + (product.cost_price * product.stock_quantity), 0)
    const totalProfit = totalValue - totalCost
    const expectedProfit = totalValue - totalCost
    const averageProfitMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0
    const lowStockItems = products.filter(product => 
      product.stock_quantity > 0 && product.stock_quantity <= (product.min_stock_level || 10)
    ).length
    const outOfStockItems = products.filter(product => product.stock_quantity === 0).length

    return {
      totalProducts,
      totalValue,
      totalCost,
      totalProfit,
      expectedProfit,
      averageProfitMargin,
      lowStockItems,
      outOfStockItems
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedBranch])

  return {
    products,
    loading,
    error,
    stats: calculateStats(),
    refetch: fetchProducts
  }
}

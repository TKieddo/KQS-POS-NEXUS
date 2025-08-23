'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Package, Building2, ArrowRight, Search, Filter } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { StockAllocationModal } from '@/features/inventory/components/StockAllocationModal'
import { EnhancedInventoryTable } from '@/features/inventory/components/EnhancedInventoryTable'
import { EnhancedStockAllocationModal } from '@/features/inventory/components/EnhancedStockAllocationModal'
import { useBranch } from '@/context/BranchContext'
import { getCentralStock, getBranchAllocations, getBranchStock, getStockSummary, initializeCentralStock } from '@/lib/stock-services'
import type { Product } from '@/lib/supabase'

interface StockItem {
  id: string
  product_id: string
  total_quantity: number
  allocated_quantity: number
  available_quantity: number
  products: Product & {
    categories: {
      id: string
      name: string
      color: string
    }
  }
}

interface BranchAllocationItem {
  id: string
  product_id: string
  branch_id: string
  allocated_quantity: number
  products: Product
  branches: {
    id: string
    name: string
  }
}

export default function InventoryPage() {
  const { selectedBranch } = useBranch()
  const [centralStock, setCentralStock] = useState<StockItem[]>([])
  const [branchAllocations, setBranchAllocations] = useState<BranchAllocationItem[]>([])
  const [branchStock, setBranchStock] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [showEnhancedModal, setShowEnhancedModal] = useState(false)
  const [allocationMode, setAllocationMode] = useState<'product' | 'variant' | 'bulk'>('product')

  useEffect(() => {
    fetchData()
  }, [selectedBranch])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // If Central Warehouse is selected, show all stock and allocations
      // If specific branch is selected, show only that branch's allocations
      if (selectedBranch?.id === '00000000-0000-0000-0000-000000000001') {
        const { data: stockData } = await getCentralStock()
        
        // If central stock is empty, initialize it from products
        if (!stockData || stockData.length === 0) {
          console.log('Initializing central stock from products...')
          await initializeCentralStock()
          const { data: newStockData } = await getCentralStock()
          setCentralStock(newStockData || [])
        } else {
          setCentralStock(stockData || [])
        }
        
        const { data: allocationData } = await getBranchAllocations()
        setBranchAllocations(allocationData || [])
      } else {
        // For specific branch, try branch stock first, fallback to allocations
        try {
          const { data: stockData, error: stockError } = await getBranchStock(selectedBranch?.id)
          if (stockError || !stockData) {
            // Fallback to allocations if branch_stock table doesn't exist yet
            console.log('Branch stock table not available, using allocations:', stockError)
            const { data: allocationData } = await getBranchAllocations(selectedBranch?.id)
            setBranchAllocations(allocationData || [])
            setBranchStock([])
          } else {
            setBranchStock(stockData || [])
            // Also get allocations for reference
            const { data: allocationData } = await getBranchAllocations(selectedBranch?.id)
            setBranchAllocations(allocationData || [])
          }
        } catch (error) {
          console.log('Using fallback to allocations due to error:', error)
        const { data: allocationData } = await getBranchAllocations(selectedBranch?.id)
        setBranchAllocations(allocationData || [])
          setBranchStock([])
        }
        
        setCentralStock([]) // Clear central stock for branch view
      }

      const summaryData = await getStockSummary(selectedBranch?.id)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAllocateStock = (product: Product) => {
    setSelectedProduct(product)
    setShowAllocationModal(true)
  }

  const handleAllocateProduct = (product: any) => {
    setSelectedProduct(product)
    setSelectedVariant(null)
    setAllocationMode('product')
    setShowEnhancedModal(true)
  }

  const handleAllocateVariant = (product: any, variant: any) => {
    setSelectedProduct(product)
    setSelectedVariant(variant)
    setAllocationMode('variant')
    setShowEnhancedModal(true)
  }

  const handleBulkAllocate = (product: any) => {
    setSelectedProduct(product)
    setSelectedVariant(null)
    setAllocationMode('bulk')
    setShowEnhancedModal(true)
  }

  const handleCloseEnhancedModal = () => {
    setShowEnhancedModal(false)
    setSelectedProduct(null)
    setSelectedVariant(null)
    setAllocationMode('product')
  }

  const filteredStock = centralStock.filter(item =>
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.products.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAllocations = branchAllocations.filter(item =>
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.products.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredBranchStock = branchStock.filter(item =>
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.products.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">
            {selectedBranch?.id === '00000000-0000-0000-0000-000000000001' ? 'Central Warehouse Stock' : `${selectedBranch?.name} Allocations`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <PremiumButton
            onClick={() => setShowAllocationModal(true)}
                          disabled={selectedBranch?.id !== '00000000-0000-0000-0000-000000000001'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Allocate Stock
          </PremiumButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PremiumCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalProducts || 0}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalStock || 0}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Allocated</p>
              <p className="text-2xl font-bold text-gray-900">{summary.allocatedStock || 0}</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowRight className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-gray-900">{summary.availableStock || 0}</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <PremiumInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <PremiumButton variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </PremiumButton>
      </div>

      {/* Enhanced Inventory Table with Accordion */}
      <EnhancedInventoryTable
        products={selectedBranch?.id === '00000000-0000-0000-0000-000000000001' 
          ? (() => {
              const mappedProducts = filteredStock.map(item => ({
                id: item.products.id,
                name: item.products.name,
                sku: item.products.sku,
                barcode: item.products.barcode,
                price: item.products.price,
                cost_price: item.products.cost_price,
                stock_quantity: item.products.stock_quantity,
                min_stock_level: item.products.min_stock_level,
                has_variants: item.products.has_variants || false,
                is_active: item.products.is_active,
                category: item.products.categories ? {
                  id: item.products.categories.id,
                  name: item.products.categories.name,
                  color: item.products.categories.color
                } : null,
                total_stock: item.total_quantity,
                allocated_stock: item.allocated_quantity,
                available_stock: item.available_quantity
              }))
              console.log('Mapped central stock products for inventory table:', mappedProducts.map(p => ({ name: p.name, has_variants: p.has_variants })))
              return mappedProducts
            })()
          : (() => {
              // For branch view: only show products that actually have stock in this branch
              const dataToUse = filteredBranchStock.length > 0 ? filteredBranchStock : filteredAllocations
              const isUsingBranchStock = filteredBranchStock.length > 0
              
              const productMap = new Map()
              
              dataToUse.forEach(item => {
                const productId = item.products.id
                const branchStockQuantity = isUsingBranchStock ? item.stock_quantity : item.allocated_quantity
                
                // Only show products that have actual stock in this branch
                if (branchStockQuantity > 0) {
                  if (productMap.has(productId)) {
                    // Add to existing product's quantity
                    const existing = productMap.get(productId)
                    existing.allocated_stock += branchStockQuantity
                  } else {
                    // Create new product entry with branch-specific stock quantity
                    productMap.set(productId, {
                      id: item.products.id,
                      name: item.products.name,
                      sku: item.products.sku,
                      barcode: item.products.barcode,
                      price: item.products.price,
                      cost_price: item.products.cost_price,
                      stock_quantity: branchStockQuantity, // Branch-specific quantity, not global
                      min_stock_level: item.products.min_stock_level,
                      has_variants: item.products.has_variants || false,
                      is_active: item.products.is_active,
                      category: item.products.categories ? {
                        id: item.products.categories.id,
                        name: item.products.categories.name,
                        color: item.products.categories.color
                      } : null,
                      allocated_stock: branchStockQuantity
                    })
                  }
                }
              })
              
              const mappedProducts = Array.from(productMap.values())
              console.log(`Mapped ${isUsingBranchStock ? 'branch stock' : 'allocation'} products for inventory table (branch view):`, 
                mappedProducts.map(p => ({ name: p.name, branch_stock: p.allocated_stock, has_variants: p.has_variants })))
              return mappedProducts
            })()
        }
        isLoading={isLoading}
        isCentralWarehouse={selectedBranch?.id === '00000000-0000-0000-0000-000000000001'}
        currentBranchId={selectedBranch?.id}
        onAllocateProduct={handleAllocateProduct}
        onAllocateVariant={handleAllocateVariant}
        onBulkAllocate={handleBulkAllocate}
        onRefresh={fetchData}
      />

      {/* Original Stock Allocation Modal */}
      <StockAllocationModal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        product={selectedProduct}
        onSuccess={fetchData}
      />

      {/* Enhanced Stock Allocation Modal */}
      <EnhancedStockAllocationModal
        isOpen={showEnhancedModal}
        onClose={handleCloseEnhancedModal}
        product={selectedProduct || undefined}
        variant={selectedVariant || undefined}
        mode={allocationMode}
        onSuccess={fetchData}
      />
    </div>
  )
} 
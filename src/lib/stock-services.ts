import { supabase } from './supabase'
import type { CentralStock, BranchAllocation, StockAllocationRequest } from '@/types/branches'

// ========================================
// CENTRAL STOCK OPERATIONS
// ========================================

export const getCentralStock = async () => {
  const { data, error } = await supabase
    .from('central_stock')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        barcode,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        has_variants,
        is_active,
        categories (
          id,
          name,
          color
        )
      )
    `)
    .order('products(name)')

  return { data, error }
}

export const updateCentralStock = async (productId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('central_stock')
    .upsert({
      product_id: productId,
      total_quantity: quantity,
      available_quantity: quantity
    })
    .select()
    .single()

  return { data, error }
}

export const addToCentralStock = async (productId: string, quantity: number) => {
  // Get current stock
  const { data: currentStock } = await supabase
    .from('central_stock')
    .select('total_quantity, available_quantity')
    .eq('product_id', productId)
    .single()

  const newTotal = (currentStock?.total_quantity || 0) + quantity
  const newAvailable = (currentStock?.available_quantity || 0) + quantity

  const { data, error } = await supabase
    .from('central_stock')
    .upsert({
      product_id: productId,
      total_quantity: newTotal,
      available_quantity: newAvailable
    })
    .select()
    .single()

  return { data, error }
}

// ========================================
// BRANCH ALLOCATION OPERATIONS
// ========================================

export const getBranchAllocations = async (branchId?: string) => {
  let query = supabase
    .from('branch_allocations')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        barcode,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        has_variants,
        is_active,
        categories (
          id,
          name,
          color
        )
      ),
      branches (
        id,
        name
      ),
      product_variants (
        id,
        sku,
        price,
        stock_quantity,
        product_variant_options (
          variant_options (
            label,
            variant_option_types (
              display_name
            )
          )
        )
      )
    `)

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  return { data, error }
}

export const allocateStockToBranch = async (allocation: StockAllocationRequest) => {
  try {
    // If variant allocation, check variant stock
    if (allocation.variantId) {
      const { data: variantData } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', allocation.variantId)
        .single()

      if (variantData && variantData.stock_quantity < allocation.quantity) {
        return {
          success: false,
          error: `Insufficient variant stock. Available: ${variantData.stock_quantity}, Requested: ${allocation.quantity}`
        }
      }
    } else {
      // Check if we have enough available stock for main product
  const { data: centralStock } = await supabase
    .from('central_stock')
    .select('available_quantity')
        .eq('product_id', allocation.productId)
    .single()

  if (centralStock && centralStock.available_quantity < allocation.quantity) {
        return {
          success: false,
          error: `Insufficient stock. Available: ${centralStock.available_quantity}, Requested: ${allocation.quantity}`
        }
      }
    }

    // Create allocation record
    const allocationData: any = {
      product_id: allocation.productId,
      branch_id: allocation.branchId,
      allocated_quantity: allocation.quantity,
      notes: allocation.notes
    }

    // Add variant_id if this is a variant allocation
    if (allocation.variantId) {
      allocationData.variant_id = allocation.variantId
    }

    // Check if allocation already exists and update or insert accordingly
    let data, error

    if (allocation.variantId) {
      // For variant allocations, check if it exists
      const { data: existing, error: checkError } = await supabase
        .from('branch_allocations')
        .select('id, allocated_quantity')
        .eq('product_id', allocation.productId)
        .eq('branch_id', allocation.branchId)
        .eq('variant_id', allocation.variantId)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no record exists

      if (checkError) {
        return { success: false, error: checkError.message }
      }

      if (existing) {
        // Update existing allocation by adding to the existing quantity
        const newQuantity = existing.allocated_quantity + allocation.quantity
        const result = await supabase
          .from('branch_allocations')
          .update({
            allocated_quantity: newQuantity,
            notes: allocation.notes
          })
          .eq('id', existing.id)
          .select()
        data = result.data
        error = result.error
      } else {
        // Insert new allocation
        const result = await supabase
          .from('branch_allocations')
          .insert(allocationData)
          .select()
        data = result.data
        error = result.error
      }
    } else {
      // For product-level allocations
      const { data: existing, error: checkError } = await supabase
        .from('branch_allocations')
        .select('id, allocated_quantity')
        .eq('product_id', allocation.productId)
        .eq('branch_id', allocation.branchId)
        .is('variant_id', null)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no record exists

      if (checkError) {
        return { success: false, error: checkError.message }
      }

      if (existing) {
        // Update existing allocation by adding to the existing quantity
        const newQuantity = existing.allocated_quantity + allocation.quantity
        const result = await supabase
          .from('branch_allocations')
          .update({
            allocated_quantity: newQuantity,
            notes: allocation.notes
          })
          .eq('id', existing.id)
          .select()
        data = result.data
        error = result.error
      } else {
        // Insert new allocation
        const result = await supabase
          .from('branch_allocations')
          .insert(allocationData)
    .select()
        data = result.data
        error = result.error
      }
    }

    if (error) {
      return { success: false, error: error.message }
    }

    // After successful allocation, update source stock quantities and create/update branch stock
    if (allocation.variantId) {
      // 1. Deduct from variant stock
      const { data: currentVariant } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', allocation.variantId)
        .single()

      if (currentVariant) {
        const newStockQuantity = Math.max(0, currentVariant.stock_quantity - allocation.quantity)
        const { error: variantUpdateError } = await supabase
          .from('product_variants')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', allocation.variantId)

        if (variantUpdateError) {
          console.error('Failed to update variant stock:', variantUpdateError)
          // Don't fail the allocation, but log the error
        }
      }

      // 2. Create/update branch stock for the variant
      try {
        // First, ensure parent product exists in branch (but with 0 stock if it's only for variants)
        const { data: existingParent } = await supabase
          .from('branch_stock')
          .select('id')
          .eq('product_id', allocation.productId)
          .eq('branch_id', allocation.branchId)
          .is('variant_id', null)
          .maybeSingle()

        if (!existingParent) {
          // Create parent product entry with 0 stock (variants will have the actual stock)
          await supabase
            .from('branch_stock')
            .insert({
              product_id: allocation.productId,
              branch_id: allocation.branchId,
              variant_id: null,
              stock_quantity: 0, // Parent shows 0, variants show actual amounts
              notes: 'Parent product for variants'
            })
        }

        // Now handle the variant stock
        const { data: existingVariantStock } = await supabase
          .from('branch_stock')
          .select('id, stock_quantity')
          .eq('product_id', allocation.productId)
          .eq('branch_id', allocation.branchId)
          .eq('variant_id', allocation.variantId)
          .maybeSingle()

        if (existingVariantStock) {
          // Update existing variant stock
          await supabase
            .from('branch_stock')
            .update({
              stock_quantity: existingVariantStock.stock_quantity + allocation.quantity
            })
            .eq('id', existingVariantStock.id)
        } else {
          // Create new variant stock record
          await supabase
            .from('branch_stock')
            .insert({
              product_id: allocation.productId,
              branch_id: allocation.branchId,
              variant_id: allocation.variantId,
              stock_quantity: allocation.quantity,
              notes: allocation.notes
            })
        }
      } catch (branchStockError) {
        console.log('Branch stock table not available yet:', branchStockError)
        // For now, we'll show this in allocation records until table is created
      }
    } else {
      // 1. Deduct from main product stock
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', allocation.productId)
    .single()

      if (currentProduct) {
        const newStockQuantity = Math.max(0, currentProduct.stock_quantity - allocation.quantity)
        const { error: productUpdateError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', allocation.productId)

        if (productUpdateError) {
          console.error('Failed to update product stock:', productUpdateError)
          // Don't fail the allocation, but log the error
        }
      }

      // 2. Create/update branch stock for the product
      try {
        const { data: existingBranchStock } = await supabase
          .from('branch_stock')
          .select('id, stock_quantity')
          .eq('product_id', allocation.productId)
          .eq('branch_id', allocation.branchId)
          .is('variant_id', null)
          .maybeSingle()

        if (existingBranchStock) {
          // Update existing branch stock
          await supabase
            .from('branch_stock')
            .update({
              stock_quantity: existingBranchStock.stock_quantity + allocation.quantity
            })
            .eq('id', existingBranchStock.id)
        } else {
          // Create new branch stock record
          await supabase
            .from('branch_stock')
            .insert({
              product_id: allocation.productId,
              branch_id: allocation.branchId,
              variant_id: null,
              stock_quantity: allocation.quantity,
              notes: allocation.notes
            })
        }
      } catch (branchStockError) {
        console.log('Branch stock table not available yet:', branchStockError)
        // For now, we'll show this in allocation records until table is created
      }
    }

    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const removeStockFromBranch = async (productId: string, branchId: string, quantity: number) => {
  // Get current allocation
  const { data: currentAllocation } = await supabase
    .from('branch_allocations')
    .select('allocated_quantity')
    .eq('product_id', productId)
    .eq('branch_id', branchId)
    .single()

  if (!currentAllocation) {
    throw new Error('No allocation found for this product and branch')
  }

  const newQuantity = Math.max(0, currentAllocation.allocated_quantity - quantity)

  if (newQuantity === 0) {
    // Remove allocation entirely
    const { error } = await supabase
      .from('branch_allocations')
      .delete()
      .eq('product_id', productId)
      .eq('branch_id', branchId)

    return { data: null, error }
  } else {
    // Update allocation
    const { data, error } = await supabase
      .from('branch_allocations')
      .update({ allocated_quantity: newQuantity })
      .eq('product_id', productId)
      .eq('branch_id', branchId)
      .select()
      .single()

    return { data, error }
  }
}

// ========================================
// BRANCH STOCK OPERATIONS (Actual Inventory)
// ========================================

export const getBranchStock = async (branchId?: string) => {
  try {
    let query = supabase
      .from('branch_stock')
      .select(`
        *,
        products (
          id,
          name,
          sku,
          barcode,
          price,
          cost_price,
          min_stock_level,
          has_variants,
          is_active,
          categories (
            id,
            name,
            color
          )
        ),
        branches (
          id,
          name
        ),
        product_variants (
          id,
          sku,
          price,
          stock_quantity,
          product_variant_options (
            variant_options (
              label,
              variant_option_types (
                display_name
              )
            )
          )
        )
      `)

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    return { data, error }
  } catch (error) {
    // Return empty data if table doesn't exist
    console.log('Branch stock table not available:', error)
    return { data: [], error: null }
  }
}

// ========================================
// BRANCH OPERATIONS
// ========================================

export const getBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error }
}

export const createBranch = async (branch: Omit<CentralStock, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('branches')
    .insert(branch)
    .select()
    .single()

  return { data, error }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getStockSummary = async (branchId?: string) => {
  // Central warehouse summary
  if (!branchId || branchId === '00000000-0000-0000-0000-000000000001') {
  const { data: centralStock } = await getCentralStock()
  const { data: branchAllocations } = await getBranchAllocations()

  const summary = {
    totalProducts: centralStock?.length || 0,
    totalStock: centralStock?.reduce((sum, item) => sum + (item.total_quantity || 0), 0) || 0,
    allocatedStock: centralStock?.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0) || 0,
    availableStock: centralStock?.reduce((sum, item) => sum + (item.available_quantity || 0), 0) || 0,
    totalAllocations: branchAllocations?.length || 0
  }

  return summary
  }

  // Branch-specific summary from branch_stock
  const { data: branchRows } = await supabase
    .from('branch_stock')
    .select('stock_quantity, product_id')
    .eq('branch_id', branchId)

  const totalProducts = new Set((branchRows || []).map((r: any) => r.product_id)).size
  const totalStock = (branchRows || []).reduce((sum: number, r: any) => sum + (r.stock_quantity || 0), 0)

  return {
    totalProducts,
    totalStock,
    allocatedStock: totalStock,
    availableStock: totalStock,
    totalAllocations: (branchRows || []).length
  }
}

// Initialize central stock from existing products
export const initializeCentralStock = async () => {
  try {
    // Get all products that don't have central stock entries
    const { data: products } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('is_active', true)

    if (!products) return { data: null, error: null }

    // Create central stock entries for products that don't have them
    const stockEntries = products.map(product => ({
      product_id: product.id,
      total_quantity: product.stock_quantity || 0,
      available_quantity: product.stock_quantity || 0,
      allocated_quantity: 0
    }))

    const { data, error } = await supabase
      .from('central_stock')
      .upsert(stockEntries, { onConflict: 'product_id' })
      .select()

    return { data, error }
  } catch (error) {
    console.error('Error initializing central stock:', error)
    return { data: null, error }
  }
}

export const getBranchStockSummary = async (branchId: string) => {
  const { data: allocations } = await getBranchAllocations(branchId)

  const summary = {
    totalProducts: allocations?.length || 0,
    totalAllocated: allocations?.reduce((sum, item) => sum + (item.allocated_quantity || 0), 0) || 0
  }

  return summary
} 
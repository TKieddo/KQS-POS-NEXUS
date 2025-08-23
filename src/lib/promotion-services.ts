// Promotion and Bulk Price Update Services
import { supabase } from './supabase'
import type { Product } from './supabase'

export interface Promotion {
  id: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_amount: number
  start_date: string
  end_date: string
  is_active: boolean
  applies_to: 'all' | 'categories' | 'products'
  category_ids?: string[]
  product_ids?: string[]
  created_at: string
  updated_at: string
}

export interface BulkPriceUpdate {
  method: 'percentage_increase' | 'percentage_decrease' | 'fixed_increase' | 'fixed_decrease' | 'set_fixed'
  value: number
  roundToNearest?: number
  productIds: string[]
}

export interface BulkPriceResult {
  success: boolean
  message: string
  updated: number
  errors: Array<{
    productId: string
    productName: string
    error: string
  }>
}

// ========================================
// PROMOTION MANAGEMENT
// ========================================

/**
 * Create a new promotion
 */
export async function createPromotion(promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string; promotion?: Promotion }> {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        name: promotion.name,
        description: promotion.description,
        discount_type: promotion.discount_type,
        discount_amount: promotion.discount_amount,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: promotion.is_active,
        applies_to: promotion.applies_to,
        category_ids: promotion.category_ids || [],
        product_ids: promotion.product_ids || []
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      message: 'Promotion created successfully',
      promotion: data
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to create promotion: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Get all promotions
 */
export async function getPromotions(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Update a promotion
 */
export async function updatePromotion(id: string, updates: Partial<Promotion>): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      message: 'Promotion updated successfully'
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to update promotion: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Delete a promotion
 */
export async function deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      message: 'Promotion deleted successfully'
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete promotion: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Apply promotion to products
 */
export async function applyPromotionToProducts(promotionId: string): Promise<{ success: boolean; message: string; updated: number }> {
  try {
    // Get the promotion
    const { data: promotion, error: promotionError } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single()

    if (promotionError) throw promotionError
    if (!promotion) throw new Error('Promotion not found')

    // Build query based on promotion scope
    let query = supabase.from('products').select('id')

    if (promotion.applies_to === 'categories' && promotion.category_ids?.length) {
      query = query.in('category_id', promotion.category_ids)
    } else if (promotion.applies_to === 'products' && promotion.product_ids?.length) {
      query = query.in('id', promotion.product_ids)
    }

    const { data: products, error: productsError } = await query

    if (productsError) throw productsError
    if (!products?.length) {
      return {
        success: true,
        message: 'No products found to apply promotion to',
        updated: 0
      }
    }

    // Update products with promotion details
    const { error: updateError } = await supabase
      .from('products')
      .update({
        discount_amount: promotion.discount_amount,
        discount_type: promotion.discount_type,
        discount_description: promotion.description,
        discount_expires_at: promotion.end_date,
        is_discount_active: promotion.is_active
      })
      .in('id', products.map(p => p.id))

    if (updateError) throw updateError

    return {
      success: true,
      message: `Promotion applied to ${products.length} products`,
      updated: products.length
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to apply promotion: ${error instanceof Error ? error.message : 'Unknown error'}`,
      updated: 0
    }
  }
}

// ========================================
// BULK PRICE UPDATES
// ========================================

/**
 * Update prices for multiple products
 */
export async function bulkUpdatePrices(update: BulkPriceUpdate): Promise<BulkPriceResult> {
  const result: BulkPriceResult = {
    success: true,
    message: 'Price update completed',
    updated: 0,
    errors: []
  }

  try {
    // Get current products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', update.productIds)

    if (fetchError) throw fetchError
    if (!products?.length) {
      result.message = 'No products found'
      return result
    }

    // Calculate new prices
    const updates = products.map(product => {
      let newPrice = product.price

      switch (update.method) {
        case 'percentage_increase':
          newPrice = product.price * (1 + update.value / 100)
          break
        case 'percentage_decrease':
          newPrice = product.price * (1 - update.value / 100)
          break
        case 'fixed_increase':
          newPrice = product.price + update.value
          break
        case 'fixed_decrease':
          newPrice = Math.max(0, product.price - update.value)
          break
        case 'set_fixed':
          newPrice = update.value
          break
      }

      // Round to nearest specified value (e.g., 0.99)
      if (update.roundToNearest) {
        newPrice = Math.round(newPrice / update.roundToNearest) * update.roundToNearest
      }

      // Ensure price is not negative
      newPrice = Math.max(0, newPrice)

      return {
        id: product.id,
        price: newPrice
      }
    })

    // Update products in batches to avoid overwhelming the database
    const batchSize = 50
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      // Use a more targeted update that only modifies the price field
      for (const updateItem of batch) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ price: updateItem.price })
          .eq('id', updateItem.id)

        if (updateError) {
          const product = products.find(p => p.id === updateItem.id)
          result.errors.push({
            productId: updateItem.id,
            productName: product?.name || 'Unknown',
            error: updateError.message
          })
        } else {
          result.updated++
        }
      }
    }

    if (result.errors.length > 0) {
      result.success = false
      result.message = `Updated ${result.updated} products with ${result.errors.length} errors`
    }

    return result
  } catch (error) {
    return {
      success: false,
      message: `Bulk price update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      updated: 0,
      errors: update.productIds.map(id => ({
        productId: id,
        productName: 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }
}

/**
 * Get price preview for bulk update
 */
export function getPricePreview(currentPrice: number, method: BulkPriceUpdate['method'], value: number, roundToNearest?: number): number {
  let newPrice = currentPrice

  switch (method) {
    case 'percentage_increase':
      newPrice = currentPrice * (1 + value / 100)
      break
    case 'percentage_decrease':
      newPrice = currentPrice * (1 - value / 100)
      break
    case 'fixed_increase':
      newPrice = currentPrice + value
      break
    case 'fixed_decrease':
      newPrice = Math.max(0, currentPrice - value)
      break
    case 'set_fixed':
      newPrice = value
      break
  }

  // Round to nearest specified value
  if (roundToNearest) {
    newPrice = Math.round(newPrice / roundToNearest) * roundToNearest
  }

  return Math.max(0, newPrice)
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if promotion is currently active
 */
export function isPromotionActive(promotion: Promotion): boolean {
  if (!promotion.is_active) return false
  
  const now = new Date()
  const startDate = new Date(promotion.start_date)
  const endDate = new Date(promotion.end_date)
  
  return now >= startDate && now <= endDate
}

/**
 * Get active promotions
 */
export async function getActivePromotions(): Promise<Promotion[]> {
  const promotions = await getPromotions()
  return promotions.filter(isPromotionActive)
} 

/**
 * Refresh product discounts based on active promotions
 */
export async function refreshProductDiscounts(): Promise<{ success: boolean; message: string; updated: number }> {
  try {
    // Get all active promotions
    const activePromotions = await getActivePromotions()
    
    if (activePromotions.length === 0) {
      // Clear all product discounts if no active promotions
      const { error } = await supabase
        .from('products')
        .update({
          discount_amount: null,
          discount_type: null,
          discount_description: null,
          discount_expires_at: null,
          is_discount_active: false
        })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all products
      
      if (error) throw error
      
      return {
        success: true,
        message: 'All product discounts cleared (no active promotions)',
        updated: 0
      }
    }

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, category_id')
    
    if (productsError) throw productsError
    if (!products?.length) {
      return {
        success: true,
        message: 'No products found',
        updated: 0
      }
    }

    let updatedCount = 0

    // Process each product
    for (const product of products) {
      let bestDiscount = null
      let bestPromotion = null

      // Find the best applicable promotion for this product
      for (const promotion of activePromotions) {
        let isApplicable = false

        switch (promotion.applies_to) {
          case 'all':
            isApplicable = true
            break
          case 'categories':
            isApplicable = promotion.category_ids?.includes(product.category_id || '') || false
            break
          case 'products':
            isApplicable = promotion.product_ids?.includes(product.id) || false
            break
        }

        if (isApplicable) {
          // Calculate discount value
          const discountValue = promotion.discount_amount
          
          // For now, use the first applicable promotion (could be enhanced to find the best one)
          if (!bestDiscount || discountValue > bestDiscount) {
            bestDiscount = discountValue
            bestPromotion = promotion
          }
        }
      }

      // Update product with the best applicable promotion
      if (bestPromotion) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            discount_amount: bestPromotion.discount_amount,
            discount_type: bestPromotion.discount_type,
            discount_description: bestPromotion.description,
            discount_expires_at: bestPromotion.end_date,
            is_discount_active: true
          })
          .eq('id', product.id)

        if (!updateError) {
          updatedCount++
        }
      } else {
        // Clear discount if no applicable promotion
        const { error: updateError } = await supabase
          .from('products')
          .update({
            discount_amount: null,
            discount_type: null,
            discount_description: null,
            discount_expires_at: null,
            is_discount_active: false
          })
          .eq('id', product.id)

        if (!updateError) {
          updatedCount++
        }
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} products with active promotion discounts`,
      updated: updatedCount
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to refresh product discounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      updated: 0
    }
  }
} 
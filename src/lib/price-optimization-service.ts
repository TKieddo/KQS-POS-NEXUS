import { supabase } from './supabase'
import { 
  generatePriceOptimizationSuggestions, 
  generateBulkPriceOptimizationSuggestions,
  analyzeMarketTrends,
  type PriceOptimizationData,
  type PriceOptimizationSuggestion as AISuggestion
} from './ai-services'

export interface PriceOptimizationSuggestion {
  id: string
  product_id: string
  current_price: number
  suggested_price: number
  price_change_percentage: number
  optimization_reason: string
  expected_impact: any
  confidence_score?: number
  is_applied: boolean
  applied_at?: string
  applied_by?: string
  created_at: string
}

export interface ProductOptimizationData {
  id: string
  name: string
  category_id: string
  category_name?: string
  current_price: number
  cost_price?: number
  stock_quantity?: number
  sales_data?: any
  competitor_data?: any
}

export const priceOptimizationService = {
  /**
   * Get all price optimization suggestions for a branch
   */
  async getSuggestions(branchId: string): Promise<PriceOptimizationSuggestion[]> {
    try {
      console.log('Fetching price optimization suggestions for branch:', branchId)
      
      // Test if the table exists
      const { data: testData, error: testError } = await supabase
        .from('price_optimization_suggestions')
        .select('id')
        .limit(1)

      if (testError) {
        console.error('price_optimization_suggestions table test failed:', testError)
        console.error('This might mean the migration hasn\'t been applied yet')
        return []
      }

      const { data, error } = await supabase
        .from('price_optimization_suggestions')
        .select(`
          *,
          products (
            id,
            name,
            category_id,
            categories (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching price optimization suggestions:', error)
        return []
      }

      console.log('Found suggestions:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Exception in getSuggestions:', error)
      return []
    }
  },

  /**
   * Get products eligible for price optimization
   */
  async getOptimizationEligibleProducts(branchId: string): Promise<ProductOptimizationData[]> {
    try {
      console.log('Fetching optimization eligible products for branch:', branchId)
      
      if (!branchId) {
        console.error('Branch ID is required')
        throw new Error('Branch ID is required')
      }

      // First, let's test if we can query the products table at all
      console.log('Testing basic products query...')
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('id, name')
        .limit(1)

      if (testError) {
        console.error('Basic products query failed:', testError)
        throw new Error(`Database connection issue: ${testError.message}`)
      }

      console.log('Basic products query successful, found:', testData?.length || 0, 'products')

      // Now try the full query (removed branch_id filter since it doesn't exist in current schema)
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category_id,
          price,
          cost_price,
          stock_quantity,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .not('price', 'is', null)

      if (error) {
        console.error('Error fetching optimization eligible products:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Found products for branch:', data?.length || 0)

      return (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category_id: product.category_id,
        category_name: (Array.isArray(product.categories) ? (product.categories[0] as any)?.name : (product.categories && typeof product.categories === 'object' ? (product.categories as any).name : undefined)),
        current_price: product.price,
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity
      }))
    } catch (error) {
      console.error('Exception in getOptimizationEligibleProducts:', error)
      throw error
    }
  },

  /**
   * Generate AI suggestions for a single product
   */
  async generateSuggestionForProduct(
    branchId: string, 
    productId: string
  ): Promise<string | null> {
    try {
      // Get product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', productId)
        .single()

      if (productError || !product) {
        console.error('Error fetching product:', productError)
        return null
      }

      // Prepare optimization data
      const optimizationData: PriceOptimizationData = {
        productId: product.id,
        currentPrice: product.price,
        costPrice: product.cost_price,
        category: (Array.isArray(product.categories) ? (product.categories[0] as any)?.name : (product.categories && typeof product.categories === 'object' ? (product.categories as any).name : undefined)),
        stockQuantity: product.stock_quantity
      }

      // Generate AI suggestion
      const aiSuggestion = await generatePriceOptimizationSuggestions(optimizationData)

      // Save suggestion to database (removed branch_id since it doesn't exist in current schema)
      const { data: savedSuggestion, error: saveError } = await supabase
        .from('price_optimization_suggestions')
        .insert({
          product_id: productId,
          current_price: product.price,
          suggested_price: aiSuggestion.suggestedPrice,
          price_change_percentage: aiSuggestion.priceChangePercentage,
          optimization_reason: aiSuggestion.optimizationReason,
          expected_impact: aiSuggestion.expectedImpact,
          confidence_score: aiSuggestion.confidenceScore,
          is_applied: false
        })
        .select('id')
        .single()

      if (saveError) {
        console.error('Error saving suggestion:', saveError)
        return null
      }

      return savedSuggestion.id
    } catch (error) {
      console.error('Error generating suggestion for product:', error)
      return null
    }
  },

  /**
   * Generate AI suggestions for multiple products
   */
  async generateBulkSuggestions(branchId: string): Promise<{
    success: number
    failed: number
    total: number
  }> {
    try {
      console.log('Starting bulk suggestions generation for branch:', branchId)
      
      if (!branchId) {
        console.error('Branch ID is required for bulk suggestions')
        throw new Error('Branch ID is required')
      }

      // Get eligible products
      const products = await this.getOptimizationEligibleProducts(branchId)
      console.log('Eligible products for optimization:', products.length)
      
      if (products.length === 0) {
        console.log('No eligible products found for optimization')
        return { success: 0, failed: 0, total: 0 }
      }

      let success = 0
      let failed = 0

      // Process products in batches to avoid rate limits
      const batchSize = 5
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`)
        
        await Promise.all(
          batch.map(async (product) => {
            try {
              console.log(`Generating suggestion for product: ${product.name} (${product.id})`)
              const suggestionId = await this.generateSuggestionForProduct(branchId, product.id)
              if (suggestionId) {
                success++
                console.log(`Successfully generated suggestion for product: ${product.name}`)
              } else {
                failed++
                console.log(`Failed to generate suggestion for product: ${product.name}`)
              }
            } catch (error) {
              console.error(`Error generating suggestion for product ${product.id} (${product.name}):`, error)
              failed++
            }
          })
        )

        // Add delay between batches to avoid rate limits
        if (i + batchSize < products.length) {
          console.log('Waiting 2 seconds before next batch...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log(`Bulk suggestions generation completed. Success: ${success}, Failed: ${failed}, Total: ${products.length}`)
      return { success, failed, total: products.length }
    } catch (error) {
      console.error('Error generating bulk suggestions:', error)
      throw error
    }
  },

  /**
   * Apply a price optimization suggestion
   */
  async applySuggestion(suggestionId: string, userId: string): Promise<boolean> {
    try {
      // Get the suggestion
      const { data: suggestion, error: fetchError } = await supabase
        .from('price_optimization_suggestions')
        .select('*')
        .eq('id', suggestionId)
        .single()

      if (fetchError || !suggestion) {
        console.error('Error fetching suggestion:', fetchError)
        return false
      }

      // Update the product price
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          price: suggestion.suggested_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', suggestion.product_id)

      if (updateError) {
        console.error('Error updating product price:', updateError)
        return false
      }

      // Mark suggestion as applied
      const { error: markError } = await supabase
        .from('price_optimization_suggestions')
        .update({
          is_applied: true,
          applied_at: new Date().toISOString(),
          applied_by: userId
        })
        .eq('id', suggestionId)

      if (markError) {
        console.error('Error marking suggestion as applied:', markError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error applying suggestion:', error)
      return false
    }
  },

  /**
   * Delete a price optimization suggestion
   */
  async deleteSuggestion(suggestionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('price_optimization_suggestions')
      .delete()
      .eq('id', suggestionId)

    if (error) {
      console.error('Error deleting suggestion:', error)
      return false
    }

    return true
  },

  /**
   * Get optimization statistics
   */
  async getOptimizationStats(branchId: string): Promise<{
    totalSuggestions: number
    appliedSuggestions: number
    pendingSuggestions: number
    averageConfidence: number
    averagePriceChange: number
  }> {
    const { data, error } = await supabase
      .from('price_optimization_suggestions')
      .select('*')

    if (error) {
      console.error('Error fetching optimization stats:', error)
      return {
        totalSuggestions: 0,
        appliedSuggestions: 0,
        pendingSuggestions: 0,
        averageConfidence: 0,
        averagePriceChange: 0
      }
    }

    const suggestions = data || []
    const applied = suggestions.filter(s => s.is_applied)
    const pending = suggestions.filter(s => !s.is_applied)

    return {
      totalSuggestions: suggestions.length,
      appliedSuggestions: applied.length,
      pendingSuggestions: pending.length,
      averageConfidence: suggestions.length > 0 
        ? suggestions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / suggestions.length 
        : 0,
      averagePriceChange: suggestions.length > 0
        ? suggestions.reduce((sum, s) => sum + Math.abs(s.price_change_percentage), 0) / suggestions.length
        : 0
    }
  },

  /**
   * Analyze market trends for a category
   */
  async analyzeCategoryMarketTrends(
    categoryId: string,
    currentPrice: number
  ): Promise<any> {
    try {
      // Get category name
      const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single()

      if (!category || !category.name) {
        throw new Error('Category not found')
      }

      // Mock competitor data (in real implementation, this would come from external APIs)
      const mockCompetitorPrices = [
        { competitor: 'Competitor A', price: currentPrice * 0.9 },
        { competitor: 'Competitor B', price: currentPrice * 1.1 },
        { competitor: 'Competitor C', price: currentPrice * 0.95 }
      ]

      return await analyzeMarketTrends(category.name, currentPrice, mockCompetitorPrices)
    } catch (error) {
      console.error('Error analyzing market trends:', error)
      throw error
    }
  },

  /**
   * Get recent optimization activity
   */
  async getRecentActivity(branchId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('price_optimization_suggestions')
      .select(`
        *,
        products (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }

    return data || []
  }
} 
import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions
export interface PricingSettings {
  id: string
  branch_id: string
  default_markup_percentage: number
  min_profit_margin: number
  max_profit_margin: number
  competitive_pricing_enabled: boolean
  auto_price_adjustment: boolean
  price_rounding_method: 'nearest' | 'up' | 'down'
  price_rounding_increment: number
  bulk_update_enabled: boolean
  discount_management_enabled: boolean
  price_optimization_enabled: boolean
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  branch_id: string
  name: string
  description?: string
  rule_type: 'markup' | 'fixed_price' | 'percentage' | 'competitive'
  condition_type: 'category' | 'cost_range' | 'stock_level' | 'date_range'
  condition_value: any
  action_type: 'set_price' | 'adjust_percentage' | 'set_markup'
  action_value: number
  priority: number
  is_active: boolean
  applies_to_variants: boolean
  created_at: string
  updated_at: string
}

export interface PriceAnalysisData {
  id: string
  branch_id: string
  product_id?: string | null // Allow null for calculator data
  analysis_date: string
  current_price: number
  cost_price?: number
  competitor_prices?: any
  market_average?: number
  price_trend?: 'up' | 'down' | 'stable'
  demand_level?: 'high' | 'medium' | 'low'
  profit_margin?: number
  price_change_percentage?: number
  created_at: string
}

export interface PricingReport {
  id: string
  branch_id: string
  report_name: string
  report_type: 'profitability' | 'competitiveness' | 'trends' | 'optimization'
  date_range_start: string
  date_range_end: string
  report_data: any
  file_path?: string
  file_size?: number
  status: 'generating' | 'completed' | 'failed'
  generated_by?: string
  created_at: string
  completed_at?: string
}

export interface ImportExportHistory {
  id: string
  branch_id: string
  operation_type: 'import' | 'export'
  data_type: 'pricing_rules' | 'product_settings' | 'all_data' | 'pricing_report'
  filename: string
  file_size?: number
  file_path?: string
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  metadata?: any
  performed_by?: string
  created_at: string
  completed_at?: string
}

export interface BulkPriceUpdate {
  id: string
  branch_id: string
  update_type: 'percentage' | 'fixed' | 'multiplier' | 'set'
  update_direction?: 'increase' | 'decrease'
  update_value: number
  affected_categories?: string[]
  affected_products_count: number
  total_value_change: number
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  performed_by?: string
  created_at: string
  completed_at?: string
}

export interface DiscountManagement {
  id: string
  branch_id: string
  discount_name: string
  discount_type: 'percentage' | 'fixed' | 'buy_one_get_one' | 'bulk'
  discount_value: number
  start_date: string
  end_date?: string
  applies_to_categories?: string[]
  applies_to_products?: string[]
  min_purchase_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  current_usage: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PriceOptimizationSuggestion {
  id: string
  branch_id: string
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

export interface QuickActionLog {
  id: string
  branch_id: string
  action_type: 'bulk_update' | 'discount_management' | 'rules_apply' | 'optimization'
  action_details: any
  affected_items_count: number
  status: 'completed' | 'failed' | 'partial'
  error_message?: string
  performed_by?: string
  created_at: string
}

export interface PricingOverview {
  rulesCount: number;
  activeRulesCount: number;
  analysisCount: number;
  reportsCount: number;
}

// Pricing Settings Service
export const pricingSettingsService = {
  async getSettings(branchId: string): Promise<PricingSettings | null> {
    const { data, error } = await supabase
      .from('product_pricing_settings')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pricing settings:', error)
      return null
    }

    if (!data || data.length === 0) {
      // No settings found, create default settings
      console.log('No pricing settings found, creating default settings...')
      return await this.createDefaultSettings(branchId)
    }

    // If there are multiple records, keep the most recent one and delete the rest
    if (data.length > 1) {
      console.log(`Found ${data.length} pricing settings records for branch ${branchId}. Cleaning up duplicates...`)
      
      // Keep the most recent record (first one after ordering by created_at desc)
      const latestRecord = data[0]
      
      // Delete all other records
      const recordIdsToDelete = data.slice(1).map(record => record.id)
      
      if (recordIdsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('product_pricing_settings')
          .delete()
          .in('id', recordIdsToDelete)
        
        if (deleteError) {
          console.error('Error deleting duplicate pricing settings:', deleteError)
        } else {
          console.log(`Deleted ${recordIdsToDelete.length} duplicate pricing settings records`)
        }
      }
      
      return latestRecord
    }

    return data[0]
  },

  async createDefaultSettings(branchId: string): Promise<PricingSettings | null> {
    const defaultSettings = {
      branch_id: branchId,
      default_markup_percentage: 30.00,
      min_profit_margin: 15.00,
      max_profit_margin: 50.00,
      competitive_pricing_enabled: false,
      auto_price_adjustment: false,
      price_rounding_method: 'nearest',
      price_rounding_increment: 0.01,
      bulk_update_enabled: true,
      discount_management_enabled: true,
      price_optimization_enabled: false
    }

    const { data, error } = await supabase
      .from('product_pricing_settings')
      .insert(defaultSettings)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating default pricing settings:', error)
      return null
    }

    return data
  },

  async updateSettings(branchId: string, settings: Partial<PricingSettings>): Promise<boolean> {
    console.log('Updating pricing settings for branch:', branchId, 'with updates:', settings)
    
    try {
      // First, try to update existing record
      const { error: updateError } = await supabase
        .from('product_pricing_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('branch_id', branchId)

      if (updateError) {
        console.log('Update failed, trying to insert new record:', updateError)
        
        // If update fails, try to insert new record
        const { error: insertError } = await supabase
          .from('product_pricing_settings')
          .insert({
            branch_id: branchId,
            ...settings,
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting pricing settings:', insertError)
          return false
        }
      }

      console.log('Successfully updated pricing settings')
      return true
    } catch (error) {
      console.error('Exception updating pricing settings:', error)
      return false
    }
  }
}

// Pricing Rules Service
export const pricingRulesService = {
  async getRules(branchId: string): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('product_pricing_rules')
      .select('*')
      .eq('branch_id', branchId)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching pricing rules:', error)
      return []
    }

    return data || []
  },

  async createRule(rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('product_pricing_rules')
      .insert(rule)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating pricing rule:', error)
      return null
    }

    return data.id
  },

  async updateRule(id: string, updates: Partial<PricingRule>): Promise<boolean> {
    const { error } = await supabase
      .from('product_pricing_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating pricing rule:', error)
      return false
    }

    return true
  },

  async deleteRule(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('product_pricing_rules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting pricing rule:', error)
      return false
    }

    return true
  },

  async applyRulesToProduct(productId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('apply_pricing_rules_to_product', { product_uuid: productId })

    if (error) {
      console.error('Error applying pricing rules:', error)
      return null
    }

    return data
  }
}

// Price Analysis Service
export const priceAnalysisService = {
  async getAnalysisData(branchId: string, startDate?: string, endDate?: string): Promise<PriceAnalysisData[]> {
    let query = supabase
      .from('price_analysis_data')
      .select('*')
      .eq('branch_id', branchId)

    if (startDate) {
      query = query.gte('analysis_date', startDate)
    }
    if (endDate) {
      query = query.lte('analysis_date', endDate)
    }

    const { data, error } = await query.order('analysis_date', { ascending: false })

    if (error) {
      console.error('Error fetching price analysis data:', error)
      return []
    }

    return data || []
  },

  async createAnalysisData(analysisData: Omit<PriceAnalysisData, 'id' | 'created_at'>): Promise<string | null> {
    try {
      // For calculator data, we might not have a product_id, so we'll use a placeholder
      const dataToInsert = {
        ...analysisData,
        product_id: analysisData.product_id || null, // Allow null for calculator data
        analysis_date: analysisData.analysis_date || new Date().toISOString().split('T')[0]
      }

      console.log('Creating analysis data:', dataToInsert)

      const { data, error } = await supabase
        .from('price_analysis_data')
        .insert(dataToInsert)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating price analysis data:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data?.id) {
        console.error('No ID returned from insert')
        throw new Error('Failed to create analysis record')
      }

      return data.id
    } catch (error) {
      console.error('Error creating price analysis data:', error)
      throw error
    }
  },

  async updateCompetitorPrices(productId: string, competitorPrices: any): Promise<boolean> {
    const { error } = await supabase
      .from('price_analysis_data')
      .update({ competitor_prices: competitorPrices })
      .eq('product_id', productId)
      .eq('analysis_date', new Date().toISOString().split('T')[0])

    if (error) {
      console.error('Error updating competitor prices:', error)
      return false
    }

    return true
  }
}

// Pricing Reports Service
export const pricingReportsService = {
  async generateReport(
    branchId: string,
    reportType: string,
    startDate: string,
    endDate: string,
    reportName: string
  ): Promise<string | null> {
    // First create the report record
    const { data: reportData, error: reportError } = await supabase
      .from('pricing_reports')
      .insert({
        branch_id: branchId,
        report_name: reportName,
        report_type: reportType,
        date_range_start: startDate,
        date_range_end: endDate,
        report_data: {},
        status: 'generating'
      })
      .select('id')
      .single()

    if (reportError) {
      console.error('Error creating report record:', reportError)
      return null
    }

    // Generate the actual report data
    const { data: generatedData, error: generateError } = await supabase
      .rpc('generate_pricing_report', {
        branch_uuid: branchId,
        report_type: reportType,
        start_date: startDate,
        end_date: endDate
      })

    if (generateError) {
      console.error('Error generating report data:', generateError)
      // Update report status to failed
      await supabase
        .from('pricing_reports')
        .update({ status: 'failed' })
        .eq('id', reportData.id)
      return null
    }

    // Update report with generated data
    const { error: updateError } = await supabase
      .from('pricing_reports')
      .update({
        report_data: generatedData,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', reportData.id)

    if (updateError) {
      console.error('Error updating report data:', updateError)
      return null
    }

    return reportData.id
  },

  async getReports(branchId: string): Promise<PricingReport[]> {
    const { data, error } = await supabase
      .from('pricing_reports')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pricing reports:', error)
      return []
    }

    return data || []
  },

  async downloadReport(reportId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('pricing_reports')
      .select('file_path')
      .eq('id', reportId)
      .single()

    if (error || !data?.file_path) {
      console.error('Error fetching report file path:', error)
      return null
    }

    return data.file_path
  }
}

// Import/Export Service
export const importExportService = {
  async createHistoryRecord(record: Omit<ImportExportHistory, 'id' | 'created_at' | 'completed_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('import_export_history')
      .insert(record)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating import/export history record:', error)
      return null
    }

    return data.id
  },

  async updateHistoryStatus(id: string, status: string, errorMessage?: string): Promise<boolean> {
    const { error } = await supabase
      .from('import_export_history')
      .update({
        status,
        error_message: errorMessage,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating import/export history status:', error)
      return false
    }

    return true
  },

  async getHistory(branchId: string): Promise<ImportExportHistory[]> {
    const { data, error } = await supabase
      .from('import_export_history')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching import/export history:', error)
      return []
    }

    return data || []
  },

  async exportData(branchId: string, dataType: string): Promise<any> {
    let data: any = {}

    switch (dataType) {
      case 'pricing_rules':
        data = await pricingRulesService.getRules(branchId)
        break
      case 'product_settings':
        data = await pricingSettingsService.getSettings(branchId)
        break
      case 'all_data':
        data = {
          settings: await pricingSettingsService.getSettings(branchId),
          rules: await pricingRulesService.getRules(branchId),
          analysis: await priceAnalysisService.getAnalysisData(branchId)
        }
        break
      default:
        throw new Error(`Unknown data type: ${dataType}`)
    }

    return data
  },

  async importData(branchId: string, dataType: string, data: any): Promise<boolean> {
    try {
      switch (dataType) {
        case 'pricing_rules':
          for (const rule of data) {
            await pricingRulesService.createRule({
              ...rule,
              branch_id: branchId
            })
          }
          break
        case 'product_settings':
          await pricingSettingsService.updateSettings(branchId, data)
          break
        case 'all_data':
          if (data.settings) {
            await pricingSettingsService.updateSettings(branchId, data.settings)
          }
          if (data.rules) {
            for (const rule of data.rules) {
              await pricingRulesService.createRule({
                ...rule,
                branch_id: branchId
              })
            }
          }
          break
        default:
          throw new Error(`Unknown data type: ${dataType}`)
      }

      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

// Bulk Price Update Service
export const bulkPriceUpdateService = {
  async createBulkUpdate(update: Omit<BulkPriceUpdate, 'id' | 'created_at' | 'completed_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('bulk_price_updates')
        .insert(update)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating bulk price update:', error)
        
        // Check if the table doesn't exist
        if (error.message && error.message.includes('relation "bulk_price_updates" does not exist')) {
          console.error('The bulk_price_updates table does not exist. Please run the migration first.')
          throw new Error('Database migration required. Please run the pricing migration in your Supabase dashboard.')
        }
        
        // Check for other common errors
        if (error.message && error.message.includes('null value in column')) {
          throw new Error('Missing required fields. Please check your input data.')
        }
        
        if (error.message && error.message.includes('foreign key')) {
          throw new Error('Invalid branch reference. Please check your branch selection.')
        }
        
        throw new Error(`Database error: ${error.message}`)
      }

      return data.id
    } catch (error) {
      console.error('Error creating bulk price update:', error)
      throw error
    }
  },

  async executeBulkUpdate(updateId: string): Promise<boolean> {
    // Get the bulk update details
    const { data: updateData, error: fetchError } = await supabase
      .from('bulk_price_updates')
      .select('*')
      .eq('id', updateId)
      .single()

    if (fetchError || !updateData) {
      console.error('Error fetching bulk update details:', fetchError)
      return false
    }

    try {
      // Build the query for affected products
      // Note: products table doesn't have branch_id, so we only filter by category if specified
      let query = supabase
        .from('products')
        .select('id, price, cost_price, stock_quantity, name')
        .eq('is_active', true) // Only update active products

      if (updateData.affected_categories && updateData.affected_categories.length > 0) {
        query = query.in('category_id', updateData.affected_categories)
      }

      const { data: products, error: productsError } = await query

      if (productsError) {
        console.error('Error fetching products:', productsError)
        throw productsError
      }

      if (!products || products.length === 0) {
        console.log('No products found to update')
        // Update the bulk update record with zero results
        await supabase
          .from('bulk_price_updates')
          .update({
            affected_products_count: 0,
            total_value_change: 0,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', updateId)
        return true
      }

      let totalValueChange = 0
      let updatedCount = 0

      const directionText = updateData.update_direction === 'decrease' ? 'decrease' : 'increase'
      console.log(`Updating ${products.length} products with ${updateData.update_type} ${directionText}`)

      // Update each product
      for (const product of products) {
        let newPrice = product.price

        switch (updateData.update_type) {
          case 'percentage':
            if (updateData.update_direction === 'decrease') {
              newPrice = product.price * (1 - updateData.update_value / 100)
            } else {
              newPrice = product.price * (1 + updateData.update_value / 100)
            }
            break
          case 'fixed':
            if (updateData.update_direction === 'decrease') {
              newPrice = product.price - updateData.update_value
            } else {
              newPrice = product.price + updateData.update_value
            }
            break
          case 'multiplier':
            if (updateData.update_direction === 'decrease') {
              newPrice = product.price / updateData.update_value
            } else {
              newPrice = product.price * updateData.update_value
            }
            break
          case 'set':
            newPrice = updateData.update_value
            break
        }

        // Ensure price is not negative
        newPrice = Math.max(0, newPrice)

        const { error: updateError } = await supabase
          .from('products')
          .update({ price: newPrice })
          .eq('id', product.id)

        if (!updateError) {
          totalValueChange += (newPrice - product.price) * (product.stock_quantity || 0)
          updatedCount++
          console.log(`Updated product ${product.name}: ${product.price} → ${newPrice}`)
        } else {
          console.error(`Failed to update product ${product.name}:`, updateError)
        }
      }

      console.log(`Successfully updated ${updatedCount} out of ${products.length} products`)

      // Update the bulk update record
      await supabase
        .from('bulk_price_updates')
        .update({
          affected_products_count: updatedCount,
          total_value_change: totalValueChange,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', updateId)

      return true
    } catch (error) {
      console.error('Error executing bulk price update:', error)
      
      // Update status to failed
      await supabase
        .from('bulk_price_updates')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', updateId)

      return false
    }
  },

  async getBulkUpdates(branchId: string): Promise<BulkPriceUpdate[]> {
    const { data, error } = await supabase
      .from('bulk_price_updates')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bulk price updates:', error)
      return []
    }

    return data || []
  }
}

// Discount Management Service
export const discountManagementService = {
  async getDiscounts(branchId: string): Promise<DiscountManagement[]> {
    const { data, error } = await supabase
      .from('discount_management')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching discounts:', error)
      return []
    }

    return data || []
  },

  async createDiscount(discount: Omit<DiscountManagement, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('discount_management')
      .insert(discount)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating discount:', error)
      return null
    }

    // Apply the discount to products if it's active
    if (discount.is_active) {
      await this.applyDiscountToProducts(data.id, { ...discount, id: data.id })
    }

    return data.id
  },

  async updateDiscount(id: string, updates: Partial<DiscountManagement>): Promise<boolean> {
    const { error } = await supabase
      .from('discount_management')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating discount:', error)
      return false
    }

    // If discount status changed, apply or remove from products
    if (updates.is_active !== undefined) {
      if (updates.is_active) {
        // Get the full discount data to apply
        const { data: discount } = await supabase
          .from('discount_management')
          .select('*')
          .eq('id', id)
          .single()
        
        if (discount) {
          await this.applyDiscountToProducts(id, { ...discount, id })
        }
      } else {
        // Remove discount from products
        await this.removeDiscountFromProducts(id)
      }
    }

    return true
  },

  async deleteDiscount(id: string): Promise<boolean> {
    // First remove discount from products
    await this.removeDiscountFromProducts(id)

    const { error } = await supabase
      .from('discount_management')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting discount:', error)
      return false
    }

    return true
  },

  // Apply discount to products
  async applyDiscountToProducts(discountId: string, discount: Omit<DiscountManagement, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }): Promise<boolean> {
    try {
      console.log(`Applying discount "${discount.discount_name}" to products...`)

      // Build query to get affected products
      let query = supabase
        .from('products')
        .select('id, name, price, category_id, discount_amount, discount_type, is_discount_active')
        .eq('is_active', true)

      // Apply category filter if specified
      if (discount.applies_to_categories && discount.applies_to_categories.length > 0) {
        query = query.in('category_id', discount.applies_to_categories)
      }

      // Apply product filter if specified
      if (discount.applies_to_products && discount.applies_to_products.length > 0) {
        query = query.in('id', discount.applies_to_products)
      }

      const { data: products, error } = await query

      if (error) {
        console.error('Error fetching products for discount application:', error)
        return false
      }

      if (!products || products.length === 0) {
        console.log('No products found to apply discount to')
        return true
      }

      console.log(`Found ${products.length} products to apply discount to`)

      // Calculate new prices and update products
      const updates = products.map(product => {
        let newPrice = product.price
        let discountAmount = 0
        let discountType = 'percentage'

        switch (discount.discount_type) {
          case 'percentage':
            discountAmount = discount.discount_value
            discountType = 'percentage'
            newPrice = product.price * (1 - discount.discount_value / 100)
            break
          case 'fixed':
            discountAmount = discount.discount_value
            discountType = 'fixed'
            newPrice = Math.max(0, product.price - discount.discount_value)
            break
          case 'buy_one_get_one':
            // For BOGO, we'll apply a 50% discount
            discountAmount = 50
            discountType = 'percentage'
            newPrice = product.price * 0.5
            break
          case 'bulk':
            // For bulk discounts, apply the specified percentage
            discountAmount = discount.discount_value
            discountType = 'percentage'
            newPrice = product.price * (1 - discount.discount_value / 100)
            break
        }

        return {
          id: product.id,
          discount_amount: discountAmount,
          discount_type: discountType,
          discount_description: discount.discount_name,
          discount_expires_at: discount.end_date || null,
          is_discount_active: true,
          updated_at: new Date().toISOString()
        }
      })

      // Update products in batches
      const batchSize = 50
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        const { error: updateError } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'id' })

        if (updateError) {
          console.error(`Error updating batch ${Math.floor(i / batchSize) + 1}:`, updateError)
          return false
        }
      }

      // Update discount usage count
      await supabase
        .from('discount_management')
        .update({ 
          current_usage: products.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountId)

      console.log(`Successfully applied discount to ${products.length} products`)
      return true

    } catch (error) {
      console.error('Error applying discount to products:', error)
      return false
    }
  },

  // Remove discount from products
  async removeDiscountFromProducts(discountId: string): Promise<boolean> {
    try {
      console.log(`Removing discount ${discountId} from products...`)

      // Get the discount to find affected products
      const { data: discount } = await supabase
        .from('discount_management')
        .select('*')
        .eq('id', discountId)
        .single()

      if (!discount) {
        console.log('Discount not found')
        return true
      }

      // Build query to get affected products
      let query = supabase
        .from('products')
        .select('id, name, price, category_id, discount_description')
        .eq('is_active', true)
        .eq('discount_description', discount.discount_name)

      // Apply category filter if specified
      if (discount.applies_to_categories && discount.applies_to_categories.length > 0) {
        query = query.in('category_id', discount.applies_to_categories)
      }

      // Apply product filter if specified
      if (discount.applies_to_products && discount.applies_to_products.length > 0) {
        query = query.in('id', discount.applies_to_products)
      }

      const { data: products, error } = await query

      if (error) {
        console.error('Error fetching products for discount removal:', error)
        return false
      }

      if (!products || products.length === 0) {
        console.log('No products found to remove discount from')
        return true
      }

      console.log(`Found ${products.length} products to remove discount from`)

      // Remove discount from products
      const updates = products.map(product => ({
        id: product.id,
        discount_amount: 0,
        discount_type: 'percentage',
        discount_description: null,
        discount_expires_at: null,
        is_discount_active: false,
        updated_at: new Date().toISOString()
      }))

      // Update products in batches
      const batchSize = 50
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        const { error: updateError } = await supabase
          .from('products')
          .upsert(batch, { onConflict: 'id' })

        if (updateError) {
          console.error(`Error updating batch ${Math.floor(i / batchSize) + 1}:`, updateError)
          return false
        }
      }

      // Reset discount usage count
      await supabase
        .from('discount_management')
        .update({ 
          current_usage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountId)

      console.log(`Successfully removed discount from ${products.length} products`)
      return true

    } catch (error) {
      console.error('Error removing discount from products:', error)
      return false
    }
  },

  // Apply all active discounts to products
  async applyAllActiveDiscounts(branchId: string): Promise<boolean> {
    try {
      console.log('Applying all active discounts to products...')

      const { data: activeDiscounts, error } = await supabase
        .from('discount_management')
        .select('*')
        .eq('branch_id', branchId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching active discounts:', error)
        return false
      }

      if (!activeDiscounts || activeDiscounts.length === 0) {
        console.log('No active discounts found')
        return true
      }

      console.log(`Found ${activeDiscounts.length} active discounts to apply`)

      // Apply each discount
      for (const discount of activeDiscounts) {
        await this.applyDiscountToProducts(discount.id, { ...discount, id: discount.id })
      }

      console.log('Successfully applied all active discounts')
      return true

    } catch (error) {
      console.error('Error applying all active discounts:', error)
      return false
    }
  }
}

// Price Optimization Service
export const priceOptimizationService = {
  async getSuggestions(branchId: string): Promise<PriceOptimizationSuggestion[]> {
    const { data, error } = await supabase
      .from('price_optimization_suggestions')
      .select('*')
      .eq('branch_id', branchId)
      .eq('is_applied', false)
      .order('confidence_score', { ascending: false })

    if (error) {
      console.error('Error fetching price optimization suggestions:', error)
      return []
    }

    return data || []
  },

  async createSuggestion(suggestion: Omit<PriceOptimizationSuggestion, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('price_optimization_suggestions')
      .insert(suggestion)
      .select('id')
      .single()

    if (error) {
      console.error('Error creating price optimization suggestion:', error)
      return null
    }

    return data.id
  },

  async applySuggestion(suggestionId: string, userId: string): Promise<boolean> {
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
      .update({ price: suggestion.suggested_price })
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
  }
}

// Quick Actions Service
export const quickActionsService = {
  async logAction(action: Omit<QuickActionLog, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('quick_actions_log')
      .insert(action)
      .select('id')
      .single()

    if (error) {
      console.error('Error logging quick action:', error)
      return null
    }

    return data.id
  },

  async getActionLogs(branchId: string): Promise<QuickActionLog[]> {
    const { data, error } = await supabase
      .from('quick_actions_log')
      .select('*')
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching quick action logs:', error)
      return []
    }

    return data || []
  }
}

// Main Product Pricing Service that combines all functionality
export const productPricingCompleteService = {
  // Pricing Settings
  ...pricingSettingsService,
  
  // Pricing Rules
  ...pricingRulesService,
  
  // Price Analysis
  ...priceAnalysisService,
  
  // Pricing Reports
  ...pricingReportsService,
  
  // Import/Export
  ...importExportService,
  
  // Bulk Price Updates
  ...bulkPriceUpdateService,
  
  // Discount Management
  ...discountManagementService,
  
  // Price Optimization
  ...priceOptimizationService,
  
  // Quick Actions
  ...quickActionsService,

  // Additional utility methods
  // Pricing Overview
  async getPricingOverview(branchId: string): Promise<PricingOverview> {
    try {
      const [
        rulesCount,
        activeRulesCount,
        analysisCount,
        reportsCount
      ] = await Promise.all([
        this.getRulesCount(branchId),
        this.getActiveRulesCount(branchId),
        this.getAnalysisCount(branchId),
        this.getReportsCount(branchId)
      ])

      return {
        rulesCount: rulesCount || 0,
        activeRulesCount: activeRulesCount || 0,
        analysisCount: analysisCount || 0,
        reportsCount: reportsCount || 0
      }
    } catch (error) {
      console.error('Error getting pricing overview:', error)
      // Return default values if there's an error
      return {
        rulesCount: 0,
        activeRulesCount: 0,
        analysisCount: 0,
        reportsCount: 0
      }
    }
  },

  async getRulesCount(branchId: string): Promise<number> {
    const { count, error } = await supabase
      .from('product_pricing_rules')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId)

    if (error) {
      console.error('Error getting rules count:', error)
      return 0
    }

    return count || 0
  },

  async getActiveRulesCount(branchId: string): Promise<number> {
    const { count, error } = await supabase
      .from('product_pricing_rules')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId)
      .eq('is_active', true)

    if (error) {
      console.error('Error getting active rules count:', error)
      return 0
    }

    return count || 0
  },

  async getAnalysisCount(branchId: string): Promise<number> {
    const { count, error } = await supabase
      .from('price_analysis_data')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId)

    if (error) {
      console.error('Error getting analysis count:', error)
      return 0
    }

    return count || 0
  },

  async getReportsCount(branchId: string): Promise<number> {
    const { count, error } = await supabase
      .from('pricing_reports')
      .select('*', { count: 'exact', head: true })
      .eq('branch_id', branchId)

    if (error) {
      console.error('Error getting reports count:', error)
      return 0
    }

    return count || 0
  },

  async applyAllPricingRules(branchId: string): Promise<{ success: number; failed: number }> {
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .eq('branch_id', branchId)

    if (error) {
      console.error('Error fetching products for rule application:', error)
      return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    for (const product of products || []) {
      try {
        const result = await pricingRulesService.applyRulesToProduct(product.id)
        if (result) {
          success++
        } else {
          failed++
        }
      } catch (error) {
        failed++
        console.error(`Error applying rules to product ${product.id}:`, error)
      }
    }

    return { success, failed }
  }
} 
import { supabase } from './supabase'
import type { Database } from './supabase'

// Types based on database schema
export interface ProductPricingSettings {
  id: string
  business_id: string
  default_markup: number
  price_rounding: 'nearest' | 'up' | 'down'
  low_stock_threshold: number
  reorder_point: number
  enable_barcode_scanning: boolean
  auto_generate_sku: boolean
  require_barcode: boolean
  allow_negative_stock: boolean
  enable_auto_pricing: boolean
  enable_bulk_pricing: boolean
  enable_seasonal_pricing: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ProductPricingRule {
  id: string
  business_id: string
  name: string
  type: 'markup' | 'discount' | 'fixed'
  value: number
  description?: string
  is_active: boolean
  conditions?: Record<string, any>
  priority: number
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ProductCategoryPricingRule {
  id: string
  business_id: string
  category_id: string
  pricing_rule_id: string
  override_markup?: number
  override_price_rounding?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ProductPricingHistory {
  id: string
  business_id: string
  product_id: string
  old_price?: number
  new_price?: number
  price_change_reason?: string
  applied_rules: any[]
  created_at: string
  created_by?: string
}

export interface BulkPricingOperation {
  id: string
  business_id: string
  operation_type: 'markup_update' | 'discount_apply' | 'price_fix' | 'bulk_import'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  parameters: Record<string, any>
  affected_products_count: number
  results: Record<string, any>
  error_message?: string
  created_at: string
  completed_at?: string
  created_by?: string
}

export interface SeasonalPricingRule {
  id: string
  business_id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  markup_adjustment: number
  discount_percentage: number
  applicable_categories: any[]
  applicable_products: any[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

// Service class for product pricing operations
export class ProductPricingService {
  private businessId: string

  constructor(businessId: string) {
    this.businessId = businessId
  }

  // ===== PRODUCT PRICING SETTINGS =====

  async getPricingSettings(): Promise<{ data: ProductPricingSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('product_pricing_settings')
        .select('*')
        .eq('business_id', this.businessId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pricing settings:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updatePricingSettings(settings: Partial<ProductPricingSettings>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('product_pricing_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating pricing settings:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createPricingSettings(settings: Omit<ProductPricingSettings, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('product_pricing_settings')
        .insert({
          ...settings,
          business_id: this.businessId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error creating pricing settings:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ===== PRODUCT PRICING RULES =====

  async getPricingRules(): Promise<{ data: ProductPricingRule[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('product_pricing_rules')
        .select('*')
        .eq('business_id', this.businessId)
        .order('priority', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createPricingRule(rule: Omit<ProductPricingRule, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: ProductPricingRule; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('product_pricing_rules')
        .insert({
          ...rule,
          business_id: this.businessId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updatePricingRule(id: string, updates: Partial<ProductPricingRule>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('product_pricing_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deletePricingRule(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('product_pricing_rules')
        .delete()
        .eq('id', id)
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async togglePricingRuleStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updatePricingRule(id, { is_active: isActive })
  }

  // ===== BULK PRICING OPERATIONS =====

  async createBulkPricingOperation(operation: Omit<BulkPricingOperation, 'id' | 'business_id' | 'created_at'>): Promise<{ success: boolean; data?: BulkPricingOperation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('bulk_pricing_operations')
        .insert({
          ...operation,
          business_id: this.businessId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating bulk pricing operation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getBulkPricingOperations(): Promise<{ data: BulkPricingOperation[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bulk_pricing_operations')
        .select('*')
        .eq('business_id', this.businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching bulk pricing operations:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateBulkPricingOperation(id: string, updates: Partial<BulkPricingOperation>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('bulk_pricing_operations')
        .update(updates)
        .eq('id', id)
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating bulk pricing operation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ===== PRICING HISTORY =====

  async getPricingHistory(productId?: string, limit = 50): Promise<{ data: ProductPricingHistory[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('product_pricing_history')
        .select('*')
        .eq('business_id', this.businessId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (productId) {
        query = query.eq('product_id', productId)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching pricing history:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async addPricingHistoryEntry(entry: Omit<ProductPricingHistory, 'id' | 'business_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('product_pricing_history')
        .insert({
          ...entry,
          business_id: this.businessId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error adding pricing history entry:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ===== SEASONAL PRICING RULES =====

  async getSeasonalPricingRules(): Promise<{ data: SeasonalPricingRule[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('seasonal_pricing_rules')
        .select('*')
        .eq('business_id', this.businessId)
        .order('start_date', { ascending: true })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching seasonal pricing rules:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createSeasonalPricingRule(rule: Omit<SeasonalPricingRule, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: SeasonalPricingRule; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('seasonal_pricing_rules')
        .insert({
          ...rule,
          business_id: this.businessId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating seasonal pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async updateSeasonalPricingRule(id: string, updates: Partial<SeasonalPricingRule>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('seasonal_pricing_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating seasonal pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteSeasonalPricingRule(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('seasonal_pricing_rules')
        .delete()
        .eq('id', id)
        .eq('business_id', this.businessId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting seasonal pricing rule:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // ===== UTILITY FUNCTIONS =====

  async applyPricingRulesToProduct(productId: string, basePrice: number): Promise<{ finalPrice: number; appliedRules: string[] }> {
    try {
      // Get active pricing rules
      const { data: rules } = await this.getPricingRules()
      if (!rules) return { finalPrice: basePrice, appliedRules: [] }

      let finalPrice = basePrice
      const appliedRules: string[] = []

      // Apply rules in priority order
      const activeRules = rules.filter(rule => rule.is_active).sort((a, b) => a.priority - b.priority)

      for (const rule of activeRules) {
        switch (rule.type) {
          case 'markup':
            finalPrice = basePrice * (1 + rule.value / 100)
            appliedRules.push(`${rule.name}: +${rule.value}% markup`)
            break
          case 'discount':
            finalPrice = finalPrice * (1 - rule.value / 100)
            appliedRules.push(`${rule.name}: -${rule.value}% discount`)
            break
          case 'fixed':
            finalPrice = rule.value
            appliedRules.push(`${rule.name}: fixed price R${rule.value}`)
            break
        }
      }

      // Get pricing settings for rounding
      const { data: settings } = await this.getPricingSettings()
      if (settings) {
        switch (settings.price_rounding) {
          case 'up':
            finalPrice = Math.ceil(finalPrice)
            break
          case 'down':
            finalPrice = Math.floor(finalPrice)
            break
          case 'nearest':
          default:
            finalPrice = Math.round(finalPrice)
            break
        }
      }

      return { finalPrice, appliedRules }
    } catch (error) {
      console.error('Error applying pricing rules:', error)
      return { finalPrice: basePrice, appliedRules: [] }
    }
  }

  async exportPricingData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const [settings, rules, seasonalRules] = await Promise.all([
        this.getPricingSettings(),
        this.getPricingRules(),
        this.getSeasonalPricingRules()
      ])

      const exportData = {
        settings: settings.data,
        rules: rules.data,
        seasonalRules: seasonalRules.data,
        exportedAt: new Date().toISOString()
      }

      return { success: true, data: exportData }
    } catch (error) {
      console.error('Error exporting pricing data:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async importPricingData(importData: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate import data structure
      if (!importData.settings || !importData.rules) {
        throw new Error('Invalid import data structure')
      }

      // Import settings
      const { data: existingSettings } = await this.getPricingSettings()
      if (existingSettings) {
        await this.updatePricingSettings(importData.settings)
      } else {
        await this.createPricingSettings(importData.settings)
      }

      // Import rules (delete existing and create new)
      const { data: existingRules } = await this.getPricingRules()
      if (existingRules) {
        for (const rule of existingRules) {
          await this.deletePricingRule(rule.id)
        }
      }

      for (const rule of importData.rules) {
        await this.createPricingRule(rule)
      }

      // Import seasonal rules if present
      if (importData.seasonalRules) {
        const { data: existingSeasonalRules } = await this.getSeasonalPricingRules()
        if (existingSeasonalRules) {
          for (const rule of existingSeasonalRules) {
            await this.deleteSeasonalPricingRule(rule.id)
          }
        }

        for (const rule of importData.seasonalRules) {
          await this.createSeasonalPricingRule(rule)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error importing pricing data:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export singleton instance
export const productPricingService = new ProductPricingService('default') 
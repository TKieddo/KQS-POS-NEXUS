import { supabase } from './supabase'

export interface SalesTaxData {
  // Tax Configuration
  tax_enabled: boolean
  default_tax_rate: string
  tax_name: string
  tax_registration_number: string
  
  // Tax Display
  show_tax_on_receipts: boolean
  show_tax_breakdown: boolean
  tax_inclusive_pricing: boolean
  
  // Tax Exemptions
  tax_exempt_categories: string[]
  tax_exempt_customer_types: string[]
  
  // Compliance
  auto_calculate_tax: boolean
  tax_rounding_method: string
  tax_decimal_places: string
  
  // Reporting
  tax_reporting_frequency: string
  tax_reporting_email: string
  tax_reporting_auto: boolean
}

class SalesTaxService {
  private static instance: SalesTaxService
  private settings: SalesTaxData | null = null
  private loadingPromise: Promise<SalesTaxData | null> | null = null

  private constructor() {}

  public static getInstance(): SalesTaxService {
    if (!SalesTaxService.instance) {
      SalesTaxService.instance = new SalesTaxService()
    }
    return SalesTaxService.instance
  }

  /**
   * Load sales tax settings from the database
   */
  async loadSalesTaxSettings(): Promise<SalesTaxData | null> {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    if (this.settings) {
      return this.settings
    }

    this.loadingPromise = this.fetchSalesTaxSettingsFromDatabase()
    try {
      this.settings = await this.loadingPromise
      return this.settings
    } finally {
      this.loadingPromise = null
    }
  }

  /**
   * Fetch sales tax settings from the database
   */
  private async fetchSalesTaxSettingsFromDatabase(): Promise<SalesTaxData | null> {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'tax_enabled',
          'default_tax_rate',
          'tax_name',
          'tax_registration_number',
          'show_tax_on_receipts',
          'show_tax_breakdown',
          'tax_inclusive_pricing',
          'tax_exempt_categories',
          'tax_exempt_customer_types',
          'auto_calculate_tax',
          'tax_rounding_method',
          'tax_decimal_places',
          'tax_reporting_frequency',
          'tax_reporting_email',
          'tax_reporting_auto'
        ])

      if (error) {
        console.error('Error loading sales tax settings:', error)
        return null
      }

      // Convert database settings to SalesTaxData format
      const settingsMap = new Map(data?.map(item => [item.setting_key, item.setting_value]) || [])
      
      return {
        tax_enabled: settingsMap.get('tax_enabled') === 'true',
        default_tax_rate: settingsMap.get('default_tax_rate') || '15.00',
        tax_name: settingsMap.get('tax_name') || 'VAT',
        tax_registration_number: settingsMap.get('tax_registration_number') || '',
        show_tax_on_receipts: settingsMap.get('show_tax_on_receipts') === 'true',
        show_tax_breakdown: settingsMap.get('show_tax_breakdown') === 'true',
        tax_inclusive_pricing: settingsMap.get('tax_inclusive_pricing') === 'true',
        tax_exempt_categories: this.parseJsonArray(settingsMap.get('tax_exempt_categories')),
        tax_exempt_customer_types: this.parseJsonArray(settingsMap.get('tax_exempt_customer_types')),
        auto_calculate_tax: settingsMap.get('auto_calculate_tax') === 'true',
        tax_rounding_method: settingsMap.get('tax_rounding_method') || 'round',
        tax_decimal_places: settingsMap.get('tax_decimal_places') || '2',
        tax_reporting_frequency: settingsMap.get('tax_reporting_frequency') || 'monthly',
        tax_reporting_email: settingsMap.get('tax_reporting_email') || '',
        tax_reporting_auto: settingsMap.get('tax_reporting_auto') === 'true'
      }
    } catch (error) {
      console.error('Error fetching sales tax settings:', error)
      return null
    }
  }

  /**
   * Parse JSON array from database
   */
  private parseJsonArray(value: string | undefined): string[] {
    if (!value) return []
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  /**
   * Update sales tax settings
   */
  async updateSalesTaxSettings(data: SalesTaxData): Promise<boolean> {
    try {
      const updates = [
        { 
          setting_key: 'tax_enabled', 
          setting_value: data.tax_enabled.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Enable Tax Calculation',
          description: 'Enable automatic tax calculation on sales',
          is_required: false,
          default_value: 'true',
          sort_order: 1
        },
        { 
          setting_key: 'default_tax_rate', 
          setting_value: data.default_tax_rate,
          setting_type: 'number',
          category: 'tax',
          display_name: 'Default Tax Rate',
          description: 'Default tax rate applied to products',
          is_required: false,
          default_value: '15.00',
          sort_order: 2
        },
        { 
          setting_key: 'tax_name', 
          setting_value: data.tax_name,
          setting_type: 'string',
          category: 'tax',
          display_name: 'Tax Name',
          description: 'Name of the tax (appears on receipts)',
          is_required: false,
          default_value: 'VAT',
          sort_order: 3
        },
        { 
          setting_key: 'tax_registration_number', 
          setting_value: data.tax_registration_number,
          setting_type: 'string',
          category: 'tax',
          display_name: 'Tax Registration Number',
          description: 'Your business tax registration number',
          is_required: false,
          default_value: '',
          sort_order: 4
        },
        { 
          setting_key: 'show_tax_on_receipts', 
          setting_value: data.show_tax_on_receipts.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Show Tax on Receipts',
          description: 'Display tax amount on customer receipts',
          is_required: false,
          default_value: 'true',
          sort_order: 5
        },
        { 
          setting_key: 'show_tax_breakdown', 
          setting_value: data.show_tax_breakdown.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Show Tax Breakdown',
          description: 'Show detailed tax breakdown on receipts',
          is_required: false,
          default_value: 'true',
          sort_order: 6
        },
        { 
          setting_key: 'tax_inclusive_pricing', 
          setting_value: data.tax_inclusive_pricing.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Tax Inclusive Pricing',
          description: 'Product prices include tax (vs. tax added separately)',
          is_required: false,
          default_value: 'false',
          sort_order: 7
        },
        { 
          setting_key: 'tax_exempt_categories', 
          setting_value: JSON.stringify(data.tax_exempt_categories),
          setting_type: 'json',
          category: 'tax',
          display_name: 'Tax Exempt Categories',
          description: 'Product categories that are exempt from tax',
          is_required: false,
          default_value: '[]',
          sort_order: 8
        },
        { 
          setting_key: 'tax_exempt_customer_types', 
          setting_value: JSON.stringify(data.tax_exempt_customer_types),
          setting_type: 'json',
          category: 'tax',
          display_name: 'Tax Exempt Customer Types',
          description: 'Customer types that are exempt from tax',
          is_required: false,
          default_value: '[]',
          sort_order: 9
        },
        { 
          setting_key: 'auto_calculate_tax', 
          setting_value: data.auto_calculate_tax.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Auto Calculate Tax',
          description: 'Automatically calculate tax on all transactions',
          is_required: false,
          default_value: 'true',
          sort_order: 10
        },
        { 
          setting_key: 'tax_rounding_method', 
          setting_value: data.tax_rounding_method,
          setting_type: 'string',
          category: 'tax',
          display_name: 'Tax Rounding Method',
          description: 'Method for rounding tax calculations',
          is_required: false,
          default_value: 'round',
          sort_order: 11
        },
        { 
          setting_key: 'tax_decimal_places', 
          setting_value: data.tax_decimal_places,
          setting_type: 'number',
          category: 'tax',
          display_name: 'Tax Decimal Places',
          description: 'Number of decimal places for tax amounts',
          is_required: false,
          default_value: '2',
          sort_order: 12
        },
        { 
          setting_key: 'tax_reporting_frequency', 
          setting_value: data.tax_reporting_frequency,
          setting_type: 'string',
          category: 'tax',
          display_name: 'Tax Reporting Frequency',
          description: 'How often to generate tax reports',
          is_required: false,
          default_value: 'monthly',
          sort_order: 13
        },
        { 
          setting_key: 'tax_reporting_email', 
          setting_value: data.tax_reporting_email,
          setting_type: 'string',
          category: 'tax',
          display_name: 'Tax Reporting Email',
          description: 'Email address for tax reports',
          is_required: false,
          default_value: '',
          sort_order: 14
        },
        { 
          setting_key: 'tax_reporting_auto', 
          setting_value: data.tax_reporting_auto.toString(),
          setting_type: 'boolean',
          category: 'tax',
          display_name: 'Auto Tax Reporting',
          description: 'Automatically generate and send tax reports',
          is_required: false,
          default_value: 'false',
          sort_order: 15
        }
      ]

      // Use upsert to insert or update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('global_settings')
          .upsert({
            setting_key: update.setting_key,
            setting_value: update.setting_value,
            setting_type: update.setting_type,
            category: update.category,
            display_name: update.display_name,
            description: update.description,
            is_required: update.is_required,
            default_value: update.default_value,
            sort_order: update.sort_order,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_key'
          })

        if (error) {
          console.error(`Error upserting ${update.setting_key}:`, error)
          return false
        }
      }

      // Refresh cached settings
      this.settings = null
      this.loadingPromise = null

      return true
    } catch (error) {
      console.error('Error updating sales tax settings:', error)
      return false
    }
  }

  /**
   * Get a specific sales tax setting
   */
  async getSalesTaxSetting<T>(key: keyof SalesTaxData, defaultValue?: T): Promise<T | undefined> {
    const settings = await this.loadSalesTaxSettings()
    return (settings?.[key] as T) ?? defaultValue
  }

  /**
   * Refresh sales tax settings from database
   */
  async refreshSalesTaxSettings(): Promise<SalesTaxData | null> {
    this.settings = null
    this.loadingPromise = null
    return this.loadSalesTaxSettings()
  }

  /**
   * Calculate tax amount
   */
  async calculateTax(amount: number, taxRate?: number): Promise<number> {
    const rate = taxRate || parseFloat(await this.getSalesTaxSetting('default_tax_rate', '15.00') || '15.00')
    const decimalPlaces = parseInt(await this.getSalesTaxSetting('tax_decimal_places', '2') || '2')
    const roundingMethod = await this.getSalesTaxSetting('tax_rounding_method', 'round') || 'round'
    
    const taxAmount = (amount * rate) / 100
    
    switch (roundingMethod) {
      case 'floor':
        return Math.floor(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
      case 'ceil':
        return Math.ceil(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
      default:
        return Math.round(taxAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
    }
  }

  /**
   * Check if tax is enabled
   */
  async isTaxEnabled(): Promise<boolean> {
    return await this.getSalesTaxSetting('tax_enabled', false) || false
  }

  /**
   * Get tax rate
   */
  async getTaxRate(): Promise<number> {
    return parseFloat(await this.getSalesTaxSetting('default_tax_rate', '15.00') || '15.00')
  }
}

const salesTaxService = SalesTaxService.getInstance()

// Export functions for easy use
export const loadSalesTaxSettings = () => salesTaxService.loadSalesTaxSettings()
export const updateSalesTaxSettings = (data: SalesTaxData) => salesTaxService.updateSalesTaxSettings(data)
export const getSalesTaxSetting = <T>(key: keyof SalesTaxData, defaultValue?: T) => 
  salesTaxService.getSalesTaxSetting(key, defaultValue)
export const calculateTax = (amount: number, taxRate?: number) => salesTaxService.calculateTax(amount, taxRate)
export const isTaxEnabled = () => salesTaxService.isTaxEnabled()
export const getTaxRate = () => salesTaxService.getTaxRate()
export const refreshSalesTaxSettings = () => salesTaxService.refreshSalesTaxSettings() 
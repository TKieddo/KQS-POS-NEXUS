import { supabase } from './supabase'

export interface PaymentOptionsData {
  // Cash payments
  cash_enabled: boolean
  cash_change_limit: string
  
  // Card payments
  card_enabled: boolean
  card_processor: string
  card_api_key: string
  card_secret_key: string
  
  // Mobile payments - Individual providers
  mpesa_enabled: boolean
  mpesa_phone: string
  ecocash_enabled: boolean
  ecocash_phone: string
  airtel_money_enabled: boolean
  airtel_money_phone: string
  orange_money_enabled: boolean
  orange_money_phone: string
  
  // EFT/Bank transfers
  eft_enabled: boolean
  eft_bank_name: string
  eft_account_number: string
  eft_reference_prefix: string
  
  // Lay-bye
  laybye_enabled: boolean
  laybye_deposit_percentage: string
  laybye_min_deposit_amount: string
  laybye_max_duration_days: string
  
  // Credit accounts
  credit_accounts_enabled: boolean
  credit_limit_default: string
  credit_interest_rate: string
}

class PaymentOptionsService {
  private static instance: PaymentOptionsService
  private settings: PaymentOptionsData | null = null
  private loadingPromise: Promise<PaymentOptionsData | null> | null = null

  private constructor() {}

  public static getInstance(): PaymentOptionsService {
    if (!PaymentOptionsService.instance) {
      PaymentOptionsService.instance = new PaymentOptionsService()
    }
    return PaymentOptionsService.instance
  }

  /**
   * Load payment options settings from the database
   */
  async loadPaymentOptions(): Promise<PaymentOptionsData | null> {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    if (this.settings) {
      return this.settings
    }

    this.loadingPromise = this.fetchPaymentOptionsFromDatabase()
    try {
      this.settings = await this.loadingPromise
      return this.settings
    } finally {
      this.loadingPromise = null
    }
  }

  /**
   * Fetch payment options from the database
   */
  private async fetchPaymentOptionsFromDatabase(): Promise<PaymentOptionsData | null> {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'cash_enabled',
          'cash_change_limit',
          'card_enabled',
          'card_processor',
          'card_api_key',
          'card_secret_key',
          'mpesa_enabled',
          'mpesa_phone',
          'ecocash_enabled',
          'ecocash_phone',
          'airtel_money_enabled',
          'airtel_money_phone',
          'orange_money_enabled',
          'orange_money_phone',
          'eft_enabled',
          'eft_bank_name',
          'eft_account_number',
          'eft_reference_prefix',
          'laybye_enabled',
          'laybye_deposit_percentage',
          'laybye_max_duration_days',
          'credit_accounts_enabled',
          'credit_limit_default',
          'credit_interest_rate'
        ])

      if (error) {
        console.error('Error loading payment options:', error)
        return null
      }

      // Convert database settings to PaymentOptionsData format
      const settingsMap = new Map(data?.map(item => [item.setting_key, item.setting_value]) || [])
      
      return {
        cash_enabled: settingsMap.get('cash_enabled') === 'true',
        cash_change_limit: settingsMap.get('cash_change_limit') || '1000.00',
        card_enabled: settingsMap.get('card_enabled') === 'true',
        card_processor: settingsMap.get('card_processor') || '',
        card_api_key: settingsMap.get('card_api_key') || '',
        card_secret_key: settingsMap.get('card_secret_key') || '',
        mpesa_enabled: settingsMap.get('mpesa_enabled') === 'true',
        mpesa_phone: settingsMap.get('mpesa_phone') || '',
        ecocash_enabled: settingsMap.get('ecocash_enabled') === 'true',
        ecocash_phone: settingsMap.get('ecocash_phone') || '',
        airtel_money_enabled: settingsMap.get('airtel_money_enabled') === 'true',
        airtel_money_phone: settingsMap.get('airtel_money_phone') || '',
        orange_money_enabled: settingsMap.get('orange_money_enabled') === 'true',
        orange_money_phone: settingsMap.get('orange_money_phone') || '',
        eft_enabled: settingsMap.get('eft_enabled') === 'true',
        eft_bank_name: settingsMap.get('eft_bank_name') || '',
        eft_account_number: settingsMap.get('eft_account_number') || '',
        eft_reference_prefix: settingsMap.get('eft_reference_prefix') || 'KQS',
        laybye_enabled: settingsMap.get('laybye_enabled') === 'true',
        laybye_deposit_percentage: settingsMap.get('laybye_deposit_percentage') || '20.00',
        laybye_min_deposit_amount: settingsMap.get('laybye_min_deposit_amount') || '100.00',
        laybye_max_duration_days: settingsMap.get('laybye_max_duration_days') || '30',
        credit_accounts_enabled: settingsMap.get('credit_accounts_enabled') === 'true',
        credit_limit_default: settingsMap.get('credit_limit_default') || '1000.00',
        credit_interest_rate: settingsMap.get('credit_interest_rate') || '2.50'
      }
    } catch (error) {
      console.error('Error fetching payment options:', error)
      return null
    }
  }

  /**
   * Update payment options settings
   */
  async updatePaymentOptions(data: PaymentOptionsData): Promise<boolean> {
    try {
      // Defaults to satisfy NOT NULL constraints for first-time inserts
      const defaults: Record<string, {
        type: 'boolean' | 'number' | 'string' | 'json'
        display: string
        description: string
        defaultValue: string
        sort: number
      }> = {
        cash_enabled: { type: 'boolean', display: 'Enable Cash Payments', description: 'Allow customers to pay with cash', defaultValue: 'true', sort: 1 },
        cash_change_limit: { type: 'number', display: 'Cash Change Limit', description: 'Maximum amount of change to keep in till', defaultValue: '1000.00', sort: 2 },
        card_enabled: { type: 'boolean', display: 'Enable Card Payments', description: 'Accept credit and debit card payments', defaultValue: 'false', sort: 3 },
        card_processor: { type: 'string', display: 'Card Processor', description: 'Payment processor for card transactions', defaultValue: '', sort: 4 },
        card_api_key: { type: 'string', display: 'Card API Key', description: 'API key from your payment processor', defaultValue: '', sort: 5 },
        card_secret_key: { type: 'string', display: 'Card Secret Key', description: 'Secret key from your payment processor', defaultValue: '', sort: 6 },
        mpesa_enabled: { type: 'boolean', display: 'Enable M-Pesa', description: 'Accept M-Pesa mobile money payments', defaultValue: 'false', sort: 7 },
        mpesa_phone: { type: 'string', display: 'M-Pesa Phone Number', description: 'Phone number for M-Pesa transactions', defaultValue: '', sort: 8 },
        ecocash_enabled: { type: 'boolean', display: 'Enable EcoCash', description: 'Accept EcoCash mobile money payments', defaultValue: 'false', sort: 9 },
        ecocash_phone: { type: 'string', display: 'EcoCash Phone Number', description: 'Phone number for EcoCash transactions', defaultValue: '', sort: 10 },
        airtel_money_enabled: { type: 'boolean', display: 'Enable Airtel Money', description: 'Accept Airtel Money mobile money payments', defaultValue: 'false', sort: 11 },
        airtel_money_phone: { type: 'string', display: 'Airtel Money Phone Number', description: 'Phone number for Airtel Money transactions', defaultValue: '', sort: 12 },
        orange_money_enabled: { type: 'boolean', display: 'Enable Orange Money', description: 'Accept Orange Money mobile money payments', defaultValue: 'false', sort: 13 },
        orange_money_phone: { type: 'string', display: 'Orange Money Phone Number', description: 'Phone number for Orange Money transactions', defaultValue: '', sort: 14 },
        eft_enabled: { type: 'boolean', display: 'Enable EFT Payments', description: 'Accept electronic fund transfers', defaultValue: 'false', sort: 15 },
        eft_bank_name: { type: 'string', display: 'EFT Bank Name', description: 'Bank name for EFT payments', defaultValue: '', sort: 16 },
        eft_account_number: { type: 'string', display: 'EFT Account Number', description: 'Bank account number for EFT payments', defaultValue: '', sort: 17 },
        eft_reference_prefix: { type: 'string', display: 'EFT Reference Prefix', description: 'Prefix for payment references', defaultValue: 'KQS', sort: 18 },
        laybye_enabled: { type: 'boolean', display: 'Enable Lay-bye', description: 'Allow customers to pay in installments', defaultValue: 'false', sort: 19 },
        laybye_deposit_percentage: { type: 'number', display: 'Lay-bye Deposit Percentage', description: 'Minimum deposit percentage required for lay-bye', defaultValue: '20.00', sort: 20 },
        laybye_min_deposit_amount: { type: 'number', display: 'Lay-bye Min Deposit Amount', description: 'Minimum deposit amount required for lay-bye', defaultValue: '100.00', sort: 21 },
        laybye_max_duration_days: { type: 'number', display: 'Lay-bye Max Duration', description: 'Maximum lay-bye duration in days', defaultValue: '30', sort: 22 },
        credit_accounts_enabled: { type: 'boolean', display: 'Enable Credit Accounts', description: 'Allow customers to have credit accounts', defaultValue: 'false', sort: 23 },
        credit_limit_default: { type: 'number', display: 'Default Credit Limit', description: 'Default credit limit for new accounts', defaultValue: '1000.00', sort: 24 },
        credit_interest_rate: { type: 'number', display: 'Credit Interest Rate', description: 'Monthly interest rate on outstanding balances', defaultValue: '2.50', sort: 25 }
      }

      const source = [
        ['cash_enabled', data.cash_enabled.toString()],
        ['cash_change_limit', data.cash_change_limit],
        ['card_enabled', data.card_enabled.toString()],
        ['card_processor', data.card_processor],
        ['card_api_key', data.card_api_key],
        ['card_secret_key', data.card_secret_key],
        ['mpesa_enabled', data.mpesa_enabled.toString()],
        ['mpesa_phone', data.mpesa_phone],
        ['ecocash_enabled', data.ecocash_enabled.toString()],
        ['ecocash_phone', data.ecocash_phone],
        ['airtel_money_enabled', data.airtel_money_enabled.toString()],
        ['airtel_money_phone', data.airtel_money_phone],
        ['orange_money_enabled', data.orange_money_enabled.toString()],
        ['orange_money_phone', data.orange_money_phone],
        ['eft_enabled', data.eft_enabled.toString()],
        ['eft_bank_name', data.eft_bank_name],
        ['eft_account_number', data.eft_account_number],
        ['eft_reference_prefix', data.eft_reference_prefix],
        ['laybye_enabled', data.laybye_enabled.toString()],
        ['laybye_deposit_percentage', data.laybye_deposit_percentage],
        ['laybye_min_deposit_amount', data.laybye_min_deposit_amount],
        ['laybye_max_duration_days', data.laybye_max_duration_days],
        ['credit_accounts_enabled', data.credit_accounts_enabled.toString()],
        ['credit_limit_default', data.credit_limit_default],
        ['credit_interest_rate', data.credit_interest_rate]
      ] as const

      const rows = source.map(([key, value]) => {
        const def = defaults[key]
        return {
          setting_key: key,
          setting_value: value,
          setting_type: def.type,
          category: 'payment',
          display_name: def.display,
          description: def.description,
          is_required: false,
          default_value: def.defaultValue,
          sort_order: def.sort,
          updated_at: new Date().toISOString()
        }
      })

      const { error } = await supabase
        .from('global_settings')
        .upsert(rows, { onConflict: 'setting_key' })

      if (error) {
        console.error('Error upserting payment options:', error)
        return false
      }

      // Refresh cached settings
      this.settings = null
      this.loadingPromise = null
      return true
    } catch (error) {
      console.error('Error updating payment options:', error)
      return false
    }
  }

  /**
   * Get a specific payment option setting
   */
  async getPaymentOption<T>(key: keyof PaymentOptionsData, defaultValue?: T): Promise<T | undefined> {
    const settings = await this.loadPaymentOptions()
    return (settings?.[key] as T) ?? defaultValue
  }

  /**
   * Refresh payment options from database
   */
  async refreshPaymentOptions(): Promise<PaymentOptionsData | null> {
    this.settings = null
    this.loadingPromise = null
    return this.loadPaymentOptions()
  }

  /**
   * Get enabled payment methods
   */
  async getEnabledPaymentMethods(): Promise<string[]> {
    const methods: string[] = []
    
    if (await this.getPaymentOption('cash_enabled', false)) {
      methods.push('cash')
    }
    if (await this.getPaymentOption('card_enabled', false)) {
      methods.push('card')
    }
    if (await this.getPaymentOption('mpesa_enabled', false)) {
      methods.push('mpesa')
    }
    if (await this.getPaymentOption('ecocash_enabled', false)) {
      methods.push('ecocash')
    }
    if (await this.getPaymentOption('airtel_money_enabled', false)) {
      methods.push('airtel_money')
    }
    if (await this.getPaymentOption('orange_money_enabled', false)) {
      methods.push('orange_money')
    }
    if (await this.getPaymentOption('eft_enabled', false)) {
      methods.push('eft')
    }
    if (await this.getPaymentOption('laybye_enabled', false)) {
      methods.push('laybye')
    }
    if (await this.getPaymentOption('credit_accounts_enabled', false)) {
      methods.push('credit')
    }

    return methods
  }

  /**
   * Check if a specific payment method is enabled
   */
  async isPaymentMethodEnabled(method: string): Promise<boolean> {
    const enabledMethods = await this.getEnabledPaymentMethods()
    return enabledMethods.includes(method)
  }
}

const paymentOptionsService = PaymentOptionsService.getInstance()

// Export functions for easy use
export const loadPaymentOptions = () => paymentOptionsService.loadPaymentOptions()
export const updatePaymentOptions = (data: PaymentOptionsData) => paymentOptionsService.updatePaymentOptions(data)
export const getPaymentOption = <T>(key: keyof PaymentOptionsData, defaultValue?: T) => 
  paymentOptionsService.getPaymentOption(key, defaultValue)
export const getEnabledPaymentMethods = () => paymentOptionsService.getEnabledPaymentMethods()
export const isPaymentMethodEnabled = (method: string) => paymentOptionsService.isPaymentMethodEnabled(method)
export const refreshPaymentOptions = () => paymentOptionsService.refreshPaymentOptions() 
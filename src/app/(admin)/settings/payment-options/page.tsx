'use client'
import React, { useState, useEffect } from 'react'
import { CreditCard } from 'lucide-react'
import { SettingsPageLayout } from '@/features/settings/components/SettingsPageLayout'
import { PaymentOptionsForm } from '@/features/settings/components/payment-options/PaymentOptionsForm'
import { loadPaymentOptions, updatePaymentOptions, type PaymentOptionsData } from '@/lib/payment-options-service'

const PaymentOptionsSettingsPage = () => {
  const [data, setData] = useState<PaymentOptionsData>({
    cash_enabled: false,
    cash_change_limit: '1000.00',
    card_enabled: false,
    card_processor: '',
    card_api_key: '',
    card_secret_key: '',
    mpesa_enabled: false,
    mpesa_phone: '',
    ecocash_enabled: false,
    ecocash_phone: '',
    airtel_money_enabled: false,
    airtel_money_phone: '',
    orange_money_enabled: false,
    orange_money_phone: '',
    eft_enabled: false,
    eft_bank_name: '',
    eft_account_number: '',
    eft_reference_prefix: 'KQS',
    laybye_enabled: false,
    laybye_deposit_percentage: '20.00',
    laybye_min_deposit_amount: '100.00',
    laybye_max_duration_days: '30',
    credit_accounts_enabled: false,
    credit_limit_default: '1000.00',
    credit_interest_rate: '2.50'
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<PaymentOptionsData | null>(null)

  // Load payment options on component mount
  useEffect(() => {
    loadPaymentOptionsData()
  }, [])

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasDataChanged = JSON.stringify(data) !== JSON.stringify(originalData)
      setHasChanges(hasDataChanged)
    }
  }, [data, originalData])

  const loadPaymentOptionsData = async () => {
    try {
      setIsLoading(true)
      const paymentOptions = await loadPaymentOptions()
      if (paymentOptions) {
        setData(paymentOptions)
        setOriginalData(paymentOptions)
      }
    } catch (error) {
      console.error('Error loading payment options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataChange = (newData: PaymentOptionsData) => {
    setData(newData)
    // Clear any previous errors when data changes
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate cash change limit
    if (data.cash_enabled && data.cash_change_limit) {
      const changeLimit = parseFloat(data.cash_change_limit)
      if (isNaN(changeLimit) || changeLimit < 0) {
        newErrors.cash_change_limit = 'Change limit must be a positive number'
      }
    }

    // Validate card processor if card payments are enabled
    if (data.card_enabled && !data.card_processor.trim()) {
      newErrors.card_processor = 'Card processor is required when card payments are enabled'
    }

    // Validate mobile money phone numbers if enabled
    if (data.mpesa_enabled && !data.mpesa_phone.trim()) {
      newErrors.mpesa_phone = 'M-Pesa phone number is required when M-Pesa is enabled'
    }

    if (data.ecocash_enabled && !data.ecocash_phone.trim()) {
      newErrors.ecocash_phone = 'EcoCash phone number is required when EcoCash is enabled'
    }

    if (data.airtel_money_enabled && !data.airtel_money_phone.trim()) {
      newErrors.airtel_money_phone = 'Airtel Money phone number is required when Airtel Money is enabled'
    }

    if (data.orange_money_enabled && !data.orange_money_phone.trim()) {
      newErrors.orange_money_phone = 'Orange Money phone number is required when Orange Money is enabled'
    }

    // Validate EFT bank name if EFT is enabled
    if (data.eft_enabled && !data.eft_bank_name.trim()) {
      newErrors.eft_bank_name = 'Bank name is required when EFT payments are enabled'
    }

    // Validate EFT account number if EFT is enabled
    if (data.eft_enabled && !data.eft_account_number.trim()) {
      newErrors.eft_account_number = 'Account number is required when EFT payments are enabled'
    }

    // Validate laybye deposit percentage
    if (data.laybye_enabled && data.laybye_deposit_percentage) {
      const depositPercentage = parseFloat(data.laybye_deposit_percentage)
      if (isNaN(depositPercentage) || depositPercentage < 0 || depositPercentage > 100) {
        newErrors.laybye_deposit_percentage = 'Deposit percentage must be between 0 and 100'
      }
    }

    // Validate laybye minimum deposit amount
    if (data.laybye_enabled && data.laybye_min_deposit_amount) {
      const minDepositAmount = parseFloat(data.laybye_min_deposit_amount)
      if (isNaN(minDepositAmount) || minDepositAmount < 0) {
        newErrors.laybye_min_deposit_amount = 'Minimum deposit amount must be a positive number'
      }
    }

    // Validate laybye max duration
    if (data.laybye_enabled && data.laybye_max_duration_days) {
      const maxDuration = parseInt(data.laybye_max_duration_days)
      if (isNaN(maxDuration) || maxDuration < 1 || maxDuration > 365) {
        newErrors.laybye_max_duration_days = 'Max duration must be between 1 and 365 days'
      }
    }

    // Validate credit limit default
    if (data.credit_accounts_enabled && data.credit_limit_default) {
      const creditLimit = parseFloat(data.credit_limit_default)
      if (isNaN(creditLimit) || creditLimit < 0) {
        newErrors.credit_limit_default = 'Credit limit must be a positive number'
      }
    }

    // Validate credit interest rate
    if (data.credit_accounts_enabled && data.credit_interest_rate) {
      const interestRate = parseFloat(data.credit_interest_rate)
      if (isNaN(interestRate) || interestRate < 0 || interestRate > 100) {
        newErrors.credit_interest_rate = 'Interest rate must be between 0 and 100'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Please fix the errors before saving.')
      return
    }

    try {
      setIsSaving(true)
      
      const success = await updatePaymentOptions(data)
      
      if (success) {
        setOriginalData(data)
        setHasChanges(false)
        alert('Payment options saved successfully!')
      } else {
        alert('Failed to save payment options. Please try again.')
      }
    } catch (error) {
      console.error('Error saving payment options:', error)
      alert('An error occurred while saving. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      if (originalData) {
        setData(originalData)
        setErrors({})
        setHasChanges(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsPageLayout
      title="Payment Options"
      description="Configure payment methods, processing fees, and payment-related settings"
      icon={CreditCard}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isSaving}
      hasChanges={hasChanges}
              >
      <PaymentOptionsForm
        data={data}
        onChange={handleDataChange}
        errors={errors}
        disabled={isSaving}
      />
    </SettingsPageLayout>
  )
}

export default PaymentOptionsSettingsPage 
import React from 'react'
import { CreditCard, DollarSign, Smartphone, Wallet } from 'lucide-react'
import { SettingsSection } from '../SettingsSection'
import { SettingsToggle } from '../SettingsToggle'
import { SettingsField } from '../SettingsField'
import { SettingsGrid } from '../SettingsGrid'

interface PaymentOptionsData {
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

interface PaymentOptionsFormProps {
  data: PaymentOptionsData
  onChange: (data: PaymentOptionsData) => void
  errors: Record<string, string>
  disabled?: boolean
}

export const PaymentOptionsForm: React.FC<PaymentOptionsFormProps> = ({
  data,
  onChange,
  errors,
  disabled = false
}) => {
  const handleFieldChange = (key: keyof PaymentOptionsData, value: any) => {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Cash Payments */}
      <SettingsSection
        title="Cash Payments"
        description="Configure cash payment settings"
        icon={DollarSign}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable Cash Payments"
            description="Accept cash payments from customers"
            checked={data.cash_enabled}
            onChange={(checked) => handleFieldChange('cash_enabled', checked)}
            disabled={disabled}
            icon={DollarSign}
          />
          
          {data.cash_enabled && (
            <SettingsField
              label="Change Limit"
              value={data.cash_change_limit}
              onChange={(value) => handleFieldChange('cash_change_limit', value)}
              type="number"
              min={0}
              step={0.01}
              error={errors.cash_change_limit}
              disabled={disabled}
              prefix="R"
              helpText="Maximum amount of change to keep in till"
            />
          )}
        </div>
      </SettingsSection>

      {/* Card Payments */}
      <SettingsSection
        title="Card Payments"
        description="Configure credit and debit card payment processing"
        icon={CreditCard}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable Card Payments"
            description="Accept credit and debit card payments"
            checked={data.card_enabled}
            onChange={(checked) => handleFieldChange('card_enabled', checked)}
            disabled={disabled}
            icon={CreditCard}
          />
          
          {data.card_enabled && (
            <SettingsGrid columns={2}>
              <SettingsField
                label="Card Processor"
                value={data.card_processor}
                onChange={(value) => handleFieldChange('card_processor', value)}
                placeholder="e.g., Stripe, PayPal"
                error={errors.card_processor}
                disabled={disabled}
                helpText="Payment processor for card transactions"
              />
              
              <SettingsField
                label="API Key"
                value={data.card_api_key}
                onChange={(value) => handleFieldChange('card_api_key', value)}
                type="password"
                placeholder="Enter API key"
                error={errors.card_api_key}
                disabled={disabled}
                helpText="API key from your payment processor"
              />
              
              <SettingsField
                label="Secret Key"
                value={data.card_secret_key}
                onChange={(value) => handleFieldChange('card_secret_key', value)}
                type="password"
                placeholder="Enter secret key"
                error={errors.card_secret_key}
                disabled={disabled}
                helpText="Secret key from your payment processor"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>

      {/* Mobile Money */}
      <SettingsSection
        title="Mobile Money"
        description="Configure mobile money payment options"
        icon={Smartphone}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable M-Pesa"
            description="Accept M-Pesa payments"
            checked={data.mpesa_enabled}
            onChange={(checked) => handleFieldChange('mpesa_enabled', checked)}
            disabled={disabled}
            icon={Smartphone}
          />
          
          {data.mpesa_enabled && (
            <SettingsField
              label="M-Pesa Phone Number"
              value={data.mpesa_phone}
              onChange={(value) => handleFieldChange('mpesa_phone', value)}
              type="tel"
              placeholder="+27 12 345 6789"
              error={errors.mpesa_phone}
              disabled={disabled}
              helpText="Phone number for M-Pesa transactions"
            />
          )}

          <SettingsToggle
            label="Enable EcoCash"
            description="Accept EcoCash payments"
            checked={data.ecocash_enabled}
            onChange={(checked) => handleFieldChange('ecocash_enabled', checked)}
            disabled={disabled}
            icon={Smartphone}
          />
          
          {data.ecocash_enabled && (
            <SettingsField
              label="EcoCash Phone Number"
              value={data.ecocash_phone}
              onChange={(value) => handleFieldChange('ecocash_phone', value)}
              type="tel"
              placeholder="+27 12 345 6789"
              error={errors.ecocash_phone}
              disabled={disabled}
              helpText="Phone number for EcoCash transactions"
            />
          )}

          <SettingsToggle
            label="Enable Airtel Money"
            description="Accept Airtel Money payments"
            checked={data.airtel_money_enabled}
            onChange={(checked) => handleFieldChange('airtel_money_enabled', checked)}
            disabled={disabled}
            icon={Smartphone}
          />
          
          {data.airtel_money_enabled && (
            <SettingsField
              label="Airtel Money Phone Number"
              value={data.airtel_money_phone}
              onChange={(value) => handleFieldChange('airtel_money_phone', value)}
              type="tel"
              placeholder="+27 12 345 6789"
              error={errors.airtel_money_phone}
              disabled={disabled}
              helpText="Phone number for Airtel Money transactions"
            />
          )}

          <SettingsToggle
            label="Enable Orange Money"
            description="Accept Orange Money payments"
            checked={data.orange_money_enabled}
            onChange={(checked) => handleFieldChange('orange_money_enabled', checked)}
            disabled={disabled}
            icon={Smartphone}
          />
          
          {data.orange_money_enabled && (
            <SettingsField
              label="Orange Money Phone Number"
              value={data.orange_money_phone}
              onChange={(value) => handleFieldChange('orange_money_phone', value)}
              type="tel"
              placeholder="+27 12 345 6789"
              error={errors.orange_money_phone}
              disabled={disabled}
              helpText="Phone number for Orange Money transactions"
            />
          )}
        </div>
      </SettingsSection>

      {/* EFT/Bank Transfers */}
      <SettingsSection
        title="EFT/Bank Transfers"
        description="Configure electronic fund transfer settings"
        icon={Wallet}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable EFT Payments"
            description="Accept electronic fund transfers"
            checked={data.eft_enabled}
            onChange={(checked) => handleFieldChange('eft_enabled', checked)}
            disabled={disabled}
            icon={Wallet}
          />
          
          {data.eft_enabled && (
            <SettingsGrid columns={2}>
              <SettingsField
                label="Bank Name"
                value={data.eft_bank_name}
                onChange={(value) => handleFieldChange('eft_bank_name', value)}
                placeholder="e.g., Standard Bank"
                error={errors.eft_bank_name}
                disabled={disabled}
                helpText="Bank name for EFT payments"
              />
              
              <SettingsField
                label="Account Number"
                value={data.eft_account_number}
                onChange={(value) => handleFieldChange('eft_account_number', value)}
                placeholder="1234567890"
                error={errors.eft_account_number}
                disabled={disabled}
                helpText="Bank account number"
              />
              
              <SettingsField
                label="Reference Prefix"
                value={data.eft_reference_prefix}
                onChange={(value) => handleFieldChange('eft_reference_prefix', value)}
                placeholder="KQS"
                error={errors.eft_reference_prefix}
                disabled={disabled}
                helpText="Prefix for payment references"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>

      {/* Lay-bye */}
      <SettingsSection
        title="Lay-bye System"
        description="Configure lay-bye payment options"
        icon={Wallet}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable Lay-bye"
            description="Allow customers to pay in installments"
            checked={data.laybye_enabled}
            onChange={(checked) => handleFieldChange('laybye_enabled', checked)}
            disabled={disabled}
            icon={Wallet}
          />
          
          {data.laybye_enabled && (
            <SettingsGrid columns={3}>
              <SettingsField
                label="Deposit Percentage"
                value={data.laybye_deposit_percentage}
                onChange={(value) => handleFieldChange('laybye_deposit_percentage', value)}
                type="number"
                min={0}
                max={100}
                step={0.01}
                error={errors.laybye_deposit_percentage}
                disabled={disabled}
                suffix="%"
                helpText="Minimum deposit percentage required"
              />
              
              <SettingsField
                label="Min Deposit Amount"
                value={data.laybye_min_deposit_amount}
                onChange={(value) => handleFieldChange('laybye_min_deposit_amount', value)}
                type="number"
                min={0}
                step={0.01}
                error={errors.laybye_min_deposit_amount}
                disabled={disabled}
                prefix="R"
                helpText="Minimum deposit amount required"
              />
              
              <SettingsField
                label="Max Duration (Days)"
                value={data.laybye_max_duration_days}
                onChange={(value) => handleFieldChange('laybye_max_duration_days', value)}
                type="number"
                min={1}
                max={365}
                error={errors.laybye_max_duration_days}
                disabled={disabled}
                helpText="Maximum lay-bye duration in days"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>

      {/* Credit Accounts */}
      <SettingsSection
        title="Credit Accounts"
        description="Configure customer credit account settings"
        icon={CreditCard}
      >
        <div className="space-y-4">
          <SettingsToggle
            label="Enable Credit Accounts"
            description="Allow customers to have credit accounts"
            checked={data.credit_accounts_enabled}
            onChange={(checked) => handleFieldChange('credit_accounts_enabled', checked)}
            disabled={disabled}
            icon={CreditCard}
          />
          
          {data.credit_accounts_enabled && (
            <SettingsGrid columns={2}>
              <SettingsField
                label="Default Credit Limit"
                value={data.credit_limit_default}
                onChange={(value) => handleFieldChange('credit_limit_default', value)}
                type="number"
                min={0}
                step={0.01}
                error={errors.credit_limit_default}
                disabled={disabled}
                prefix="R"
                helpText="Default credit limit for new accounts"
              />
              
              <SettingsField
                label="Interest Rate"
                value={data.credit_interest_rate}
                onChange={(value) => handleFieldChange('credit_interest_rate', value)}
                type="number"
                min={0}
                max={100}
                step={0.01}
                error={errors.credit_interest_rate}
                disabled={disabled}
                suffix="%"
                helpText="Monthly interest rate on outstanding balances"
              />
            </SettingsGrid>
          )}
        </div>
      </SettingsSection>
    </div>
  )
} 
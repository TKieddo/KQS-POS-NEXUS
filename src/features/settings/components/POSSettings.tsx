'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Monitor, 
  Calendar, 
  Clock, 
  Save, 
  ArrowLeft, 
  Settings, 
  ShoppingCart,
  CreditCard,
  Receipt,
  User,
  RefreshCw,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useBranch } from '@/context/BranchContext'
import { getPOSSettings, savePOSSettings, defaultPOSSettings, type POSSettings as POSSettingsType } from '@/lib/pos-settings-service'

// Types
interface POSSettingsData {
  id?: string
  branch_id: string
  // Laybye Settings
  laybye_duration_months: number
  laybye_duration_days: number
  require_customer_for_laybye: boolean
  min_laybye_deposit_percentage: number
  max_laybye_duration_months: number
  allow_laybye_extensions: boolean
  laybye_reminder_days: number
  // Payment Settings
  auto_print_receipts: boolean
  default_payment_method: string
  max_discount_percentage: number
  allow_cash_rounding: boolean
  require_receipt_printing: boolean
  // Customer Settings
  show_customer_selection: boolean
  require_customer_for_credit: boolean
  auto_create_loyalty_account: boolean
  // Inventory Settings
  allow_negative_inventory: boolean
  show_stock_warnings: boolean
  low_stock_threshold: number
  created_at?: string
  updated_at?: string
}

const defaultSettings: Omit<POSSettingsData, 'branch_id'> = {
  // Laybye Settings
  laybye_duration_months: 3,
  laybye_duration_days: 0,
  require_customer_for_laybye: true,
  min_laybye_deposit_percentage: 20,
  max_laybye_duration_months: 6,
  allow_laybye_extensions: true,
  laybye_reminder_days: 7,
  // Payment Settings
  auto_print_receipts: true,
  default_payment_method: 'cash',
  max_discount_percentage: 20,
  allow_cash_rounding: true,
  require_receipt_printing: false,
  // Customer Settings
  show_customer_selection: true,
  require_customer_for_credit: true,
  auto_create_loyalty_account: false,
  // Inventory Settings
  allow_negative_inventory: false,
  show_stock_warnings: true,
  low_stock_threshold: 5
}

export const POSSettings: React.FC = () => {
  const router = useRouter()
  const { selectedBranch } = useBranch()
  const [settings, setSettings] = useState<POSSettingsData>({
    ...defaultSettings,
    branch_id: selectedBranch?.id || '00000000-0000-0000-0000-000000000001'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'laybye' | 'payment' | 'customer' | 'inventory'>('laybye')

  // Load settings on mount
  useEffect(() => {
    if (selectedBranch?.id) {
      loadPOSSettings()
    }
  }, [selectedBranch?.id])

  const loadPOSSettings = async () => {
    setLoading(true)
    try {
      const branchId = selectedBranch?.id || '00000000-0000-0000-0000-000000000001'
      const result = await getPOSSettings(branchId)
      
      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        console.error('Failed to load POS settings:', result.error)
        toast.error(result.error || 'Failed to load POS settings')
        // Use default settings as fallback
        setSettings({
          ...defaultSettings,
          branch_id: branchId
        })
      }
    } catch (error) {
      console.error('Error loading POS settings:', error)
      toast.error('Failed to load POS settings')
      // Use default settings as fallback
      setSettings({
        ...defaultSettings,
        branch_id: selectedBranch?.id || '00000000-0000-0000-0000-000000000001'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await savePOSSettings(settings)
      
      if (result.success && result.data) {
        setSettings(result.data)
        toast.success('POS settings saved successfully')
      } else {
        console.error('Failed to save POS settings:', result.error)
        toast.error(result.error || 'Failed to save POS settings')
      }
    } catch (error) {
      console.error('Error saving POS settings:', error)
      toast.error('Failed to save POS settings')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof POSSettingsData, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateDueDate = () => {
    const today = new Date()
    const dueDate = new Date(today)
    dueDate.setMonth(dueDate.getMonth() + settings.laybye_duration_months)
    dueDate.setDate(dueDate.getDate() + settings.laybye_duration_days)
    return dueDate.toLocaleDateString()
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E5FF29] flex items-center justify-center">
            <Monitor className="h-5 w-5 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">POS Settings</h1>
            <p className="text-sm text-gray-600">
              Configure Point of Sale interface settings for {selectedBranch?.name || 'All Branches'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5FF29]"></div>
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'laybye', name: 'Lay-bye Settings', icon: Calendar },
                { id: 'payment', name: 'Payment & Checkout', icon: CreditCard },
                { id: 'customer', name: 'Customer & Interface', icon: User },
                { id: 'inventory', name: 'Inventory & Stock', icon: ShoppingCart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[#E5FF29] text-[hsl(var(--primary))]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'laybye' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Duration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#E5FF29]" />
                      Duration & Timeline
                    </CardTitle>
                    <CardDescription>
                      Configure automatic laybye duration and deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Duration (Months) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="12"
                          value={settings.laybye_duration_months}
                          onChange={(e) => handleInputChange('laybye_duration_months', parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Days
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={settings.laybye_duration_days}
                          onChange={(e) => handleInputChange('laybye_duration_days', parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Duration (Months)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={settings.max_laybye_duration_months}
                        onChange={(e) => handleInputChange('max_laybye_duration_months', parseInt(e.target.value) || 1)}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum allowed laybye duration for any order</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reminder Days Before Due
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.laybye_reminder_days}
                        onChange={(e) => handleInputChange('laybye_reminder_days', parseInt(e.target.value) || 1)}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Send reminders this many days before due date</p>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800">
                        <strong>Due Date Preview:</strong> {calculateDueDate()}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Based on today's date with current settings
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Deposit & Policy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#E5FF29]" />
                      Deposit & Policies
                    </CardTitle>
                    <CardDescription>
                      Configure deposit requirements and laybye policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Deposit Percentage *
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="5"
                          max="100"
                          value={settings.min_laybye_deposit_percentage}
                          onChange={(e) => handleInputChange('min_laybye_deposit_percentage', parseInt(e.target.value) || 5)}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum deposit required as percentage of total order value
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Example:</strong> With {settings.min_laybye_deposit_percentage}% minimum, 
                        a R1,000 laybye requires at least R{((settings.min_laybye_deposit_percentage / 100) * 1000).toFixed(0)} deposit
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.require_customer_for_laybye}
                          onChange={(e) => handleInputChange('require_customer_for_laybye', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Require customer selection for laybye orders</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.allow_laybye_extensions}
                          onChange={(e) => handleInputChange('allow_laybye_extensions', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Allow extension of laybye due dates</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#E5FF29]" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription>
                      Configure default payment options and behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Payment Method
                      </label>
                      <select
                        value={settings.default_payment_method}
                        onChange={(e) => handleInputChange('default_payment_method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E5FF29] focus:border-transparent"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="ecocash">EcoCash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Discount Percentage
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={settings.max_discount_percentage}
                          onChange={(e) => handleInputChange('max_discount_percentage', parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.allow_cash_rounding}
                          onChange={(e) => handleInputChange('allow_cash_rounding', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Allow cash rounding to nearest 5 cents</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-[#E5FF29]" />
                      Receipt Settings
                    </CardTitle>
                    <CardDescription>
                      Configure receipt printing and requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.auto_print_receipts}
                          onChange={(e) => handleInputChange('auto_print_receipts', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Auto-print receipts after payment</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.require_receipt_printing}
                          onChange={(e) => handleInputChange('require_receipt_printing', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Require receipt printing for all transactions</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-[#E5FF29]" />
                      Customer Management
                    </CardTitle>
                    <CardDescription>
                      Configure customer selection and account creation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.show_customer_selection}
                          onChange={(e) => handleInputChange('show_customer_selection', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Show customer selection in POS interface</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.require_customer_for_credit}
                          onChange={(e) => handleInputChange('require_customer_for_credit', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Require customer for credit transactions</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.auto_create_loyalty_account}
                          onChange={(e) => handleInputChange('auto_create_loyalty_account', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Auto-create loyalty accounts for new customers</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-[#E5FF29]" />
                      Stock Management
                    </CardTitle>
                    <CardDescription>
                      Configure inventory and stock behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Low Stock Threshold
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.low_stock_threshold}
                        onChange={(e) => handleInputChange('low_stock_threshold', parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Show warnings when stock falls below this number</p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.allow_negative_inventory}
                          onChange={(e) => handleInputChange('allow_negative_inventory', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Allow sales when stock is below zero</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.show_stock_warnings}
                          onChange={(e) => handleInputChange('show_stock_warnings', e.target.checked)}
                          className="rounded border-gray-300 text-[#E5FF29] focus:ring-[#E5FF29]"
                        />
                        <span className="text-sm text-gray-700">Show low stock warnings in POS</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-200 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E5FF29] text-black hover:bg-[#E5FF29]/90 font-semibold"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

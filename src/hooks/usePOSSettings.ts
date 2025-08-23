import { useState, useEffect, useContext, createContext } from 'react'
import { getPOSSettings, type POSSettings } from '@/lib/pos-settings-service'
import { useBranch } from '@/context/BranchContext'

interface POSSettingsContextType {
  settings: POSSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const POSSettingsContext = createContext<POSSettingsContextType | undefined>(undefined)

export const usePOSSettings = () => {
  const context = useContext(POSSettingsContext)
  if (context === undefined) {
    throw new Error('usePOSSettings must be used within a POSSettingsProvider')
  }
  return context
}

// Hook for direct usage without context
export const usePOSSettingsHook = () => {
  const { selectedBranch } = useBranch()
  const [settings, setSettings] = useState<POSSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    if (!selectedBranch?.id) return

    setLoading(true)
    setError(null)
    
    try {
      const result = await getPOSSettings(selectedBranch.id)
      
      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        setError(result.error || 'Failed to load POS settings')
        // Use default settings as fallback
        setSettings({
          id: undefined,
          branch_id: selectedBranch.id,
          laybye_duration_months: 3,
          laybye_duration_days: 0,
          auto_print_receipts: true,
          default_payment_method: 'cash',
          show_customer_selection: true,
          require_customer_for_laybye: true,
          max_discount_percentage: 20,
          allow_negative_inventory: false
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load POS settings'
      setError(errorMessage)
      console.error('Error loading POS settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [selectedBranch?.id])

  return {
    settings,
    loading,
    error,
    refreshSettings: loadSettings
  }
}




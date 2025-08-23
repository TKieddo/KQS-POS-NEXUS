import { useState, useEffect } from 'react'
import { getCurrencySettings, formatCurrencyWithSettings, CurrencySettings } from '@/lib/currency-utils'

export function useCurrency() {
  const [settings, setSettings] = useState<CurrencySettings>({
    currency: 'ZAR',
    currencySymbol: 'R',
    decimalPlaces: 2
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCurrencySettings() {
      try {
        setIsLoading(true)
        setError(null)
        const currencySettings = await getCurrencySettings()
        setSettings(currencySettings)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load currency settings')
        console.error('Error loading currency settings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrencySettings()
  }, [])

  const formatCurrency = (amount: number): string => {
    return formatCurrencyWithSettings(amount, settings)
  }

  const formatCurrencyAsync = async (amount: number): Promise<string> => {
    const currentSettings = await getCurrencySettings()
    return formatCurrencyWithSettings(amount, currentSettings)
  }

  return {
    settings,
    isLoading,
    error,
    formatCurrency,
    formatCurrencyAsync,
    currencySymbol: settings.currencySymbol,
    currency: settings.currency,
    decimalPlaces: settings.decimalPlaces
  }
}

import React, { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Percent, Target, Info, Save } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import type { PricingSettings, PricingRule, PriceAnalysisData } from '@/lib/product-pricing-complete-service'

interface PriceCalculation {
  costPrice: number
  markupPercentage: number
  markupAmount: number
  sellingPrice: number
  profitMargin: number
  profitAmount: number
  recommendedPrice: number
}

interface PriceCalculatorProps {
  settings: PricingSettings | null
  rules: PricingRule[]
  onSaveCalculation: (data: Omit<PriceAnalysisData, 'id' | 'created_at'>) => Promise<string | null>
  isLoading: boolean
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  settings,
  rules,
  onSaveCalculation,
  isLoading
}) => {
  const [calculation, setCalculation] = useState<PriceCalculation>({
    costPrice: 0,
    markupPercentage: settings?.default_markup_percentage || 30,
    markupAmount: 0,
    sellingPrice: 0,
    profitMargin: 0,
    profitAmount: 0,
    recommendedPrice: 0
  })

  const [targetProfitMargin, setTargetProfitMargin] = useState(settings?.min_profit_margin || 25)
  const [competitorPrice, setCompetitorPrice] = useState(0)
  const [demandLevel, setDemandLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [productName, setProductName] = useState('')

  // Update calculation when settings change
  useEffect(() => {
    if (settings) {
      setCalculation(prev => ({
        ...prev,
        markupPercentage: settings.default_markup_percentage || 30
      }))
      setTargetProfitMargin(settings.min_profit_margin || 25)
    }
  }, [settings])

  // Calculate pricing when inputs change
  useEffect(() => {
    if (calculation.costPrice > 0) {
      const markupAmount = (calculation.costPrice * calculation.markupPercentage) / 100
      const sellingPrice = calculation.costPrice + markupAmount
      const profitAmount = sellingPrice - calculation.costPrice
      const profitMargin = (profitAmount / sellingPrice) * 100

      setCalculation(prev => ({
        ...prev,
        markupAmount,
        sellingPrice,
        profitAmount,
        profitMargin
      }))
    }
  }, [calculation.costPrice, calculation.markupPercentage])

  // Calculate recommended price based on target profit margin
  useEffect(() => {
    if (calculation.costPrice > 0 && targetProfitMargin > 0) {
      const recommendedPrice = calculation.costPrice / (1 - targetProfitMargin / 100)
      setCalculation(prev => ({ ...prev, recommendedPrice }))
    }
  }, [calculation.costPrice, targetProfitMargin])

  const handleCostPriceChange = (value: string) => {
    const costPrice = parseFloat(value) || 0
    setCalculation(prev => ({ ...prev, costPrice }))
  }

  const handleMarkupChange = (value: string) => {
    const markupPercentage = parseFloat(value) || 0
    setCalculation(prev => ({ ...prev, markupPercentage }))
  }

  const handleTargetProfitChange = (value: string) => {
    const targetProfit = parseFloat(value) || 0
    setTargetProfitMargin(targetProfit)
  }

  const getDemandMultiplier = () => {
    switch (demandLevel) {
      case 'low': return 0.9
      case 'medium': return 1.0
      case 'high': return 1.15
      default: return 1.0
    }
  }

  const getCompetitivePrice = () => {
    if (competitorPrice > 0) {
      return competitorPrice * getDemandMultiplier()
    }
    return 0
  }

  const getOptimalPrice = () => {
    const prices = [
      calculation.sellingPrice,
      calculation.recommendedPrice,
      getCompetitivePrice()
    ].filter(price => price > 0)

    if (prices.length === 0) return 0

    // Return the middle price (balanced approach)
    return prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
  }

  const handleSaveCalculation = async () => {
    if (!productName || calculation.costPrice <= 0) {
      alert('Please enter a product name and cost price')
      return
    }

    try {
      console.log('Saving calculation for product:', productName)
      
      const analysisData = {
        branch_id: '', // Will be set by service
        product_id: null, // Calculator data doesn't have a specific product
        analysis_date: new Date().toISOString().split('T')[0], // Use date only
        current_price: calculation.sellingPrice,
        cost_price: calculation.costPrice,
        competitor_prices: { 
          product_name: productName,
          competitor_price: competitorPrice,
          demand_level: demandLevel
        },
        market_average: getCompetitivePrice(),
        price_trend: 'stable',
        demand_level: demandLevel,
        profit_margin: calculation.profitMargin,
        price_change_percentage: 0
      }

      console.log('Analysis data to save:', analysisData)

      const analysisId = await onSaveCalculation(analysisData)

      if (analysisId) {
        alert('Price analysis saved successfully!')
        // Reset form
        setCalculation({
          costPrice: 0,
          markupPercentage: settings?.default_markup_percentage || 30,
          markupAmount: 0,
          sellingPrice: 0,
          profitMargin: 0,
          profitAmount: 0,
          recommendedPrice: 0
        })
        setProductName('')
        setCompetitorPrice(0)
        setDemandLevel('medium')
      } else {
        alert('Failed to save analysis. Please try again.')
      }
    } catch (error) {
      console.error('Error saving calculation:', error)
      alert(`Failed to save calculation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const optimalPrice = getOptimalPrice()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Price Calculator</h3>
          <p className="text-sm text-gray-600">Calculate optimal pricing with cost analysis</p>
        </div>
      </div>

      {/* Settings Info */}
      {settings && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Current Pricing Settings</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Default Markup:</span>
              <span className="font-semibold text-blue-900 ml-1">{settings.default_markup_percentage}%</span>
            </div>
            <div>
              <span className="text-blue-700">Min Profit:</span>
              <span className="font-semibold text-blue-900 ml-1">{settings.min_profit_margin}%</span>
            </div>
            <div>
              <span className="text-blue-700">Max Profit:</span>
              <span className="font-semibold text-blue-900 ml-1">{settings.max_profit_margin}%</span>
            </div>
            <div>
              <span className="text-blue-700">Active Rules:</span>
              <span className="font-semibold text-blue-900 ml-1">{rules.filter(r => r.is_active).length}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Cost & Pricing Inputs</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <PremiumInput
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price (R)
                </label>
                <PremiumInput
                  type="number"
                  value={calculation.costPrice || ''}
                  onChange={(e) => handleCostPriceChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Markup Percentage (%)
                </label>
                <PremiumInput
                  type="number"
                  value={calculation.markupPercentage || ''}
                  onChange={(e) => handleMarkupChange(e.target.value)}
                  placeholder="30"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Profit Margin (%)
                </label>
                <PremiumInput
                  type="number"
                  value={targetProfitMargin || ''}
                  onChange={(e) => handleTargetProfitChange(e.target.value)}
                  placeholder="25"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competitor Price (R)
                </label>
                <PremiumInput
                  type="number"
                  value={competitorPrice || ''}
                  onChange={(e) => setCompetitorPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demand Level
                </label>
                <select
                  value={demandLevel}
                  onChange={(e) => setDemandLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Demand</option>
                  <option value="medium">Medium Demand</option>
                  <option value="high">High Demand</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Calculation Results</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Markup Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  R{calculation.markupAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Selling Price:</span>
                <span className="text-sm font-semibold text-blue-900">
                  R{calculation.sellingPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Profit Amount:</span>
                <span className="text-sm font-semibold text-green-900">
                  R{calculation.profitAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Profit Margin:</span>
                <span className="text-sm font-semibold text-purple-900">
                  {calculation.profitMargin.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-orange-700">Recommended Price:</span>
                <span className="text-sm font-semibold text-orange-900">
                  R{calculation.recommendedPrice.toFixed(2)}
                </span>
              </div>

              {competitorPrice > 0 && (
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-indigo-700">Competitive Price:</span>
                  <span className="text-sm font-semibold text-indigo-900">
                    R{getCompetitivePrice().toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optimal Price Recommendation */}
          {optimalPrice > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Target className="h-5 w-5" />
                <h4 className="font-semibold">Optimal Price Recommendation</h4>
              </div>
              <div className="text-3xl font-bold mb-2">R{optimalPrice.toFixed(2)}</div>
              <p className="text-sm opacity-90">
                Based on cost analysis, target profit margin, and market conditions
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <PremiumButton
              gradient="green"
              icon={Save}
              onClick={handleSaveCalculation}
              disabled={isLoading || !productName || calculation.costPrice <= 0}
            >
              {isLoading ? 'Saving...' : 'Save Analysis'}
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  )
} 
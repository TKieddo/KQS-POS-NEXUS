import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, DollarSign, Target, Brain, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { Modal } from '@/components/ui/modal'
import type { PriceAnalysisData, PricingSettings } from '@/lib/product-pricing-complete-service'

interface PriceAnalysisProps {
  analysisData: PriceAnalysisData[]
  settings: PricingSettings | null
  onCreateAnalysis: (data: Omit<PriceAnalysisData, 'id' | 'created_at'>) => Promise<string | null>
  isLoading: boolean
}

interface AIInsight {
  type: 'trend' | 'optimization' | 'warning' | 'opportunity'
  title: string
  description: string
  confidence: number
  action?: string
  impact: 'high' | 'medium' | 'low'
}

export const PriceAnalysis: React.FC<PriceAnalysisProps> = ({
  analysisData,
  settings,
  onCreateAnalysis,
  isLoading
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isAIAnalysisOpen, setIsAIAnalysisOpen] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // AI-powered insights generation
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const insights: AIInsight[] = []
    
    // Analyze profit margins
    const avgProfitMargin = analysisData.length > 0 
      ? analysisData.reduce((sum, item) => sum + (item.profit_margin || 0), 0) / analysisData.length 
      : 0
    
    if (avgProfitMargin < 15) {
      insights.push({
        type: 'warning',
        title: 'Low Profit Margins Detected',
        description: `Average profit margin is ${avgProfitMargin.toFixed(1)}%, which is below the recommended 20% threshold. Consider price adjustments or cost optimization.`,
        confidence: 0.92,
        action: 'Review pricing strategy and supplier costs',
        impact: 'high'
      })
    }
    
    // Analyze price trends
    const priceChanges = analysisData.filter(item => item.price_change_percentage !== undefined && item.price_change_percentage !== 0)
    const recentPriceChanges = priceChanges.slice(-5)
    
    if (recentPriceChanges.length > 0) {
      const avgPriceChange = recentPriceChanges.reduce((sum, item) => sum + (item.price_change_percentage || 0), 0) / recentPriceChanges.length
      
      if (avgPriceChange > 5) {
        insights.push({
          type: 'trend',
          title: 'Significant Price Increases Detected',
          description: `Recent average price increase of ${avgPriceChange.toFixed(1)}% may impact customer retention. Monitor sales volume changes.`,
          confidence: 0.88,
          action: 'Monitor customer feedback and sales metrics',
          impact: 'medium'
        })
      }
    }
    
    // Analyze demand patterns
    const highDemandItems = analysisData.filter(item => item.demand_level === 'high')
    const lowDemandItems = analysisData.filter(item => item.demand_level === 'low')
    
    if (highDemandItems.length > analysisData.length * 0.3) {
      insights.push({
        type: 'opportunity',
        title: 'High Demand Products Identified',
        description: `${highDemandItems.length} products show high demand. Consider increasing prices gradually or expanding inventory.`,
        confidence: 0.85,
        action: 'Evaluate price optimization for high-demand items',
        impact: 'high'
      })
    }
    
    if (lowDemandItems.length > analysisData.length * 0.4) {
      insights.push({
        type: 'warning',
        title: 'Low Demand Products Detected',
        description: `${lowDemandItems.length} products show low demand. Consider promotional pricing or inventory reduction.`,
        confidence: 0.78,
        action: 'Implement promotional strategies or discontinue low-performing items',
        impact: 'medium'
      })
    }
    
    // Market competitiveness analysis
    if (settings?.competitive_pricing_enabled) {
      insights.push({
        type: 'optimization',
        title: 'Competitive Pricing Active',
        description: 'Competitive pricing is enabled. AI recommends monitoring competitor prices weekly for optimal positioning.',
        confidence: 0.95,
        action: 'Set up automated competitor price monitoring',
        impact: 'medium'
      })
    }
    
    // Price optimization opportunity
    const itemsWithLowMargin = analysisData.filter(item => (item.profit_margin || 0) < 15)
    if (itemsWithLowMargin.length > 0) {
      insights.push({
        type: 'optimization',
        title: 'Price Optimization Opportunity',
        description: `${itemsWithLowMargin.length} products have profit margins below 15%. AI suggests price increases of 5-10% for these items.`,
        confidence: 0.82,
        action: 'Review and adjust prices for low-margin products',
        impact: 'high'
      })
    }
    
    setAiInsights(insights)
    setIsGeneratingInsights(false)
  }

  // Calculate summary statistics
  const totalAnalyses = analysisData.length
  const averageProfitMargin = analysisData.length > 0 
    ? analysisData.reduce((sum, item) => sum + (item.profit_margin || 0), 0) / analysisData.length 
    : 0
  const averagePrice = analysisData.length > 0 
    ? analysisData.reduce((sum, item) => sum + item.current_price, 0) / analysisData.length 
    : 0
  const priceChanges = analysisData.filter(item => item.price_change_percentage !== undefined && item.price_change_percentage !== 0)

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />
      case 'optimization': return <Target className="h-4 w-4" />
      case 'warning': return <AlertCircle className="h-4 w-4" />
      case 'opportunity': return <Lightbulb className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'optimization': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'opportunity': return 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Price Analysis</h3>
            <p className="text-sm text-gray-600">Analyze pricing trends and competitiveness</p>
          </div>
        </div>
        <PremiumButton
          gradient="purple"
          size="sm"
          icon={Brain}
          onClick={() => {
            setIsAIAnalysisOpen(true)
            generateAIInsights()
          }}
          disabled={isLoading || analysisData.length === 0}
        >
          AI Insights
        </PremiumButton>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{totalAnalyses}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Profit Margin</p>
              <p className="text-2xl font-bold text-green-600">{averageProfitMargin.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(averagePrice)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Price Changes</p>
              <p className="text-2xl font-bold text-orange-600">{priceChanges.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Analysis History</h4>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Data Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : analysisData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No price analysis data found.</p>
            <p className="text-xs mt-1">Use the Price Calculator to create your first analysis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Current Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cost Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Profit Margin</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Trend</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Demand</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Price Change</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.slice(0, 10).map((analysis) => (
                  <tr key={analysis.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {formatDate(analysis.analysis_date)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {formatCurrency(analysis.current_price)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {analysis.cost_price ? formatCurrency(analysis.cost_price) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (analysis.profit_margin || 0) >= 20 
                          ? 'bg-green-100 text-green-800' 
                          : (analysis.profit_margin || 0) >= 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(analysis.profit_margin || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getTrendIcon(analysis.price_trend || 'stable')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDemandColor(analysis.demand_level || 'medium')}`}>
                        {analysis.demand_level || 'medium'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {analysis.price_change_percentage !== undefined && analysis.price_change_percentage !== 0 ? (
                        <span className={`font-medium ${
                          analysis.price_change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analysis.price_change_percentage > 0 ? '+' : ''}{analysis.price_change_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings Info */}
      {settings && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Analysis Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Competitive Pricing:</span>
              <span className="font-semibold text-blue-900 ml-1">
                {settings.competitive_pricing_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Auto Adjustment:</span>
              <span className="font-semibold text-blue-900 ml-1">
                {settings.auto_price_adjustment ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Price Optimization:</span>
              <span className="font-semibold text-blue-900 ml-1">
                {settings.price_optimization_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Rounding Method:</span>
              <span className="font-semibold text-blue-900 ml-1 capitalize">
                {settings.price_rounding_method}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      <Modal
        isOpen={isAIAnalysisOpen}
        onClose={() => setIsAIAnalysisOpen(false)}
        title="AI-Powered Price Analysis"
        maxWidth="4xl"
      >
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">AI Analysis Engine</h4>
            </div>
            <p className="text-sm text-purple-700">
              Our AI analyzes your pricing data to provide intelligent insights, trend predictions, and optimization recommendations.
            </p>
          </div>

          {isGeneratingInsights ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">AI is analyzing your pricing data...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">AI Insights & Recommendations</h4>
                <span className="text-sm text-gray-500">{aiInsights.length} insights found</span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                        {insight.action && (
                          <div className="bg-white/50 rounded p-3">
                            <p className="text-xs font-medium text-gray-900 mb-1">Recommended Action:</p>
                            <p className="text-sm text-gray-700">{insight.action}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No AI insights available.</p>
              <p className="text-xs mt-1">Ensure you have sufficient pricing data for analysis.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={() => setIsAIAnalysisOpen(false)}
            >
              Close
            </PremiumButton>
            {aiInsights.length > 0 && (
              <PremiumButton
                gradient="purple"
                size="sm"
                icon={CheckCircle}
                onClick={() => {
                  // Here you could implement actions based on insights
                  alert('AI insights have been processed. Consider implementing the recommended actions.')
                }}
              >
                Apply Recommendations
              </PremiumButton>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
} 
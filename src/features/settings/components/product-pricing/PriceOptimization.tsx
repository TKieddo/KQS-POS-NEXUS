import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { Modal } from '@/components/ui/modal'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import type { 
  PriceOptimizationSuggestion, 
  PricingSettings,
  PricingRule 
} from '@/lib/product-pricing-complete-service'

interface PriceOptimizationProps {
  suggestions: PriceOptimizationSuggestion[]
  settings: PricingSettings | null
  rules: PricingRule[]
  isLoading: boolean
  onCreateSuggestion: (suggestion: Omit<PriceOptimizationSuggestion, 'id' | 'created_at'>) => Promise<string | null>
  onApplySuggestion: (suggestionId: string, userId: string) => Promise<boolean>
  onGenerateAISuggestions: () => Promise<void>
  onUpdateSettings: (settings: Partial<PricingSettings>) => Promise<boolean>
}

export const PriceOptimization: React.FC<PriceOptimizationProps> = ({
  suggestions,
  settings,
  rules,
  isLoading,
  onCreateSuggestion,
  onApplySuggestion,
  onGenerateAISuggestions,
  onUpdateSettings
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isApplying, setIsApplying] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<PriceOptimizationSuggestion | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'high-confidence' | 'medium-confidence' | 'low-confidence'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'confidence' | 'impact' | 'date'>('confidence')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Use only real suggestions from the service
  const displaySuggestions = suggestions

  // Filter and sort suggestions
  const filteredSuggestions = displaySuggestions
    .filter(suggestion => {
      if (filterType === 'all') return true
      if (filterType === 'high-confidence') return (suggestion.confidence_score || 0) >= 0.8
      if (filterType === 'medium-confidence') return (suggestion.confidence_score || 0) >= 0.5 && (suggestion.confidence_score || 0) < 0.8
      if (filterType === 'low-confidence') return (suggestion.confidence_score || 0) < 0.5
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (b.confidence_score || 0) - (a.confidence_score || 0)
        case 'impact':
          return Math.abs(b.price_change_percentage) - Math.abs(a.price_change_percentage)
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      await onGenerateAISuggestions()
      setSuccess('AI suggestions generated successfully!')
    } catch (error) {
      setError('Failed to generate AI suggestions. Please try again.')
      console.error('Error generating suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplySuggestion = async (suggestionId: string) => {
    setIsApplying(suggestionId)
    setError(null)
    setSuccess(null)

    try {
      const success = await onApplySuggestion(suggestionId, 'current-user-id')
      if (success) {
        setSuccess('Suggestion applied successfully!')
        // Refresh suggestions
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError('Failed to apply suggestion')
      }
    } catch (error) {
      setError('An error occurred while applying the suggestion')
      console.error('Error applying suggestion:', error)
    } finally {
      setIsApplying(null)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  const getImpactColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getImpactIcon = (change: number) => {
    if (change > 0) return TrendingUp
    if (change < 0) return TrendingDown
    return Target
  }

  const stats = {
    total: displaySuggestions.length,
    highConfidence: displaySuggestions.filter(s => (s.confidence_score || 0) >= 0.8).length,
    applied: displaySuggestions.filter(s => s.is_applied).length,
    pending: displaySuggestions.filter(s => !s.is_applied).length,
    averageImpact: displaySuggestions.length > 0 
      ? displaySuggestions.reduce((sum, s) => sum + Math.abs(s.price_change_percentage), 0) / displaySuggestions.length 
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Price Optimization
          </h3>
          <p className="text-gray-600 mt-1">
            AI-powered price optimization suggestions based on market analysis and sales data
          </p>
        </div>
        <div className="flex gap-3">
          <PremiumButton
            variant="outline"
            size="sm"
            icon={Settings}
            onClick={() => setIsSettingsModalOpen(true)}
          >
            Settings
          </PremiumButton>
          <PremiumButton
            gradient="purple"
            size="sm"
            icon={Brain}
            onClick={handleGenerateSuggestions}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
          </PremiumButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumCard className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Suggestions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Brain className="h-8 w-8 opacity-80" />
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">High Confidence</p>
              <p className="text-2xl font-bold">{stats.highConfidence}</p>
            </div>
            <CheckCircle className="h-8 w-8 opacity-80" />
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Applied</p>
              <p className="text-2xl font-bold">{stats.applied}</p>
            </div>
            <Target className="h-8 w-8 opacity-80" />
          </div>
        </PremiumCard>

        <PremiumCard className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg. Impact</p>
              <p className="text-2xl font-bold">{stats.averageImpact.toFixed(1)}%</p>
            </div>
            <BarChart3 className="h-8 w-8 opacity-80" />
          </div>
        </PremiumCard>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Suggestions</option>
              <option value="high-confidence">High Confidence (≥80%)</option>
              <option value="medium-confidence">Medium Confidence (50-79%)</option>
              <option value="low-confidence">Low Confidence (&lt;50%)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="confidence">Sort by Confidence</option>
              <option value="impact">Sort by Impact</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="relative w-64">
              <PremiumInput
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <PremiumButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => window.location.reload()}
            >
              Refresh
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Suggestions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI suggestions...</p>
          </div>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Suggestions Available</h3>
          <p className="text-gray-600 mb-4">
            {suggestions.length === 0 
              ? "No AI suggestions have been generated yet. Click the button below to generate your first suggestions."
              : "No suggestions match your current filters. Try adjusting your search or filter criteria."
            }
          </p>
          {suggestions.length === 0 && (
            <PremiumButton
              gradient="purple"
              icon={Brain}
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate First Suggestions'}
            </PremiumButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSuggestions.map((suggestion) => {
            const ImpactIcon = getImpactIcon(suggestion.price_change_percentage)
            return (
              <PremiumCard key={suggestion.id} className="hover:shadow-lg transition-shadow">
                <div className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImpactIcon className={`h-5 w-5 ${getImpactColor(suggestion.price_change_percentage)}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {(suggestion as any).products?.name || `Product #${suggestion.product_id.slice(0, 8)}`}
                        </span>
                        {(suggestion as any).products?.categories?.name && (
                          <span className="text-xs text-gray-500">
                            {(suggestion as any).products.categories.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(suggestion.confidence_score || 0)}`}>
                      {getConfidenceLabel(suggestion.confidence_score || 0)}
                    </span>
                  </div>

                  {/* Price Changes */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-medium">${suggestion.current_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Suggested Price:</span>
                      <span className="font-semibold text-purple-600">
                        ${suggestion.suggested_price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-medium ${getImpactColor(suggestion.price_change_percentage)}`}>
                        {suggestion.price_change_percentage > 0 ? '+' : ''}
                        {suggestion.price_change_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Reason:</strong> {suggestion.optimization_reason}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSuggestion(suggestion)
                        setIsDetailsModalOpen(true)
                      }}
                      className="flex-1"
                    >
                      Details
                    </PremiumButton>
                    <PremiumButton
                      gradient="green"
                      size="sm"
                      onClick={() => handleApplySuggestion(suggestion.id)}
                      disabled={isApplying === suggestion.id || suggestion.is_applied}
                      className="flex-1"
                    >
                      {isApplying === suggestion.id ? 'Applying...' : suggestion.is_applied ? 'Applied' : 'Apply'}
                    </PremiumButton>
                  </div>

                  {/* Applied Status */}
                  {suggestion.is_applied && (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Applied on {new Date(suggestion.applied_at!).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </PremiumCard>
            )
          })}
        </div>
      )}

      {/* Suggestion Details Modal */}
      {selectedSuggestion && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`AI Suggestion Details - ${(selectedSuggestion as any).products?.name || 'Product'}`}
          maxWidth="2xl"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Price Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Price:</span>
                    <span className="font-medium">${selectedSuggestion.current_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Suggested Price:</span>
                    <span className="font-semibold text-purple-600">
                      ${selectedSuggestion.suggested_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price Change:</span>
                    <span className={`font-medium ${getImpactColor(selectedSuggestion.price_change_percentage)}`}>
                      {selectedSuggestion.price_change_percentage > 0 ? '+' : ''}
                      {selectedSuggestion.price_change_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence Score:</span>
                    <span className={`font-medium ${getConfidenceColor(selectedSuggestion.confidence_score || 0)}`}>
                      {((selectedSuggestion.confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(selectedSuggestion.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Optimization Reason</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {selectedSuggestion.optimization_reason}
              </p>
            </div>

            {selectedSuggestion.expected_impact && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Expected Impact</h4>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                    {JSON.stringify(selectedSuggestion.expected_impact, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <PremiumButton
                variant="outline"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </PremiumButton>
              {!selectedSuggestion.is_applied && (
                <PremiumButton
                  gradient="green"
                  onClick={() => {
                    handleApplySuggestion(selectedSuggestion.id)
                    setIsDetailsModalOpen(false)
                  }}
                  disabled={isApplying === selectedSuggestion.id}
                >
                  {isApplying === selectedSuggestion.id ? 'Applying...' : 'Apply Suggestion'}
                </PremiumButton>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="AI Optimization Settings"
        maxWidth="lg"
      >
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">AI Price Optimization</h4>
                <p className="text-sm text-gray-600">Enable AI-powered price optimization suggestions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.price_optimization_enabled || false}
                  onChange={async (e) => {
                    await onUpdateSettings({ price_optimization_enabled: e.target.checked })
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Minimum Confidence Score (0-1)
              </label>
              <PremiumInput
                type="number"
                min="0"
                max="1"
                step="0.1"
                placeholder="0.5"
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Maximum Price Change Percentage
              </label>
              <PremiumInput
                type="number"
                min="0"
                max="100"
                placeholder="25"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <PremiumButton
              variant="outline"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Cancel
            </PremiumButton>
            <PremiumButton
              gradient="purple"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Save Settings
            </PremiumButton>
          </div>
        </div>
      </Modal>
    </div>
  )
} 
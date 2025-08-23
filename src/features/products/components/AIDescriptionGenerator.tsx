import React, { useState } from 'react'
import { Sparkles, Wand2, Copy, Check, RefreshCw } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumInput } from '@/components/ui/premium-input'
import { generateProductDescription, type ProductInfo } from '@/lib/ai-services'

interface AIDescriptionGeneratorProps {
  productInfo: ProductInfo
  currentDescription: string
  onDescriptionGenerated: (description: string) => void
  className?: string
}

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  productInfo,
  currentDescription,
  onDescriptionGenerated,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateDescription = async () => {
    if (!productInfo.name) {
      setError('Product name is required to generate description')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateProductDescription(productInfo)
      setGeneratedDescription(result.description)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate description'
      setError(errorMessage)
      
      // If it's an API key error, show a more helpful message
      if (errorMessage.includes('API key')) {
        setError('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file. See AI_INTEGRATION_SETUP.md for instructions.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseDescription = () => {
    if (generatedDescription) {
      onDescriptionGenerated(generatedDescription)
      setGeneratedDescription('')
    }
  }

  const handleCopyDescription = async () => {
    if (generatedDescription) {
      try {
        await navigator.clipboard.writeText(generatedDescription)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy description:', err)
      }
    }
  }

  const handleRegenerate = () => {
    setGeneratedDescription('')
    handleGenerateDescription()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Generation Button */}
      <div className="flex items-center gap-3">
        <PremiumButton
          onClick={handleGenerateDescription}
          disabled={isGenerating || !productInfo.name}
          gradient="purple"
          size="sm"
          icon={isGenerating ? RefreshCw : Sparkles}
          className="rounded-full px-4 py-2 text-sm font-semibold"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Description
            </>
          )}
        </PremiumButton>
        
        {currentDescription && (
          <span className="text-xs text-gray-500">
            Current: {currentDescription.length} characters
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generated Description */}
      {generatedDescription && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-purple-900">AI Generated Description</h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyDescription}
                className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                title="Copy description"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleRegenerate}
                className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-colors"
                title="Regenerate description"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {generatedDescription}
            </p>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {generatedDescription.length} characters
            </span>
            <PremiumButton
              onClick={handleUseDescription}
              variant="outline"
              size="sm"
              className="rounded-full px-3 py-1.5 text-xs font-semibold border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              Use This Description
            </PremiumButton>
          </div>
        </div>
      )}

      {/* Product Info Summary */}
      {productInfo.name && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h5 className="text-xs font-medium text-gray-700 mb-2">AI will use this information:</h5>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Name:</strong> {productInfo.name}</div>
            {productInfo.category && <div><strong>Category:</strong> {productInfo.category}</div>}
            {productInfo.price && <div><strong>Price:</strong> ${productInfo.price}</div>}
            {productInfo.variants && productInfo.variants.length > 0 && (
              <div><strong>Variants:</strong> {productInfo.variants.length} options</div>
            )}
            {productInfo.stock_quantity !== undefined && (
              <div><strong>Stock:</strong> {productInfo.stock_quantity} {productInfo.unit || 'units'}</div>
            )}
            {productInfo.discount_amount && (
              <div><strong>Discount:</strong> {productInfo.discount_type === 'percentage' ? `${productInfo.discount_amount}%` : `$${productInfo.discount_amount}`}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
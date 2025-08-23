import { useState } from 'react'
import { Sparkles, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { analyzeProductImagesForVariants, generateVariantsFromColors } from '@/lib/ai-services'
import type { ProductVariant as VariantManagerProductVariant } from './VariantManager'

interface AIVariantDetectorProps {
  images: string[]
  productName: string
  basePrice: number
  baseSku: string
  onVariantsGenerated: (variants: VariantManagerProductVariant[]) => void
  disabled?: boolean
}

export const AIVariantDetector = ({
  images,
  productName,
  basePrice,
  baseSku,
  onVariantsGenerated,
  disabled = false
}: AIVariantDetectorProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<{
    detectedColors: string[]
    suggestedVariants: Array<{
      color: string
      size?: string
      sku: string
      price: number
      confidence: number
    }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyzeImages = async () => {
    if (images.length === 0) {
      setError('Please upload at least one product image first')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      const result = await analyzeProductImagesForVariants(images, productName, basePrice)
      
      if (result.error) {
        setError(result.error)
        return
      }

      setAnalysis({
        detectedColors: result.detectedColors,
        suggestedVariants: result.suggestedVariants
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze images')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateVariants = () => {
    if (!analysis || analysis.detectedColors.length === 0) {
      setError('No colors detected. Please try analyzing again.')
      return
    }

    const generatedVariants = generateVariantsFromColors(
      analysis.detectedColors,
      productName,
      basePrice,
      baseSku
    )

    // Convert to VariantManager format
    const variantManagerVariants: VariantManagerProductVariant[] = generatedVariants.map(variant => ({
      id: variant.id,
      sku: variant.sku,
      barcode: variant.barcode,
      price: variant.price,
      cost: variant.cost,
      stock_quantity: variant.stock_quantity,
      image_url: variant.image_url,
      is_active: variant.is_active,
      options: variant.options
    }))

    onVariantsGenerated(variantManagerVariants)
  }

  const hasImages = images.length > 0
  const hasAnalysis = analysis !== null
  const hasDetectedColors = analysis && analysis.detectedColors.length > 0

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">AI Variant Detection</h3>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        Upload product images and let AI automatically detect colors to create variants for you.
      </p>

      {/* Analysis Button */}
      <div className="space-y-3">
        <PremiumButton
          onClick={handleAnalyzeImages}
          disabled={disabled || !hasImages || isAnalyzing}
          gradient="blue"
          size="sm"
          className="w-full"
          icon={isAnalyzing ? Loader2 : Eye}
        >
          {isAnalyzing ? 'Analyzing Images...' : 'Analyze Images for Colors'}
        </PremiumButton>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs text-red-700">{error}</span>
          </div>
        )}

        {/* Analysis Results */}
        {hasAnalysis && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Detected Colors
              </h4>
              
              {hasDetectedColors ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {analysis.detectedColors.map((color, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Found {analysis.detectedColors.length} color variant{analysis.detectedColors.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No colors detected in the images.</p>
              )}
            </div>

            {/* Generate Variants Button */}
            {hasDetectedColors && (
              <PremiumButton
                onClick={handleGenerateVariants}
                gradient="green"
                size="sm"
                className="w-full"
                icon={Sparkles}
              >
                Generate {analysis.detectedColors.length} Variant{analysis.detectedColors.length !== 1 ? 's' : ''}
              </PremiumButton>
            )}
          </div>
        )}

        {/* No Images Warning */}
        {!hasImages && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-700">
              Upload product images first to enable AI analysis
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 
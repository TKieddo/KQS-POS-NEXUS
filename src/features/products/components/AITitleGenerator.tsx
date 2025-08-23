import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle, Copy, RefreshCw, Shield } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { generateProductTitle, type ProductInfo, type GeneratedTitle } from '@/lib/ai-services'

interface AITitleGeneratorProps {
  productInfo: ProductInfo
  currentTitle: string
  onTitleGenerated: (title: string) => void
  className?: string
}

export const AITitleGenerator = ({ 
  productInfo, 
  currentTitle, 
  onTitleGenerated, 
  className = '' 
}: AITitleGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedTitle, setGeneratedTitle] = useState<GeneratedTitle | null>(null)
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null)

  const handleGenerateTitle = async () => {
    setIsGenerating(true)
    setError(null)
    setGeneratedTitle(null)

    try {
      const result = await generateProductTitle(productInfo)
      setGeneratedTitle(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate title')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseTitle = (title: string) => {
    onTitleGenerated(title)
    setGeneratedTitle(null)
  }

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title)
      setCopiedTitle(title)
      setTimeout(() => setCopiedTitle(null), 2000)
    } catch (err) {
      console.error('Failed to copy title:', err)
    }
  }

  const hasImages = productInfo.images && productInfo.images.length > 0 || productInfo.mainImage

  // Check if current title contains brand names
  const hasBrandName = generatedTitle?.title && /nike|adidas|puma|reebok|converse|vans|apple|samsung|gucci|prada|lv|nike|adidas/i.test(generatedTitle.title)

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">AI Title Generator</span>
        {hasImages && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Image Analysis Available
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <PremiumButton
          onClick={handleGenerateTitle}
          disabled={isGenerating}
          size="sm"
          variant="outline"
          className="text-xs"
          icon={isGenerating ? Loader2 : Sparkles}
        >
          {isGenerating ? 'Generating...' : 'Generate Title'}
        </PremiumButton>

        {generatedTitle && (
          <PremiumButton
            onClick={() => handleGenerateTitle()}
            size="sm"
            variant="outline"
            className="text-xs"
            icon={RefreshCw}
          >
            Regenerate
          </PremiumButton>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Title Generation Failed</p>
            <p className="text-xs mt-1">{error}</p>
            {error.includes('API key') && (
              <p className="text-xs mt-2">
                Please add your OpenAI API key to the environment variables to use this feature.
              </p>
            )}
          </div>
        </div>
      )}

      {generatedTitle && (
        <div className="space-y-3">
          {/* Main Title */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Generated Title</span>
                  {hasBrandName && (
                    <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      <Shield className="h-3 w-3" />
                      Brand Detected
                    </div>
                  )}
                </div>
                <p className="text-sm text-blue-900 font-medium">{generatedTitle.title}</p>
                {hasBrandName && (
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ Brand name detected. Consider using alternative titles below to avoid trademark issues.
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopyTitle(generatedTitle.title)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title="Copy title"
                >
                  <Copy className="h-3 w-3" />
                </button>
                {copiedTitle === generatedTitle.title && (
                  <span className="text-xs text-green-600">Copied!</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <PremiumButton
                onClick={() => handleUseTitle(generatedTitle.title)}
                size="sm"
                gradient="blue"
                className="text-xs"
              >
                Use This Title
              </PremiumButton>
            </div>
          </div>

          {/* Alternative Titles */}
          {generatedTitle.alternative_titles && generatedTitle.alternative_titles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-700">Alternative Options:</h4>
              {generatedTitle.alternative_titles.map((altTitle, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                  <span className="text-sm text-gray-700">{altTitle}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopyTitle(altTitle)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Copy title"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <PremiumButton
                      onClick={() => handleUseTitle(altTitle)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Use
                    </PremiumButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Keywords */}
          {generatedTitle.keywords && generatedTitle.keywords.length > 0 && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Keywords:</h4>
              <div className="flex flex-wrap gap-1">
                {generatedTitle.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!hasImages && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          <p>💡 <strong>Tip:</strong> Upload product images for better AI-generated titles that include visual features like colors, patterns, and styles.</p>
        </div>
      )}

      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <p>🛡️ <strong>Brand Protection:</strong> AI automatically detects and avoids brand names in titles to prevent trademark issues. Alternative brand-free titles are provided when brands are detected.</p>
      </div>
    </div>
  )
} 
import * as React from 'react'
import { Image, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'

export interface GalleryImage {
  file?: File
  url: string
  isExisting?: boolean
}

export interface ColorImageSelectorProps {
  selectedColors: string[]
  images: GalleryImage[]
  colorImages: { [color: string]: string }
  onColorImageChange: (color: string, imageUrl: string | null) => void
  className?: string
}

const ColorImageSelector = ({
  selectedColors,
  images,
  colorImages,
  onColorImageChange,
  className
}: ColorImageSelectorProps) => {
  if (selectedColors.length === 0 || images.length === 0) {
    return null
  }

  return (
    <div className={cn("bg-white rounded-2xl shadow-md p-4", className)}>
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
        <Image className="h-4 w-4" />
        Color Variant Images
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Select an image for each color variant. All size variants of the same color will use this image.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedColors.map(color => (
          <div key={color} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 capitalize">{color}</h4>
              {colorImages[color] && (
                <PremiumButton
                  variant="outline"
                  size="sm"
                  onClick={() => onColorImageChange(color, null)}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </PremiumButton>
              )}
            </div>
            
            {colorImages[color] ? (
              <div className="relative">
                <img
                  src={colorImages[color]}
                  alt={`${color} variant`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={() => onColorImageChange(color, null)}
                    className="bg-white/90 text-gray-900"
                  >
                    Remove
                  </PremiumButton>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">No image selected</p>
                <div className="grid grid-cols-3 gap-1">
                  {images.slice(0, 6).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => onColorImageChange(color, image.url)}
                      className="relative group"
                    >
                      <img
                        src={image.url}
                        alt={`Option ${index + 1}`}
                        className="w-full h-8 object-cover rounded border border-gray-200 hover:border-blue-500 transition-colors"
                      />
                      <div className="absolute inset-0 bg-blue-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </button>
                  ))}
                </div>
                {images.length > 6 && (
                  <p className="text-xs text-gray-400 mt-1">
                    +{images.length - 6} more images available
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedColors.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Select one image per color. All size variants (Small, Medium, Large, etc.) 
            of the same color will automatically use this image.
          </p>
        </div>
      )}
    </div>
  )
}

export { ColorImageSelector } 
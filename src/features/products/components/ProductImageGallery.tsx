import * as React from 'react'
import { CheckCircle, Image as ImageIcon, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'

export interface ProductImageGalleryProps {
  images: string[] // URLs or local preview URLs
  mainImage: string | null
  onMainImageSelect: (url: string) => void
  onRemoveImage: (url: string) => void
  onAddImages: (files: FileList | null) => void
  className?: string
  // For variant assignment, parent can use images prop and manage selection
}

const ProductImageGallery = ({
  images,
  mainImage,
  onMainImageSelect,
  onRemoveImage,
  onAddImages,
  className,
}: ProductImageGalleryProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAddImages(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Product Images</h4>
        <PremiumButton
          onClick={handleUploadClick}
          gradient="blue"
          size="sm"
          className="rounded-full px-2 py-1 text-xs font-semibold h-8"
        >
          <ImageIcon className="h-3 w-3 mr-1" />
          Upload Images
        </PremiumButton>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      {images.length === 0 ? (
        <div className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-indigo-50">
          <ImageIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">No images uploaded yet</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className={cn(
              'relative group rounded-lg overflow-hidden border',
              mainImage === url ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            )}>
              <img
                src={url}
                alt="Product"
                className="w-full h-20 object-cover"
              />
              {/* Main image badge */}
              <button
                type="button"
                onClick={() => onMainImageSelect(url)}
                className={cn(
                  'absolute top-1 left-1 bg-white/80 rounded-full p-0.5 shadow transition',
                  mainImage === url ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
                )}
                title={mainImage === url ? 'Main Image' : 'Set as Main Image'}
              >
                <Star className="h-3 w-3" fill={mainImage === url ? '#2563eb' : 'none'} />
              </button>
              {/* Remove image button */}
              <button
                type="button"
                onClick={() => onRemoveImage(url)}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-red-500 hover:bg-red-100 shadow"
                title="Remove Image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              {/* Main image overlay */}
              {mainImage === url && (
                <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

ProductImageGallery.displayName = 'ProductImageGallery'

export { ProductImageGallery } 
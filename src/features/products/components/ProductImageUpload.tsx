import * as React from 'react'
import { Image as ImageIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PremiumButton } from '@/components/ui/premium-button'

export interface ProductImageUploadProps {
  title: string
  description: string
  onImageSelect: (files: FileList | null) => void
  multiple?: boolean
  className?: string
  variant?: 'main' | 'gallery' | 'color'
  color?: string
  currentImage?: string
  onRemoveImage?: () => void
}

const ProductImageUpload = ({ 
  title, 
  description, 
  onImageSelect, 
  multiple = false, 
  className,
  variant = 'main',
  color,
  currentImage,
  onRemoveImage,
  ...props 
}: ProductImageUploadProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onImageSelect(e.target.files)
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getUploadArea = () => {
    if (currentImage) {
      return (
        <div className="relative group">
          <img 
            src={currentImage} 
            alt={title}
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <PremiumButton
              onClick={onRemoveImage}
              variant="outline"
              size="sm"
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </PremiumButton>
          </div>
        </div>
      )
    }

    return (
      <div 
        className={cn(
          "w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
          variant === 'main' && "border-blue-300/50 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400/70",
          variant === 'gallery' && "border-purple-300/50 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-400/70",
          variant === 'color' && "border-gray-300/50 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-400/70"
        )}
        onClick={handleClick}
      >
        <div className={cn(
          "w-12 h-12 rounded-lg mb-2 flex items-center justify-center",
          variant === 'main' && "bg-gradient-to-br from-blue-100 to-indigo-100",
          variant === 'gallery' && "bg-gradient-to-br from-purple-100 to-pink-100",
          variant === 'color' && "bg-gradient-to-br from-gray-100 to-slate-100"
        )}>
          <ImageIcon className={cn(
            "h-6 w-6",
            variant === 'main' && "text-blue-500",
            variant === 'gallery' && "text-purple-500",
            variant === 'color' && "text-gray-500"
          )} />
        </div>
        <p className="text-xs text-gray-600 text-center px-2">
          {color ? `${color} variant` : description}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {!currentImage && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {!currentImage && (
          <PremiumButton
            onClick={handleClick}
            gradient={variant === 'main' ? 'blue' : variant === 'gallery' ? 'purple' : 'gray'}
            size="sm"
            className="rounded-full px-3 py-1 text-xs font-semibold"
          >
            <Upload className="h-3 w-3 mr-1" />
            Choose {multiple ? 'Files' : 'Image'}
          </PremiumButton>
        )}
      </div>

      {getUploadArea()}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

ProductImageUpload.displayName = 'ProductImageUpload'

export { ProductImageUpload } 
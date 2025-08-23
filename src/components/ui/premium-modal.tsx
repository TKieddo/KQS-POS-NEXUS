import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { PremiumButton } from './premium-button'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  className?: string
}

export const PremiumModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = ''
}: PremiumModalProps) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'w-96',
    md: 'w-[480px]',
    lg: 'w-[640px]',
    xl: 'w-[768px]',
    '2xl': 'w-[1024px]'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className={`p-8 overflow-y-auto ${className}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 
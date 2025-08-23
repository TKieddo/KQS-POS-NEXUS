'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  showBackButton?: boolean
  backButtonText?: string
  onBackClick?: () => void
  children?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  showBackButton = true,
  backButtonText = 'Back',
  onBackClick,
  children
}) => {
  const router = useRouter()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-gray-600 hover:bg-gray-100/80 h-9 px-3 rounded-lg transition-all duration-200 hover:scale-105 text-xs"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                {backButtonText}
              </Button>
            )}
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="p-1.5 bg-gradient-to-br from-[#E5FF29] to-[#E5FF29]/80 rounded-lg shadow-lg">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
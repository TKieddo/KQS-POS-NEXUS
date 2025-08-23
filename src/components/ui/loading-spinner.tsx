'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-[#E5FF29] mx-auto mb-4 ${sizeClasses[size]}`}></div>
        {text && <p className="text-sm text-gray-600">{text}</p>}
      </div>
    </div>
  )
} 
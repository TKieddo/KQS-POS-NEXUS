'use client'

import React from 'react'
import { Button } from './button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionButton?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionButton,
  className = ''
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="h-8 w-8 text-gray-400 mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          className="h-8 bg-gradient-to-r from-[#E5FF29] to-[#E5FF29]/90 text-black hover:from-[#E5FF29]/90 hover:to-[#E5FF29]/80 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 text-xs"
        >
          {actionButton.icon}
          {actionButton.label}
        </Button>
      )}
    </div>
  )
} 
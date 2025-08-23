import React from 'react'
import { PremiumCard } from './premium-card'
import { Button } from './button'
import { Star, Copy, Trash2, Edit, Eye } from 'lucide-react'

interface ReceiptTemplateCardProps {
  template: {
    id?: string
    name: string
    description?: string
    is_default?: boolean
    template_type: string
  }
  isSelected: boolean
  onSelect: (templateId: string) => void
  onDuplicate: (templateId: string) => void
  onDelete: (templateId: string) => void
  onSetDefault: (templateId: string) => void
  onEdit: (templateId: string) => void
  onPreview: (templateId: string) => void
  children: React.ReactNode
}

const ReceiptTemplateCard: React.FC<ReceiptTemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onSetDefault,
  onEdit,
  onPreview,
  children
}) => {
  return (
    <div 
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-primary ring-opacity-50'
          : 'hover:ring-1 hover:ring-primary hover:ring-opacity-30'
      }`}
      onClick={() => onSelect(template.id || '')}
    >
      <PremiumCard 
        className={`p-4 ${
          isSelected
            ? 'border-primary bg-primary/5 shadow-lg'
            : 'border-border hover:border-primary/50 hover:shadow-md'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-gray-900">{template.name}</h4>
              {template.is_default && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {template.description || 'No description'}
            </p>
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {template.template_type}
            </span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="mb-3 bg-gray-50 rounded-lg p-2 min-h-[120px] flex items-center justify-center">
          {children}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onPreview(template.id || '')
              }}
              className="h-7 px-2"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(template.id || '')
              }}
              className="h-7 px-2"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(template.id || '')
              }}
              className="h-7 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            {!template.is_default && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetDefault(template.id || '')
                  }}
                  className="h-7 px-2"
                >
                  <Star className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(template.id || '')
                  }}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </PremiumCard>
    </div>
  )
}

export { ReceiptTemplateCard } 
import React from 'react'
import { PremiumCard } from './premium-card'
import { Button } from './button'
import { Download, Upload } from 'lucide-react'
import { ReceiptTemplateCard } from './receipt-template-card'
import { TemplatePreview } from './template-preview'
import type { ReceiptTemplate } from '@/lib/receipt-template-service'

interface TemplateManagementProps {
  templates: ReceiptTemplate[]
  selectedTemplateId: string | null
  onTemplateSelect: (templateId: string) => void
  onDuplicate: (templateId: string) => void
  onDelete: (templateId: string) => void
  onSetDefault: (templateId: string) => void
  onEdit: (templateId: string) => void
  onPreview: (templateId: string) => void
  onExport: () => void
  onImport: () => void
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onDuplicate,
  onDelete,
  onSetDefault,
  onEdit,
  onPreview,
  onExport,
  onImport
}) => {
  const getTemplateType = (template: ReceiptTemplate) => {
    // Map template names to types for preview
    const name = template.name.toLowerCase()
    if (name.includes('retail')) return 'retail'
    if (name.includes('luxury')) return 'luxury'
    if (name.includes('laybye') && name.includes('payment')) return 'laybye'
    if (name.includes('quotation')) return 'quotation'
    if (name.includes('delivery')) return 'delivery'
    if (name.includes('refund')) return 'refund'
    if (name.includes('cash-drop')) return 'cash-drop'
    if (name.includes('order')) return 'order'
    if (name.includes('cash-up')) return 'cash-up'
    if (name.includes('till-session')) return 'till-session'
    if (name.includes('intermediate')) return 'intermediate'
    if (name.includes('account-payment')) return 'account-payment'
    if (name.includes('laybye-reserve')) return 'laybye-reserve'
    if (name.includes('laybye-cancellation')) return 'laybye-cancellation'
    if (name.includes('returns-exchange')) return 'returns-exchange'
    if (name.includes('customer-statement')) return 'customer-statement'
    return 'default'
  }

  return (
    <PremiumCard className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Template Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={onImport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => (
          <ReceiptTemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={onTemplateSelect}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onSetDefault={onSetDefault}
            onEdit={onEdit}
            onPreview={onPreview}
          >
            <TemplatePreview 
              templateType={getTemplateType(template)}
              className="w-full h-full"
            />
          </ReceiptTemplateCard>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Create your first receipt template to get started</p>
          </div>
        </div>
      )}
    </PremiumCard>
  )
}

export { TemplateManagement } 
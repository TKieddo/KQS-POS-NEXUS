import React from 'react'
import { PremiumCard } from './premium-card'
import { Button } from './button'
import { Download, Upload } from 'lucide-react'
import { ReceiptTemplateCard } from './receipt-template-card'
import type { ReceiptTemplate } from '@/lib/receipt-template-service'

// Import all the custom receipt template components
import RetailReceiptPreview from './retail-receipt-preview'
import LuxuryReceiptPreview from './luxury-receipt-preview'
import LaybyePaymentReceiptPreview from './laybye-payment-receipt-preview'
import LaybyeReserveSlipPreview from './laybye-reserve-slip-preview'
import AccountPaymentReceiptPreview from './account-payment-receipt-preview'
import IntermediateBillReceiptPreview from './intermediate-bill-receipt-preview'
import TillSessionReportReceiptPreview from './till-session-report-receipt-preview'
import LaybyeCancellationReceiptPreview from './laybye-cancellation-receipt-preview'
import ReturnsExchangeSlipReceiptPreview from './returns-exchange-slip-receipt-preview'
import RefundSlipReceiptPreview from './refund-slip-receipt-preview'
import CashUpReportReceiptPreview from './cash-up-report-receipt-preview'
import OrderSlipReceiptPreview from './order-slip-receipt-preview'
import CashDropWithdrawReceiptPreview from './cash-drop-withdraw-receipt-preview'
import DeliverySlipReceiptPreview from './delivery-slip-receipt-preview'
import QuotationSlipReceiptPreview from './quotation-slip-receipt-preview'
import CustomerStatementReceiptPreview from './customer-statement-receipt-preview'

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

// Component to render the correct receipt template based on template type
const DynamicReceiptPreview: React.FC<{ template: ReceiptTemplate; className?: string }> = ({ 
  template, 
  className = "" 
}) => {
  const name = template.name.toLowerCase()
  
  // Debug: Log the template name to see what we're working with
  console.log('Template Management Template name:', template.name, 'Lowercase:', name)
  
  // For template management page, we want a preview version (just header section)
  // Return the appropriate preview component based on template type
  if (name.includes('cash up')) {
    console.log('Template Management Rendering CashUpReportReceiptPreview')
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        {/* Header Only */}
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Cash Up Report</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('final laybye payment')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Luxury Receipt</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('laybye') && name.includes('payment')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Laybye Payment</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('laybye reserve')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Laybye Reserve Slip</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('account payment')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Account Payment</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('intermediate')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Intermediate Bill</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('till session')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Till Session Report</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('laybye cancellation')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Laybye Cancellation</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('returns') && name.includes('exchange')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Returns & Exchange</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('refund')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Refund Slip</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('order')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Order Slip</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('cash drop')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Cash Drop/Withdraw</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('delivery')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Delivery Slip</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('quotation')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Quotation Slip</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('customer statement')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Customer Statement</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('retail')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="flex justify-center mb-1">
            <img 
              src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" 
              alt="KQS Logo" 
              className="w-3/5 h-auto object-contain"
            />
          </div>
          <div className="font-bold text-gray-900 text-sm">Retail Receipt</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  if (name.includes('luxury')) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Luxury Receipt</div>
        </div>
        <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
      </div>
    )
  }
  
  // Default to retail receipt if no match
  console.log('Template Management Defaulting to RetailReceiptPreview')
  return (
    <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 font-mono text-xs shadow-lg relative h-48 overflow-hidden ${className}`}>
      <div className="text-center mb-3">
        <div className="flex justify-center mb-1">
          <img 
            src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" 
            alt="KQS Logo" 
            className="w-3/5 h-auto object-contain"
          />
        </div>
        <div className="font-bold text-gray-900 text-sm">Retail Receipt</div>
      </div>
      <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
      <div className="text-center text-gray-600 text-xs mt-2">Preview - Click eye icon for full view</div>
    </div>
  )
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
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
            <DynamicReceiptPreview 
              template={template}
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
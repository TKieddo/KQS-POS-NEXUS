import React, { useState } from 'react'
import { Plus, Edit, Trash2, Eye, Copy, Settings } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { ReceiptTemplate } from '@/lib/printing-service'
import LuxuryReceiptPreview from '@/components/ui/luxury-receipt-preview'
import LaybyePaymentReceiptPreview from '@/components/ui/laybye-payment-receipt-preview'
import LaybyeReserveSlipPreview from '@/components/ui/laybye-reserve-slip-preview'
import RetailReceiptPreview from '@/components/ui/retail-receipt-preview'
import AccountPaymentReceiptPreview from '@/components/ui/account-payment-receipt-preview'
import IntermediateBillReceiptPreview from '@/components/ui/intermediate-bill-receipt-preview'
import TillSessionReportReceiptPreview from '@/components/ui/till-session-report-receipt-preview'
import LaybyeCancellationReceiptPreview from '@/components/ui/laybye-cancellation-receipt-preview'
import ReturnsExchangeSlipReceiptPreview from '@/components/ui/returns-exchange-slip-receipt-preview'
import RefundSlipReceiptPreview from '@/components/ui/refund-slip-receipt-preview'
import CashUpReportReceiptPreview from '@/components/ui/cash-up-report-receipt-preview'
import OrderSlipReceiptPreview from '@/components/ui/order-slip-receipt-preview'
import CashDropWithdrawReceiptPreview from '@/components/ui/cash-drop-withdraw-receipt-preview'
import DeliverySlipReceiptPreview from '@/components/ui/delivery-slip-receipt-preview'
import QuotationSlipReceiptPreview from '@/components/ui/quotation-slip-receipt-preview'
import CustomerStatementReceiptPreview from '@/components/ui/customer-statement-receipt-preview'
import LaybyeFinalPaymentReceiptPreview from '@/components/ui/laybye-final-payment-receipt-preview'
import { printReceipt } from '@/lib/qz-printing'

interface TemplateManagerProps {
  templates: ReceiptTemplate[]
  onEdit: (template: ReceiptTemplate) => void
  onDelete: (templateId: string) => void
  onCreate: () => void
  onPreview: (template: ReceiptTemplate) => void
}

// Component to render visual preview based on template ID
const TemplateVisualPreview: React.FC<{ templateId: string }> = ({ templateId }) => {
  switch (templateId) {
    case 'laybye-final-payment':
      return <LaybyeFinalPaymentReceiptPreview className="scale-75 transform origin-top" />
    case 'laybye-payment':
      return <LaybyePaymentReceiptPreview className="scale-75 transform origin-top" />
    case 'laybye-reserve-slip':
      return <LaybyeReserveSlipPreview className="scale-75 transform origin-top" />
    case 'retail-receipt':
      return <RetailReceiptPreview className="scale-75 transform origin-top" />
    case 'account-payment':
      return <AccountPaymentReceiptPreview className="scale-75 transform origin-top" />
    case 'intermediate-bill':
      return <IntermediateBillReceiptPreview className="scale-75 transform origin-top" />
    case 'till-session-report':
      return <TillSessionReportReceiptPreview className="scale-75 transform origin-top" />
    case 'laybye-cancellation':
      return <LaybyeCancellationReceiptPreview className="scale-75 transform origin-top" />
    case 'returns-exchange-slip':
      return <ReturnsExchangeSlipReceiptPreview className="scale-75 transform origin-top" />
    case 'refund-slip':
      return <RefundSlipReceiptPreview className="scale-75 transform origin-top" />
    case 'cash-up-report':
      return <CashUpReportReceiptPreview className="scale-75 transform origin-top" />
    case 'order-slip':
      return <OrderSlipReceiptPreview className="scale-75 transform origin-top" />
    case 'cash-drop-withdraw':
      return <CashDropWithdrawReceiptPreview className="scale-75 transform origin-top" />
    case 'delivery-slip':
      return <DeliverySlipReceiptPreview className="scale-75 transform origin-top" />
    case 'quotation-slip':
      return <QuotationSlipReceiptPreview className="scale-75 transform origin-top" />
    case 'customer-statement':
      return <CustomerStatementReceiptPreview className="scale-75 transform origin-top" />
    default:
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-xs shadow-lg">
          <div className="text-center text-gray-500">
            <div className="text-lg font-bold mb-2">Template Preview</div>
            <div className="text-sm">Visual preview not available</div>
          </div>
        </div>
      )
  }
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onEdit,
  onDelete,
  onCreate,
  onPreview
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'compact' | 'detailed' | 'custom'>('all')

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || template.template_type === filterType
    return matchesSearch && matchesType
  })

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'compact': return 'bg-green-100 text-green-800'
      case 'detailed': return 'bg-purple-100 text-purple-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Receipt Templates</h2>
          <p className="text-sm text-gray-600">Manage your receipt design templates</p>
        </div>
        <PremiumButton
          onClick={onCreate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </PremiumButton>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="standard">Standard</option>
          <option value="compact">Compact</option>
          <option value="detailed">Detailed</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <PremiumCard className="p-12 text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'No templates match your search criteria'
              : 'Create your first receipt template to get started'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <PremiumButton onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </PremiumButton>
          )}
        </PremiumCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTemplates.map(template => (
            <PremiumCard key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(template.template_type)}`}>
                    {template.template_type}
                  </span>
                </div>
                <div className={`w-3 h-3 rounded-full ${template.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>

              {/* Template Description */}
              {template.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {template.description}
                </p>
              )}

              {/* Visual Preview */}
              <div className="mb-4">
                <TemplateVisualPreview templateId={template.id} />
              </div>

              {/* Template Actions */}
              <div className="flex items-center gap-2">
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => onPreview(template)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Full Preview
                </PremiumButton>
                
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(template)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </PremiumButton>
                
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Clone template functionality
                    const clonedTemplate = {
                      ...template,
                      id: '',
                      name: `${template.name} (Copy)`,
                      description: `${template.description} - Copy`
                    }
                    onEdit(clonedTemplate)
                  }}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Clone
                </PremiumButton>
              </div>

              {/* Delete Action */}
              <div className="mt-3 pt-3 border-t">
                <PremiumButton
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(template.id)}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
        </div>
      </div>
    </div>
  )
}

export default TemplateManager 
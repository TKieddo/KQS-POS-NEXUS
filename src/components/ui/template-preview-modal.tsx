import React from 'react'
import { PremiumCard } from './premium-card'
import { Button } from './button'
import { X, Printer } from 'lucide-react'
import RetailReceiptPreview from './retail-receipt-preview'
import LuxuryReceiptPreview from './luxury-receipt-preview'
import LaybyePaymentReceiptPreview from './laybye-payment-receipt-preview'
import QuotationSlipReceiptPreview from './quotation-slip-receipt-preview'
import DeliverySlipReceiptPreview from './delivery-slip-receipt-preview'
import RefundSlipReceiptPreview from './refund-slip-receipt-preview'
import CashDropWithdrawReceiptPreview from './cash-drop-withdraw-receipt-preview'
import OrderSlipReceiptPreview from './order-slip-receipt-preview'
import CashUpReportReceiptPreview from './cash-up-report-receipt-preview'
import TillSessionReportReceiptPreview from './till-session-report-receipt-preview'
import IntermediateBillReceiptPreview from './intermediate-bill-receipt-preview'
import AccountPaymentReceiptPreview from './account-payment-receipt-preview'
import LaybyeReserveSlipPreview from './laybye-reserve-slip-preview'
import LaybyeCancellationReceiptPreview from './laybye-cancellation-receipt-preview'
import ReturnsExchangeSlipReceiptPreview from './returns-exchange-slip-receipt-preview'
import CustomerStatementReceiptPreview from './customer-statement-receipt-preview'
import type { ReceiptTemplate } from '@/lib/receipt-template-service'

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: ReceiptTemplate | null
  onPrint?: () => void
  printing?: boolean
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  onPrint,
  printing = false
}) => {
  if (!isOpen || !template) return null

  const getTemplateComponent = () => {
    const name = template.name.toLowerCase()
    
    if (name.includes('retail')) {
      return <RetailReceiptPreview template={template} className="w-full max-w-md" />
    }
    if (name.includes('luxury')) {
      return <LuxuryReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('laybye') && name.includes('payment')) {
      return <LaybyePaymentReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('quotation')) {
      return <QuotationSlipReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('delivery')) {
      return <DeliverySlipReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('refund')) {
      return <RefundSlipReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('cash-drop')) {
      return <CashDropWithdrawReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('order')) {
      return <OrderSlipReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('cash-up')) {
      return <CashUpReportReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('till-session')) {
      return <TillSessionReportReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('intermediate')) {
      return <IntermediateBillReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('account-payment')) {
      return <AccountPaymentReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('laybye-reserve')) {
      return <LaybyeReserveSlipPreview className="w-full max-w-md" />
    }
    if (name.includes('laybye-cancellation')) {
      return <LaybyeCancellationReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('returns-exchange')) {
      return <ReturnsExchangeSlipReceiptPreview className="w-full max-w-md" />
    }
    if (name.includes('customer-statement')) {
      return <CustomerStatementReceiptPreview className="w-full max-w-md" />
    }
    
    // Default to retail receipt
    return <RetailReceiptPreview template={template} className="w-full max-w-md" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">{template.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preview of receipt template
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onPrint && (
              <Button
                onClick={onPrint}
                disabled={printing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {printing ? 'Printing...' : 'Print'}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex justify-center">
            {getTemplateComponent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export { TemplatePreviewModal } 
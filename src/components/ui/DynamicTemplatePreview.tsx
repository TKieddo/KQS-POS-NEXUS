import React from 'react'
import { getTemplateComponent } from '@/lib/template-service'

// Import all template preview components
import LuxuryReceiptPreview from './luxury-receipt-preview'
import LaybyePaymentReceiptPreview from './laybye-payment-receipt-preview'
import LaybyeReserveSlipPreview from './laybye-reserve-slip-preview'
import RetailReceiptPreview from './retail-receipt-preview'
import AccountPaymentReceiptPreview from './account-payment-receipt-preview'
import RefundSlipReceiptPreview from './refund-slip-receipt-preview'
import ReturnsExchangeSlipReceiptPreview from './returns-exchange-slip-receipt-preview'
import CashUpReportReceiptPreview from './cash-up-report-receipt-preview'
import TillSessionReportReceiptPreview from './till-session-report-receipt-preview'
import LaybyeCancellationReceiptPreview from './laybye-cancellation-receipt-preview'
import OrderSlipReceiptPreview from './order-slip-receipt-preview'
import DeliverySlipReceiptPreview from './delivery-slip-receipt-preview'
import CashDropWithdrawReceiptPreview from './cash-drop-withdraw-receipt-preview'
import QuotationSlipReceiptPreview from './quotation-slip-receipt-preview'
import CustomerStatementReceiptPreview from './customer-statement-receipt-preview'
import LaybyeFinalPaymentReceiptPreview from './laybye-final-payment-receipt-preview'
import IntermediateBillReceiptPreview from './intermediate-bill-receipt-preview'

interface DynamicTemplatePreviewProps {
  templateId: string
  className?: string
}

// Component mapping
const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'LuxuryReceiptPreview': LuxuryReceiptPreview,
  'LaybyePaymentReceiptPreview': LaybyePaymentReceiptPreview,
  'LaybyeFinalPaymentReceiptPreview': LaybyeFinalPaymentReceiptPreview,
  'LaybyeReserveSlipPreview': LaybyeReserveSlipPreview,
  'RetailReceiptPreview': RetailReceiptPreview,
  'AccountPaymentReceiptPreview': AccountPaymentReceiptPreview,
  'RefundSlipReceiptPreview': RefundSlipReceiptPreview,
  'ReturnsExchangeSlipReceiptPreview': ReturnsExchangeSlipReceiptPreview,
  'CashUpReportReceiptPreview': CashUpReportReceiptPreview,
  'TillSessionReportReceiptPreview': TillSessionReportReceiptPreview,
  'LaybyeCancellationReceiptPreview': LaybyeCancellationReceiptPreview,
  'OrderSlipReceiptPreview': OrderSlipReceiptPreview,
  'DeliverySlipReceiptPreview': DeliverySlipReceiptPreview,
  'CashDropWithdrawReceiptPreview': CashDropWithdrawReceiptPreview,
  'QuotationSlipReceiptPreview': QuotationSlipReceiptPreview,
  'CustomerStatementReceiptPreview': CustomerStatementReceiptPreview,
  'IntermediateBillReceiptPreview': IntermediateBillReceiptPreview
}

const DynamicTemplatePreview: React.FC<DynamicTemplatePreviewProps> = ({ 
  templateId, 
  className = '' 
}) => {
  const componentName = getTemplateComponent(templateId)
  
  if (!componentName) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-xs shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-bold mb-2">Template Not Found</div>
          <div className="text-sm">Template ID: {templateId}</div>
        </div>
      </div>
    )
  }

  const TemplateComponent = TEMPLATE_COMPONENTS[componentName]
  
  if (!TemplateComponent) {
    return (
      <div className={`bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-xs shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-lg font-bold mb-2">Component Not Found</div>
          <div className="text-sm">Component: {componentName}</div>
        </div>
      </div>
    )
  }

  return <TemplateComponent className={className} />
}

export default DynamicTemplatePreview 
import { ReceiptTemplate } from './printing-service'

// Template definitions that map to existing UI components
export const TEMPLATE_DEFINITIONS = [
  {
    id: 'luxury-receipt',
    name: 'KQS Luxury Receipt',
    description: 'Premium boutique receipt with category icons and luxury styling',
    template_type: 'custom' as const,
    component: 'LuxuryReceiptPreview',
    category: 'receipts'
  },
  {
    id: 'laybye-payment',
    name: 'Laybye Payment Receipt',
    description: 'Specialized receipt for laybye payment transactions',
    template_type: 'detailed' as const,
    component: 'LaybyePaymentReceiptPreview',
    category: 'laybye'
  },
  {
    id: 'laybye-reserve-slip',
    name: 'Laybye Reserve Slip',
    description: 'Initial laybye reservation slip',
    template_type: 'standard' as const,
    component: 'LaybyeReserveSlipPreview',
    category: 'laybye'
  },
  {
    id: 'laybye-cancellation',
    name: 'Laybye Cancellation',
    description: 'Laybye cancellation receipt',
    template_type: 'standard' as const,
    component: 'LaybyeCancellationReceiptPreview',
    category: 'laybye'
  },
  {
    id: 'retail-receipt',
    name: 'Standard Retail Receipt',
    description: 'Standard retail transaction receipt',
    template_type: 'standard' as const,
    component: 'RetailReceiptPreview',
    category: 'receipts'
  },
  {
    id: 'account-payment',
    name: 'Account Payment Receipt',
    description: 'Receipt for account payment transactions',
    template_type: 'detailed' as const,
    component: 'AccountPaymentReceiptPreview',
    category: 'payments'
  },
  {
    id: 'refund-slip',
    name: 'Refund Slip',
    description: 'Refund transaction slip',
    template_type: 'standard' as const,
    component: 'RefundSlipReceiptPreview',
    category: 'refunds'
  },
  {
    id: 'returns-exchange-slip',
    name: 'Returns/Exchange Slip',
    description: 'Returns and exchange transaction slip',
    template_type: 'standard' as const,
    component: 'ReturnsExchangeSlipReceiptPreview',
    category: 'refunds'
  },
  {
    id: 'cash-up-report',
    name: 'Cash Up Report',
    description: 'End of day cash up report',
    template_type: 'detailed' as const,
    component: 'CashUpReportReceiptPreview',
    category: 'reports'
  },
  {
    id: 'till-session-report',
    name: 'Till Session Report',
    description: 'Till session summary report',
    template_type: 'detailed' as const,
    component: 'TillSessionReportReceiptPreview',
    category: 'reports'
  },
  {
    id: 'order-slip',
    name: 'Order Slip',
    description: 'Order placement slip',
    template_type: 'standard' as const,
    component: 'OrderSlipReceiptPreview',
    category: 'orders'
  },
  {
    id: 'delivery-slip',
    name: 'Delivery Slip',
    description: 'Delivery confirmation slip',
    template_type: 'standard' as const,
    component: 'DeliverySlipReceiptPreview',
    category: 'delivery'
  },
  {
    id: 'cash-drop-withdraw',
    name: 'Cash Drop/Withdraw',
    description: 'Cash drop or withdrawal slip',
    template_type: 'standard' as const,
    component: 'CashDropWithdrawReceiptPreview',
    category: 'cash'
  },
  {
    id: 'quotation-slip',
    name: 'Quotation Slip',
    description: 'Price quotation slip',
    template_type: 'standard' as const,
    component: 'QuotationSlipReceiptPreview',
    category: 'quotations'
  },
  {
    id: 'customer-statement',
    name: 'Customer Statement',
    description: 'Customer account statement',
    template_type: 'detailed' as const,
    component: 'CustomerStatementReceiptPreview',
    category: 'statements'
  },
  {
    id: 'intermediate-bill',
    name: 'Intermediate Bill',
    description: 'Intermediate billing slip',
    template_type: 'standard' as const,
    component: 'IntermediateBillReceiptPreview',
    category: 'billing'
  }
]

/**
 * Get all available templates
 */
export const getAllTemplates = (): ReceiptTemplate[] => {
  return TEMPLATE_DEFINITIONS.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    template_type: template.template_type,
    layout: {
      header: [],
      body: [],
      footer: [],
      styling: {
        font_family: 'monospace',
        line_height: 1.2,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        colors: { primary: '#000000', secondary: '#666666', accent: '#E5FF29' }
      }
    },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: string): ReceiptTemplate[] => {
  return getAllTemplates().filter(template => {
    const definition = TEMPLATE_DEFINITIONS.find(def => def.id === template.id)
    return definition?.category === category
  })
}

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): ReceiptTemplate | undefined => {
  return getAllTemplates().find(template => template.id === id)
}

/**
 * Get template categories
 */
export const getTemplateCategories = () => {
  const categories = [...new Set(TEMPLATE_DEFINITIONS.map(t => t.category))]
  return categories.map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
    count: TEMPLATE_DEFINITIONS.filter(t => t.category === category).length
  }))
}

/**
 * Get component name for template
 */
export const getTemplateComponent = (templateId: string): string | undefined => {
  const template = TEMPLATE_DEFINITIONS.find(t => t.id === templateId)
  return template?.component
} 
import React, { useState, useEffect } from 'react'
import { X, Printer, Download, Eye } from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { PrintingSettings, ReceiptTemplate, formatCurrency, formatDate, formatTime } from '@/lib/printing-service'

interface ReceiptPreviewProps {
  settings: PrintingSettings
  templates: ReceiptTemplate[]
  selectedTemplate?: ReceiptTemplate | null
  onClose: () => void
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  settings, 
  templates, 
  selectedTemplate, 
  onClose 
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [previewData, setPreviewData] = useState<any>({})

  useEffect(() => {
    if (selectedTemplate) {
      setSelectedTemplateId(selectedTemplate.id)
    } else if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [selectedTemplate, templates])

  useEffect(() => {
    // Generate sample data for preview
    setPreviewData({
      business_name: 'KQS POS Store',
      business_address: '123 Main Street, Johannesburg, South Africa',
      business_phone: '+27 11 123 4567',
      business_email: 'info@kqspos.com',
      receipt_number: 'R202412011234567890',
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      cashier_name: 'John Doe',
      customer_name: 'Jane Smith',
      items: [
        { name: 'Product 1', quantity: 2, price: 25.00, total: 50.00 },
        { name: 'Product 2', quantity: 1, price: 15.50, total: 15.50 },
        { name: 'Product 3', quantity: 3, price: 10.00, total: 30.00 }
      ],
      subtotal: 95.50,
      tax_amount: 14.33,
      tax_rate: 15,
      total: 109.83,
      payment_method: 'Cash',
      change: 0.17,
      receipt_footer: settings.receipt_footer,
      receipt_url: 'https://kqspos.com/receipt/R202412011234567890'
    })
  }, [settings])

  const currentTemplate = templates.find(t => t.id === selectedTemplateId)

  const renderElement = (element: any) => {
    const { type, content, alignment, font_size, font_weight } = element
    
    // Replace template variables with actual data
    let processedContent = content
    Object.keys(previewData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processedContent = processedContent.replace(regex, previewData[key])
    })

    const alignmentClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }

    const fontSizeClasses = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base'
    }

    const fontWeightClasses = {
      normal: 'font-normal',
      bold: 'font-bold'
    }

    const baseClasses = `${alignmentClasses[alignment]} ${fontSizeClasses[font_size]} ${fontWeightClasses[font_weight]}`

    switch (type) {
      case 'text':
        return (
          <div key={element.id} className={baseClasses}>
            {processedContent}
          </div>
        )
      
      case 'divider':
        return (
          <div key={element.id} className={`${baseClasses} border-t border-gray-300 my-2`}>
            {processedContent}
          </div>
        )
      
      case 'table':
        return (
          <div key={element.id} className={baseClasses}>
            <div className="space-y-1">
              {previewData.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'total':
        return (
          <div key={element.id} className={`${baseClasses} font-bold`}>
            {processedContent}
          </div>
        )
      
      case 'tax_breakdown':
        return (
          <div key={element.id} className={baseClasses}>
            <div>Tax ({previewData.tax_rate}%): {formatCurrency(previewData.tax_amount)}</div>
          </div>
        )
      
      case 'logo':
        return (
          <div key={element.id} className={`${baseClasses} py-2`}>
            <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
              <span className="text-gray-500 text-xs">LOGO</span>
            </div>
          </div>
        )
      
      case 'barcode':
        return (
          <div key={element.id} className={`${baseClasses} py-2`}>
            <div className="bg-black text-white p-2 text-xs font-mono">
              {processedContent}
            </div>
          </div>
        )
      
      case 'qr_code':
        return (
          <div key={element.id} className={`${baseClasses} py-2`}>
            <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
              <span className="text-gray-500 text-xs">QR</span>
            </div>
          </div>
        )
      
      default:
        return (
          <div key={element.id} className={baseClasses}>
            {processedContent}
          </div>
        )
    }
  }

  const renderReceipt = () => {
    if (!currentTemplate) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Eye className="h-8 w-8 mx-auto mb-2" />
          <p>No template selected</p>
        </div>
      )
    }

    const { layout } = currentTemplate

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 max-w-sm mx-auto">
        {/* Receipt Content */}
        <div className="space-y-2 font-mono text-sm">
          {/* Header */}
          {layout.header.map(renderElement)}
          
          {/* Body */}
          {layout.body.map(renderElement)}
          
          {/* Footer */}
          {layout.footer.map(renderElement)}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Receipt Preview</h2>
            <p className="text-sm text-gray-600">Preview how your receipts will look when printed</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Template Selection & Controls */}
          <div className="w-80 border-r bg-gray-50 p-4 space-y-6">
            {/* Template Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Select Template</h3>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E5FF29] focus:outline-none"
              >
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Info */}
            {currentTemplate && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">{currentTemplate.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{currentTemplate.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Type: {currentTemplate.template_type}</div>
                  <div>Header: {currentTemplate.layout.header.length} elements</div>
                  <div>Body: {currentTemplate.layout.body.length} elements</div>
                  <div>Footer: {currentTemplate.layout.footer.length} elements</div>
                </div>
              </div>
            )}

            {/* Preview Controls */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Preview Controls</h3>
              <div className="space-y-3">
                <PremiumButton
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Preview
                </PremiumButton>
                
                <PremiumButton
                  variant="outline"
                  onClick={() => {
                    // Download as PDF functionality would go here
                    alert('PDF download functionality coming soon!')
                  }}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </PremiumButton>
              </div>
            </div>

            {/* Sample Data */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Sample Data</h3>
              <div className="bg-white p-4 rounded-lg border text-xs space-y-2">
                <div><strong>Receipt #:</strong> {previewData.receipt_number}</div>
                <div><strong>Date:</strong> {previewData.date}</div>
                <div><strong>Time:</strong> {previewData.time}</div>
                <div><strong>Cashier:</strong> {previewData.cashier_name}</div>
                <div><strong>Customer:</strong> {previewData.customer_name}</div>
                <div><strong>Total:</strong> {formatCurrency(previewData.total)}</div>
                <div><strong>Payment:</strong> {previewData.payment_method}</div>
              </div>
            </div>
          </div>

          {/* Right Panel - Receipt Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Receipt Preview</h3>
              <div className="text-sm text-gray-500">
                Paper: {settings.paper_size} • Width: {settings.paper_width}mm
              </div>
            </div>
            
            <div className="flex justify-center">
              {renderReceipt()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptPreview 
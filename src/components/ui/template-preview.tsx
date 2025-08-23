import React from 'react'

interface TemplatePreviewProps {
  templateType: string
  className?: string
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ templateType, className }) => {
  const getPreviewContent = () => {
    switch (templateType) {
      case 'retail':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Retail Receipt</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Items: 3</div>
            <div className="text-gray-700">Total: R3,150</div>
          </div>
        )
      
      case 'luxury':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Luxury Receipt</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Enhanced Design</div>
            <div className="text-gray-700">QR Code</div>
          </div>
        )
      
      case 'laybye':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Laybye Payment</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Balance: R750</div>
            <div className="text-gray-700">Progress: 60%</div>
          </div>
        )
      
      case 'quotation':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Quotation Slip</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Valid: 7 days</div>
            <div className="text-gray-700">Quote #: Q-001</div>
          </div>
        )
      
      case 'delivery':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Delivery Slip</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Items: 2</div>
            <div className="text-gray-700">Status: Ready</div>
          </div>
        )
      
      case 'refund':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Refund Slip</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Refund: R450</div>
            <div className="text-gray-700">Reason: Exchange</div>
          </div>
        )
      
      case 'cash-drop':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Cash Drop</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Amount: R2,500</div>
            <div className="text-gray-700">Till: #001</div>
          </div>
        )
      
      case 'order':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Order Slip</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Order #: O-001</div>
            <div className="text-gray-700">Status: Pending</div>
          </div>
        )
      
      case 'cash-up':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Cash Up Report</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Total: R15,250</div>
            <div className="text-gray-700">Session: #001</div>
          </div>
        )
      
      case 'till-session':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Till Session</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Sales: 45</div>
            <div className="text-gray-700">Total: R12,800</div>
          </div>
        )
      
      case 'intermediate':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Intermediate Bill</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Partial: R1,200</div>
            <div className="text-gray-700">Remaining: R800</div>
          </div>
        )
      
      case 'account-payment':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Account Payment</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Payment: R500</div>
            <div className="text-gray-700">Balance: R1,200</div>
          </div>
        )
      
      case 'laybye-reserve':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Laybye Reserve</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Deposit: R300</div>
            <div className="text-gray-700">Valid: 3 months</div>
          </div>
        )
      
      case 'laybye-cancellation':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Laybye Cancel</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Refund: R1,500</div>
            <div className="text-gray-700">Reason: Cancelled</div>
          </div>
        )
      
      case 'returns-exchange':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Returns &amp; Exchange</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Exchange: 1 item</div>
            <div className="text-gray-700">Credit: R850</div>
          </div>
        )
      
      case 'customer-statement':
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Customer Statement</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Balance: R2,100</div>
            <div className="text-gray-700">Transactions: 8</div>
          </div>
        )
      
      default:
        return (
          <div className="text-center text-xs font-mono">
            <div className="font-bold mb-1">KQS</div>
            <div className="text-gray-600">Receipt Template</div>
            <div className="text-gray-500 mt-1">━━━━━━━━━━━━━━</div>
            <div className="text-gray-700">Custom Design</div>
            <div className="text-gray-700">Editable</div>
          </div>
        )
    }
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      {getPreviewContent()}
    </div>
  )
}

export { TemplatePreview } 
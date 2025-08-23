import React from 'react'

interface LaybyeReserveSlipData {
  customer_name: string
  customer_phone: string
  customer_id: string
  laybye_number: string
  product_name: string
  product_sku: string
  total_amount: number
  amount_paid: number
  remaining_balance: number
  laybye_date: string
  expiry_date: string
  branch_name: string
  branch_address: string
  branch_phone: string
  cashier_name: string
}

interface LaybyeReserveSlipPreviewProps {
  className?: string
}

const LaybyeReserveSlipPreview: React.FC<LaybyeReserveSlipPreviewProps> = ({ className }) => {
  // Sample data for preview
  const sampleData: LaybyeReserveSlipData = {
    customer_name: "John Doe",
    customer_phone: "+267 71 234 567",
    customer_id: "CUST-001",
    laybye_number: "LB-2024-001",
    product_name: "Nike Air Max 270",
    product_sku: "NK-AM270-BLK-42",
    total_amount: 1200.00,
    amount_paid: 400.00,
    remaining_balance: 800.00,
    laybye_date: "2024-01-15",
    expiry_date: "2024-04-15",
    branch_name: "KQS Footware - Main Branch",
    branch_address: "123 Main Street, Gaborone",
    branch_phone: "+267 31 123 456",
    cashier_name: "Sarah Johnson"
  }

  const formatCurrency = (amount: number) => {
    return `P${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className={`max-w-sm mx-auto bg-white border border-gray-300 shadow-lg ${className || ''}`}>
      {/* Header */}
      <div className="text-center py-2 border-b border-gray-300">
        <h1 className="text-lg font-bold text-black">LAY-BYE RESERVE SLIP</h1>
        <p className="text-xs text-gray-600">KEEP WITH GOODS</p>
      </div>

      {/* Lay-bye Number */}
      <div className="p-2 border-b border-gray-300">
        <div className="text-center">
          <div className="text-sm text-gray-600">LAY-BYE NUMBER</div>
          <div className="text-lg font-bold text-black">{sampleData.laybye_number}</div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="p-2 border-b border-gray-300">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-bold text-black">{sampleData.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-bold text-black">{sampleData.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer ID:</span>
            <span className="font-bold text-black">{sampleData.customer_id}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2 border-b border-gray-300">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Product:</span>
            <span className="font-bold text-black">{sampleData.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SKU:</span>
            <span className="font-bold text-black">{sampleData.product_sku}</span>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div className="p-2 border-b border-gray-300">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.amount_paid)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining Balance:</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.remaining_balance)}</span>
          </div>
        </div>
      </div>

      {/* Important Dates */}
      <div className="p-2">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Lay-bye Date:</span>
            <span className="font-bold text-black">{formatDate(sampleData.laybye_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expiry Date:</span>
            <span className="font-bold text-black">{formatDate(sampleData.expiry_date)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaybyeReserveSlipPreview 
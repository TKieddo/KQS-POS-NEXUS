import React from 'react'
import { PremiumCard } from './premium-card'

interface LuxuryReceiptPreviewProps {
  className?: string
}

const LuxuryReceiptPreview: React.FC<LuxuryReceiptPreviewProps> = ({ className }) => {
  // Sample data for preview
  const sampleData = {
    business_name: 'KQS',
    business_address: 'Maseru, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'kqs-boutique.com',
    receipt_number: 'KQS-2024-001234',
    laybye_id: '52466',
    payment_id: '13098',
    date: '21-Dec-24',
    time: '11:24 AM',
    cashier_name: 'Hape',
    customer_name: 'NTEBALENG TAELO',
    items: [
      { name: 'ADIDAS Sneakers', quantity: 1, price: 850.00, total: 850.00, category: 'Shoes' },
      { name: 'Designer Dress', quantity: 1, price: 1200.00, total: 1200.00, category: 'Clothing' },
      { name: 'Luxury Handbag', quantity: 1, price: 950.00, total: 950.00, category: 'Accessories' }
    ],
    subtotal: 3000.00,
    total: 3000.00,
    payment_method: 'MPESA',
    amount_paid: 450.00,
    change: 0.00,
    total_already_paid: 2550.00
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Shoes': '/images/receipts/SHOES ICON.png',
      'Clothing': '/images/receipts/CLOTHING ICON.png',
      'Accessories': '/images/receipts/ACCESSORIES ICON.png'
    }
    return icons[category] || '/images/receipts/ACCESSORIES ICON.png'
  }

  return (
    <PremiumCard className={`p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KQS Final Laybye Payment</h3>
        <p className="text-sm text-gray-600">Final laybye payment receipt with balance tracking and progress display</p>
      </div>

      {/* Receipt Preview */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-xs shadow-lg relative">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex justify-center mb-1">
            <img 
              src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" 
              alt="KQS Logo" 
              className="w-3/5 h-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="text-lg font-bold tracking-wider text-gray-900 hidden">KQS</div>
          </div>
          <div className="font-bold text-gray-900 text-sm">Laybye Final Payment</div>
        </div>

        {/* Compact Info Section */}
        <div className="mb-3 space-y-1">
          <div className="text-gray-700">Receipt #: {sampleData.receipt_number}</div>
          <div className="text-gray-700">Laybye ID: {sampleData.laybye_id}</div>
          <div className="text-gray-700">Payment ID: {sampleData.payment_id}</div>
          <div className="text-gray-700">Date: {sampleData.date} • Time: {sampleData.time}</div>
          <div className="text-gray-700">Cashier: {sampleData.cashier_name}</div>
          <div className="text-gray-700">Customer: {sampleData.customer_name}</div>
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        
        {/* Items Table with 2 Columns */}
        <div className="mb-3">
          {/* Table Header */}
          <div className="grid grid-cols-2 gap-2 mb-2 font-bold text-gray-900">
            <div className="text-center">Description</div>
            <div className="text-center">Total</div>
          </div>
          
          {/* Table Rows with Gray Background */}
          {sampleData.items.map((item, index) => (
            <div key={index} className={`grid grid-cols-2 gap-2 py-1 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'} rounded-sm`}>
              <div className="flex items-center gap-1">
                <img 
                  src={getCategoryIcon(item.category)} 
                  alt={item.category}
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="text-gray-700">{item.name}</span>
              </div>
              <div className="text-right text-gray-700 font-semibold">
                {formatCurrency(item.total)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        
        {/* Payment Details */}
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-gray-700">
            <span className="font-bold text-black">MPESA</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.amount_paid)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Paid</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.amount_paid)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Change</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.change)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Total Already Paid</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.total_already_paid)}</span>
          </div>
        </div>

        {/* Business Tagline */}
        <div className="text-center text-gray-600 mb-3 italic font-semibold">
          Finest footware
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Laybye Policy */}
        <div className="mb-3">
          <div className="text-center font-bold text-gray-900 mb-1">Lay-bye Policy</div>
          <div className="text-gray-700 text-xs leading-tight bg-gray-50 p-2 rounded-sm">
            NOTE: WE DO NOT CHANGE LAY-BYE. Exchanges will be for the same product (by size only) size. 
            (Thepe khutla pele ho matsatsi a 7 hotlo chenchoa (size feela)). Chelete yona hae khutle Le ha ese felletsoe ke nako.
          </div>
        </div>

        {/* Enhanced QR Code Section with Promotional Text */}
        <div className="mb-3">
          {/* Promotional Text */}
          <div className="text-center mb-2">
            <div className="font-bold text-gray-900 text-xs">SHOP ONLINE</div>
            <div className="text-gray-700 text-xs">Stand a chance to win</div>
          </div>
          
          {/* QR Code with Contact Info */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-sm">
            {/* QR Code */}
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-md">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-sm grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
                  {/* QR Code Pattern */}
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                  <div className="bg-black rounded-sm"></div>
                  <div className="bg-white rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* Contact Info with Bold Labels */}
            <div className="flex-1 ml-3 space-y-1">
              <div className="text-black">
                <span className="text-xs font-bold">Address:</span>
                <span className="text-xs font-medium ml-1">{sampleData.business_address}</span>
              </div>
              <div className="text-black">
                <span className="text-xs font-bold">Phone:</span>
                <span className="text-xs font-medium ml-1">{sampleData.business_phone}</span>
              </div>
              <div className="text-black">
                <span className="text-xs font-bold">Website:</span>
                <span className="text-xs font-medium ml-1">{sampleData.business_website}</span>
              </div>
              <div className="text-black">
                <span className="text-xs font-bold">Facebook:</span>
                <span className="text-xs font-medium ml-1">KQSFOOTWARE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Thank You */}
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900">Thank You for shopping with Us</div>
        </div>
      </div>

      {/* Design Features */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Enhanced Design Features:</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">2-column table layout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">Gray background rows</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">Category icons</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">Enhanced QR code section</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">Promotional text</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
            <span className="text-gray-700">Inline contact info</span>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

export default LuxuryReceiptPreview 
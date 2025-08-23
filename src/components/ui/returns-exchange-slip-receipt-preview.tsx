import React from 'react'
import { PremiumCard } from './premium-card'

interface ReturnsExchangeSlipReceiptPreviewProps {
  className?: string
}

const ReturnsExchangeSlipReceiptPreview: React.FC<ReturnsExchangeSlipReceiptPreviewProps> = ({ className }) => {
  // Sample data for returns/exchange slip
  const sampleData = {
    business_name: 'KQS',
    business_address: 'Maseru, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'kqs-boutique.com',
    slip_number: 'KQS-RE-2024-00077',
    date: '23-Dec-24',
    time: '14:30 PM',
    cashier_name: 'Hape',
    customer_name: 'NTEBALENG TAELO',
    items: [
      { name: 'ADIDAS Sneakers', quantity: 1, price: 850.00, total: 850.00, category: 'Shoes', action: 'Returned' },
      { name: 'Designer Dress', quantity: 1, price: 1200.00, total: 1200.00, category: 'Clothing', action: 'Exchanged (Size M → L)' }
    ],
    reason: 'Wrong size and color',
    total: 2050.00
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KQS Returns/Exchange Slip</h3>
        <p className="text-sm text-gray-600">Slip for returned or exchanged items</p>
      </div>

      {/* Slip Preview */}
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
          <div className="font-bold text-gray-900 text-sm">Returns/Exchange Slip</div>
        </div>

        {/* Compact Info Section */}
        <div className="mb-3 space-y-1">
          <div className="text-gray-700">Slip #: {sampleData.slip_number}</div>
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
            <div className="text-center">Action</div>
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
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <div className="text-right text-gray-700 font-semibold">
                {item.action}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        
        {/* Reason Section */}
        <div className="mb-3 text-xs text-gray-700 bg-gray-50 p-2 rounded-sm">
          <span className="font-semibold">Reason:</span> {sampleData.reason}
        </div>

        {/* Business Tagline */}
        <div className="text-center text-gray-600 mb-3 italic font-semibold">
          Finest footware
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Return & Exchange Policy */}
        <div className="mb-3">
          <div className="text-center font-bold text-gray-900 mb-1">Return &amp; Exchange Policy</div>
          <div className="text-gray-700 text-xs leading-tight bg-gray-50 p-2 rounded-sm">
            Returns and exchanges accepted within <span className="font-semibold">7 days</span> of purchase with a valid receipt.<br />
            Exchanges are for goods of equal value only.<br />
            <span className="font-semibold">No cash refunds.</span>
            <br /><br />
            <span className="italic text-gray-600">
              Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.
            </span>
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
            {/* Inline Contact Info */}
            <div className="flex-1 ml-3 space-y-1">
              <div className="flex items-center gap-1 text-black">
                <img 
                  src="/images/receipts/icons8-address-16.png" 
                  alt="Address"
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="text-xs font-medium">{sampleData.business_address}</span>
              </div>
              <div className="flex items-center gap-1 text-black">
                <img 
                  src="/images/receipts/icons8-phone-16.png" 
                  alt="Phone"
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="text-xs font-medium">{sampleData.business_phone}</span>
              </div>
              <div className="flex items-center gap-1 text-black">
                <img 
                  src="/images/receipts/icons8-website-16.png" 
                  alt="Website"
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="text-xs font-medium">{sampleData.business_website}</span>
              </div>
              <div className="flex items-center gap-1 text-black">
                <img 
                  src="/images/receipts/icons8-facebook-16.png" 
                  alt="Facebook"
                  className="w-3 h-3 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="text-xs font-medium">KQSFOOTWARE</span>
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
    </PremiumCard>
  )
}

export default ReturnsExchangeSlipReceiptPreview 
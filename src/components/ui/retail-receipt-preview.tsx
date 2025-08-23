import React from 'react'
import { PremiumCard } from './premium-card'

interface ReceiptTemplate {
  business_name: string
  business_address: string
  business_phone: string
  business_website: string
  business_facebook: string
  business_tagline: string
  return_policy_english: string
  return_policy_sesotho: string
  thank_you_message: string
  footer_text: string
  show_qr_section: boolean
  show_policy_section: boolean
  show_points_section: boolean
  show_tagline: boolean
  receipt_type?: string
}

interface RetailReceiptPreviewProps {
  className?: string
  template?: ReceiptTemplate
}

const RetailReceiptPreview: React.FC<RetailReceiptPreviewProps> = ({ 
  className, 
  template = {
    business_name: 'KQS',
    business_address: 'Maseru, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'www.kqsfootware.com',
    business_facebook: 'KQSFOOTWARE',
    business_tagline: 'Finest footware',
    return_policy_english: 'Returns and exchanges accepted within 7 days of purchase with a valid receipt. Exchanges are for goods of equal value only. No cash refunds.',
    return_policy_sesotho: 'Thepa e lungoelletsoe ho khutla pele ho matsatsi a 7 ho tla chenchoa. Chelete eona ha e khutle.',
    thank_you_message: 'Thank You for shopping with Us',
    footer_text: 'SHOP ONLINE - Stand a chance to win',
    show_qr_section: true,
    show_policy_section: true,
    show_points_section: true,
    show_tagline: true
  }
}) => {
  // Sample data for preview
  const sampleData = {
    receipt_number: 'KQS-2024-009876',
    date: '21-Dec-24',
    time: '11:24 AM',
    cashier_name: 'Hape',
    customer_name: 'NTEBALENG TAELO', // Optional
    items: [
      { name: 'ADIDAS Sneakers', quantity: 1, price: 850.00, total: 850.00, category: 'Shoes' },
      { name: 'Designer Dress', quantity: 1, price: 1200.00, total: 1200.00, category: 'Clothing' },
      { name: 'Luxury Handbag', quantity: 1, price: 950.00, total: 950.00, category: 'Accessories' }
    ],
    subtotal: 3000.00,
    tax: 300.00,
    discount: 100.00,
    points_used: 50,
    points_earned: 30,
    total: 3150.00,
    payment_method: 'MPESA',
    amount_paid: 3200.00,
    change: 50.00
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KQS Retail Receipt</h3>
        <p className="text-sm text-gray-600">Beautiful 2-column layout with QR code integration</p>
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
            <div className="text-lg font-bold tracking-wider text-gray-900 hidden">{template.business_name}</div>
          </div>
          <div className="font-bold text-gray-900 text-sm">{template.receipt_type || 'Retail Receipt'}</div>
        </div>

        {/* Compact Info Section */}
        <div className="mb-3 space-y-1">
          <div className="text-gray-700">Receipt #: {sampleData.receipt_number}</div>
          <div className="text-gray-700">Date: {sampleData.date} • Time: {sampleData.time}</div>
          <div className="text-gray-700">Cashier: {sampleData.cashier_name}</div>
          {sampleData.customer_name && (
            <div className="text-gray-700">Customer: {sampleData.customer_name}</div>
          )}
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
                <span className="text-gray-500 ml-2">x{item.quantity}</span>
              </div>
              <div className="text-right text-gray-700 font-semibold">
                {formatCurrency(item.total)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        
        {/* Totals Section */}
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tax</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.tax)}</span>
          </div>
          {sampleData.discount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Discount</span>
              <span className="font-bold text-black">-{formatCurrency(sampleData.discount)}</span>
            </div>
          )}
          {template.show_points_section && sampleData.points_used > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Points Used</span>
              <span className="font-bold text-black">-{sampleData.points_used}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-900 font-bold border-t pt-1">
            <span>TOTAL</span>
            <span>{formatCurrency(sampleData.total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-3 space-y-1">
          <div className="flex justify-between text-gray-700">
            <span className="font-bold text-black">{sampleData.payment_method}</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.amount_paid)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Change</span>
            <span className="font-bold text-black">{formatCurrency(sampleData.change)}</span>
          </div>
        </div>

        {/* Loyalty Points */}
        {template.show_points_section && sampleData.points_earned > 0 && (
          <div className="mb-3 text-center text-xs text-gray-700">
            <span className="font-bold text-black">Points Earned:</span> {sampleData.points_earned}
          </div>
        )}

        {/* Business Tagline */}
        {template.show_tagline && (
          <div className="text-center text-gray-600 mb-3 italic font-semibold">
            {template.business_tagline}
          </div>
        )}

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Return & Exchange Policy */}
        {template.show_policy_section && (
          <div className="mb-3">
            <div className="text-center font-bold text-gray-900 mb-1">Return & Exchange Policy</div>
            <div className="text-gray-700 text-xs leading-tight bg-gray-50 p-2 rounded-sm">
              {template.return_policy_english}
              <br /><br />
              <span className="italic text-gray-600">
                {template.return_policy_sesotho}
              </span>
            </div>
          </div>
        )}

        {/* Enhanced QR Code Section with Promotional Text */}
        {template.show_qr_section && (
          <div className="mb-3">
            {/* Promotional Text */}
            <div className="text-center mb-2">
              <div className="font-bold text-gray-900 text-xs">{template.footer_text}</div>
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
                  <span className="text-xs font-medium ml-1">{template.business_address}</span>
                </div>
                <div className="text-black">
                  <span className="text-xs font-bold">Phone:</span>
                  <span className="text-xs font-medium ml-1">{template.business_phone}</span>
                </div>
                <div className="text-black">
                  <span className="text-xs font-bold">Website:</span>
                  <span className="text-xs font-medium ml-1">{template.business_website}</span>
                </div>
                <div className="text-black">
                  <span className="text-xs font-bold">Facebook:</span>
                  <span className="text-xs font-medium ml-1">{template.business_facebook}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

        {/* Thank You */}
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900">{template.thank_you_message}</div>
        </div>
      </div>
    </PremiumCard>
  )
}

export default RetailReceiptPreview 
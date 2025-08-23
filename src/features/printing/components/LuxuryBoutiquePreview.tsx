import React from 'react'
import { PremiumCard } from '@/components/ui/premium-card'

interface LuxuryBoutiquePreviewProps {
  onClose: () => void
}

const LuxuryBoutiquePreview: React.FC<LuxuryBoutiquePreviewProps> = ({ onClose }) => {
  // Sample data for preview
  const sampleData = {
    business_name: 'KQS',
    business_address: '123 Luxury Avenue, Fashion District',
    business_phone: '+27 11 123 4567',
    business_email: 'style@kqs-boutique.com',
    receipt_number: 'KQS-2024-001234',
    date: '15/12/2024',
    time: '14:30',
    cashier_name: 'Sarah Johnson',
    customer_name: 'Emma Thompson',
    items: [
      { name: '👗 Designer Dress', quantity: 1, price: 2500.00, total: 2500.00, category: 'Clothing' },
      { name: '👠 Luxury Heels', quantity: 1, price: 1800.00, total: 1800.00, category: 'Shoes' },
      { name: '👜 Designer Handbag', quantity: 1, price: 3200.00, total: 3200.00, category: 'Accessories' },
      { name: '💍 Statement Ring', quantity: 1, price: 950.00, total: 950.00, category: 'Jewelry' }
    ],
    subtotal: 8450.00,
    tax_amount: 1267.50,
    tax_rate: 15,
    discount: 500.00,
    total: 9217.50,
    payment_method: 'Credit Card',
    change: 0.00,
    receipt_footer: 'Thank you for choosing KQS Luxury Boutique'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Clothing': '👗',
      'Shoes': '👠',
      'Accessories': '👜',
      'Jewelry': '💍',
      'Bags': '👜',
      'Shoes': '👠',
      'Dresses': '👗',
      'Tops': '👚',
      'Bottoms': '👖',
      'Outerwear': '🧥'
    }
    return icons[category] || '🛍️'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">KQS Luxury Boutique Receipt</h3>
            <p className="text-sm text-gray-600">Premium boutique design preview</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-sm">
            {/* Header */}
            <div className="text-center space-y-1 mb-4">
              <div className="text-2xl font-bold tracking-wider">KQS</div>
              <div className="text-xs text-gray-600">LUXURY BOUTIQUE</div>
              <div className="text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              <div className="text-xs">{sampleData.business_address}</div>
              <div className="text-xs">{sampleData.business_phone} • {sampleData.business_email}</div>
              <div className="text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className="text-center font-bold">PURCHASE RECEIPT</div>
              <div>Receipt #{sampleData.receipt_number}</div>
              <div>{sampleData.date} • {sampleData.time}</div>
              <div>Stylist: {sampleData.cashier_name}</div>
              <div>Client: {sampleData.customer_name}</div>
              <div className="text-center text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              <div className="text-center font-bold text-xs">ITEMS PURCHASED</div>
              
              {/* Items */}
              <div className="space-y-1">
                {sampleData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span>{getCategoryIcon(item.category)}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 ml-4">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              
              {/* Totals */}
              <div className="space-y-1 text-right">
                <div>Subtotal: {formatCurrency(sampleData.subtotal)}</div>
                <div>Tax ({sampleData.tax_rate}%): {formatCurrency(sampleData.tax_amount)}</div>
                <div>Discount: -{formatCurrency(sampleData.discount)}</div>
                <div className="text-lg font-bold">TOTAL: {formatCurrency(sampleData.total)}</div>
              </div>

              <div>Payment: {sampleData.payment_method}</div>
              <div>Change: {formatCurrency(sampleData.change)}</div>
            </div>

            {/* Footer */}
            <div className="mt-4 space-y-2 text-center">
              <div className="text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              <div className="text-xs">RETURN POLICY: 14 days with original receipt</div>
              <div className="text-xs">Exchanges available within 30 days</div>
              <div className="text-xs">Earn points on every purchase • Join our VIP program</div>
              <div className="text-xs">Follow us: @KQSBoutique</div>
              <div className="text-xs">www.kqs-boutique.com</div>
              <div className="text-xs">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              <div className="font-bold">THANK YOU FOR CHOOSING KQS</div>
              <div className="text-xs">We look forward to styling you again!</div>
              <div className="text-xs mt-2">[QR Code]</div>
              <div className="text-xs">[Barcode]</div>
            </div>
          </div>
        </div>

        {/* Design Features */}
        <div className="p-6 border-t bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">Design Features:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>Luxury typography</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>Category icons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>Elegant dividers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>Brand colors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>VIP messaging</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E5FF29] rounded-full"></span>
              <span>Social integration</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          <button
            onClick={() => {
              // This would save the template
              alert('Template saved! This will be implemented in the full system.')
            }}
            className="px-4 py-2 bg-[#E5FF29] text-black font-medium rounded-lg hover:bg-[#E5FF29]/90"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}

export default LuxuryBoutiquePreview 
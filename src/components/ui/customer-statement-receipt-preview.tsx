import React from 'react'
import { PremiumCard } from './premium-card'

interface CustomerStatementReceiptPreviewProps {
  className?: string
}

const CustomerStatementReceiptPreview: React.FC<CustomerStatementReceiptPreviewProps> = ({ className }) => {
  const sampleData = {
    business_name: 'KQS',
    business_address: 'Maseru, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'kqs-boutique.com',
    statement_number: 'KQS-STMT-2024-00012',
    date: '28-Dec-24',
    customer_name: 'NTEBALENG TAELO',
    account_id: 'CUST-00123',
    period: '01-Dec-24 to 28-Dec-24',
    opening_balance: 1500.00,
    closing_balance: 500.00,
    transactions: [
      { date: '01-Dec-24', description: 'Opening Balance', debit: 0, credit: 0, balance: 1500.00 },
      { date: '05-Dec-24', description: 'Purchase - Invoice #INV-1001', debit: 1000.00, credit: 0, balance: 2500.00 },
      { date: '10-Dec-24', description: 'Payment Received', debit: 0, credit: 1000.00, balance: 1500.00 },
      { date: '15-Dec-24', description: 'Purchase - Invoice #INV-1002', debit: 800.00, credit: 0, balance: 2300.00 },
      { date: '20-Dec-24', description: 'Payment Received', debit: 0, credit: 1800.00, balance: 500.00 },
    ]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <PremiumCard className={`p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KQS Customer Statement</h3>
        <p className="text-sm text-gray-600">Account Statement for Customer</p>
      </div>
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
          <div className="font-bold text-gray-900 text-sm">Customer Statement</div>
        </div>
        {/* Info Section */}
        <div className="mb-3 space-y-1">
          <div className="text-gray-700">Statement #: {sampleData.statement_number}</div>
          <div className="text-gray-700">Date: {sampleData.date}</div>
          <div className="text-gray-700">Customer: {sampleData.customer_name}</div>
          <div className="text-gray-700">Account ID: {sampleData.account_id}</div>
          <div className="text-gray-700">Period: {sampleData.period}</div>
        </div>
        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        {/* Opening Balance */}
        <div className="flex justify-between text-gray-700 mb-1">
          <span>Opening Balance</span>
          <span className="font-bold text-black">{formatCurrency(sampleData.opening_balance)}</span>
        </div>
        {/* Transactions Table */}
        <div className="mb-3">
          <div className="grid grid-cols-5 gap-1 mb-1 font-bold text-gray-900">
            <div className="text-center">Date</div>
            <div className="col-span-2 text-center">Description</div>
            <div className="text-center">Debit</div>
            <div className="text-center">Credit</div>
          </div>
          {sampleData.transactions.map((txn, idx) => (
            <div key={idx} className={`grid grid-cols-5 gap-1 py-1 ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'} rounded-sm`}>
              <div className="text-center text-gray-700">{txn.date}</div>
              <div className="col-span-2 text-gray-700">{txn.description}</div>
              <div className="text-right text-gray-700">{txn.debit ? formatCurrency(txn.debit) : '-'}</div>
              <div className="text-right text-gray-700">{txn.credit ? formatCurrency(txn.credit) : '-'}</div>
            </div>
          ))}
        </div>
        {/* Closing Balance */}
        <div className="flex justify-between text-gray-900 font-bold border-t pt-1 mb-3">
          <span>Closing Balance</span>
          <span>{formatCurrency(sampleData.closing_balance)}</span>
        </div>
        {/* Tagline */}
        <div className="text-center text-gray-600 mb-3 italic font-semibold">
          Finest footware
        </div>
        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        {/* Statement Policy */}
        <div className="mb-3">
          <div className="text-center font-bold text-gray-900 mb-1">Statement Policy</div>
          <div className="text-gray-700 text-xs leading-tight bg-gray-50 p-2 rounded-sm">
            Please verify all transactions. Contact us within 7 days for any discrepancies.<br />
            <span className="italic text-gray-600">
              Ka kopo netefatsa liketsahalo tsohle. Ikopanye le rona nakong ea matsatsi a 7 haeba ho na le phoso.
            </span>
          </div>
        </div>
        {/* QR/Contact Section */}
        <div className="mb-3">
          <div className="text-center mb-2">
            <div className="font-bold text-gray-900 text-xs">SHOP ONLINE</div>
            <div className="text-gray-700 text-xs">Stand a chance to win</div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-sm">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shadow-md">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-sm grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
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

export default CustomerStatementReceiptPreview 
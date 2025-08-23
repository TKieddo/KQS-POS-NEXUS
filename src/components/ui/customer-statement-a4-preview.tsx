import React from 'react'

interface CustomerStatementA4PreviewProps {
  className?: string
}

const CustomerStatementA4Preview: React.FC<CustomerStatementA4PreviewProps> = ({ className }) => {
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
    <div className={`bg-white p-12 rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-200 font-sans text-sm ${className}`} style={{ minHeight: '1122px', width: '794px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src="/images/receipts/KQS RECEIPT LOGO-Photoroom.png" alt="KQS Logo" className="w-32 h-auto object-contain" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{sampleData.business_name}</div>
            <div className="text-gray-700">{sampleData.business_address}</div>
            <div className="text-gray-700">Tel: {sampleData.business_phone}</div>
            <div className="text-gray-700">{sampleData.business_website}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">Customer Statement</div>
          <div className="text-gray-600">Statement #: {sampleData.statement_number}</div>
          <div className="text-gray-600">Date: {sampleData.date}</div>
        </div>
      </div>
      {/* Info Section */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="text-gray-700"><span className="font-semibold">Customer:</span> {sampleData.customer_name}</div>
        <div className="text-gray-700"><span className="font-semibold">Account ID:</span> {sampleData.account_id}</div>
        <div className="text-gray-700"><span className="font-semibold">Period:</span> {sampleData.period}</div>
      </div>
      {/* Opening Balance */}
      <div className="mb-2 flex justify-between">
        <span className="font-semibold text-gray-700">Opening Balance</span>
        <span className="font-bold text-black">{formatCurrency(sampleData.opening_balance)}</span>
      </div>
      {/* Transactions Table */}
      <div className="mb-6">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left text-gray-700 font-semibold">Date</th>
              <th className="py-2 px-3 text-left text-gray-700 font-semibold">Description</th>
              <th className="py-2 px-3 text-right text-gray-700 font-semibold">Debit</th>
              <th className="py-2 px-3 text-right text-gray-700 font-semibold">Credit</th>
              <th className="py-2 px-3 text-right text-gray-700 font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.transactions.map((txn, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3 text-gray-700">{txn.date}</td>
                <td className="py-2 px-3 text-gray-700">{txn.description}</td>
                <td className="py-2 px-3 text-right text-gray-700">{txn.debit ? formatCurrency(txn.debit) : '-'}</td>
                <td className="py-2 px-3 text-right text-gray-700">{txn.credit ? formatCurrency(txn.credit) : '-'}</td>
                <td className="py-2 px-3 text-right text-gray-900 font-semibold">{formatCurrency(txn.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Closing Balance */}
      <div className="mb-6 flex justify-between border-t pt-2">
        <span className="font-semibold text-gray-700">Closing Balance</span>
        <span className="font-bold text-black">{formatCurrency(sampleData.closing_balance)}</span>
      </div>
      {/* Tagline */}
      <div className="text-center text-gray-600 mb-6 italic font-semibold text-lg">
        Finest footware
      </div>
      {/* Statement Policy */}
      <div className="mb-6">
        <div className="text-lg font-bold text-gray-900 mb-1 text-center">Statement Policy</div>
        <div className="text-gray-700 text-sm leading-tight bg-gray-50 p-4 rounded-sm text-center">
          Please verify all transactions. Contact us within 7 days for any discrepancies.<br />
          <span className="italic text-gray-600">
            Ka kopo netefatsa liketsahalo tsohle. Ikopanye le rona nakong ea matsatsi a 7 haeba ho na le phoso.
          </span>
        </div>
      </div>
      {/* Thank You */}
      <div className="text-center mt-8">
        <div className="font-bold text-gray-900 text-lg">Thank You for shopping with Us</div>
      </div>
    </div>
  )
}

export default CustomerStatementA4Preview 
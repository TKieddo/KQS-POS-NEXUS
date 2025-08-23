import React from 'react'
import { PremiumCard } from './premium-card'

interface CashUpReportReceiptPreviewProps {
  className?: string
}

const CashUpReportReceiptPreview: React.FC<CashUpReportReceiptPreviewProps> = ({ className }) => {
  // Sample data for cash up report
  const sampleData = {
    business_name: 'KQS',
    business_address: 'Maseru, Husteds opposite Queen II',
    business_phone: '2700 7795',
    business_website: 'kqs-boutique.com',
    report_number: 'KQS-CU-2024-00021',
    session_id: 'TS-2024-00012',
    cashier_name: 'Hape',
    date: '24-Dec-24',
    time: '19:00 PM',
    opening_float: 1000.00,
    cash_sales: 3500.00,
    card_sales: 2200.00,
    cash_drops: 500.00,
    cash_payouts: 200.00,
    closing_balance: 3800.00,
    counted_cash: 3750.00,
    variance: -50.00,
    notes: 'Short by 50.00, verified by supervisor.'
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KQS Cash Up Report</h3>
        <p className="text-sm text-gray-600">Summary of end-of-day cash up and reconciliation</p>
      </div>

      {/* Report Preview */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4 max-w-sm mx-auto font-mono text-xs shadow-lg relative">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="font-bold text-gray-900 text-lg">KQS</div>
          <div className="font-bold text-gray-900 text-sm">Cash Up Report</div>
        </div>

        {/* Info Section */}
        <div className="mb-3 space-y-1">
          <div className="text-gray-700">Report #: {sampleData.report_number}</div>
          <div className="text-gray-700">Session #: {sampleData.session_id}</div>
          <div className="text-gray-700">Cashier: {sampleData.cashier_name}</div>
          <div className="text-gray-700">Date: {sampleData.date} • Time: {sampleData.time}</div>
        </div>

        <div className="text-center text-gray-400 mb-3">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        
        {/* Cash Up Details Table */}
        <div className="mb-3">
          <div className="grid grid-cols-2 gap-2 mb-2 font-bold text-gray-900">
            <div className="text-center">Detail</div>
            <div className="text-center">Amount</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-100 rounded-sm">
            <div className="text-gray-700">Opening Float</div>
            <div className="text-right text-gray-700 font-semibold">{formatCurrency(sampleData.opening_float)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-50 rounded-sm">
            <div className="text-gray-700">Cash Sales</div>
            <div className="text-right text-gray-700 font-semibold">{formatCurrency(sampleData.cash_sales)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-100 rounded-sm">
            <div className="text-gray-700">Card Sales</div>
            <div className="text-right text-gray-700 font-semibold">{formatCurrency(sampleData.card_sales)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-50 rounded-sm">
            <div className="text-gray-700">Cash Drops</div>
            <div className="text-right text-gray-700 font-semibold">-{formatCurrency(sampleData.cash_drops)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-100 rounded-sm">
            <div className="text-gray-700">Cash Payouts</div>
            <div className="text-right text-gray-700 font-semibold">-{formatCurrency(sampleData.cash_payouts)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-50 rounded-sm">
            <div className="text-gray-900 font-bold">Closing Balance</div>
            <div className="text-right text-gray-900 font-bold">{formatCurrency(sampleData.closing_balance)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-100 rounded-sm">
            <div className="text-gray-700">Counted Cash</div>
            <div className="text-right text-gray-700 font-semibold">{formatCurrency(sampleData.counted_cash)}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 py-1 bg-gray-50 rounded-sm">
            <div className="text-gray-700">Variance</div>
            <div className={`text-right font-semibold ${sampleData.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(sampleData.variance)}</div>
          </div>
        </div>

        {/* Notes Section */}
        {sampleData.notes && (
          <div className="mb-3 text-xs text-gray-700 bg-gray-50 p-2 rounded-sm">
            <span className="font-semibold">Notes:</span> {sampleData.notes}
          </div>
        )}

        {/* Policy */}
        <div className="mb-3">
          <div className="text-center font-bold text-gray-900 mb-1">Cash Up Policy</div>
          <div className="text-gray-700 text-xs leading-tight bg-gray-50 p-2 rounded-sm">
            All cash up reports must be verified and signed by a supervisor.<br />
            <span className="italic text-gray-600">
              Litlaleho tsa cash up li tlameha ho netefatsoa ke mookameli pele li saenngoa.
            </span>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

export default CashUpReportReceiptPreview 
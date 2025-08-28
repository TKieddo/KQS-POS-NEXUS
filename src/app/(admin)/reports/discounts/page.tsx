'use client'
import * as React from 'react'
import { Calendar, Download, DollarSign, PieChart, X } from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

// Mock data
const stats = [
  { label: 'Total Discounts', value: 1200, icon: DollarSign },
  { label: 'Discount Rate', value: '3.8%', icon: PieChart },
  { label: 'Avg Discount', value: 80, icon: Calendar },
]
const discountTypes = [
  { type: 'Promo', value: 500, color: '#E5FF29' },
  { type: 'Loyalty', value: 400, color: '#29B6FF' },
  { type: 'Manual', value: 300, color: '#FF29E5' },
]
const discountTransactions = [
  { id: 1, date: '2024-06-01', amount: 50, type: 'Promo', cashier: 'Jane Doe', reason: 'Promo code' },
  { id: 2, date: '2024-06-02', amount: 100, type: 'Loyalty', cashier: 'John Smith', reason: 'Loyalty points' },
  { id: 3, date: '2024-06-03', amount: 70, type: 'Manual', cashier: 'Alice Brown', reason: 'Manager override' },
]

const chartData = {
  labels: discountTypes.map((d) => d.type),
  datasets: [
    {
      data: discountTypes.map((d) => d.value),
      backgroundColor: discountTypes.map((d) => d.color),
      borderWidth: 2,
    },
  ],
}
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: '#222',
        font: { size: 14 },
        usePointStyle: true,
        pointStyle: 'rectRounded',
        borderRadius: 8,
      },
    },
    title: { display: false },
    tooltip: { enabled: true },
  },
}

function DiscountDetailsModal({ discount, open, onClose }: { discount: any, open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black text-[#E5FF29] hover:bg-[#E5FF29] hover:text-black transition" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-black shadow-sm">
            <PieChart className="h-8 w-8 text-[#E5FF29]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black mb-1">Discount Details</h2>
            <div className="text-xs text-muted-foreground">Date: {discount.date}</div>
            <div className="text-xs text-muted-foreground">Cashier: {discount.cashier}</div>
            <div className="text-xs text-muted-foreground">Type: {discount.type}</div>
          </div>
        </div>
        <div className="mb-2 text-sm text-black">Reason: {discount.reason}</div>
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Amount</span>
            <span className="font-bold text-lg">R{discount.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const DateRangePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-2">
    <Calendar className="h-5 w-5 text-[#E5FF29]" />
    <select
      className="rounded-lg border border-border bg-white px-3 py-1 text-sm focus:outline-none"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="custom">Custom</option>
    </select>
  </div>
)
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) => (
  <div className="flex flex-col items-start rounded-2xl p-4 min-w-[120px] shadow-md">
    <div className="p-3 rounded-xl bg-black shadow-sm mb-2">
      <Icon className="h-5 w-5 text-[#E5FF29]" />
    </div>
    <span className="text-xs font-medium text-muted-foreground mb-1">{label}</span>
    <span className="text-lg font-bold text-black">{typeof value === 'number' ? `R${value.toLocaleString()}` : value}</span>
  </div>
)
const ExportButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5FF29] text-black font-semibold shadow hover:bg-[#e5ff29]/90 transition"
    onClick={onClick}
  >
    <Download className="h-4 w-4" /> Export CSV
  </button>
)

const DiscountsReportPage = () => {
  const [range, setRange] = React.useState('7d')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedDiscount, setSelectedDiscount] = React.useState<any | null>(null)

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Exporting CSV (stub)')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">Discounts Used</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">Track discounts and their impact on sales.</p>
        <div className="flex items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
          <ExportButton onClick={handleExport} />
        </div>
      </div>
      {loading ? (
        <div className="rounded-2xl bg-white shadow p-8 text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="rounded-2xl bg-white shadow p-8 text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((s, i) => (
              <StatCard key={i} icon={s.icon} label={s.label} value={s.value} />
            ))}
          </div>
          <div className="rounded-2xl bg-white shadow p-4 mb-6 flex flex-col items-center">
            <Pie data={chartData} options={chartOptions} className="w-full max-w-xs h-40" />
            <div className="flex gap-4 mt-4">
              {discountTypes.map((d) => (
                <div key={d.type} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 px-2 text-left font-semibold">Date</th>
                  <th className="py-2 px-2 text-right font-semibold">Amount</th>
                  <th className="py-2 px-2 text-left font-semibold">Type</th>
                  <th className="py-2 px-2 text-left font-semibold">Cashier</th>
                  <th className="py-2 px-2 text-left font-semibold">Reason</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {discountTransactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No discounts found.</td></tr>
                ) : (
                  discountTransactions.map((d) => (
                    <tr key={d.id} className="border-b border-border hover:bg-[#E5FF29]/10 transition">
                      <td className="py-2 px-2">{d.date}</td>
                      <td className="py-2 px-2 text-right font-bold">R{d.amount.toLocaleString()}</td>
                      <td className="py-2 px-2">{d.type}</td>
                      <td className="py-2 px-2">{d.cashier}</td>
                      <td className="py-2 px-2">{d.reason}</td>
                      <td className="py-2 px-2 text-right">
                        <button className="flex items-center gap-1 font-semibold hover:underline" onClick={() => setSelectedDiscount(d)}>
                          <span className="p-1 rounded-full bg-black shadow-sm"><PieChart className="h-4 w-4 text-[#E5FF29]" /></span>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DiscountDetailsModal discount={selectedDiscount} open={!!selectedDiscount} onClose={() => setSelectedDiscount(null)} />
        </>
      )}
    </div>
  )
}

export default DiscountsReportPage 
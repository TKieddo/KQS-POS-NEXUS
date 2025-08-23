'use client'
import * as React from 'react'
import { Users, Calendar, Download, BarChart2, X } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Mock data
const mockCashiers = [
  { id: 1, name: 'Jane Doe', salesCount: 45, totalSales: 15000, avgSale: 333, refunds: 2 },
  { id: 2, name: 'John Smith', salesCount: 38, totalSales: 12000, avgSale: 316, refunds: 1 },
  { id: 3, name: 'Alice Brown', salesCount: 30, totalSales: 9000, avgSale: 300, refunds: 0 },
]

const chartData = {
  labels: mockCashiers.map((c) => c.name),
  datasets: [
    {
      label: 'Total Sales',
      data: mockCashiers.map((c) => c.totalSales),
      backgroundColor: '#E5FF29',
      borderRadius: 8,
      barPercentage: 0.5,
    },
  ],
}
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      ticks: { color: '#222' },
      grid: { color: 'rgba(0,0,0,0.08)' },
    },
    y: {
      ticks: { color: '#222' },
      grid: { color: 'rgba(0,0,0,0.08)' },
    },
  },
}

function CashierDetailsModal({ cashier, open, onClose }: { cashier: any, open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black text-[#E5FF29] hover:bg-[#E5FF29] hover:text-black transition" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-black shadow-sm">
            <Users className="h-8 w-8 text-[#E5FF29]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black mb-1">{cashier.name}</h2>
            <div className="text-xs text-muted-foreground">Total Sales: <span className="font-bold">R{cashier.totalSales.toLocaleString()}</span></div>
            <div className="text-xs text-muted-foreground">Sales Count: <span className="font-bold">{cashier.salesCount}</span></div>
            <div className="text-xs text-muted-foreground">Avg Sale: <span className="font-bold">R{cashier.avgSale.toLocaleString()}</span></div>
            <div className="text-xs text-muted-foreground">Refunds: <span className="font-bold">{cashier.refunds}</span></div>
          </div>
        </div>
        <div className="mt-2 text-sm text-black">This is a mock cashier details modal. You can add more analytics or actions here.</div>
      </div>
    </div>
  )
}

const SalesByCashierReportPage = () => {
  const [range, setRange] = React.useState('7d')
  const [cashier, setCashier] = React.useState('All')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCashier, setSelectedCashier] = React.useState<any | null>(null)

  const cashiers = ['All', ...mockCashiers.map(c => c.name)]
  const filtered = cashier === 'All' ? mockCashiers : mockCashiers.filter(c => c.name === cashier)

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Exporting CSV (stub)')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">Sales by Cashier</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">Analyze sales performance by staff.</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#E5FF29]" />
            <select
              className="rounded-lg border border-border bg-white px-3 py-1 text-sm focus:outline-none"
              value={range}
              onChange={e => setRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#E5FF29]" />
            <select
              className="rounded-lg border border-border bg-white px-3 py-1 text-sm focus:outline-none"
              value={cashier}
              onChange={e => setCashier(e.target.value)}
            >
              {cashiers.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5FF29] text-black font-semibold shadow hover:bg-[#e5ff29]/90 transition"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="rounded-2xl bg-white shadow p-4 mb-6">
        <Bar data={chartData} options={chartOptions} className="w-full h-40" />
      </div>
      <div className="overflow-x-auto rounded-2xl shadow bg-white mb-6">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 px-2 text-left font-semibold">Cashier</th>
              <th className="py-2 px-2 text-right font-semibold">Sales Count</th>
              <th className="py-2 px-2 text-right font-semibold">Total Sales</th>
              <th className="py-2 px-2 text-right font-semibold">Avg Sale</th>
              <th className="py-2 px-2 text-right font-semibold">Refunds</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={6} className="text-center py-8 text-red-500">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No cashiers found.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="border-b border-border hover:bg-[#E5FF29]/10 transition">
                  <td className="py-2 px-2 font-semibold text-black">{c.name}</td>
                  <td className="py-2 px-2 text-right">{c.salesCount}</td>
                  <td className="py-2 px-2 text-right font-bold">R{c.totalSales.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">R{c.avgSale.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right">{c.refunds}</td>
                  <td className="py-2 px-2 text-right">
                    <button className="flex items-center gap-1 font-semibold hover:underline" onClick={() => setSelectedCashier(c)}>
                      <span className="p-1 rounded-full bg-black shadow-sm"><BarChart2 className="h-4 w-4 text-[#E5FF29]" /></span>
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <CashierDetailsModal cashier={selectedCashier} open={!!selectedCashier} onClose={() => setSelectedCashier(null)} />
    </div>
  )
}

export default SalesByCashierReportPage 
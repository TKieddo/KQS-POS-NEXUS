'use client'
import * as React from 'react'
import { Calendar, Download, DollarSign, PieChart, X } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Mock data
const stats = [
  { label: 'Total Profit', value: 534200, icon: DollarSign },
  { label: 'Profit Margin', value: '18.2%', icon: PieChart },
  { label: 'Total Tax', value: 12000, icon: Calendar },
]
const profitTrend = [
  { date: '2024-06-01', value: 12000 },
  { date: '2024-06-02', value: 18000 },
  { date: '2024-06-03', value: 16000 },
  { date: '2024-06-04', value: 21000 },
  { date: '2024-06-05', value: 25000 },
  { date: '2024-06-06', value: 32000 },
  { date: '2024-06-07', value: 34000 },
]
const profitTaxBreakdown = [
  { id: 1, date: '2024-06-01', profit: 12000, tax: 1800 },
  { id: 2, date: '2024-06-02', profit: 18000, tax: 2700 },
  { id: 3, date: '2024-06-03', profit: 16000, tax: 2400 },
]

const chartData = {
  labels: profitTrend.map((d) => d.date),
  datasets: [
    {
      label: 'Profit',
      data: profitTrend.map((d) => d.value),
      borderColor: '#E5FF29',
      backgroundColor: 'rgba(229,255,41,0.15)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#E5FF29',
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

function ProfitTaxDetailsModal({ row, open, onClose }: { row: any, open: boolean, onClose: () => void }) {
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
            <h2 className="text-xl font-bold text-black mb-1">Profit & Tax Details</h2>
            <div className="text-xs text-muted-foreground">Date: {row.date}</div>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Profit</span>
            <span className="font-bold text-lg">R{row.profit.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Tax</span>
            <span className="font-bold text-lg">R{row.tax.toLocaleString()}</span>
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

const ProfitTaxReportPage = () => {
  const [range, setRange] = React.useState('7d')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null)

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Exporting CSV (stub)')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">Profit & Tax</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">View profit margins and tax breakdowns.</p>
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
          <div className="rounded-2xl bg-white shadow p-4 mb-6">
            <Line data={chartData} options={chartOptions} className="w-full h-40" />
          </div>
          <div className="overflow-x-auto rounded-2xl shadow bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 px-2 text-left font-semibold">Date</th>
                  <th className="py-2 px-2 text-right font-semibold">Profit</th>
                  <th className="py-2 px-2 text-right font-semibold">Tax</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {profitTaxBreakdown.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No data found.</td></tr>
                ) : (
                  profitTaxBreakdown.map((row) => (
                    <tr key={row.id} className="border-b border-border hover:bg-[#E5FF29]/10 transition">
                      <td className="py-2 px-2">{row.date}</td>
                      <td className="py-2 px-2 text-right font-bold">R{row.profit.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right font-bold">R{row.tax.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">
                        <button className="flex items-center gap-1 font-semibold hover:underline" onClick={() => setSelectedRow(row)}>
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
          <ProfitTaxDetailsModal row={selectedRow} open={!!selectedRow} onClose={() => setSelectedRow(null)} />
        </>
      )}
    </div>
  )
}

export default ProfitTaxReportPage 
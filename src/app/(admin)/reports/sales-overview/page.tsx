'use client'
import * as React from 'react'
import { Calendar, Download, TrendingUp, BarChart2 } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Mock data
const stats = [
  { label: 'Total Sales', value: 45000, icon: TrendingUp },
  { label: 'Transactions', value: 120, icon: Calendar },
  { label: 'Avg Sale', value: 375, icon: BarChart2 },
]
const salesTrend = [
  { date: '2024-06-01', value: 5000 },
  { date: '2024-06-02', value: 7000 },
  { date: '2024-06-03', value: 6000 },
  { date: '2024-06-04', value: 8000 },
  { date: '2024-06-05', value: 9000 },
  { date: '2024-06-06', value: 9500 },
  { date: '2024-06-07', value: 8500 },
]

const chartData = {
  labels: salesTrend.map((d) => d.date),
  datasets: [
    {
      label: 'Sales',
      data: salesTrend.map((d) => d.value),
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

// Date range picker (stub)
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

// Stat card atom
const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="flex flex-col items-start rounded-2xl p-4 min-w-[120px] shadow-md">
    <div className="p-3 rounded-xl bg-black shadow-sm mb-2">
      <Icon className="h-5 w-5 text-[#E5FF29]" />
    </div>
    <span className="text-xs font-medium text-muted-foreground mb-1">{label}</span>
    <span className="text-lg font-bold text-black">R{value.toLocaleString()}</span>
  </div>
)

// Export button atom
const ExportButton = ({ onClick }: { onClick: () => void }) => (
  <button
    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5FF29] text-black font-semibold shadow hover:bg-[#e5ff29]/90 transition"
    onClick={onClick}
  >
    <Download className="h-4 w-4" /> Export CSV
  </button>
)

const SalesOverviewReportPage = () => {
  const [range, setRange] = React.useState('7d')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Exporting CSV (stub)')
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">Sales Overview</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">Track daily, weekly, and monthly sales trends.</p>
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
          {/* Sales Trend Table for non-tech savvy users */}
          <div className="overflow-x-auto rounded-2xl shadow bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 px-2 text-left font-semibold">Date</th>
                  <th className="py-2 px-2 text-right font-semibold">Sales</th>
                </tr>
              </thead>
              <tbody>
                {salesTrend.map((row) => (
                  <tr key={row.date} className="border-b border-border hover:bg-[#E5FF29]/10 transition">
                    <td className="py-2 px-2">{row.date}</td>
                    <td className="py-2 px-2 text-right font-bold">R{row.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default SalesOverviewReportPage 
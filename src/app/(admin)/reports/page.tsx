'use client'
import React, { useState } from "react"
import { ReportsOverviewGrid } from "@/features/reports/components/ReportsOverviewGrid"
import { ReportsCategoryTabs } from "@/features/reports/components/ReportsCategoryTabs"
import { ReportsListGrid } from "@/features/reports/components/ReportsListGrid"
import { YearSelector } from "@/features/reports/components/YearSelector"
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { DollarSign, Package, Users, ShoppingCart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const availableYears = [2022, 2023, 2024]

const statCards = [
  {
    icon: DollarSign,
    label: 'Total Profit',
    value: 'R 534,200',
    change: '+12.3%',
    color: 'bg-[hsl(var(--primary))] text-white',
  },
  {
    icon: Package,
    label: 'Total Stock Value',
    value: 'R 1,200,000',
    change: '+4.1%',
    color: 'bg-[hsl(var(--primary))] text-white',
  },
  {
    icon: Users,
    label: 'Customers',
    value: '1,429',
    change: '+5.1%',
    color: 'bg-[hsl(var(--primary))] text-white',
  },
  {
    icon: ShoppingCart,
    label: 'Sales (YTD)',
    value: 'R 1,234,560',
    change: '+10.5%',
    color: 'bg-[hsl(var(--primary))] text-white',
  },
]

const profitData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Profit',
      data: [12000, 18000, 16000, 21000, 25000, 32000, 34000, 33000, 31000, 32000, 30000, 35000],
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
const stockValueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Stock Value',
      data: [100000, 110000, 120000, 130000, 125000, 140000, 135000, 138000, 142000, 145000, 148000, 150000],
      backgroundColor: '#E5FF29',
      borderColor: '#E5FF29',
      borderWidth: 2,
      borderRadius: 8,
      barPercentage: 0.5,
    },
  ],
}
const salesVsStockData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Sales',
      data: [12000, 18000, 16000, 21000, 25000, 32000, 34000, 33000, 31000, 32000, 30000, 35000],
      backgroundColor: '#E5FF29',
      borderRadius: 8,
      barPercentage: 0.5,
    },
    {
      label: 'Stock Value',
      data: [100000, 110000, 120000, 130000, 125000, 140000, 135000, 138000, 142000, 145000, 148000, 150000],
      backgroundColor: 'hsl(240, 5.9%, 10%)',
      borderRadius: 8,
      barPercentage: 0.5,
    },
  ],
}
const categoryBreakdownData = {
  labels: ['Clothing', 'Shoes', 'Accessories', 'Other'],
  datasets: [
    {
      label: 'Stock by Category',
      data: [40, 25, 20, 15],
      backgroundColor: ['#E5FF29', '#29B6FF', '#FF29E5', '#222'],
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

const ReportsPage = () => {
  const [category, setCategory] = useState("All")
  const [year, setYear] = useState(2024)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-border flex flex-col md:flex-row md:items-center md:justify-between p-8 mb-4 shadow-sm gap-2 max-w-screen-2xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Reports & Analytics</h1>
        <div className="w-full md:w-auto">
          <ReportsCategoryTabs selected={category} onCategoryChange={setCategory} />
        </div>
      </div>
      <div className="p-8 space-y-10 pb-10 max-w-screen-2xl mx-auto w-full">
        {/* Year Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold text-[hsl(var(--primary))]">Overview ({year})</div>
          <YearSelector years={availableYears} selectedYear={year} onChange={setYear} />
        </div>
        {/* Overview Stats & Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8 z-0">
          {statCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div key={i} className={`rounded-2xl p-4 shadow-lg flex items-center gap-4 ${card.color} z-0`}>
                <Icon className="h-8 w-8 mb-1 text-[#E5FF29] drop-shadow" />
                <div>
                  <span className="text-xs font-medium text-white/80 block">{card.label}</span>
                  <span className="text-lg font-bold text-white block mt-0.5">{formatCurrency(card.value)}</span>
                  <span className="text-[10px] mt-1 block" style={{ color: '#E5FF29' }}>{card.change} from last period</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 z-0">
          {/* Profit Over Time */}
          <div className="rounded-2xl p-6 shadow-lg bg-white flex flex-col min-h-[260px] w-full z-0">
            <span className="text-base font-semibold text-[hsl(var(--primary))] mb-2">Profit Over Time</span>
            <div className="flex-1 flex items-center justify-center">
              <Line data={profitData} options={chartOptions} className="w-full h-40" />
            </div>
          </div>
          {/* Total Stock Value */}
          <div className="rounded-2xl p-6 shadow-lg bg-white flex flex-col min-h-[260px] w-full z-0">
            <span className="text-base font-semibold text-[hsl(var(--primary))] mb-2">Total Stock Value</span>
            <div className="flex-1 flex items-center justify-center">
              <Bar data={stockValueData} options={chartOptions} className="w-full h-40" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 z-0">
          {/* Sales vs. Stock Value */}
          <div className="rounded-2xl p-6 shadow-lg bg-white flex flex-col min-h-[260px] w-full z-0">
            <span className="text-base font-semibold text-[hsl(var(--primary))] mb-2">Sales vs. Stock Value</span>
            <div className="flex-1 flex items-center justify-center">
              <Bar data={salesVsStockData} options={chartOptions} className="w-full h-40" />
            </div>
          </div>
          {/* Category Breakdown */}
          <div className="rounded-2xl p-6 shadow-lg bg-white flex flex-col min-h-[260px] w-full z-0">
            <span className="text-base font-semibold text-[hsl(var(--primary))] mb-2">Category Breakdown</span>
            <div className="flex-1 flex items-center justify-center">
              <Doughnut data={categoryBreakdownData} options={{ plugins: { legend: { labels: { color: '#222', font: { size: 14 } } } } }} className="w-full h-40" />
            </div>
          </div>
        </div>
        <ReportsOverviewGrid />
        <ReportsListGrid category={category === "All" ? undefined : category} />
      </div>
    </div>
  )
}

export default ReportsPage 
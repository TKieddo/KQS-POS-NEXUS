'use client'
import * as React from 'react'
import { Search, ListFilter, Download, Star, X } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Mock data
const mockProducts = [
  { id: 1, name: 'Denim Jacket', sku: 'DJ-001', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f', quantity: 120, profit: 3500, category: 'Apparel', description: 'Premium denim jacket, unisex fit.' },
  { id: 2, name: 'Sneakers', sku: 'SN-002', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', quantity: 90, profit: 4200, category: 'Footwear', description: 'Comfortable sneakers for everyday wear.' },
  { id: 3, name: 'Leather Bag', sku: 'LB-003', image: 'https://images.unsplash.com/photo-1526178613658-3f1622045557', quantity: 60, profit: 2100, category: 'Accessories', description: 'Handcrafted leather bag, stylish and durable.' },
]
const categories = ['All', 'Apparel', 'Footwear', 'Accessories']

const getChartData = (mode: 'quantity' | 'profit') => ({
  labels: mockProducts.map((p) => p.name),
  datasets: [
    {
      label: mode === 'quantity' ? 'Quantity Sold' : 'Profit',
      data: mockProducts.map((p) => (mode === 'quantity' ? p.quantity : p.profit)),
      backgroundColor: '#E5FF29',
      borderRadius: 8,
      barPercentage: 0.5,
    },
  ],
})
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

function ProductDetailsModal({ product, open, onClose }: { product: any, open: boolean, onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black text-[#E5FF29] hover:bg-[#E5FF29] hover:text-black transition" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 mb-4">
          <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover border border-border" />
          <div>
            <h2 className="text-xl font-bold text-black mb-1">{product.name}</h2>
            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
            <div className="text-xs text-muted-foreground">Category: {product.category}</div>
          </div>
        </div>
        <div className="mb-2 text-sm text-black">{product.description}</div>
        <div className="flex gap-4 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Quantity Sold</span>
            <span className="font-bold text-lg">{product.quantity}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Profit</span>
            <span className="font-bold text-lg">R{product.profit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const TopProductsReportPage = () => {
  const [mode, setMode] = React.useState<'quantity' | 'profit'>('quantity')
  const [category, setCategory] = React.useState('All')
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null)

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Exporting CSV (stub)')
  }

  // Filtered products
  const filtered = mockProducts.filter(p =>
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">Top Products</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <p className="text-muted-foreground">See your best-selling products by quantity and profit.</p>
        <div className="flex items-center gap-3">
          <button
            className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${mode === 'quantity' ? 'bg-black text-[#E5FF29]' : 'bg-[#E5FF29]/10 text-black'}`}
            onClick={() => setMode('quantity')}
          >By Quantity</button>
          <button
            className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${mode === 'profit' ? 'bg-black text-[#E5FF29]' : 'bg-[#E5FF29]/10 text-black'}`}
            onClick={() => setMode('profit')}
          >By Profit</button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E5FF29] text-black font-semibold shadow hover:bg-[#e5ff29]/90 transition"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ListFilter className="h-5 w-5 text-[#E5FF29]" />
          <select
            className="rounded-lg border border-border bg-white px-3 py-1 text-sm focus:outline-none"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-[#E5FF29]" />
          <input
            className="rounded-lg border border-border bg-white px-3 py-1 text-sm focus:outline-none"
            placeholder="Search product name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-2xl bg-white shadow p-4 mb-6">
        <Bar data={getChartData(mode)} options={chartOptions} className="w-full h-40" />
      </div>
      <div className="overflow-x-auto rounded-2xl shadow bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2 px-2 text-left font-semibold">Product</th>
              <th className="py-2 px-2 text-left font-semibold">SKU</th>
              <th className="py-2 px-2 text-left font-semibold">Category</th>
              <th className="py-2 px-2 text-right font-semibold">{mode === 'quantity' ? 'Quantity Sold' : 'Profit'}</th>
              <th className="py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-8 text-red-500">{error}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No products found.</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p.id} className="border-b border-border hover:bg-[#E5FF29]/10 transition">
                  <td className="py-2 px-2 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-border" />
                    <span className="font-semibold text-black">{p.name}</span>
                  </td>
                  <td className="py-2 px-2">{p.sku}</td>
                  <td className="py-2 px-2">{p.category}</td>
                  <td className="py-2 px-2 text-right font-bold">
                    {mode === 'quantity' ? p.quantity : `R${p.profit.toLocaleString()}`}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <button className="flex items-center gap-1 font-semibold hover:underline" onClick={() => setSelectedProduct(p)}>
                      <span className="p-1 rounded-full bg-black shadow-sm"><Star className="h-4 w-4 text-[#E5FF29]" /></span>
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProductDetailsModal product={selectedProduct} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}

export default TopProductsReportPage 